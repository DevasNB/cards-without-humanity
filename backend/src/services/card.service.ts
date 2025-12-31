// src/services/game.service.ts
import { Prisma, RoomUserStatus, RoundStatus } from "@prisma/client";
import prisma from "../utils/prisma";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { fisherYatesShuffle, randomElement } from "../utils/helpers";
import { AnswerCard, PromptCard } from "cah-shared";

export class CardService {
  public async getHandPickForPlayersInGame(
    tx: Prisma.TransactionClient,
    gameId: string
  ): Promise<Map<string, AnswerCard[]>> {
    // Get the current game and connected players
    const game = await tx.game.findUnique({
      where: {
        id: gameId,
      },
      select: {
        // Get all the players that are in game
        players: {
          where: {
            user: {
              status: RoomUserStatus.IN_GAME,
            },
          },
          select: {
            id: true,
            _count: {
              select: {
                hand: true,
              },
            },
          },
        },
        // Get the last round
        rounds: {
          where: {
            status: RoundStatus.ENDED,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            picks: true,
            promptCard: {
              select: {
                pick: true,
              },
            },
          },
        },
      },
    });

    // If the game does not exist, throw an error
    if (!game) {
      throw new NotFoundError("Game not found");
    }

    // Calculate the max amount of cards that are missing
    // If there is a last round, use 3 (the max pick amount)
    // If there is no last round, use 7 (the max hand amount)
    const missingNumberOfCardsPerPlayer =
      game.rounds.length > 0 ? game.rounds[0].promptCard.pick : 7;

    const missingNumberOfCards =
      missingNumberOfCardsPerPlayer * game.players.length;

    // Get the needed deck: Get the max needed amount of all valid cards from the game decks
    const answerCards = await this.takeNRandomCards(
      tx,
      gameId,
      missingNumberOfCards
    );

    if (answerCards.length === 0) {
      throw new Error("No answer cards available to draw from.");
    }

    if (game.rounds.length > 0) {
      // Delete all player hand cards that are part of the last round
      await tx.playerHandCard.deleteMany({
        where: {
          OR: game.rounds[0].picks.map((pick) => ({
            AND: [{ playerId: pick.playerId }, { cardId: pick.cardId }],
          })),
        },
      });
    }

    // Create an array of objects to insert and shuffle it
    // TODO: now this is kinda inefficient and unnecessary. remove it for now
    /*
    const shuffledCards = fisherYatesShuffle<{ id: string }>(
      missingNumberOfCards,
      answerCards
    );
    */
    const shuffledCards = [...answerCards];

    const playerHandCards = [];
    let cardIndex = 0;

    // TODO: the new algo will do this already
    // For each player, give the missing number of cards
    for (const player of game.players) {
      // Compute the number of cards that are missing
      const neededCards = 7 - player._count.hand;

      for (let i = 0; i < neededCards; i++) {
        const card = shuffledCards[cardIndex];
        playerHandCards.push({ playerId: player.id, cardId: card.id });
        cardIndex++;
      }
    }

    // Insert all new entries
    await tx.playerHandCard.createMany({
      data: playerHandCards,
    });

    // Return all cards for each player
    // TODO: what can we do with groupBy?
    const insertedCards = await tx.playerHandCard.findMany({
      where: {
        player: {
          gameId,
        },
      },
      select: {
        id: true,
        answerCard: true,
        player: {
          select: {
            user: {
              select: { connectionId: true },
            },
          },
        },
      },
    });

    const cardsByConn = new Map<string, AnswerCard[]>();

    for (const card of insertedCards) {
      const connId = card.player.user.connectionId;

      if (!cardsByConn.has(connId)) {
        cardsByConn.set(connId, []);
      }

      const newCard: AnswerCard = {
        id: card.answerCard.id,
        text: card.answerCard.content,
      };

      cardsByConn.get(connId)!.push(newCard);
    }

    return cardsByConn;
  }

  // TODO: for performance sake, use Redis. take the important cards for the game, store it in "THE game's deck, and just keep taking from it"
  private async takeNRandomCards(
    tx: Prisma.TransactionClient,
    gameId: string,
    n: number
  ): Promise<{ id: string }[]> {
    const where = {
      // That belong to a deck that is part of the game gameId
      deck: {
        games: {
          some: {
            gameId,
          },
        },
      },
      // That as not been submitted in any round
      roundSubmissions: {
        none: {
          round: {
            gameId,
          },
        },
      },
      // And that are not in any player's hand
      playerHands: {
        none: {
          player: {
            gameId,
          },
        },
      },
    };

    const itemCount = await prisma.answerCard.count({
      where: where,
    });

    const skip = Math.max(0, Math.floor(Math.random() * itemCount) - n);
    const orderDir = randomElement([
      Prisma.SortOrder.asc,
      Prisma.SortOrder.desc,
    ]);

    return await tx.answerCard.findMany({
      where: where,
      skip: skip,
      select: {
        id: true,
      },
      orderBy: { id: orderDir },
      take: n,
    });
  }

  // TODO: use Redis as well in here
  public async getNewPromptCard(
    tx: Prisma.TransactionClient,
    gameId: string
  ): Promise<PromptCard> {
    const where = {
      deck: {
        games: {
          some: { gameId },
        },
      },
      rounds: {
        none: {
          gameId,
        },
      },
    };

    const itemCount = await tx.promptCard.count({
      where: where,
    });

    const skip = Math.max(0, Math.floor(Math.random() * itemCount) - 1);
    const orderDir = randomElement([
      Prisma.SortOrder.asc,
      Prisma.SortOrder.desc,
    ]);

    const promptCards = await tx.promptCard.findMany({
      where: where,
      skip: skip,
      select: {
        id: true,
        content: true,
        pick: true,
      },
      orderBy: { id: orderDir },
      take: 1,
    });

    const promptCard = promptCards[0];

    if (!promptCard) {
      throw new NotFoundError("Prompt card not found");
    }

    return {
      id: promptCard.id,
      text: promptCard.content,
      pick: promptCard.pick,
    };
  }

  public async selectCard(
    gameId: string,
    userId: string,
    cardId: string
  ): Promise<void> {
    // TODO: fix this method: with playerId and roundId
    const currentRound = await prisma.round.findFirst({
      where: { gameId, status: RoundStatus.DRAWING_CARDS },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        game: {
          select: {
            roomId: true,
          },
        },
      },
    });

    if (!currentRound) {
      throw new NotFoundError("Round not found");
    }

    const roomUser = await prisma.roomUser.findUnique({
      where: { userId_roomId: { userId, roomId: currentRound.game.roomId } },
    });

    if (!roomUser) {
      throw new NotFoundError("Room user not found");
    }

    const player = await prisma.player.findUnique({
      where: {
        gameId_roomUserId: {
          gameId,
          roomUserId: roomUser.id,
        },
      },
      select: {
        id: true,
        judgingRounds: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!player) {
      throw new NotFoundError("Player not found");
    }

    if (
      player.judgingRounds.map((round) => round.id).includes(currentRound.id)
    ) {
      throw new BadRequestError("This player is the czar for this round");
    }

    await prisma.roundPick.create({
      data: {
        cardId,
        playerId: player.id,
        roundId: currentRound.id,
      },
    });
  }
}
