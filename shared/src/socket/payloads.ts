import { PlayerResponse } from 'src/models';
import { AnswerCard } from '../models/AnswerCard';
import { IncompleteGame } from '../models/Game';
import { RoundResponse } from '../models/Round';

// --- Specific Payload Interfaces ---

export interface StartingGamePayload {
  game: IncompleteGame;
}

export interface MiddleGamePayload {
  round: RoundResponse;
  handPick: AnswerCard[];
}

export interface RoundUpdatePayload {
  round: RoundResponse;
  players: PlayerResponse[] | undefined;
}

export interface EndRoundPayload {
  reason: 'timeout' | 'all_played';
  round: RoundResponse;
}

export interface EndGamePayload {
  winner: PlayerResponse;
  round: RoundResponse;
  players: PlayerResponse[];
}
