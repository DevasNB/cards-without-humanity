export type UserStatus = 'READY' | 'WAITING';

export interface RoomUser {
  id: string;
  username: string;
  points: number;
  status: UserStatus;
  isHost: boolean;
}

export interface RoomSettings {
  maxPlayers: number;
  roundTime: number;
  scoreLimit: number;
}

export interface RoomResponse {
  id: string;
  code: string;
  hostId: string;
  users: RoomUser[];
  settings: RoomSettings;
}
