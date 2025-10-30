// src/types/rooms.d.ts

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
