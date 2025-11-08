// src/services/roomUser.service.ts
import { EditableRoomUser } from "../types/rooms";
import prisma from "../utils/prisma";

export class RoomUserService {
  public async changeRoomUserStatus(
    userId: string,
    roomId: string,
    payload: EditableRoomUser
  ): Promise<void> {
    await prisma.roomUser.update({
      where: {
        userId_roomId: {
          roomId,
          userId,
        },
      },
      data: payload,
    });
  }
}
