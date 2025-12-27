import { RoundResponse } from "cah-shared";
import { Prisma, RoundStatus } from "@prisma/client";
import { SelectedRoundsType } from "../types/rounds";

export const ROUND_DURATION = 30_000;

export function getRoundResponse(
  updatedRound: Prisma.RoundGetPayload<{
    select: SelectedRoundsType;
  }>
): RoundResponse {
  const czar = updatedRound.czar;
  const promptCard = updatedRound.promptCard;

  // Map the round to a response
  const picks = updatedRound.picks.map((pick) => ({
    id: pick.id,
    playerId: pick.playerId,
    cardId: pick.cardId,
    isWinner: pick.isWinner,
    text:
      updatedRound.status === RoundStatus.DRAWING_CARDS
        ? undefined
        : pick.answerCard.content,
  }));

  let winner = undefined;

  if (updatedRound.winner) {
    winner = {
      id: updatedRound.winner.id,
      roomUserId: updatedRound.winner.user.id,
      username: updatedRound.winner.user.user.username,
      points: 0,
    };
  }

  const roundResponse: RoundResponse = {
    id: updatedRound.id,
    startedAt: updatedRound.createdAt.getTime(),
    endsAt: updatedRound.endsAt.getTime(),
    status: updatedRound.status,
    winner: winner,
    czar: {
      id: czar.id,
      roomUserId: czar.user.id,
      username: czar.user.user.username,
      points: czar._count.winningRounds,
    },
    promptCard: {
      id: promptCard.id,
      text: promptCard.content,
      pick: promptCard.pick,
    },
    picks,
  };

  return roundResponse;
}
