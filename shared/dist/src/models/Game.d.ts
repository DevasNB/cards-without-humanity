import { PlayerResponse } from './Player';
import { RoundResponse } from './Round';
import { GameStatus } from '../enums/GameStatus';
export interface GameResponse {
    id: string;
    status: GameStatus;
    players: PlayerResponse[];
    currentRound: RoundResponse;
}
export interface IncompleteGame {
    id: string;
    status: GameStatus;
    players: PlayerResponse[];
}
export interface GameUpdatePayload extends GameResponse {
}
