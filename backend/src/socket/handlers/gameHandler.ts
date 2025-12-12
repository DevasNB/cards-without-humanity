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
  AnswerCard,
  EditableRoom,
  EditableRoomSchema,
  EditableRoomUser,
  EditableRoomUserSchema,
  GameUpdatePayload,
} from "cah-shared";

const roomService = new RoomService();
const roomUserService = new RoomUserService();
const gameService = new GameService();
const cardService = new CardService();

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

    console.log(gameState, 24941);
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
 * Registers all game-related Socket.IO event handlers for a given socket.
 * @param io - The Socket.IO server instance.
 * @param socket - The individual client socket.
 */
export const registerGameHandlers = (io: IoInstance, socket: GameSocket) => {
  // --- Connection/Disconnection ---
  socket.on("disconnect", async () => {
    console.log(
      `User ${socket.data.username} (${socket.data.userId}) disconnected.`
    );
  });

  // --- Room Events ---

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
      // Check if user is in a room
      if (!socket.data.currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      // Validate payload with zod schema (ensures only the expected fields are present)
      const payload = EditableRoomUserSchema.parse(rawPayload);

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) updating room ${socket.data.currentRoomId}`
      );

      // Update roomUser in database
      await roomUserService.changeRoomUserStatus(
        socket.data.userId,
        socket.data.currentRoomId,
        payload
      );

      // Notify all users in the room with the new room state
      emitRoomUpdate(io, socket.data.currentRoomId);
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
      // Check if user is in a room
      if (!socket.data.currentRoomId) {
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
        `User ${socket.data.username} (${socket.data.userId}) updating room ${socket.data.currentRoomId}`
      );

      // Update room in database
      await roomService.updateRoomSettings(socket.data.currentRoomId, payload);

      // Notify all users in the room with the new room state
      emitRoomUpdate(io, socket.data.currentRoomId);
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
    try {
      const roomId = socket.data.currentRoomId;

      if (!roomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) leaving room ${roomId}`
      );

      // Update database of roomUser disconnecting from room
      await roomService.leaveRoom(socket.data.userId, roomId);

      // Remove socket from the Socket.IO room
      socket.leave(roomId);

      // Clear socket data info related to room
      delete socket.data.currentRoomId;
      delete socket.data.isHost;

      // Send leave confirmation
      socket.emit("info", { message: `Left room '${roomId}'.` });

      // Notify all users in the room with the new room state
      emitRoomUpdate(io, roomId);
    } catch (error: any) {
      console.error(`Error leaving room ${socket.data.currentRoomId}:`, error);

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to leave room.",
        type: "not-found",
      });
    }
  });

  // When a user starts the game
  socket.on("room:host:startGame", async () => {
    try {
      // Check if user is in a room
      if (!socket.data.currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      if (!socket.data.isHost) {
        throw new UnauthorizedError("Only the host can start the game.");
      }

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) starting game in room ${socket.data.currentRoomId}`
      );

      // Update room in database
      // TODO: Make this already return the handPick
      const { game: newGame, handPicks } = await gameService.startGame(
        socket.data.currentRoomId
      );

      // Set socket data info related to game
      socket.data.currentGameId = newGame.id;

      // Notify all users in the room with the new game state
      for (const [connectionId, cards] of handPicks) {
        io.to(connectionId).emit("room:initGame", {
          game: newGame,
          handPick: cards,
        });
      }

      console.log(`Game ${newGame.id} updated: ${JSON.stringify(newGame)}`);
    } catch (error: any) {
      console.error(
        `Error starting game in room ${socket.data.currentRoomId}:`,
        error
      );

      // Send not-found error
      socket.emit("error", {
        message: error.message || "Failed to start game.",
        type: "not-found",
      });
    }
  });

  socket.on("game:card:select", async (payload: { cardId: string }) => {
    try {
      // Check if user is in a room
      if (!socket.data.currentRoomId) {
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

      // Notify all users in the room with the new game state
      emitGameUpdate(io, socket.data.currentRoomId);
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
};
