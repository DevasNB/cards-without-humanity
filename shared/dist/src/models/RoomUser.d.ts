import { UserStatusType } from '../enums/RoomUserStatus';
import { z } from 'zod';
export interface RoomUserResponse {
  id: string;
  username: string;
  connectionId: string | null;
  isHost: boolean;
  status: UserStatusType;
}
export declare const EditableRoomUserSchema: z.ZodObject<
  {
    status: z.ZodOptional<
      z.ZodEnum<{
        [x: string]: string;
      }>
    >;
  },
  z.core.$strip
>;
export type EditableRoomUser = z.infer<typeof EditableRoomUserSchema>;
