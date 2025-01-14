import { MatchmakingManager } from "../MatchmakingManager";
import { LobbyManager } from "../LobbyManager";
import { GameSocket } from "../../types/socket";

describe("MatchmakingManager", () => {
  let matchmakingManager: MatchmakingManager;
  let mockLobbyManager: jest.Mocked<LobbyManager>;
  let mockSocket: jest.Mocked<GameSocket>;

  beforeEach(() => {
    mockLobbyManager = {
      createLobby: jest.fn().mockReturnValue("test_game"),
      addPlayer: jest.fn().mockReturnValue(true),
      removePlayer: jest.fn(),
      setPlayerReady: jest.fn(),
    } as unknown as jest.Mocked<LobbyManager>;

    mockSocket = {
      emit: jest.fn(),
      data: {
        playerId: "player1",
      },
      id: "test_socket_id",
    } as unknown as jest.Mocked<GameSocket>;

    matchmakingManager = new MatchmakingManager(mockLobbyManager);
  });

  describe("addToQueue", () => {
    it("should add player to queue and emit searching status", () => {
      matchmakingManager.addToQueue(mockSocket, "player1");

      expect(mockSocket.emit).toHaveBeenCalledWith("matchmaking:status", {
        status: "searching",
      });
    });

    it("should remove player from existing queue before adding to new one", () => {
      matchmakingManager.addToQueue(mockSocket, "player1", { maxPlayers: 2 });
      mockSocket.emit.mockClear();

      matchmakingManager.addToQueue(mockSocket, "player1", { maxPlayers: 3 });

      expect(mockSocket.emit).toHaveBeenCalledWith("matchmaking:status", {
        status: "searching",
      });
    });

    it("should create match when enough players join queue", () => {
      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        data: { playerId: "player2" },
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      matchmakingManager.addToQueue(mockSocket, "player1");
      matchmakingManager.addToQueue(mockSocket2, "player2");

      expect(mockLobbyManager.createLobby).toHaveBeenCalled();
      expect(mockLobbyManager.addPlayer).toHaveBeenCalledTimes(2);
      expect(mockSocket.emit).toHaveBeenCalledWith("matchmaking:found", {
        gameId: expect.any(String),
        opponentId: "player2",
      });
      expect(mockSocket2.emit).toHaveBeenCalledWith("matchmaking:found", {
        gameId: expect.any(String),
        opponentId: "player1",
      });
    });
  });

  describe("queue management", () => {
    it("should maintain separate queues for different maxPlayers", () => {
      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        data: { playerId: "player2" },
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      matchmakingManager.addToQueue(mockSocket, "player1", { maxPlayers: 2 });
      matchmakingManager.addToQueue(mockSocket2, "player2", { maxPlayers: 3 });

      // Should not match because they're in different queues
      expect(mockLobbyManager.createLobby).not.toHaveBeenCalled();
    });

    it("should handle failed lobby creation", () => {
      mockLobbyManager.addPlayer.mockReturnValueOnce(false);

      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        data: { playerId: "player2" },
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      matchmakingManager.addToQueue(mockSocket, "player1");
      matchmakingManager.addToQueue(mockSocket2, "player2");

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "game:error",
        "Failed to join lobby"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle player joining multiple times", () => {
      matchmakingManager.addToQueue(mockSocket, "player1");
      mockSocket.emit.mockClear();

      // Join again with same ID
      matchmakingManager.addToQueue(mockSocket, "player1");

      // We expect two events:
      // 1. "cancelled" from removeFromQueue
      // 2. "searching" from new addToQueue
      expect(mockSocket.emit).toHaveBeenCalledTimes(2);
      expect(mockSocket.emit).toHaveBeenNthCalledWith(1, "matchmaking:status", {
        status: "cancelled",
      });
      expect(mockSocket.emit).toHaveBeenNthCalledWith(2, "matchmaking:status", {
        status: "searching",
      });
    });

    it("should handle race conditions in match creation", () => {
      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        data: { playerId: "player2" },
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      const mockSocket3 = {
        ...mockSocket,
        id: "test_socket_id_3",
        data: { playerId: "player3" },
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      // Add three players almost simultaneously
      matchmakingManager.addToQueue(mockSocket, "player1");
      matchmakingManager.addToQueue(mockSocket2, "player2");
      matchmakingManager.addToQueue(mockSocket3, "player3");

      // Should only create one match with first two players
      expect(mockLobbyManager.createLobby).toHaveBeenCalledTimes(1);
      expect(mockSocket3.emit).toHaveBeenCalledWith("matchmaking:status", {
        status: "searching",
      });
    });
  });

  describe("timeout handling", () => {
    it("should clear timeout when player is removed from queue", () => {
      jest.useFakeTimers();

      matchmakingManager.addToQueue(mockSocket, "player1");
      matchmakingManager.removeFromQueue("player1");

      jest.advanceTimersByTime(30000);

      expect(mockSocket.emit).not.toHaveBeenCalledWith("matchmaking:timeout");
    });

    it("should handle multiple timeouts correctly", () => {
      jest.useFakeTimers();

      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        data: { playerId: "player2" },
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      matchmakingManager.addToQueue(mockSocket, "player1");
      matchmakingManager.addToQueue(mockSocket2, "player2", { maxPlayers: 3 }); // Different queue

      jest.advanceTimersByTime(30000);

      expect(mockSocket.emit).toHaveBeenCalledWith("matchmaking:timeout");
      expect(mockSocket2.emit).toHaveBeenCalledWith("matchmaking:timeout");
    });
  });

  describe("removeFromQueue", () => {
    it("should remove player from queue and emit cancelled status", () => {
      matchmakingManager.addToQueue(mockSocket, "player1");
      mockSocket.emit.mockClear();

      matchmakingManager.removeFromQueue("player1");

      expect(mockSocket.emit).toHaveBeenCalledWith("matchmaking:status", {
        status: "cancelled",
      });
    });

    it("should handle removing non-existent player", () => {
      matchmakingManager.removeFromQueue("nonexistent");
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe("matchmaking timeout", () => {
    it("should remove player from queue after timeout", async () => {
      jest.useFakeTimers();

      matchmakingManager.addToQueue(mockSocket, "player1");
      mockSocket.emit.mockClear();

      jest.advanceTimersByTime(30000);

      expect(mockSocket.emit).toHaveBeenCalledWith("matchmaking:timeout");
    });

    it("should not emit timeout if player already matched", () => {
      jest.useFakeTimers();

      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        data: { playerId: "player2" },
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      matchmakingManager.addToQueue(mockSocket, "player1");
      matchmakingManager.addToQueue(mockSocket2, "player2");

      mockSocket.emit.mockClear();
      mockSocket2.emit.mockClear();

      jest.advanceTimersByTime(30000);

      expect(mockSocket.emit).not.toHaveBeenCalledWith("matchmaking:timeout");
      expect(mockSocket2.emit).not.toHaveBeenCalledWith("matchmaking:timeout");
    });
  });

  describe("event emission", () => {
    it("should emit matchCreated event when match is found", () => {
      const eventHandler = jest.fn();
      matchmakingManager.on("matchCreated", eventHandler);

      const mockSocket2 = {
        ...mockSocket,
        id: "test_socket_id_2",
        data: { playerId: "player2" },
        emit: jest.fn(),
      } as unknown as jest.Mocked<GameSocket>;

      matchmakingManager.addToQueue(mockSocket, "player1");
      matchmakingManager.addToQueue(mockSocket2, "player2");

      expect(eventHandler).toHaveBeenCalledWith({
        gameId: expect.any(String),
        players: ["player1", "player2"],
      });
    });
  });
});
