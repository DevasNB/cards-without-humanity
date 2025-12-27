// src/services/game.service.ts
import prisma from "../utils/prisma";
import { GameResponse, IncompleteGame, RoundResponse } from "cah-shared";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { SelectedRounds } from "../utils/prisma/helpers/selects/rounds";
import { getRoundResponse } from "../utils/prisma/helpers/dtos/rounds";
import { GameStatus, RoomUserStatus } from "@prisma/client";

// TODO: delete this
(async () => {
  await prisma.room.deleteMany();
})();

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

    const roundResponse: RoundResponse = getRoundResponse(updatedRound);

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

  public async getRoomAssociatedGameId(roomId: string): Promise<string> {
    const game = await prisma.game.findUnique({
      where: { roomId },
      select: { id: true },
    });

    if (!game) {
      throw new NotFoundError("Round not found");
    }

    return game.id;
  }

  /**
   * Starts a game in the given room.
   * @param {string} roomId - The ID of the room to start the game in.
   * @returns {Promise<GameResponse>} A promise that resolves to the created game's data.
   * @throws {NotFoundError} If the room is not found.
   * @throws {BadRequestError} If not everyone in the room is ready, or if there are not enough players to start the game.
   */
  public async startGame(roomId: string): Promise<IncompleteGame> {
    // Find the room
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      select: {
        users: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Check if room exists
    if (!room) {
      throw new NotFoundError("Room not found");
    }

    /*
    // Validations (all users are ready, and no less than 3 users are in the room)
    const usersStatus = room.users.map((user) => user.status);

    const waitingCount = usersStatus.filter(
      (status) => status === RoomUserStatus.WAITING
    ).length;

    if (waitingCount > 0) {
      throw new BadRequestError("Not everyone in the room is ready");
    }

    const readyCount = usersStatus.filter(
      (status) => status === RoomUserStatus.READY
    ).length;

    if (readyCount < 3) {
      throw new BadRequestError("Not enough players to start the game");
    }
      */

    // Get the ids of the decks for the game
    const selectedDecks = await prisma.deck.findMany({
      // TODO: where the user has selected them, it must come from the payload
      select: {
        id: true,
      },
    });

    // Delete all the room users that have been disconnected
    await prisma.roomUser.deleteMany({
      where: {
        AND: [{ roomId }, { status: RoomUserStatus.DISCONNECTED }],
      },
    });

    // Find only the online users.
    // ! Attention: This is probably not needed. We could just use the room.users, as there's no one waiting, disconnected or in game
    const onlineUsers = room.users.filter(
      (user) => user.status === RoomUserStatus.READY
    );

    // Get a new game
    const { createdGame } = await prisma.$transaction(async (prisma) => {
      // Mark all players to be IN_GAME
      await prisma.roomUser.updateMany({
        where: {
          AND: [{ roomId }, { status: RoomUserStatus.READY }],
        },
        data: {
          status: RoomUserStatus.IN_GAME,
        },
      });

      // Create the game
      const newGame = await prisma.game.create({
        data: {
          // Associated to the room
          roomId,

          // TODO: Attention! For now, we are assuming that the game can start immediately. In fact, I think it should be this way. However, in that case, WAITING_FOR_PLAYERS is useless
          status: GameStatus.PLAYING,

          // Create all the players; Only related to the room users
          // ! Attention: Additional data will be created and updated once they join the game
          // Wrong! All the associated data should be created/updated, and when the user arrives, it's simply handed to them
          players: {
            createMany: {
              data: onlineUsers.map((user) => ({
                roomUserId: user.id,
              })),
            },
          },

          // Create all the GameDecks - The decks associated to the game
          decks: {
            createMany: {
              data: selectedDecks.map((deck) => ({ deckId: deck.id })),
            },
          },
        },
        select: {
          id: true,
          status: true,
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
        },
      });

      return { createdGame: newGame };
    });

    // Check if the game has been created
    if (!createdGame) {
      throw new BadRequestError("Game not created");
    }

    // Map the game to a response

    const gameResponse: IncompleteGame = {
      id: createdGame.id,
      status: createdGame.status,
      players: createdGame.players.map((player) => ({
        id: player.id,
        roomUserId: player.user.id,
        username: player.user.user.username,
        points: player._count.winningRounds,
      })),
    };

    return gameResponse;
  }
}
