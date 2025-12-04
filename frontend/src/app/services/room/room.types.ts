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

export interface GameResponse {
  id: string;
  players: PlayerResponse[];
  status: GameStatus;
}

export interface StartingGamePayload {
  game: GameResponse;
  handPick: WhiteCard[];
}

export interface MiddleGamePayload {
  round: RoundResponse;
  newCards: WhiteCard[];
}

export interface BlackCard {
  id: number;
  text: string;
}

export interface WhiteCard {
  id: number;
  text: string;
}

export enum GameStatus {
  WAITING_FOR_PLAYERS = 'WAITING_FOR_PLAYERS', // When in lobby
  PLAYING = 'PLAYING', // When playing a round
  ROUND_ENDED = 'ROUND_ENDED', // When a round has ended
  GAME_ENDED = 'GAME_ENDED', // When the game ended
}

export interface PlayerResponse {
  id: string;
  roomUserId: string;
  username: string;
}

export interface RoundResponse {}

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
