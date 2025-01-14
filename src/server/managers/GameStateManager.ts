import { Server } from "socket.io";
import { GameState } from "../../types";
import { ServerLogger } from "../utils/serverLogger";

const logger = new ServerLogger();

export class GameStateManager {
  private games: Map<
    string,
    {
      players: Set<string>;
      playerStates: Record<string, number>;
      confessions: Array<{ playerId: string; message: string }>;
      readyForNextStep: Set<string>; // Track who's ready to proceed
    }
  > = new Map();

  constructor(private io: Server) {}

  public getGame(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  public initializeGame(gameId: string, players: string[]) {
    logger.game("Initializing game", { gameId, players });

    // Create initial game state
    const initialState: GameState = {
      players: new Set(players),
      playerStates: {},
      confessions: [],
      readyForNextStep: new Set(),
    };

    this.games.set(gameId, initialState);

    logger.game("Game initialized, broadcasting starting event", { gameId });
    console.log("Emitting game:starting event", { gameId });

    this.io.to(gameId).emit("game:starting", gameId);

    // Add delay before broadcasting initial state
    setTimeout(() => {
      logger.game("Broadcasting initial game state", { gameId });
      this.broadcastGameState(gameId);
      this.startGame(gameId);
    }, 3000); // Match animation duration (2.5s) plus a small buffer
  }

  handleStepUpdate(gameId: string, playerId: string, step: number) {
    const game = this.games.get(gameId);
    if (!game) {
      logger.game("Game not found for step update", { gameId });
      return;
    }

    logger.game("Player ready for step", { gameId, playerId, step });

    // Add player to ready set
    game.readyForNextStep.add(playerId);

    // Broadcast ready status first
    this.io.to(gameId).emit("game:player_ready_for_step", {
      gameId,
      playerId,
      step,
    });

    // Check if all players are ready
    const allPlayersReady = Array.from(game.players).every((pid) =>
      game.readyForNextStep.has(pid)
    );

    logger.game("Ready status", {
      allPlayersReady,
      readyPlayers: Array.from(game.readyForNextStep),
      totalPlayers: Array.from(game.players),
    });

    if (allPlayersReady) {
      // Update all players' states to the new step
      game.players.forEach((pid) => {
        game.playerStates[pid] = step;
      });

      // Clear ready set for next step
      game.readyForNextStep.clear();

      // Broadcast the step update to all players
      this.io.to(gameId).emit("game:step_update", {
        gameId,
        playerStates: game.playerStates,
        step,
      });

      logger.game("Step update broadcast", {
        gameId,
        step,
        playerStates: game.playerStates,
      });
    }

    // Always broadcast updated game state
    this.broadcastGameState(gameId);
  }

  handleConfession(gameId: string, playerId: string, message: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.confessions.push({ playerId, message });
    this.broadcastGameState(gameId);
  }

  handlePlayerDisconnect(gameId: string, playerId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.players.delete(playerId);
    delete game.playerStates[playerId];

    if (game.players.size === 0) {
      this.games.delete(gameId);
    }
  }

  public addPlayerToGame(gameId: string, playerId: string) {
    if (!this.games.has(gameId)) {
      this.games.set(gameId, {
        players: new Set(),
        playerStates: {},
        confessions: [],
        readyForNextStep: new Set(),
      });
    }

    const game = this.games.get(gameId)!;
    game.players.add(playerId);
    game.playerStates[playerId] = 0;
  }

  public startGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) {
      logger.game("Failed to start game - not found", { gameId });
      return;
    }

    logger.game("Starting game", { gameId });
    this.broadcastGameState(gameId);
  }

  private broadcastGameState(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    this.io.to(gameId).emit("game:state", {
      playerStates: game.playerStates,
      confessions: game.confessions,
      readyForNextStep: Array.from(game.readyForNextStep),
    });
  }
}
