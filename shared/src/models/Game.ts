import { PlayerResponse } from './Player';
import { RoundResponse } from './Round';
import { GameStatus } from '../enums/GameStatus';

export interface GameResponse {
  id: string;
  status: GameStatus;
  players: PlayerResponse[];

  currentRound?: RoundResponse | null;
}

export interface GameUpdatePayload extends GameResponse {}
