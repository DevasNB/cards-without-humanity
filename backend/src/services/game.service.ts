// src/services/game.service.ts
import prisma from "../utils/prisma";
import { GameResponse, RoundResponse } from "cah-shared";
import { NotFoundError } from "../utils/errors";
import { SelectedRounds } from "../utils/prisma/helpers/selects/rounds";
import { getRoundResponse } from "../utils/prisma/helpers/dtos/rounds";

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
            _count: {
              select: {
                winningRounds: true,
              },
            },
          },
        },
        rounds: SelectedRounds,
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

    const roundResponse = getRoundResponse(updatedRound);

    // Map the game to a response
    const gameResponse: GameResponse = {
      id: updatedGame.id,
      status: updatedGame.status,
      players: updatedGame.players.map((player) => ({
        id: player.id,
        roomUserId: player.user.id,
        username: player.user.user.username,
        points: player._count.winningRounds,
      })),
      currentRound: roundResponse,
    };

    return gameResponse;
  }
}
