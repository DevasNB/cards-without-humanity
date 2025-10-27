export interface CreateRoomResponse {
  id: string;
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

export interface RoomUser {
  id: string;
  name: string;
  isHost: boolean;
  status: 'DISCONNECTED' | 'WAITING' | 'READY' | 'IN_GAME';
}
