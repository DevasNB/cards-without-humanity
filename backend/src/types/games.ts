import { GameStatus, RoundStatus } from "@prisma/client";
import { DeckResponse } from "./decks";

export interface GameResponse {
  // props everyone should receive
  id: string;
  players: PlayerResponse[];

  status: GameStatus;

  decks: DeckResponse[];
  rounds: RoundResponse[];
  currentRoundIndex: number;

  // props only the host should receive

  // props each person should receive different
  initialCards: CardResponse[];
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
