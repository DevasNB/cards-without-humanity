import { AnswerCard } from '../models/AnswerCard';
import { IncompleteGame } from '../models/Game';
import { RoundResponse } from '../models/Round';
export interface StartingGamePayload {
    game: IncompleteGame;
}
export interface MiddleGamePayload {
    round: RoundResponse;
    handPick: AnswerCard[];
}
export interface EndRoundPayload {
    reason: 'timeout' | 'all_played';
}
