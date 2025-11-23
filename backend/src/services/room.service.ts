// src/services/room.service.ts
import prisma from "../utils/prisma";
import { BadRequestError, NotFoundError } from "../utils/errors";
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
    // Check if user already is hosting an active room
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

    // Map the rooms to a response
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
    // Find the room
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

    // Check if the room exists
    if (!updatedRoom) {
      throw new NotFoundError("Room not found");
    }

    // Map the room to a response
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

  /**
   * Updates the settings of a room.
   * @param {string} roomId - The ID of the room to update.
   * @param {EditableRoom} payload - The new settings for the room.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  public async updateRoomSettings(
    roomId: string,
    payload: EditableRoom
  ): Promise<void> {
    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: payload,
    });
  }

  /**
   * Joins a user to a room.
   * @param {string} roomId - The ID of the room to join.
   * @param {string} userId - The ID of the user joining the room.
   * @param {string} connectionId - The ID of the user's connection.
   * @returns {Promise<CreateRoomResponse>} A promise that resolves to the updated room data.
   * @throws {NotFoundError} If the room or user is not found.
   */
  public async joinRoom(
    roomId: string,
    userId: string,
    connectionId: string
  ): Promise<CreateRoomResponse> {
    // Find the room
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    // Check if the room exists
    if (!room) {
      throw new NotFoundError("Room not found");
    }

    // Insert the new room user or update its state
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

    return updatedRoomUser.room;
  }

  /**
   * Leaves a room.
   * @param {string} userId - The ID of the user leaving the room.
   * @param {string} roomId - The ID of the room to leave.
   * @returns {Promise<void>} A promise that resolves when the user has left the room.
   * @throws {NotFoundError} If the room or user is not found.
   * If the user is the host, the next host in the room will be set to the next online user.
   * If there are no online users in the room, the room will be deleted.
   */
  public async leaveRoom(userId: string, roomId: string): Promise<void> {
    // Find the room
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

    // If user isn't host, return - everything is fine
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

    console.log(
      "Online users except host: ",
      onlineUsersExceptHost,
      onlineUsersExceptHost.length
    );

    // If there are any online users, set the new host and return
    if (onlineUsersExceptHost.length > 0) {
      const newHostId = onlineUsersExceptHost[0].userId;

      console.log("Next host: ", newHostId);

      // Set the new host
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

    // If there are not any online users, delete the room
    console.log("Online users except host length = 0");
    console.log("Deleting room...", roomId);

    await prisma.room.delete({
      where: {
        id: roomId,
      },
    });
  }

  public async startGame(roomId: string): Promise<void> {
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

    // Get the ids of the decks for the game
    const gameDecks = await prisma.deck.findMany({
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

    // Create the game
    await prisma.game.create({
      data: {
        // Associated to the room
        roomId,

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

        // Associate all the decks by id
        decks: {
          connect: gameDecks.map((deck) => ({ id: deck.id })),
        },

        // Not creating rounds - only when they all join the game, should the round be created.
        // Wrong! The round should be created when the game starts, or when the host joins
      },
      select: {
        id: true,
      },
    });
  }
}

const WINNING_ROUNDS = 5;
const MAX_PLAYERS = 8;
