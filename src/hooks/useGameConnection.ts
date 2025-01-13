import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Unit, PlayerGameState } from "../types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export function useGameConnection() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<PlayerGameState | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<
    "idle" | "searching" | "found" | "joining"
  >("idle");
  const [gameId, setGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerId] = useState<string>(
    () =>
      localStorage.getItem("playerId") ||
      Math.random().toString(36).substring(2, 15)
  );

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      query: { playerId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Matchmaking events
    newSocket.on(
      "matchmaking:status",
      (status: "searching" | "found" | "joining") => {
        setMatchmakingStatus(status);
      }
    );

    newSocket.on("matchmaking:found", ({ gameId, players }) => {
      console.log("Match found:", { gameId, players });
      setGameId(gameId);
      console.log("Setting gameId to", gameId);
      setMatchmakingStatus("found");
    });

    // Lobby events
    newSocket.on("lobby:joined", ({ gameId, players }) => {
      console.log("Joined lobby:", { gameId, players });
      setMatchmakingStatus("joining");
    });

    newSocket.on("lobby:player_ready", ({ playerId }) => {
      console.log("Player ready:", playerId);
      // Update local state if needed
    });

    newSocket.on("lobby:countdown", (seconds: number) => {
      console.log("Match starting in:", seconds);
      // Add countdown state if needed
    });

    newSocket.on("game:starting", (receivedGameId) => {
      console.log("Game starting event received", {
        receivedGameId,
        socketId: newSocket.id,
        connected: newSocket.connected,
      });

      // Use the gameId from the event instead of closure
      newSocket.emit("game:join", receivedGameId);
    });

    // Game events
    newSocket.on("game:state", (state: PlayerGameState) => {
      console.log("Game state received", {
        state,
      });
      setGameState(state);
    });

    newSocket.on("game:error", (message: string) => {
      console.error("Game error:", message);
      setError(message);
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("Connected to server with playerId:", playerId);
      setError(null);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Failed to connect to server");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected us, try to reconnect
        newSocket.connect();
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.close();
    };
  }, []);

  // Matchmaking actions
  const findMatch = (config: { maxPlayers: number }) => {
    if (!socket) return;

    if (matchmakingStatus === "idle") {
      socket.emit("matchmaking:join", { maxPlayers: config.maxPlayers });
      setMatchmakingStatus("searching");
    } else {
      socket.emit("matchmaking:leave");
      setMatchmakingStatus("idle");
    }
  };

  // Lobby actions
  const setReady = () => {
    if (gameId) {
      socket?.emit("lobby:ready", gameId);
    }
  };

  const leaveLobby = () => {
    if (gameId) {
      socket?.emit("lobby:leave", gameId);
      setGameId(null);
      setMatchmakingStatus("idle");
    }
  };

  // Game actions
  const placeUnit = (unit: Unit, position: { x: number; y: number }) => {
    if (gameId) {
      socket?.emit("game:place-unit", { gameId, unit, position });
    }
  };

  const refreshShop = () => {
    if (gameId) {
      socket?.emit("game:refresh-shop", gameId);
    }
  };

  const toggleLock = (slotIndex: number) => {
    if (gameId) {
      socket?.emit("game:toggle-lock", { gameId, slotIndex });
    }
  };

  return {
    gameState,
    matchmakingStatus,
    error,
    gameId,
    socket,
    playerId,
    findMatch,
    setReady,
    leaveLobby,
    placeUnit,
    refreshShop,
    toggleLock,
  };
}
