// src/socket/handlers/gameHandler.ts

import { GameSocket, IoInstance } from "../config";
import { RoomService } from "../../services/room.service"; // Placeholder for Room-related logic
import { AppError, UnauthorizedError } from "../../utils/errors";
import { RoomUserService } from "../../services/roomUser.service";
import { GameService } from "../../services/game.service";
import { CardService } from "../../services/card.service";
import {
  RoomUpdatePayload,
  CreateRoomPayload,
  EditableRoom,
  EditableRoomSchema,
  EditableRoomUser,
  EditableRoomUserSchema,
  GameUpdatePayload,
  RoundResponse,
} from "cah-shared";
import { endGame, endRound, startNextRound, startRound } from "./roundTimer";
import { RoundService } from "../../services/round.service";
import { PlayerService } from "../../services/player.sevice";

const roomService = new RoomService();
const roomUserService = new RoomUserService();
const gameService = new GameService();
const cardService = new CardService();
const roundService = new RoundService();
const playerService = new PlayerService();

const removeData = (socket: GameSocket) => {
  // Clear socket data info related to room
  // TODO:
  // delete socket.data.userId;
  // delete socket.data.username;
  delete socket.data.currentRoomId;
  delete socket.data.currentGameId;
  delete socket.data.isHost;
};

/**
 * Emits a comprehensive room update to all clients in a specific room.
 * @param io - The Socket.IO server instance.
 * @param roomId - The ID of the room to update.
 */
const emitRoomUpdate = async (
  io: IoInstance,
  roomId: string
): Promise<void> => {
  try {
    // TODO: Do not send the whole object at once
    const roomState: RoomUpdatePayload = await roomService.getRoomState(roomId); // Get latest room data from service

    if (roomState) {
      io.to(roomId).emit("room:update", roomState);
      console.log(`Room ${roomId} updated: ${JSON.stringify(roomState)}`);
    }
  } catch (error: any) {
    console.error(`Failed to emit room update for ${roomId}:`, error);
    // Consider emitting a general error or specific room error to clients if critical
  }
};

/**
 * Emits a comprehensive game update to all clients in a specific room.
 * @param io - The Socket.IO server instance.
 * @param roomId - The ID of the room to update.
 * @returns A promise that resolves when the update is complete.
 * @throws {Error} If there is an error while emitting the update.
 */
const emitGameUpdate = async (
  io: IoInstance,
  roomId: string
): Promise<void> => {
  try {
    // TODO: Do not send the whole object at once
    const gameState: GameUpdatePayload = await gameService.getGameState(roomId); // Get latest room data from service

    if (gameState) {
      io.to(roomId).emit("game:update", gameState);
      console.log(`Game ${roomId} updated: ${JSON.stringify(gameState)}`);
    }
  } catch (error: any) {
    console.error(`Failed to emit game update for ${roomId}:`, error);
    // Consider emitting a general error or specific room error to clients if critical
  }
};

/**
 * Emits a comprehensive game update to all clients in a specific room.
 * @param io - The Socket.IO server instance.
 * @param roomId - The ID of the room to update.
 * @returns A promise that resolves when the update is complete.
 * @throws {Error} If there is an error while emitting the update.
 */
const emitRoundUpdate = async (
  io: IoInstance,
  roomId: string,
  withPlayers: boolean = false
): Promise<void> => {
  try {
    // TODO: Do not send the whole object at once
    const roundState: RoundResponse = await roundService.getRoundState(roomId); // Get latest room data from service
    let players = undefined;

    if (withPlayers) {
      players = await playerService.getUpdatedPlayers(roomId);
    }

    if (roundState) {
      io.to(roomId).emit("game:round:update", { round: roundState, players });
      console.log(
        `Round ${roundState.id} updated: ${JSON.stringify(roundState)}`
      );
    }
  } catch (error: any) {
    console.error(`Failed to emit game update for ${roomId}:`, error);
    // Consider emitting a general error or specific room error to clients if critical
  }
};

const leaveRoom = async (
  io: IoInstance,
  socket: GameSocket,
  roomId?: string
) => {
  // Clear socket data info related to room
  removeData(socket);

  if (!roomId) {
    throw new AppError("Room ID not provided.");
  }

  // Update database of roomUser disconnecting from room
  const wasRoomDeleted = await roomService.leaveRoom(
    socket.data.userId,
    roomId
  );

  // Remove socket from the Socket.IO room
  socket.leave(roomId);

  if (!wasRoomDeleted) {
    // Send leave confirmation
    socket.emit("info", { message: `Left room '${roomId}'.` });

    // Notify all users in the room with the new room state
    emitRoomUpdate(io, roomId);
  }
};

/**
 * Registers all game-related Socket.IO event handlers for a given socket.
 * @param io - The Socket.IO server instance.
 * @param socket - The individual client socket.
 */
export const registerGameHandlers = (io: IoInstance, socket: GameSocket) => {
  // --- Room Events ---
  // --- Disconnection ---
  socket.on("disconnect", async () => {
    const currentRoomId = socket.data.currentRoomId;

    try {
      console.log(
        `A user disconnected: ${socket.data.username} (ID: ${socket.id})`
      );

      await leaveRoom(io, socket, currentRoomId);
    } catch (err) {
      console.error(`Error disconnecting ${socket.data.username}:`, err);
    }
  });

  // When a user asks to join a room
  socket.on("room:join", async (payload: { roomId: string }) => {
    try {
      console.log(
        `User ${socket.data.username} (${socket.data.userId}) attempting to join room ${payload.roomId}`
      );

      // Create the roomUser in database
      const room: CreateRoomPayload = await roomService.joinRoom(
        payload.roomId,
        socket.data.userId,
        socket.id
      );

      // Add socket to the Socket.IO room
      socket.join(payload.roomId);

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) joined room ${payload.roomId}`
      );
      // Store on socket data info about the roomId and if the user is host
      socket.data.currentRoomId = payload.roomId;
      // TODO: add socket.data.currentRoomUserId
      // TODO: add socket.data.currentPlayerId
      socket.data.isHost = socket.data.userId === room.hostId;

      // Send join confirmation
      socket.emit("info", { message: `Joined room '${room.name}'.` });

      // Notify all users in the room with the new room state
      emitRoomUpdate(io, payload.roomId);
    } catch (error: any) {
      console.error(`Error joining room ${payload.roomId}:`, error);

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to join room.",
        type: "not-found",
      });
    }
  });

  // When a roomUser updates its state
  socket.on("room:user:update", async (rawPayload: EditableRoomUser) => {
    try {
      const currentRoomId = socket.data.currentRoomId;

      // Check if user is in a room
      if (!currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      // Validate payload with zod schema (ensures only the expected fields are present)
      const payload = EditableRoomUserSchema.parse(rawPayload);

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) updating room ${currentRoomId}`
      );

      // Update roomUser in database
      await roomUserService.changeRoomUserStatus(
        socket.data.userId,
        currentRoomId,
        payload
      );

      // Notify all users in the room with the new room state
      emitRoomUpdate(io, currentRoomId);
    } catch (error: any) {
      console.error(`Error updating room user:`, error);

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to update room user.",
        type: "not-found",
      });
    }
  });

  // When a host updates the room settings
  socket.on("room:host:updateSettings", async (rawPayload: EditableRoom) => {
    try {
      const currentRoomId = socket.data.currentRoomId;

      // Check if user is in a room
      if (!currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      // Check if user is host
      if (!socket.data.isHost) {
        // Make sure only the host can update room settings
        const error = new UnauthorizedError(
          "Only the host can update room settings."
        );

        console.error(`Error updating room settings:`, error);

        // Send unauthorized error
        socket.emit("error", {
          message: error.message || "Failed to update room user.",
          type: "unauthorized",
        });
      }

      // Validate payload with zod schema (ensures only the expected fields are present)
      const payload = EditableRoomSchema.parse(rawPayload);

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) updating room ${currentRoomId}`
      );

      // Update room in database
      await roomService.updateRoomSettings(currentRoomId, payload);

      // Notify all users in the room with the new room state
      emitRoomUpdate(io, currentRoomId);
    } catch (error: any) {
      console.error(`Error updating room settings:`, error);

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to update room settings.",
        type: "not-found",
      });
    }
  });

  // When a user leaves a room
  socket.on("room:leave", async () => {
    const currentRoomId = socket.data.currentRoomId;

    try {
      if (!currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) leaving room ${currentRoomId}`
      );

      await leaveRoom(io, socket, currentRoomId);
    } catch (error: any) {
      console.error(`Error leaving room ${currentRoomId}:`, error);

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to leave room.",
        type: "not-found",
      });
    }
  });

  // on host click start game, start countdown
  // Notify room users it's about to start in 3 seconds
  /*
      io.to(currentRoomId).emit("game:starting", {
        message: "Starting game in 3 seconds.",
      });*/

  // Here it already started the game
  socket.on("room:host:startGame", async () => {
    const currentRoomId = socket.data.currentRoomId;

    try {
      // Check if user is in a room
      if (!currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      if (!socket.data.isHost) {
        throw new UnauthorizedError("Only the host can start the game.");
      }

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) starting game in room ${currentRoomId}`
      );

      // Update room in database
      // TODO: Make this already return the handPick
      const game = await gameService.startGame(currentRoomId);

      // Set socket data info related to game
      socket.data.currentGameId = game.id;

      io.to(currentRoomId).emit("room:game:new", {
        game,
      });

      await startRound(game.id, currentRoomId, io);

      console.log(`Game ${game.id} updated: ${JSON.stringify(game)}`);
    } catch (error: any) {
      console.error(`Error starting game in room ${currentRoomId}:`, error);

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to start game.",
        type: "not-found",
      });
    }
  });

  // When a user claims to join a game
  socket.on("game:join", async () => {
    const currentRoomId = socket.data.currentRoomId;

    try {
      // Check if user is in a room
      if (!currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      if (socket.data.isHost) {
        console.warn("User has already joined the game because it is the host");
        return;
      }

      if (socket.data.currentGameId) {
        throw new AppError("Already in a game.", 400);
      }

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) joining game in room ${currentRoomId}`
      );

      const gameId = await gameService.getRoomAssociatedGameId(currentRoomId); // Get latest room data from service

      if (!gameId) {
        throw new AppError("Room not found.", 404);
      }

      // Set socket data info related to game
      socket.data.currentGameId = gameId;
    } catch (error: any) {
      console.error(`Error joining game in room ${currentRoomId}:`, error);

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to join game.",
        type: "not-found",
      });
    }
  });

  socket.on("game:card:select", async (payload: { cardId: string }) => {
    const currentRoomId = socket.data.currentRoomId;

    try {
      // Check if user is in a room
      if (!currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      if (!socket.data.currentGameId) {
        throw new AppError("Not currently in a game.", 400);
      }

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) selecting card ${payload.cardId} in game ${socket.data.currentGameId}`
      );

      // Update game in database
      await cardService.selectCard(
        socket.data.currentGameId,
        socket.data.userId,
        payload.cardId
      );

      const { haveAllPlayersSubmitted, roundId } =
        await roundService.haveAllPlayersSubmitted(socket.data.currentGameId);

      if (haveAllPlayersSubmitted) {
        endRound(
          socket.data.currentGameId,
          currentRoomId,
          roundId,
          io,
          "all_played"
        );
      }

      // Notify all users in the room with the new game state
      emitRoundUpdate(io, currentRoomId);
    } catch (error: any) {
      console.error(
        `Error selecting card ${payload.cardId} in game ${socket.data.currentGameId}:`,
        error
      );

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to select card.",
        type: "not-found",
      });
    }
  });

  socket.on("game:czar:vote", async (payload: { roundPickId: string }) => {
    const currentRoomId = socket.data.currentRoomId;

    try {
      // Check if user is in a room
      if (!currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      if (!socket.data.currentGameId) {
        throw new AppError("Not currently in a game.", 400);
      }

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) voting for card ${payload.roundPickId} in game ${socket.data.currentGameId}`
      );

      // Update game in database
      const winner = await roundService.voteForRoundPick(payload.roundPickId);

      // Notify all users in the room with the new game state
      await emitRoundUpdate(io, currentRoomId, true);

      if (winner) {
        endGame(socket.data.currentGameId, currentRoomId, io, winner);
      } else {
        startNextRound(socket.data.currentGameId, currentRoomId, io);
      }
    } catch (error: any) {
      console.error(
        `Error voting for card ${payload.roundPickId} in game ${socket.data.currentGameId}:`,
        error
      );

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to vote for card.",
        type: "not-found",
      });
    }
  });
};
