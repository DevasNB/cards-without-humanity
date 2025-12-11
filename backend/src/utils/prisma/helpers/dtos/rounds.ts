import { RoundResponse } from "cah-shared";
import { Prisma } from "@prisma/client";
import { SelectedRoundsType } from "../types/rounds";

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
  }));

  const roundResponse: RoundResponse = {
    id: updatedRound.id,
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
