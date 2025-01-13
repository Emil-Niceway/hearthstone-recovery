import { Server } from "socket.io";
import { GameSocket, ServerToClientEvents } from "../types/socket";
import { GameStateManager } from "../managers/GameStateManager";
import { ServerLogger } from "../utils/serverLogger";

export interface LobbyPlayer {
  id: string;
  socket: GameSocket;
  ready: boolean;
}

const logger = new ServerLogger();

export class LobbyManager {
  private lobbies: Map<
    string,
    {
      players: Map<string, LobbyPlayer>;
      maxPlayers: number;
      createdAt: number;
    }
  > = new Map();

  constructor(private io: Server, private gameStateManager: GameStateManager) {}

  public createLobby(gameId: string, maxPlayers: number = 2) {
    this.lobbies.set(gameId, {
      players: new Map(),
      maxPlayers,
      createdAt: Date.now(),
    });
    return gameId;
  }

  public getPlayerLobbies(playerId: string) {
    return Array.from(this.lobbies.keys()).filter((gameId) =>
      this.getPlayers(gameId).some((player) => player.id === playerId)
    );
  }

  public getPlayers(gameId: string) {
    const lobby = this.lobbies.get(gameId);
    if (!lobby) return [];

    return Array.from(lobby.players.values()).map((player) => ({
      id: player.id,
      ready: player.ready,
    }));
  }

  public broadcastMessage(
    gameId: string,
    message: { playerId: string; message: string }
  ) {
    const lobby = this.lobbies.get(gameId);
    if (!lobby) return;

    // Send to all players in the lobby
    this.broadcastToLobby(gameId, "lobby:message", message);
  }

  public addPlayer(gameId: string, playerId: string, socket: GameSocket) {
    const lobby = this.lobbies.get(gameId);
    if (!lobby) return false;

    if (lobby.players.size >= lobby.maxPlayers) return false;

    // Join the socket to the game room
    socket.join(gameId);

    lobby.players.set(playerId, {
      id: playerId,
      socket,
      ready: false,
    });

    this.broadcastToLobby(gameId, "lobby:player_joined", {
      id: playerId,
      ready: false,
    });

    return true;
  }

  public setPlayerReady(gameId: string, playerId: string) {
    const lobby = this.lobbies.get(gameId);
    if (!lobby) return false;

    const player = lobby.players.get(playerId);
    if (!player) return false;

    player.ready = true;
    this.broadcastToLobby(gameId, "lobby:player_ready", playerId);

    const allReady = Array.from(lobby.players.values()).every((p) => p.ready);
    if (allReady) {
      logger.game("All players are ready, starting game", { gameId });

      // Emit game:starting event through lobby broadcast
      this.broadcastToLobby(gameId, "game:starting", gameId);

      // Initialize game with all players
      this.gameStateManager.initializeGame(
        gameId,
        Array.from(lobby.players.keys())
      );

      return true;
    }

    return false;
  }

  public removePlayer(gameId: string, playerId: string) {
    const lobby = this.lobbies.get(gameId);
    if (!lobby) return;

    lobby.players.delete(playerId);
    this.broadcastToLobby(gameId, "lobby:player_left", playerId);

    // Clean up empty lobbies
    if (lobby.players.size === 0) {
      this.lobbies.delete(gameId);
    }
  }

  private broadcastToLobby(
    gameId: string,
    event: keyof ServerToClientEvents,
    ...args: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>
  ) {
    const lobby = this.lobbies.get(gameId);
    if (!lobby) return;

    // Use io.to(gameId) instead of individual socket emits
    this.io.to(gameId).emit(event, ...args);

    logger.game(`Broadcasting ${event} to lobby`, {
      gameId,
      playerCount: lobby.players.size,
      event,
    });
  }
}
