import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { CheckCircle2, DoorOpen, Loader2, Sword } from "lucide-react";
import { Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../server/types/socket";
import { PlayerList } from "./PlayerList";
import { ChatSection } from "./ChatSection";
import { Separator } from "../ui/separator";
import { LobbyPlayer } from "../../server/matchmaking/LobbyManager";
import { GameStartingAnimation } from "./GameStartingAnimation";

interface LobbyScreenProps {
  gameId: string;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  onReady: () => void;
  onLeave: () => void;
  playerId: string;
}

export function LobbyScreen({
  gameId,
  socket,
  onReady,
  onLeave,
  playerId,
}: LobbyScreenProps) {
  const [players, setPlayers] = useState<Omit<LobbyPlayer, "socket">[]>([]);
  const [messages, setMessages] = useState<
    {
      playerId: string;
      message: string;
    }[]
  >([]);
  const [isReady, setIsReady] = useState(false);
  const [isGameStarting, setIsGameStarting] = useState(false);

  useEffect(() => {
    // Add initial therapy message
    setMessages([
      {
        playerId: "system",
        message:
          "Welcome to your intervention. Take a moment to share what brought you here today...",
      },
    ]);
  }, []);

  useEffect(() => {
    socket.emit("lobby:players", gameId);

    socket.on("lobby:players", (updatedPlayers) => {
      setPlayers(updatedPlayers);

      // Check if all players are ready
      if (updatedPlayers.length > 1 && updatedPlayers.every((p) => p.ready)) {
        setIsGameStarting(true);
      }
    });

    socket.on("lobby:message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("lobby:player_ready", (playerId) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, ready: true } : p))
      );
    });

    // Add handler for player leaving
    socket.on("lobby:player_left", (playerId) => {
      // Update players list
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));

      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          playerId: "system",
          message: `Player ${playerId.slice(0, 6)} left the lobby`,
        },
      ]);
    });

    return () => {
      socket.off("lobby:players");
      socket.off("lobby:message");
      socket.off("lobby:player_ready");
      socket.off("lobby:player_left");
    };
  }, [socket, gameId]);

  const handleSendMessage = (message: string) => {
    socket.emit("lobby:message", { gameId, message });
  };

  const handleReady = () => {
    setIsReady(true);
    onReady();
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[#12121A]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02))] bg-[length:8px_8px]" />

      {/* Top metallic edge */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5E62] to-transparent opacity-30" />

      <div className="relative h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-6 bg-[#12121A] border-0 shadow-xl shadow-black/20">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white/90">
                    Game Lobby
                  </h2>
                  <p className="text-sm text-white/50">Game ID: {gameId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#FF5E62] animate-spin" />
                  <span className="text-sm text-white/50">
                    Waiting for players...
                  </span>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <PlayerList players={players} />

              <Separator className="bg-white/10" />

              <ChatSection
                messages={messages}
                onSendMessage={handleSendMessage}
                currentPlayerId={playerId}
                gameId={gameId}
                socket={socket}
              />

              <Separator className="bg-white/10" />

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleReady}
                  disabled={isReady}
                  className={`
            relative flex-1 overflow-hidden
            ${
              isReady
                ? "bg-gradient-to-r from-green-500 to-emerald-500 cursor-not-allowed opacity-90"
                : "bg-gradient-to-r from-[#FF5E62] to-[#FF9966] hover:from-[#FF5E62]/90 hover:to-[#FF9966]/90"
            }
            transition-all duration-300 group
          `}
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1))] bg-[length:250%_250%] group-hover:bg-[length:200%_200%] transition-all duration-300" />

                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-[-1px] bg-gradient-to-r from-white/20 to-transparent blur-sm" />
                  </div>

                  {/* Button content with icon */}
                  <div className="relative flex items-center justify-center gap-2">
                    {isReady ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>I Accept Help</span>
                      </>
                    ) : (
                      <>
                        <Sword className="w-4 h-4" />
                        <span>Begin Recovery</span>
                      </>
                    )}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={onLeave}
                  className="
            relative flex-1 border-white/10 
            hover:bg-white/5 hover:border-red-500/50 hover:text-red-500
            transition-all duration-300 group
          "
                >
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent transition-all duration-300" />

                  {/* Button content with icon */}
                  <div className="relative flex items-center justify-center gap-2">
                    <DoorOpen className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Leave Lobby</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Game Starting Animation */}
      <AnimatePresence>
        {isGameStarting && (
          <GameStartingAnimation
            onComplete={() => {
              // Handle game start transition
              setMessages((prev) => [
                ...prev,
                {
                  playerId: "system",
                  message: "Battle is starting...",
                },
              ]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
