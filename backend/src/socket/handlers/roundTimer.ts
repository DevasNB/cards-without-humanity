import { RoundService } from "../../services/round.service";
import { BadRequestError } from "../../utils/errors";
import { ROUND_DURATION } from "../../utils/prisma/helpers/dtos/rounds";
import { IoInstance } from "../config";
import { IncompleteGame } from "cah-shared";

const roundService = new RoundService();

interface ActiveRounds {
  roundId: string | null;
  roundEndsAt: number | null;
  roundTimer: NodeJS.Timeout | null;
}

const activeGames: Record<string, ActiveRounds> = {};

const setDefaultGameState = (game: IncompleteGame) => {
  activeGames[game.id] = activeGames[game.id] || {
    roundId: null,
    roundEndsAt: null,
    roundTimer: null,
  };
};

export async function startRound(
  game: IncompleteGame,
  roomId: string,
  io: IoInstance
): Promise<void> {
  setDefaultGameState(game);

  const { handPicks, roundResponse } = await roundService.create(game.id);

  if (!roundResponse || !handPicks) {
    throw new BadRequestError("Round not created");
  }

  const inMemoryGame = activeGames[game.id];
  inMemoryGame.roundId = roundResponse.id;

  // Clear previous timer
  if (inMemoryGame.roundTimer) clearTimeout(inMemoryGame.roundTimer);

  // Set timer
  inMemoryGame.roundEndsAt = roundResponse.endsAt;
  inMemoryGame.roundTimer = setTimeout(() => {
    endRound(game.id, roomId, roundResponse.id, io, "timeout");
  }, ROUND_DURATION);

  // Notify all users in the room with the new game state
  for (const [connectionId, cards] of handPicks) {
    io.to(connectionId).emit("game:round:new", {
      round: roundResponse,
      handPick: cards,
    });
  }
}

export async function endRound(
  gameId: string,
  roomId: string,
  roundId: string,
  io: IoInstance,
  reason: "timeout" | "all_played"
): Promise<void> {
  try {
    const room = activeGames[gameId];
    if (!room.roundEndsAt) return; // already ended

    console.log(room, 148);
    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }

    console.log(room, 14941);

    room.roundEndsAt = null;

    const round = await roundService.updateToVoting(roundId);

    io.to(roomId).emit("game:round:end", {
      reason,
      round,
    });
  } catch (err) {
    console.log("BANANANA", 4959);
    console.log("Error ending a round", err);
  }
  // startRound(gameId, io);
}
