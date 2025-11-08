// src/services/room.service.ts
import prisma from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import {
  CreateRoomResponse,
  EditableRoom,
  ListedRoom,
  RoomResponse,
} from "../types/rooms";
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
    const roomWhichUserIsHost = await prisma.room.findUnique({
      where: {
        hostId: userId,
      },
      select: {
        id: true,
        name: true,
        hostId: true,
      },
    });

    // Conflict: User already has an active room. Enter that room
    if (roomWhichUserIsHost) {
      const existingRoom: CreateRoomResponse = roomWhichUserIsHost;
      return existingRoom;
    }

    // Create the room
    const newRoom: CreateRoomResponse = await prisma.room.create({
      data: {
        name: username + "'s Room",
        hostId: userId,
      },
      select: {
        id: true,
        name: true,
        hostId: true,
      },
    });

    return newRoom;
  }

  /**
   * Lists all rooms in the database.
   * @returns A promise that resolves to an array of all rooms in the database.
   */
  public async listRooms(): Promise<ListedRoom[]> {
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        isPublic: true,
        users: {
          where: {
            status: {
              not: RoomUserStatus.DISCONNECTED,
            },
          },
          select: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    const roomsListResponse: ListedRoom[] = rooms.map((updatedRoom) => ({
      id: updatedRoom.id,
      name: updatedRoom.name,
      isPublic: updatedRoom.isPublic,
      maxPlayers: MAX_PLAYERS,
      users: updatedRoom.users.map((user) => ({
        id: user.user.id,
        username: user.user.username,
      })),
    }));

    return roomsListResponse;
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
          where: {
            status: {
              not: RoomUserStatus.DISCONNECTED,
            },
          },
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
        isHost: user.userId === updatedRoom.hostId,
        connectionId: user.connectionId,
        status: user.status,
      })),
    };

    return roomResponse;
  }

  public async updateRoomSettings(roomId: string, payload: EditableRoom) {
    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: payload,
    });
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
        status: RoomUserStatus.WAITING,
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
        connectionId,
      },
      select: {
        room: {
          select: {
            id: true,
            name: true,
            hostId: true,
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

  public async leaveRoom(userId: string, roomId: string) {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      select: {
        hostId: true,
        users: true,
      },
    });

    // Check if room user exists
    if (!room) {
      throw new NotFoundError("Room not found");
    }

    console.log("Room exists: ", room);

    // Mark the room user as disconnected
    await prisma.roomUser.update({
      where: {
        userId_roomId: {
          roomId,
          userId,
        },
      },
      data: {
        status: RoomUserStatus.DISCONNECTED,
      },
    });

    // If user isn't host, return
    if (room.hostId !== userId) {
      console.log("Room user is not host");
      return;
    }

    // If user is host, find the next host
    console.log("Room is host");

    // Find all the online users that are not the host (the current player)
    const onlineUsersExceptHost = room.users
      .filter((user) => user.status !== RoomUserStatus.DISCONNECTED)
      .filter((user) => user.userId !== userId);

    console.log("Online users except host: ", onlineUsersExceptHost);

    console.log(
      "Online users except host length: ",
      onlineUsersExceptHost.length,
      onlineUsersExceptHost.length > 0
    );

    // If there are any online users, set the new host and return
    if (onlineUsersExceptHost.length > 0) {
      console.log("Online users except host length > 0");
      const newHostId = onlineUsersExceptHost[0].userId;

      console.log("Next host: ", newHostId);

      await prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          hostId: newHostId,
        },
      });
      return;
    }

    console.log("Online users except host length = 0");
    console.log("Deleting room...", roomId);

    // If there are not any online users, delete the room
    await prisma.room.delete({
      where: {
        id: roomId,
      },
    });
  }
}

const WINNING_ROUNDS = 5;
const MAX_PLAYERS = 8;
