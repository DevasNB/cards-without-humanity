// src/services/game.service.ts
import { Prisma, RoomUserStatus, RoundStatus } from "@prisma/client";
import prisma from "../utils/prisma";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { fisherYatesShuffle } from "../utils/helpers";
import { AnswerCard, PromptCard } from "cah-shared";

export class CardService {
  public async getHandPickForPlayersInGame(
    tx: Prisma.TransactionClient,
    gameId: string,
    lastRoundPick: number
  ): Promise<Map<string, AnswerCard[]>> {
    // Get all valid cards from the decks table
    const answerCards = await tx.answerCard.findMany({
      where: {
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
      },
      select: {
        id: true,
      },
    });

    if (answerCards.length === 0) {
      throw new Error("No answer cards available to draw from.");
    }

    // Get the last prompt card's pick and the connected players
    const game = await tx.game.findUnique({
      where: {
        id: gameId,
      },
      select: {
        // Get the last round's prompt card's pick
        // TODO: Check is it desc?
        rounds: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            promptCard: {
              select: {
                pick: true,
              },
            },
          },
        },
        // Get all the players that are in game
        players: {
          where: {
            user: {
              status: RoomUserStatus.IN_GAME,
            },
          },
        },
      },
    });

    // If the game does not exist, throw an error
    if (!game) {
      throw new NotFoundError("Game not found");
    }

    // Calculate the number of cards that are missing
    const missingNumberOfCards = 7 - lastRoundPick;

    if (missingNumberOfCards <= 0) return new Map();

    // Create an array of objects to insert and shuffle it
    const shuffledCards = fisherYatesShuffle<{ id: string }>(
      missingNumberOfCards * game.players.length,
      answerCards
    );

    const playerHandCards = [];
    let cardIndex = 0;

    for (const player of game.players) {
      for (let i = 0; i < missingNumberOfCards; i++) {
        const card = shuffledCards[cardIndex % shuffledCards.length];
        playerHandCards.push({ playerId: player.id, cardId: card.id });
        cardIndex++;
      }
    }

    if (playerHandCards.length !== 7 * game.players.length) {
      console.log("Answer cards: ", answerCards);
      console.log("Rounds: ", game.rounds);
      console.log("Pick: ", lastRoundPick);
      console.log("Missing number of cards: ", missingNumberOfCards);
      console.log("Shuffled cards: ", shuffledCards);
      console.log("Player hand cards: ", playerHandCards);
    }

    // Insert all entries
    await tx.playerHandCard.createMany({
      data: playerHandCards,
    });

    // Return all created entries
    const insertedCards = await tx.playerHandCard.findMany({
      where: {
        OR: playerHandCards.map(({ playerId, cardId }) => ({
          playerId,
          cardId,
        })),
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

  public async getNewPromptCard(
    tx: Prisma.TransactionClient,
    gameId: string
  ): Promise<PromptCard> {
    const ids = await tx.promptCard.findMany({
      where: {
        deck: {
          games: {
            some: { gameId },
          },
        },
      },
      select: { id: true },
    });

    const randomId = ids[Math.floor(Math.random() * ids.length)].id;

    const promptCard = await tx.promptCard.findUnique({
      where: { id: randomId },
    });

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
