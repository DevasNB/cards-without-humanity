import { RoomUserResponse } from './RoomUser';
import { SimplifiedUser } from './User';

export interface RoomSettings {
  isPublic: boolean;
  winningRounds: number;
  maxPlayers: number;

  // roundTime: number;
  // scoreLimit: number;
}

// Interface for the response when a room is successfully created
export interface RoomResponse {
  id: string;
  name: string;
  hostId: string;
  users: RoomUserResponse[];

  // settings: RoomSettings;

  createdAt: Date;
  updatedAt: Date;

  isPublic: boolean;
  winningRounds: number;
  maxPlayers: number;
}

export interface ListedRoom {
  id: string;
  name: string;
  isPublic: boolean;
  maxPlayers: number;
  users: SimplifiedUser[];
}

export interface CreateRoomResponse {
  id: string;
  name: string;
  hostId: string;
}

export interface RoomUpdatePayload extends RoomResponse {}
export interface CreateRoomPayload extends CreateRoomResponse {}

import { z } from 'zod';

// zod schema for validating room updates
export const EditableRoomSchema = z
  .object({
    name: z.string().optional(),
    isPublic: z.boolean().optional(),
    //winningRounds: z.number().optional(),
    //maxPlayers: z.number().optional(),
  })
  .strip();

export type EditableRoom = z.infer<typeof EditableRoomSchema>;
