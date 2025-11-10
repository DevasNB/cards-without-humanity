// src/types/rooms.d.ts
import { z } from "zod";
import { RoomUserStatus } from "@prisma/client";

export interface SimplifiedUser {
  id: string;
  username: string;
}

export interface ListedRoom {
  id: string;
  name: string;
  isPublic: boolean;
  maxPlayers: number;
  users: SimplifiedUser[];
}

export interface RoomUserResponse {
  id: string;
  username: string;
  connectionId: string | null;
  isHost: boolean;
  status: "DISCONNECTED" | "WAITING" | "READY" | "IN_GAME";
}

// Interface for the response when a room is successfully created
export interface RoomResponse {
  id: string;
  name: string;
  hostId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  winningRounds: number;
  maxPlayers: number;
  users: RoomUserResponse[];
}

export interface CreateRoomResponse {
  id: string;
  name: string;
  hostId: string;
}

// zod schema for validating roomUser updates
export const EditableRoomUserSchema = z
  .object({
    status: z
      .enum([
        RoomUserStatus.DISCONNECTED,
        RoomUserStatus.WAITING,
        RoomUserStatus.READY,
        RoomUserStatus.IN_GAME,
      ])
      .optional(),
  })
  .strip();

// zod schema for validating room updates
export const EditableRoomSchema = z
  .object({
    name: z.string().optional(),
    isPublic: z.boolean().optional(),
    //winningRounds: z.number().optional(),
    //maxPlayers: z.number().optional(),
  })
  .strip();

export type EditableRoomUser = z.infer<typeof EditableRoomUserSchema>;
export type EditableRoom = z.infer<typeof EditableRoomSchema>;
