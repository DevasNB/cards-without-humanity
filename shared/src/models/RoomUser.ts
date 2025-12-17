import { UserStatus } from '../enums/RoomUserStatus';
import { z } from 'zod';

export interface RoomUserResponse {
  id: string;
  username: string;
  connectionId: string | null;
  isHost: boolean;
  status: UserStatus;

  // points: number;
}

// zod schema for validating roomUser updates
export const EditableRoomUserSchema = z
  .object({
    status: z
      .enum([UserStatus.DISCONNECTED, UserStatus.WAITING, UserStatus.READY, UserStatus.IN_GAME])
      .optional(),
  })
  .strip();

export type EditableRoomUser = z.infer<typeof EditableRoomUserSchema>;
