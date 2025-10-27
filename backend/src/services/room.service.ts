// src/services/room.service.ts
import prisma from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import { CreateRoomResponse, RoomResponse } from "../types/rooms";
import { RoomUserStatus } from "@prisma/client";

export class RoomService {
  /**
   * Creates a new room in the database.
   * @param userId - An object containing the host user's id.
   * @returns A promise that resolves to the created room's data.
   */
  public async createRoom(
    userId: string,
    username: string
  ): Promise<CreateRoomResponse> {
    // Check if username already exists
    const existingRoom: CreateRoomResponse | null =
      await prisma.room.findUnique({
        where: {
          hostId: userId,
        },
        select: {
          id: true,
          name: true,
        },
      });

    // Conflict: User already has an active room. Enter that room
    if (existingRoom) {
      return existingRoom;
    }

    // Create the room
    const newRoom: CreateRoomResponse = await prisma.room.create({
      data: {
        hostId: userId,
        name: username + "'s Room",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return newRoom;
  }

  /**
   * Retrieves the current state of a room in the database.
   * @param id - The ID of the room to retrieve.
   * @returns A promise that resolves to the room's state, including its name, host ID, public status, and user data.
   * @throws {NotFoundError} If the room with the given ID does not exist.
   */
  public async getRoomState(id: string): Promise<RoomResponse> {
    const updatedRoom = await prisma.room.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!updatedRoom) {
      throw new NotFoundError("Room not found");
    }

    const roomResponse: RoomResponse = {
      id: updatedRoom.id,
      name: updatedRoom.name,
      hostId: updatedRoom.hostId,
      isPublic: updatedRoom.isPublic,
      createdAt: updatedRoom.createdAt,
      updatedAt: updatedRoom.updatedAt,
      winningRounds: WINNING_ROUNDS,
      maxPlayers: MAX_PLAYERS,
      users: updatedRoom.users.map((user) => ({
        id: user.id,
        username: user.user.username,
        isHost: user.isHost,
        connectionId: user.connectionId,
        status: user.status,
      })),
    };

    return roomResponse;
  }

  public async joinRoom(
    roomId: string,
    userId: string,
    connectionId: string
  ): Promise<CreateRoomResponse> {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      throw new NotFoundError("Room not found");
    }

    const updatedRoomUser = await prisma.roomUser.upsert({
      where: {
        userId_roomId: {
          roomId,
          userId,
        },
      },
      update: {
        connectionId,
        // TODO: if it is already in the room, how do we know its status?
        // if a game is in progress, the status should be IN_GAME
        //    but be careful: if the game is over, the status should be WAITING
        //    and another careful: probably if the game has started and there is not a corresponding player (with the roomuser), we should not allow the user to play. it should be "spectating", probably
        // if a game is not in progress, the status should be WAITING
      },
      create: {
        roomId,
        userId,
        status: RoomUserStatus.WAITING,
        isHost: room.hostId === userId,
        connectionId,
      },
      select: {
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const updatedRoom = updatedRoomUser.room;

    if (!updatedRoom) {
      throw new NotFoundError("Room not found");
    }

    return updatedRoom;
  }

  public async handleUserDisconnect(userId: string, roomId: string) {
    await prisma.roomUser.updateMany({
      where: {
        userId,
        roomId,
      },
      data: {
        status: RoomUserStatus.DISCONNECTED,
      },
    });
  }
}

const WINNING_ROUNDS = 5;
const MAX_PLAYERS = 8;
