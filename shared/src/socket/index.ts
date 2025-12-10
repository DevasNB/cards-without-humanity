// shared/src/socket/index.ts
export * from './errors';
export * from './payloads';

import { EditableRoom, EditableRoomUser, GameUpdatePayload, RoomUpdatePayload } from '../models';
import { ErrorType } from './errors';
import { StartingGamePayload } from './payloads';

// --- Client-to-Server Events (Incoming) ---
export interface ClientToServerEvents {
  'room:join': { roomId: string };
  'room:leave': {};
  'room:user:update': EditableRoomUser;
  'room:host:updateSettings': EditableRoom;
  'room:host:startGame': {};
  'game:join': {};
}

// --- Server-to-Client Events (Outgoing) ---
export interface ServerToClientEvents {
  error: { message: string; type: ErrorType }; // Generic error messages
  info: { message: string }; // Generic info messages
  'room:update': RoomUpdatePayload;
  'room:initGame': StartingGamePayload;
  'game:update': GameUpdatePayload;
}
