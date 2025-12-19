import { RoundService } from "../../services/round.service";
import { BadRequestError } from "../../utils/errors";
import { IoInstance } from "../config";
import { GameResponse, IncompleteGame, RoundResponse } from "cah-shared";

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
  console.log("THE ROUND IS STARTING!");
  setDefaultGameState(game);

  // TODO: Round cannot be created here
  const { handPicks, roundResponse } = await roundService.createNewRound(
    game.id
  );

  console.log("CREATED A NEW ROUND");

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
    endRound(game.id, io, "timeout");
  }, ROUND_DURATION);

  console.log("EVERYONE SHOULD RECEIVE A NEW ROUND");
  // Notify all users in the room with the new game state
  for (const [connectionId, cards] of handPicks) {
    io.to(connectionId).emit("game:round:new", {
      round: roundResponse,
      handPick: cards,
    });
  }
}

export function endRound(
  gameId: string,
  io: IoInstance,
  reason: "timeout" | "all_played"
): void {
  const room = activeGames[gameId];

  if (!room.roundEndsAt) return; // already ended

  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    room.roundTimer = null;
  }

  room.roundEndsAt = null;

  io.to(gameId).emit("game:round:end", {
    reason,
  });

  // startRound(gameId, io);
}
