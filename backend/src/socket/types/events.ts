// src/socket/types/events.d.ts

import { CreateRoomResponse, RoomResponse } from "../../types/rooms";

// --- Client-to-Server Events (Incoming) ---
export interface ClientToServerEvents {
  "room:join": (payload: { roomId: string; username: string }) => void;
  "room:leave": (payload: { roomId: string }) => void;
}

// --- Server-to-Client Events (Outgoing) ---
export interface ServerToClientEvents {
  error: (payload: { message: string }) => void; // Generic error messages
  info: (payload: { message: string }) => void; // Generic info messages
  "room:update": (payload: RoomUpdatePayload) => void;
}

// --- Specific Payload Interfaces ---

// --- Room Related ---

export interface CreateRoomPayload extends CreateRoomResponse {}

export interface RoomUpdatePayload extends RoomResponse {}
