import { PlayerResponse } from './Player';
import { RoundResponse } from './Round';
import { GameStatus } from '../enums/GameStatus';

export interface IncompleteGame {
  id: string;
  status: GameStatus;
  players: PlayerResponse[];
  winner?: PlayerResponse;
}

export interface GameResponse extends IncompleteGame {
  currentRound: RoundResponse;
}

export interface GameUpdatePayload extends GameResponse {}
