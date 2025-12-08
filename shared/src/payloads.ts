import { GameResponse, RoundResponse } from './game';
import { AnswerCard } from './cards';
import { RoomResponse } from './room';

export interface StartingGamePayload {
  game: GameResponse;
  handPick: AnswerCard[];
}

export interface MiddleGamePayload {
  round: RoundResponse;
  newCards: AnswerCard[];
}

export interface RoomUpdatePayload {
  room: RoomResponse;
}

export interface SubmitWhiteCardPayload {
  cardId: string;
}

export interface ChooseWinnerPayload {
  userId: string;
}
