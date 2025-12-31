// src/services/game.service.ts
import {
  GameStatus,
  Prisma,
  RoomUserStatus,
  RoundStatus,
} from "@prisma/client";
import { AnswerCard, PlayerResponse, RoundResponse } from "cah-shared";
import { CardService } from "./card.service";
import { randomElement } from "../utils/helpers";
import {
  getRoundResponse,
  ROUND_DURATION,
} from "../utils/prisma/helpers/dtos/rounds";
import { SelectedRounds } from "../utils/prisma/helpers/selects/rounds";
import prisma from "../utils/prisma";
import { BadRequestError, NotFoundError } from "../utils/errors";

const cardService = new CardService();

const WINNING_ROUNDS = 1;

export class RoundService {
  public async create(gameId: string): Promise<{
    handPicks: Map<string, AnswerCard[]>;
    roundResponse: RoundResponse;
  }> {
    return await prisma.$transaction(async (tx) => {
      const promptCard = await cardService.getNewPromptCard(tx, gameId);
      const czar = await this.getNextCzar(tx, gameId);

      const newRound = await tx.round.create({
        data: {
          gameId,
          endsAt: new Date(Date.now() + ROUND_DURATION),
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
    });
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
    const sorted = [...players].sort((a, b) => {
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

  public async updateToVoting(roundId: string): Promise<RoundResponse> {
    const round = await prisma.round.update({
      where: { id: roundId },
      data: { status: RoundStatus.CZAR_VOTING, endsAt: new Date() },
      select: SelectedRounds.select,
    });

    return getRoundResponse(round);
  }

  public async haveAllPlayersSubmitted(
    gameId: string
  ): Promise<{ haveAllPlayersSubmitted: boolean; roundId: string }> {
    // TODO: fix this method: with playerId and roundId
    const currentRound = await prisma.round.findFirst({
      where: { gameId, status: RoundStatus.DRAWING_CARDS },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
      },
    });

    if (!currentRound) {
      throw new NotFoundError("Round not found");
    }

    // Check if all players have selected a card
    const players = await prisma.player.findMany({
      where: {
        gameId: gameId,
        user: {
          status: RoomUserStatus.IN_GAME,
        },
        judgingRounds: {
          none: {
            id: currentRound.id,
          },
        },
      },
      select: {
        /* user: {
          select: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },*/
        submissions: {
          where: {
            roundId: currentRound.id,
          },
        },
      },
    });

    return {
      haveAllPlayersSubmitted: players.every(
        (player) => player.submissions.length > 0
      ),
      roundId: currentRound.id,
    };
  }

  public async voteForRoundPick(
    roundPickId: string
  ): Promise<PlayerResponse | null> {
    const roundPick = await prisma.roundPick.findUnique({
      where: { id: roundPickId },
      select: { roundId: true },
    });

    if (!roundPick) {
      throw new NotFoundError("Round pick not found");
    }

    const round = await prisma.round.findUnique({
      where: { id: roundPick.roundId },
      select: { status: true },
    });

    if (!round) {
      throw new NotFoundError("Round not found");
    }

    if (round.status !== RoundStatus.CZAR_VOTING) {
      throw new BadRequestError("Round is not in voting phase");
    }

    const gameWinnerId = await prisma.$transaction(async (tx) => {
      const roundPick = await tx.roundPick.update({
        where: { id: roundPickId },
        data: { isWinner: true },
        select: {
          round: true,
          playerId: true,
        },
      });

      const newRound = await tx.round.update({
        where: { id: roundPick.round.id },
        data: { winnerId: roundPick.playerId, status: RoundStatus.ENDED },
      });

      const roundsByWinner = await tx.round.groupBy({
        by: ["winnerId"],
        _count: {
          id: true,
        },
      });

      const winningPlayerId = roundsByWinner.find(
        (t) => t._count.id >= WINNING_ROUNDS
      );

      if (!winningPlayerId?.winnerId) return null;

      await tx.game.update({
        where: { id: newRound.gameId },
        data: { status: GameStatus.GAME_ENDED },
      });

      return winningPlayerId?.winnerId;
    });

    if (!gameWinnerId) return null;

    const winningPlayer = await prisma.player.findUnique({
      where: { id: gameWinnerId },
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

    if (!winningPlayer) {
      throw new NotFoundError("Winning player not found");
    }

    return {
      id: winningPlayer.id,
      roomUserId: winningPlayer.user.id,
      username: winningPlayer.user.user.username,
      points: winningPlayer._count.winningRounds,
    };
  }

  public async getRoundState(roomId: string): Promise<RoundResponse> {
    const round = await prisma.round.findFirst({
      where: { game: { roomId } },
      orderBy: { createdAt: "desc" },
      select: SelectedRounds.select,
    });

    if (!round) {
      throw new NotFoundError("Round not found");
    }

    return getRoundResponse(round);
  }
}
