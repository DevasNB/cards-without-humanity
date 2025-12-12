// src/services/game.service.ts
import {
  Prisma,
  PrismaClient,
  RoomUserStatus,
  RoundStatus,
} from "@prisma/client";
import prisma from "../utils/prisma";
import { AnswerCard, PlayerResponse, RoundResponse } from "cah-shared";
import { CardService } from "./card.service";
import { randomElement } from "../utils/helpers";
import { getRoundResponse } from "../utils/prisma/helpers/dtos/rounds";
import { SelectedRounds } from "../utils/prisma/helpers/selects/rounds";
import { NotFoundError } from "../utils/errors";

const cardService = new CardService();

export class RoundService {
  public async createNewRound(
    tx: Prisma.TransactionClient,
    gameId: string
  ): Promise<{
    handPicks: Map<string, AnswerCard[]>;
    roundResponse: RoundResponse;
  }> {
    const promptCard = await cardService.getNewPromptCard(tx, gameId);
    const czar = await this.getNextCzar(tx, gameId);

    const newRound = await tx.round.create({
      data: {
        gameId,
        status: RoundStatus.DRAWING_CARDS,
        czarId: czar.id,
        promptCardId: promptCard.id,
      },
      select: SelectedRounds.select,
    });

    const roundResponse: RoundResponse = getRoundResponse(newRound);

    // Generate hand pick for each player
    const handPicks: Map<string, AnswerCard[]> =
      await cardService.getHandPickForPlayersInGame(tx, gameId);

    return { handPicks, roundResponse };
  }

  private async getNextCzar(
    tx: Prisma.TransactionClient,
    gameId: string
  ): Promise<PlayerResponse> {
    // Find all players
    const possiblePlayers = await tx.player.findMany({
      where: {
        // Inside the game
        gameId,
        // Which status is IN_GAME
        user: {
          status: RoomUserStatus.IN_GAME,
        },
      },
      select: {
        id: true,
        _count: {
          select: { judgingRounds: true, winningRounds: true },
        },
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
      },
    });

    const neverCzar = possiblePlayers.filter(
      (p) => p._count.judgingRounds === 0
    );

    // If there is at least one player from the game that has not been czar yet
    if (neverCzar.length > 0) {
      const nextCzar = randomElement(neverCzar);

      return {
        id: nextCzar.id,
        roomUserId: nextCzar.user.id,
        username: nextCzar.user.user.username,
        points: nextCzar._count.winningRounds,
      };
    }

    // Get all online players and get their most recent judging round
    const players = await tx.player.findMany({
      where: {
        gameId,
        user: {
          status: RoomUserStatus.IN_GAME,
        },
      },
      select: {
        id: true,
        _count: {
          select: { judgingRounds: true, winningRounds: true },
        },
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
        // Take the most recent judging round
        // TODO: Check if this is correct
        judgingRounds: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    // Sort the players by their most recent judging round
    const sorted = players.sort((a, b) => {
      const aDate = a.judgingRounds[0]?.createdAt ?? new Date(0);
      const bDate = b.judgingRounds[0]?.createdAt ?? new Date(0);
      return aDate.getTime() - bDate.getTime();
    });

    // Get the earliest last judging round
    const earliestLastJudged = sorted[0].judgingRounds[0]?.createdAt;

    // Get all players with the earliest last judging round
    const candidates = sorted.filter(
      (p) =>
        (p.judgingRounds[0]?.createdAt ?? new Date(0)).getTime() ===
        earliestLastJudged.getTime()
    );

    const nextCzar = randomElement(candidates);

    return {
      id: nextCzar.id,
      roomUserId: nextCzar.user.id,
      username: nextCzar.user.user.username,
      points: nextCzar._count.winningRounds,
    };
  }
}
