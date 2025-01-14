import { Socket } from "socket.io";
import { PlayerGameState } from "../../types";

export interface ServerToClientEvents {
  "matchmaking:status": (
    status: "searching" | "cancelled" | "lobby_waiting" | "lobby_ready" | "idle"
  ) => void;
  "matchmaking:found": (data: { gameId: string; opponentId: string }) => void;
  "matchmaking:timeout": () => void;
  "lobby:player_joined": (player: { id: string; ready: boolean }) => void;
  "lobby:player_left": (playerId: string) => void;
  "lobby:player_ready": (playerId: string) => void;
  "lobby:message": (data: { playerId: string; message: string }) => void;
  "lobby:players": (players: Array<{ id: string; ready: boolean }>) => void;
  "lobby:typing": (data: { playerId: string; isTyping: boolean }) => void;
  "game:step_update": (data: {
    playerStates: Record<string, number>;
    gameId: string;
    step: number;
  }) => void;
  "game:confession": (data: {
    playerId: string;
    gameId: string;
    message: string;
  }) => void;
  "game:player_ready_for_step": (data: {
    playerId: string;
    gameId: string;
    step: number;
  }) => void;
  "game:starting": (gameId: string) => void;
  "game:state": (state: PlayerGameState) => void;
  "game:error": (message: string) => void;
}

export interface ClientToServerEvents {
  "matchmaking:join": (config: { maxPlayers?: number }) => void;
  "matchmaking:leave": () => void;
  "matchmaking:found": (gameId: string) => void;
  "lobby:ready": (gameId: string) => void;
  "lobby:leave": (gameId: string) => void;
  "lobby:message": (data: { gameId: string; message: string }) => void;
  "lobby:players": (gameId: string) => void;
  "lobby:typing": (data: { gameId: string; isTyping: boolean }) => void;
  "game:step_update": (data: {
    playerId: string;
    gameId: string;
    step: number;
  }) => void;
  "game:confession": (data: {
    playerId: string;
    gameId: string;
    message: string;
  }) => void;
  "game:player_ready_for_step": (data: {
    playerId: string;
    gameId: string;
    step: number;
  }) => void;
  "game:starting": (gameId: string) => void;
  "game:join": (gameId: string) => void;
}

export interface InterServerEvents {
  matchCreated: (data: { gameId: string; players: string[] }) => void;
}

export interface SocketData {
  playerId: string;
}

export type GameSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
