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
  "room:join": (payload: { roomId: string; username: string }) => void;
  "room:leave": (payload: { roomId: string }) => void;
  "room:updateSettings": (payload: EditableRoom) => void;
  "roomUser:update": (payload: EditableRoomUser) => void;
  "room:startGame": () => void;
}

export type ErrorType = "not-found" | "unauthorized";

// --- Server-to-Client Events (Outgoing) ---
export interface ServerToClientEvents {
  error: (payload: { message: string; type: ErrorType }) => void; // Generic error messages
  info: (payload: { message: string }) => void; // Generic info messages
  "room:update": (payload: RoomUpdatePayload) => void;
  "game:update": (payload: GameUpdatePayload) => void;
}

// --- Specific Payload Interfaces ---

// --- Room Related ---

export interface CreateRoomPayload extends CreateRoomResponse {}

export interface RoomUpdatePayload extends RoomResponse {}

export interface GameUpdatePayload extends GameResponse {}

export interface RoundPayload {
  id: string;
  roundNumber: number;
}
