// src/socket/handlers/gameHandler.ts

import { GameSocket } from "../types/socket";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomUpdatePayload,
  CreateRoomPayload,
} from "../types/events";
import { RoomService } from "../../services/room.service"; // Placeholder for Room-related logic
import { AppError, UnauthorizedError } from "../../utils/errors";
import { Server as SocketIOServer } from "socket.io";
import { RoomUserService } from "../../services/roomUser.service";
import { EditableRoomSchema, EditableRoomUserSchema } from "../../types/rooms";

const roomService = new RoomService();
const roomUserService = new RoomUserService();

/**
 * Emits a comprehensive room update to all clients in a specific room.
 * @param io - The Socket.IO server instance.
 * @param roomId - The ID of the room to update.
 */
const emitRoomUpdate = async (
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>,
  roomId: string
): Promise<void> => {
  try {
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
 * Registers all game-related Socket.IO event handlers for a given socket.
 * @param io - The Socket.IO server instance.
 * @param socket - The individual client socket.
 */
export const registerGameHandlers = (
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>,
  socket: GameSocket
) => {
  // --- Connection/Disconnection ---
  socket.on("disconnect", async () => {
    if (!socket.data.currentRoomId) {
      console.log(
        `User ${socket.data.username} (${socket.data.userId}) disconnected.`
      );
      return;
    }

    console.log(
      `User ${socket.data.username} (${socket.data.userId}) disconnected from room ${socket.data.currentRoomId}`
    );

    try {
      await roomService.leaveRoom(
        socket.data.userId,
        socket.data.currentRoomId
      );

      socket.leave(socket.data.currentRoomId); // Remove socket from the Socket.IO room

      socket.emit("info", {
        message: `Left room '${socket.data.currentRoomId}'.`,
      });
      emitRoomUpdate(io, socket.data.currentRoomId); // Update room for remaining users

      delete socket.data.currentRoomId; // Clear current room ID from socket data
      delete socket.data.isHost; // Clear current room ID from socket data
    } catch (error) {
      console.error(
        `Error handling disconnect for user ${socket.data.userId} in room ${socket.data.currentRoomId}:`,
        error
      );
    }
  });

  // --- Room Events ---
  socket.on("room:join", async (payload) => {
    try {
      console.log(
        `User ${socket.data.username} (${socket.data.userId}) attempting to join room ${payload.roomId}`
      );

      const room: CreateRoomPayload = await roomService.joinRoom(
        payload.roomId,
        socket.data.userId,
        socket.id
      );

      socket.join(payload.roomId); // Add socket to the Socket.IO room
      socket.data.currentRoomId = payload.roomId; // Store current room ID on socket data
      socket.data.isHost = socket.data.userId === room.hostId;

      socket.emit("info", { message: `Joined room '${room.name}'.` });

      emitRoomUpdate(io, payload.roomId); // Notify all users in the room
    } catch (error: any) {
      console.error(`Error joining room ${payload.roomId}:`, error);
      socket.emit("error", {
        message: error.message || "Failed to join room.",
        type: "not-found",
      });
    }
  });

  socket.on("roomUser:update", async (rawPayload) => {
    try {
      if (!socket.data.currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      const payload = EditableRoomUserSchema.parse(rawPayload);

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) updating room ${socket.data.currentRoomId}`
      );

      await roomUserService.changeRoomUserStatus(
        socket.data.userId,
        socket.data.currentRoomId,
        payload
      );

      emitRoomUpdate(io, socket.data.currentRoomId); // Notify all users in the room
    } catch (error: any) {
      console.error(`Error updating room user:`, error);
      socket.emit("error", {
        message: error.message || "Failed to update room user.",
        type: "not-found",
      });
    }
  });

  socket.on("room:updateSettings", async (rawPayload) => {
    try {
      if (!socket.data.currentRoomId) {
        throw new AppError("Not currently in a room.", 400);
      }

      if (!socket.data.isHost) {
        const errorMessage = "Only the host can update room settings.";
        const error = new UnauthorizedError(errorMessage);

        console.error(`Error updating room settings:`, error);
        socket.emit("error", {
          message: error.message || "Failed to update room user.",
          type: "unauthorized",
        });
      }

      const payload = EditableRoomSchema.parse(rawPayload);

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) updating room ${socket.data.currentRoomId}`
      );

      await roomService.updateRoomSettings(socket.data.currentRoomId, payload);

      emitRoomUpdate(io, socket.data.currentRoomId); // Notify all users in the room
    } catch (error: any) {
      console.error(`Error updating room settings:`, error);
      socket.emit("error", {
        message: error.message || "Failed to update room settings.",
        type: "not-found",
      });
    }
  });

  socket.on("room:leave", async (payload) => {
    try {
      if (socket.data.currentRoomId !== payload.roomId) {
        throw new AppError("Not currently in this room.", 400);
      }

      console.log(
        `User ${socket.data.username} (${socket.data.userId}) leaving room ${payload.roomId}`
      );

      await roomService.leaveRoom(socket.data.userId, payload.roomId);

      socket.leave(payload.roomId); // Remove socket from the Socket.IO room
      delete socket.data.currentRoomId; // Clear current room ID from socket data
      delete socket.data.isHost; // Clear current room ID from socket data

      socket.emit("info", { message: `Left room '${payload.roomId}'.` });
      emitRoomUpdate(io, payload.roomId); // Notify all users in the room
    } catch (error: any) {
      console.error(`Error leaving room ${payload.roomId}:`, error);

      socket.emit("error", {
        message: error.message || "Failed to leave room.",
        type: "not-found",
      });
    }
  });
};
