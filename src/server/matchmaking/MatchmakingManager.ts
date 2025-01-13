import EventEmitter from "events";
import { Server, Socket } from "socket.io";
import { LobbyManager } from "./LobbyManager";
import { GameSocket } from "../types/socket";
import { ServerLogger } from "../utils/serverLogger";

const logger = new ServerLogger();

export interface QueuedPlayer {
  playerId: string;
  socket: Socket;
  joinedAt: number;
  maxPlayers: number;
}

export class MatchmakingManager extends EventEmitter {
  private queues: Map<number, QueuedPlayer[]> = new Map();
  private matchTimeout: number = 30000;

  constructor(private io: Server, private lobbyManager: LobbyManager) {
    super();
  }

  public addToQueue(
    socket: GameSocket,
    playerId: string,
    config: { maxPlayers?: number } = {}
  ) {
    const maxPlayers = config.maxPlayers || 2;
    this.removeFromQueue(playerId);

    const player: QueuedPlayer = {
      playerId,
      socket,
      joinedAt: Date.now(),
      maxPlayers,
    };

    let queue = this.queues.get(maxPlayers);
    if (!queue) {
      queue = [];
      this.queues.set(maxPlayers, queue);
    }

    queue.push(player);
    socket.emit("matchmaking:status", "searching");

    logger.matchmaking("Player joined matchmaking queue", {
      playerId,
      maxPlayers: config.maxPlayers || 2,
    });

    this.checkForMatch(maxPlayers);
    this.startMatchTimeout(player);
  }

  public removeFromQueue(playerId: string) {
    for (const [, queue] of this.queues) {
      const playerIndex = queue.findIndex((p) => p.playerId === playerId);
      if (playerIndex !== -1) {
        const player = queue[playerIndex];
        queue.splice(playerIndex, 1);
        player.socket.emit("matchmaking:status", { status: "cancelled" });
        return;
      }
    }
  }

  private checkForMatch(maxPlayers: number) {
    const queue = this.queues.get(maxPlayers);
    if (!queue || queue.length < maxPlayers) return;

    const players = queue.splice(0, maxPlayers);
    const gameId = this.generateGameId();

    // Create lobby
    this.lobbyManager.createLobby(gameId, maxPlayers);

    // Add players to lobby
    players.forEach((player) => {
      const added = this.lobbyManager.addPlayer(
        gameId,
        player.playerId,
        player.socket
      );
      if (!added) {
        // Handle failed lobby join
        player.socket.emit("game:error", "Failed to join lobby");
        return;
      }
    });

    // Notify all players about the match
    const playerIds = players.map((p) => p.playerId);
    players.forEach((player) => {
      const opponents = playerIds.filter((id) => id !== player.playerId);
      player.socket.emit("matchmaking:found", {
        gameId,
        opponentId: opponents[0], // For now, just send the first opponent
      });
    });
  }

  private startMatchTimeout(player: QueuedPlayer) {
    setTimeout(() => {
      for (const [, queue] of this.queues) {
        if (queue.includes(player)) {
          this.removeFromQueue(player.playerId);
          player.socket.emit("matchmaking:timeout");
          return;
        }
      }
    }, this.matchTimeout);
  }

  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
