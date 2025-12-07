import { GameStatus, RoundStatus } from "@prisma/client";

export interface GameResponse {
  id: string;
  status: GameStatus;
  players: PlayerResponse[];
}

export interface CardResponse {}

export interface PlayerResponse {
  id: string;
  roomUserId: string;
  username: string;
}

export interface RoundResponse {
  id: string;
  roundNumber: number;
  status: RoundStatus;

  czarId: string;
  winnerId: string | null;
  promptCardId: string;
}
