// src/services/roomUser.service.ts
import { EditableRoomUser } from "cah-shared";
import prisma from "../utils/prisma";
import { RoomUserStatus } from "@prisma/client";

export class RoomUserService {
  /**
   * Updates the status of a room user.
   * @param userId - The ID of the user to update.
   * @param roomId - The ID of the room the user is in.
   * @param payload - An object containing the new status for the user.
   * @returns A promise that resolves when the update is complete.
   * @throws {NotFoundError} If the room user is not found.
   */
  public async changeRoomUserStatus(
    userId: string,
    roomId: string,
    payload: EditableRoomUser
  ): Promise<void> {
    // Update the room user
    await prisma.roomUser.update({
      where: {
        userId_roomId: {
          roomId,
          userId,
        },
      },
      data: {
        ...payload,
        status: payload.status as RoomUserStatus | undefined,
      },
    });
  }
}
