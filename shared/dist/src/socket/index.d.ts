export * from './errors';
export * from './payloads';
import { EditableRoom, EditableRoomUser, GameUpdatePayload, RoomUpdatePayload } from '../models';
import { ErrorType } from './errors';
import { MiddleGamePayload, StartingGamePayload } from './payloads';
export interface ClientToServerEvents {
    'room:join': (payload: {
        roomId: string;
    }) => void;
    'room:leave': () => void;
    'room:user:update': (payload: EditableRoomUser) => void;
    'room:host:updateSettings': (payload: EditableRoom) => void;
    'room:host:startGame': () => void;
    'game:join': () => void;
    'game:card:select': (payload: {
        cardId: string;
    }) => void;
}
export interface ServerToClientEvents {
    error: (error: {
        message: string;
        type: ErrorType;
    }) => void;
    info: (info: {
        message: string;
    }) => void;
    'room:update': (payload: RoomUpdatePayload) => void;
    'room:game:new': (payload: StartingGamePayload) => void;
    'game:update': (payload: GameUpdatePayload) => void;
    'game:round:new': (payload: MiddleGamePayload) => void;
}
