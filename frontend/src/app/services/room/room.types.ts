export interface CreateRoomResponse {
  id: string;
  name: string;
  hostId: string;
}

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

export interface RoomResponse {
  id: string;
  name: string;
  hostId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  winningRounds: number;
  maxPlayers: number;
  users: RoomUser[];
}

export interface GameResponse {}

export interface RoomUser {
  id: string;
  username: string;
  isHost: boolean;
  status: 'DISCONNECTED' | 'WAITING' | 'READY' | 'IN_GAME';
}

export interface SocketError {
  message: string;
  type: string;
}

export type ErrorType = 'not-found' | 'unauthorized';
