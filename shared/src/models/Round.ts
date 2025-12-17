import { RoundStatus } from '../enums/RoundStatus';
import { AnswerCard } from './AnswerCard';
import { PlayerResponse } from './Player';
import { PromptCard } from './PromptCard';

export interface RoundResponse {
  id: string;
  status: RoundStatus;

  czar: PlayerResponse;
  winner?: PlayerResponse;

  promptCard: PromptCard;
  picks: RoundPick[];
}

export interface RoundPayload {
  id: string;
}

export interface RoundPick {
  id: string;
  playerId: string;
  cardId: string;
  isWinner?: boolean;
  text?: string;
}
