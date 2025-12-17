import { AnswerCard } from '../models/AnswerCard';
import { GameResponse } from '../models/Game';
import { RoundResponse } from '../models/Round';
export interface StartingGamePayload {
    game: GameResponse;
    handPick: AnswerCard[];
}
export interface MiddleGamePayload {
    round: RoundResponse;
    newCards: AnswerCard[];
}
