// src/socket/types/events.d.ts

import { GameResponse } from "../../types/games";
import {
  CreateRoomResponse,
  EditableRoom,
  EditableRoomUser,
  RoomResponse,
} from "../../types/rooms";

// --- Client-to-Server Events (Incoming) ---
export interface ClientToServerEvents {
  "room:join": (payload: { roomId: string }) => void;
  "room:leave": () => void;
  "room:user:update": (payload: EditableRoomUser) => void;
  "room:host:updateSettings": (payload: EditableRoom) => void;
  "room:host:startGame": () => void;
  "game:join": () => void;
}

export type ErrorType = "not-found" | "unauthorized";

// --- Server-to-Client Events (Outgoing) ---
export interface ServerToClientEvents {
  error: (payload: { message: string; type: ErrorType }) => void; // Generic error messages
  info: (payload: { message: string }) => void; // Generic info messages
  "room:update": (payload: RoomUpdatePayload) => void;
  "room:initGame": (payload: StartingGamePayload) => void;
  "game:update": (payload: GameUpdatePayload) => void;
}

// --- Specific Payload Interfaces ---

export interface StartingGamePayload {
  game: GameResponse;
  handPick: AnswerCard[];
}

export interface MiddleGamePayload {
  round: RoundPayload;
  newCards: AnswerCard[];
}

// --- Room Related ---

export interface CreateRoomPayload extends CreateRoomResponse {}

export interface RoomUpdatePayload extends RoomResponse {}

// --- Game Related ---

export interface GameUpdatePayload extends GameResponse {}

export interface RoundPayload {
  id: string;
  roundNumber: number;
}

export interface AnswerCard {
  id: string;
  text: string;
}
