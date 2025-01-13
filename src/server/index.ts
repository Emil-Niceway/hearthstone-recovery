import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types/socket";
import { MatchmakingManager } from "./matchmaking/MatchmakingManager";
import { LobbyManager } from "./matchmaking/LobbyManager";
import { ServerLogger } from "./utils/serverLogger";
import { GameStateManager } from "./managers/GameStateManager";
import path from "path";

const app = express();
const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? true // Allow all origins in production (Render will handle security)
        : "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist/client"));

  // Handle client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("dist/client/index.html"));
  });
}

const gameStateManager = new GameStateManager(io);
const lobbyManager = new LobbyManager(io, gameStateManager);
const matchmaking = new MatchmakingManager(io, lobbyManager);
const logger = new ServerLogger();

io.on("connection", (socket) => {
  const playerId = socket.handshake.query.playerId as string;
  if (!playerId || typeof playerId !== "string") {
    socket.emit("game:error", "Invalid player ID");
    socket.disconnect();
    return;
  }

  socket.data.playerId = playerId;
  socket.join(playerId);

  logger.network("Player connected", { playerId });

  // Matchmaking events
  socket.on("matchmaking:join", () => {
    matchmaking.addToQueue(socket, playerId);
  });

  socket.on("matchmaking:leave", () => {
    console.log(`Player ${playerId} leaving queue`);
    matchmaking.removeFromQueue(playerId);
  });

  socket.on("matchmaking:found", (gameId) => {
    // Join the game room
    socket.join(gameId);

    // Request initial players list
    const players = lobbyManager.getPlayers(gameId);
    socket.emit("lobby:players", players);
  });

  // Lobby events
  socket.on("lobby:ready", (gameId) => {
    lobbyManager.setPlayerReady(gameId, playerId);

    // Get updated players list
    const players = lobbyManager.getPlayers(gameId);

    // Broadcast updated players list
    io.to(gameId).emit("lobby:players", players);
  });

  socket.on("lobby:leave", (gameId) => {
    socket.to(gameId).emit("lobby:typing", {
      playerId,
      isTyping: false,
    });
    lobbyManager.removePlayer(gameId, playerId);
    socket.emit("matchmaking:status", "idle"); // Add this line to reset client state
  });

  socket.on("lobby:typing", ({ gameId, isTyping }) => {
    logger.network("Typing status change", {
      playerId,
      gameId,
      isTyping,
    });

    socket.to(gameId).emit("lobby:typing", {
      playerId,
      isTyping,
    });
  });

  socket.on("lobby:message", ({ gameId, message }) => {
    // When a message is sent, automatically clear typing status
    socket.to(gameId).emit("lobby:typing", {
      playerId,
      isTyping: false,
    });

    // Existing message broadcast
    lobbyManager.broadcastMessage(gameId, {
      playerId,
      message,
    });
  });

  socket.on("lobby:players", (gameId) => {
    const players = lobbyManager.getPlayers(gameId);
    socket.emit("lobby:players", players);
  });

  socket.on("game:starting", () => {
    logger.game("Received game:starting event", {
      playerId,
      gameId: Array.from(socket.rooms).find((room) => room.startsWith("game_")),
      rooms: Array.from(socket.rooms),
    });
  });

  // Game events
  socket.on("game:join", (gameId) => {
    socket.join(gameId);
    console.log("Joining game room", { gameId });
    gameStateManager.addPlayerToGame(gameId, playerId);
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    const playerLobbies = lobbyManager.getPlayerLobbies(playerId);
    playerLobbies.forEach((gameId) => {
      socket.to(gameId).emit("lobby:typing", {
        playerId,
        isTyping: false,
      });
      // Handle game state cleanup if needed
      gameStateManager.handlePlayerDisconnect(gameId, playerId);
    });
    matchmaking.removeFromQueue(playerId);
  });
});

// Listen for matchmaking events
matchmaking.on("matchCreated", ({ gameId, players }) => {
  console.log(`Match created: ${gameId} with players:`, players);
  // Additional match creation handling if needed
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
