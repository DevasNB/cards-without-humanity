import { GameService } from "../../services/game.service";
import { PlayerService } from "../../services/player.sevice";
import { RoundService } from "../../services/round.service";
import { BadRequestError } from "../../utils/errors";
import { ROUND_DURATION } from "../../utils/prisma/helpers/dtos/rounds";
import { IoInstance } from "../config";
import { IncompleteGame, PlayerResponse, RoundResponse } from "cah-shared";

const roundService = new RoundService();
const gameService = new GameService();
const playerService = new PlayerService();

interface ActiveRounds {
  roundId: string | null;
  roundEndsAt: number | null;
  roundTimer: NodeJS.Timeout | null;
}

const activeGames: Record<string, ActiveRounds> = {};

const setDefaultGameState = (gameId: string) => {
  activeGames[gameId] = activeGames[gameId] || {
    roundId: null,
    roundEndsAt: null,
    roundTimer: null,
  };
};

export async function startRound(
  gameId: string,
  roomId: string,
  io: IoInstance
): Promise<void> {
  try {
    setDefaultGameState(gameId);

    const { handPicks, roundResponse } = await roundService.create(gameId);

    if (!roundResponse || !handPicks) {
      throw new BadRequestError("Round not created");
    }

    const inMemoryGame = activeGames[gameId];
    inMemoryGame.roundId = roundResponse.id;

    // Clear previous timer
    if (inMemoryGame.roundTimer) clearTimeout(inMemoryGame.roundTimer);

    // Set timer
    inMemoryGame.roundEndsAt = roundResponse.endsAt;
    inMemoryGame.roundTimer = setTimeout(() => {
      endRound(gameId, roomId, roundResponse.id, io, "timeout");

      startNextRound(gameId, roomId, io);
    }, ROUND_DURATION);

    // Notify all users in the room with the new game state
    for (const [connectionId, cards] of handPicks) {
      io.to(connectionId).emit("game:round:new", {
        round: roundResponse,
        handPick: cards,
      });
    }
  } catch (err) {
    console.log(err);
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

    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }

    room.roundEndsAt = null;

    const round = await roundService.updateToVoting(roundId);

    io.to(roomId).emit("game:round:end", {
      reason,
      round,
    });
  } catch (err) {
    console.log("Error ending a round", err);
  }
}

export function startNextRound(
  gameId: string,
  roomId: string,
  io: IoInstance
): void {
  setTimeout(() => {
    startRound(gameId, roomId, io);
  }, 5000);
}

export async function endGame(
  gameId: string,
  roomId: string,
  io: IoInstance,
  winner: PlayerResponse
): Promise<void> {
  const roundState: RoundResponse = await roundService.getRoundState(roomId); // Get latest room data from service
  const players = await playerService.getUpdatedPlayers(roomId);

  delete activeGames[gameId];
  io.to(roomId).emit("game:end", { winner, round: roundState, players });

  setTimeout(() => {
    io.to(roomId).emit("game:backToLobby");

    gameService.endGame(gameId);
  }, 5000);
}
