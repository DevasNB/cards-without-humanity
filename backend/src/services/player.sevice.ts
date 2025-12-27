import { PlayerResponse } from "cah-shared";
import prisma from "../utils/prisma";

export class PlayerService {
  public async getUpdatedPlayers(roomId: string): Promise<PlayerResponse[]> {
    const players = await prisma.player.findMany({
      where: {
        game: {
          roomId,
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            winningRounds: true,
          },
        },
      },
    });

    return players.map((player) => {
      return {
        id: player.id,
        roomUserId: player.user.id,
        username: player.user.user.username,
        points: player._count.winningRounds,
      };
    });
  }
}
