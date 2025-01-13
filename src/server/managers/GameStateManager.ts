import { Server } from "socket.io";
import { GameState } from "../../types";
import { ServerLogger } from "../utils/serverLogger";

const logger = new ServerLogger();

export class GameStateManager {
  private games: Map<string, GameState> = new Map();

  constructor(private io: Server) {}

  public getGame(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  public initializeGame(gameId: string, players: string[]) {
    logger.game("Initializing game", { gameId, players });

    // Create initial game state
    const initialState: GameState = {
      gameId,
      players: new Map(),
      phase: "preparation",
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

  public addPlayerToGame(gameId: string, playerId: string) {
    const game = this.games.get(gameId);
    if (!game) {
      logger.game("Failed to add player - game not found", {
        gameId,
        playerId,
      });
      return;
    }

    // Check if player is already in the game state
    if (!game.players.has(playerId)) {
      logger.game("Adding player to game", { gameId, playerId });
    }

    game.players.set(playerId, {
      id: playerId,
      gold: 3,
      shopSlots: [],
      playerIndex: 0,
    });
  }

  public handlePlayerDisconnect(gameId: string, playerId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.players.delete(playerId);
    this.broadcastGameState(gameId);
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
    if (!game) {
      logger.game("Failed to broadcast - game not found", { gameId });
      return;
    }

    logger.game("Broadcasting game state", {
      gameId,
      playerCount: game.players.size,
    });

    game.players.forEach((_, playerId) => {
      logger.game("Emitting state to game room", {
        gameId,
        playerId,
      });
      this.io.to(playerId).emit("game:state", game);
    });
  }
}
