import { PromptCard, AnswerCard } from './cards';
import { RoomUser } from './room';

type GameStatus = 'WAITING_FOR_PLAYERS' | 'PLAYING' | 'ROUND_ENDED' | 'GAME_ENDED';
type RoundStatus = 'DRAWING_CARDS' | 'CZAR_VOTING' | 'ENDED';

export interface RoundResponse {
  id: string;
  status: RoundStatus;
  roundNumber: number;
  
  czar: PlayerResponse;
  promptCard: PromptCard;
  submittedCards: {
    userId: string;
    card: AnswerCard;
  }[];
  winnerUser?: RoomUser;
}

export interface GameResponse {
  id: string;
  status: GameStatus;
  players: PlayerResponse[];

  currentRound: RoundResponse | null;
}

export interface PlayerResponse {
  id: string;
  roomUserId: string;
  username: string;
}
