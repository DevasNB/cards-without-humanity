// src/services/game.service.ts
import { RoomUserStatus } from "@prisma/client";
import prisma from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import { shuffle } from "../utils/helpers";
import { AnswerCard } from "../socket/types/events";

export class CardService {
  public async getHandPickForPlayersInGame(
    gameId: string
  ): Promise<Array<[string, AnswerCard[]]>> {
    // Get all valid cards from the decks table
    const answerCards = await prisma.answerCard.findMany({
      where: {
        AND: [
          // That belong to a deck that is part of the game gameId
          {
            deck: {
              games: {
                some: {
                  gameId,
                },
              },
            },
          },
          // That as not been submitted in any round
          {
            roundSubmissions: {
              none: {
                round: {
                  gameId,
                },
              },
            },
          },
          // And that are not in any player's hand
          {
            playerHands: {
              none: {
                player: {
                  gameId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    // Shuffle the cards
    const shuffledCards = shuffle<{ id: string }>(answerCards);

    // Get the last prompt card's pick and the connected players
    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      select: {
        // Get the last round's prompt card's pick
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
          select: {
            id: true,
          },
        },
      },
    });

    // If the game does not exist, throw an error
    if (!game) {
      throw new NotFoundError("Game not found");
    }

    // Calculate the number of cards that are missing
    const missingNumberOfCards = 7 - (game?.rounds[0]?.promptCard.pick || 0);

    // Create an array of objects to insert
    const playerHandCards = [];

    let cardIndex = 0;

    // Build the array of objects to insert
    for (const player of game.players) {
      for (let i = 0; i < missingNumberOfCards; i++) {
        const card = shuffledCards[cardIndex % shuffledCards.length];
        playerHandCards.push({ playerId: player.id, cardId: card.id });
        cardIndex++;
      }
    }

    // Insert all entries individually and return them
    const insertedCards = await prisma.$transaction(
      playerHandCards.map((card) =>
        prisma.playerHandCard.create({
          data: card,
          select: {
            id: true,
            answerCard: true,
            player: {
              select: {
                user: {
                  select: {
                    connectionId: true,
                  },
                },
              },
            },
          },
        })
      )
    );

    const cards: Record<string, AnswerCard[]> = insertedCards.reduce(
      (acc, card) => {
        const newCard: AnswerCard = {
          id: card.answerCard.id,
          text: card.answerCard.content,
        };

        const connId = card.player.user.connectionId;

        if (!acc[connId]) {
          acc[connId] = [];
        }

        acc[connId].push(newCard);

        return acc;
      },
      {} as Record<string, AnswerCard[]>
    );

    // Convert to array of [connectionId, cards]
    const cardEntries = Object.entries(cards);

    return cardEntries;
  }
}
