// shared/src/socket/index.ts
export * from './errors';
export * from './payloads';

import {
  EditableRoom,
  EditableRoomUser,
  GameUpdatePayload,
  RoomResponse,
  RoomUpdatePayload,
  RoundResponse,
} from '../models';
import { ErrorType } from './errors';
import {
  EndRoundPayload,
  MiddleGamePayload,
  RoundUpdatePayload,
  StartingGamePayload,
} from './payloads';

// --- Client-to-Server Events (Incoming) ---
export interface ClientToServerEvents {
  'room:join': (payload: { roomId: string }) => void;
  'room:leave': () => void;
  'room:user:update': (payload: EditableRoomUser) => void;
  'room:host:updateSettings': (payload: EditableRoom) => void;
  'room:host:startGame': () => void;
  'game:join': () => void;
  'game:card:select': (payload: { cardId: string }) => void;
  'game:czar:vote': (payload: { roundPickId: string }) => void;
}

// --- Server-to-Client Events (Outgoing) ---

export interface ServerToClientEvents {
  error: (error: { message: string; type: ErrorType }) => void; // Generic error messages
  info: (info: { message: string }) => void; // Generic info messages
  'room:update': (payload: RoomUpdatePayload) => void;
  'room:game:new': (payload: StartingGamePayload) => void;
  'game:update': (payload: GameUpdatePayload) => void;
  'game:round:new': (payload: MiddleGamePayload) => void;
  'game:round:update': (payload: RoundUpdatePayload) => void;
  'game:round:end': (payload: EndRoundPayload) => void;
}
