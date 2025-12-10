import { AnswerCard } from '../models/AnswerCard';
import { GameResponse } from '../models/Game';
import { RoundResponse } from '../models/Round';

// --- Specific Payload Interfaces ---

export interface StartingGamePayload {
  game: GameResponse;
  handPick: AnswerCard[];
}

export interface MiddleGamePayload {
  round: RoundResponse;
  newCards: AnswerCard[];
}
