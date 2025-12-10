// src/services/game.service.ts
import prisma from "../utils/prisma";
import { GameResponse, RoundResponse } from "cah-shared";
import { NotFoundError } from "../utils/errors";

export class GameService {
  /**
   * Retrieves the current state of a game in the database.
   * @param roomId - The ID of the room to retrieve the game from.
   * @returns A promise that resolves to the game's state, including its ......TODO
   * @throws {NotFoundError} If the game with the given roomId does not exist.
   */
  public async getGameState(roomId: string): Promise<GameResponse> {
    // Find the game
    const updatedGame = await prisma.game.findUnique({
      where: { roomId },
      select: {
        id: true,
        status: true,
        decks: {
          select: {
            id: true,
          },
        },
        players: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                user: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
        rounds: {
          select: {
            id: true,
            roundNumber: true,
            status: true,
            czar: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    user: true,
                  },
                },
              },
            },
            promptCard: true,
            picks: true,
          },
          orderBy: {
            roundNumber: "asc",
          },
          take: 1,
        },
        round: true,
      },
    });

    // Check if the game exists
    if (!updatedGame) {
      throw new NotFoundError("Game not found");
    }

    const updatedRound = updatedGame.rounds[0];

    if (!updatedRound) {
      throw new NotFoundError("Round not found");
    }

    const czar = updatedRound.czar;
    const promptCard = updatedRound.promptCard;

    // Map the round to a response
    const picks = updatedRound.picks.map((pick) => ({
      id: pick.id,
      playerId: pick.playerId,
      cardId: pick.cardId,
      isWinner: pick.isWinner,
    }));

    const roundResponse: RoundResponse = {
      id: updatedRound.id,
      roundNumber: updatedRound.roundNumber,
      status: updatedRound.status,
      czar: {
        id: czar.id,
        roomUserId: czar.user.id,
        username: czar.user.user.username,
      },
      promptCard: {
        id: promptCard.id,
        text: promptCard.content,
        pick: promptCard.pick,
      },
      picks,
    };

    // Map the game to a response
    const gameResponse: GameResponse = {
      id: updatedGame.id,
      status: updatedGame.status,
      players: updatedGame.players.map((player) => ({
        id: player.id,
        roomUserId: player.user.id,
        username: player.user.user.username,
      })),
      currentRound: roundResponse,
    };

    return gameResponse;
  }
}
