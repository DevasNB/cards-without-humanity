import { RoomUserResponse } from './RoomUser';
import { SimplifiedUser } from './User';
export interface RoomSettings {
    isPublic: boolean;
    winningRounds: number;
    maxPlayers: number;
}
export interface RoomResponse {
    id: string;
    name: string;
    hostId: string;
    users: RoomUserResponse[];
    createdAt: Date;
    updatedAt: Date;
    isPublic: boolean;
    winningRounds: number;
    maxPlayers: number;
}
export interface ListedRoom {
    id: string;
    name: string;
    isPublic: boolean;
    maxPlayers: number;
    users: SimplifiedUser[];
}
export interface CreateRoomResponse {
    id: string;
    name: string;
    hostId: string;
}
export interface RoomUpdatePayload extends RoomResponse {
}
export interface CreateRoomPayload extends CreateRoomResponse {
}
import { z } from 'zod';
export declare const EditableRoomSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type EditableRoom = z.infer<typeof EditableRoomSchema>;
