import { Server } from "socket.io";
import { LobbyManager } from "../LobbyManager";
import { GameSocket } from "../../types/socket";
import { GameStateManager } from "../../managers/GameStateManager";

describe("LobbyManager", () => {
  let lobbyManager: LobbyManager;
  let mockGameStateManager: jest.Mocked<GameStateManager>;
  let mockIo: jest.Mocked<Server>;
  let mockSocket: jest.Mocked<GameSocket>;

  beforeEach(() => {
    mockIo = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<Server>;

    mockSocket = {
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      data: {
        playerId: "test_player",
      },
      rooms: new Set(),
      id: "test_socket_id",
      connected: true,
      disconnected: false,
      handshake: {
        query: {},
        headers: {},
      },
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      eventNames: jest.fn(),
      listeners: jest.fn(),
      rawListeners: jest.fn(),
      listenerCount: jest.fn(),
    } as unknown as jest.Mocked<GameSocket>;

    mockGameStateManager = {
      initializeGame: jest.fn(),
      startGame: jest.fn(),
      addPlayerToGame: jest.fn(),
      broadcastGameState: jest.fn(),
    } as unknown as jest.Mocked<GameStateManager>;

    lobbyManager = new LobbyManager(mockIo, mockGameStateManager);
  });

  describe("createLobby", () => {
    it("should create a new lobby with specified maxPlayers", () => {
      const gameId = "test_game";
      lobbyManager.createLobby(gameId, 4);

      const result = lobbyManager.addPlayer(gameId, "player1", mockSocket);
      expect(result).toBe(true);
    });
  });

  describe("addPlayer", () => {
    it("should add player to lobby and broadcast join event", () => {
      const gameId = "test_game";
      lobbyManager.createLobby(gameId);

      const result = lobbyManager.addPlayer(gameId, "player1", mockSocket);

      expect(result).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith("lobby:player_joined", {
        id: "player1",
        ready: false,
      });
    });

    it("should reject player if lobby is full", () => {
      const gameId = "test_game";
      lobbyManager.createLobby(gameId, 1);

      lobbyManager.addPlayer(gameId, "player1", mockSocket);
      const result = lobbyManager.addPlayer(gameId, "player2", mockSocket);

      expect(result).toBe(false);
    });
  });

  describe("setPlayerReady", () => {
    it("should mark player as ready and broadcast ready status", () => {
      const gameId = "test_game";
      lobbyManager.createLobby(gameId);
      lobbyManager.addPlayer(gameId, "player1", mockSocket);

      const result = lobbyManager.setPlayerReady(gameId, "player1");

      expect(result).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith(
        "lobby:player_ready",
        "player1"
      );
    });

    it("should broadcast lobby_ready when all players are ready", () => {
      const gameId = "test_game";
      lobbyManager.createLobby(gameId, 2);

      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      lobbyManager.addPlayer(gameId, "player1", mockSocket);
      lobbyManager.addPlayer(gameId, "player2", mockSocket2);

      lobbyManager.setPlayerReady(gameId, "player1");
      lobbyManager.setPlayerReady(gameId, "player2");

      expect(mockSocket.emit).toHaveBeenCalledWith("matchmaking:status", {
        status: "lobby_ready",
      });
    });
  });

  describe("removePlayer", () => {
    it("should remove player and broadcast leave event", () => {
      const gameId = "test_game";
      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      // Create lobby with two players
      lobbyManager.createLobby(gameId);
      lobbyManager.addPlayer(gameId, "player1", mockSocket);
      lobbyManager.addPlayer(gameId, "player2", mockSocket2);

      // Clear previous emit calls (from addPlayer)
      mockSocket.emit.mockClear();
      mockSocket2.emit.mockClear();

      // Remove one player
      lobbyManager.removePlayer(gameId, "player1");

      // The remaining player should receive the leave event
      expect(mockSocket2.emit).toHaveBeenCalledWith(
        "lobby:player_left",
        "player1"
      );
    });

    it("should clean up empty lobby", () => {
      const gameId = "test_game";
      lobbyManager.createLobby(gameId);
      lobbyManager.addPlayer(gameId, "player1", mockSocket);

      // Clear previous emit calls
      mockSocket.emit.mockClear();

      lobbyManager.removePlayer(gameId, "player1");

      // Try to add player to deleted lobby
      const result = lobbyManager.addPlayer(gameId, "player2", mockSocket);
      expect(result).toBe(false);
    });
  });

  describe("broadcastToLobby", () => {
    it("should broadcast to all players in lobby", () => {
      const gameId = "test_game";
      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      lobbyManager.createLobby(gameId);
      lobbyManager.addPlayer(gameId, "player1", mockSocket);
      lobbyManager.addPlayer(gameId, "player2", mockSocket2);

      lobbyManager.setPlayerReady(gameId, "player1");

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "lobby:player_ready",
        "player1"
      );
      expect(mockSocket2.emit).toHaveBeenCalledWith(
        "lobby:player_ready",
        "player1"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle operations on non-existent lobby", () => {
      const gameId = "nonexistent";

      expect(lobbyManager.addPlayer(gameId, "player1", mockSocket)).toBe(false);
      expect(lobbyManager.setPlayerReady(gameId, "player1")).toBe(false);
      expect(() => lobbyManager.removePlayer(gameId, "player1")).not.toThrow();
    });

    it("should handle setting ready state for non-existent player", () => {
      const gameId = "test_game";
      lobbyManager.createLobby(gameId);

      expect(lobbyManager.setPlayerReady(gameId, "nonexistent")).toBe(false);
    });
  });
});
