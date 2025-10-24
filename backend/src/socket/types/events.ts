// src/socket/types/events.d.ts

// --- Client-to-Server Events (Incoming) ---
export interface ClientToServerEvents {}

// --- Server-to-Client Events (Outgoing) ---
export interface ServerToClientEvents {
  error: (payload: { message: string }) => void; // Generic error messages
  info: (payload: { message: string }) => void; // Generic info messages
}
