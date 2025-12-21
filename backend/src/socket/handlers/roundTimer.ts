import { RoundService } from "../../services/round.service";
import { BadRequestError } from "../../utils/errors";
import { IoInstance } from "../config";
import { IncompleteGame } from "cah-shared";

const roundService = new RoundService();

const ROUND_DURATION = 30_000;

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
    endRound(game.id, roundResponse.id, io, "timeout");
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
  roundId: string,
  io: IoInstance,
  reason: "timeout" | "all_played"
): Promise<void> {
  const room = activeGames[gameId];
  if (!room.roundEndsAt) return; // already ended

  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    room.roundTimer = null;
  }

  room.roundEndsAt = null;
  
  const round = await roundService.updateToVoting(roundId);

  io.to(gameId).emit("game:round:end", {
    reason,
    round
  });

  // startRound(gameId, io);
}
