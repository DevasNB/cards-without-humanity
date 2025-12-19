import { RoundResponse } from "cah-shared";
import { Prisma, RoundStatus } from "@prisma/client";
import { SelectedRoundsType } from "../types/rounds";

const ROUND_DURATION = 30_000;

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

  const roundResponse: RoundResponse = {
    id: updatedRound.id,
    startedAt: updatedRound.createdAt.getTime(),
    endsAt: updatedRound.createdAt.getTime() + ROUND_DURATION,
    status: updatedRound.status,
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
