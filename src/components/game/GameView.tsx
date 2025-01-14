import { motion } from "framer-motion";
import { Crown, Heart, Send, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ClientToServerEvents } from "../../server/types/socket";
import { Socket } from "socket.io-client";
import { ServerToClientEvents } from "../../server/types/socket";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { ChatSection } from "../lobby/ChatSection";
import { Input } from "../ui/input";

interface GameViewProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  gameId: string;
  playerId: string;
}

export function GameView({ socket, gameId, playerId }: GameViewProps) {
  const [step, setStep] = useState(0);
  const [chatMessages, setChatMessages] = useState<
    Array<{ playerId: string; message: string }>
  >([]);
  const [playerStates, setPlayerStates] = useState<Record<string, number>>({});
  const [confessionInput, setConfessionInput] = useState("");
  const [confessions, setConfessions] = useState<
    Array<{ playerId: string; message: string }>
  >([]);
  const [playersReadyForNextStep, setPlayersReadyForNextStep] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    if (!socket) return;

    socket.emit("game:join", gameId);

    socket.on("game:state", (state) => {
      console.log("Received game state:", state); // Debug log
      setPlayerStates(state.playerStates || {});
      setConfessions(state.confessions || []);
      setPlayersReadyForNextStep(new Set(state.readyForNextStep || []));
    });

    socket.on(
      "game:player_ready_for_step",
      ({ playerId: readyPlayerId, step: readyStep }) => {
        console.log("Player ready for step:", { readyPlayerId, readyStep }); // Debug log
        setPlayersReadyForNextStep((prev) => new Set(prev).add(readyPlayerId));
      }
    );

    socket.on(
      "game:step_update",
      ({ playerStates: newPlayerStates, step: newStep }) => {
        console.log("Step update received:", { newPlayerStates, newStep }); // Debug log
        setPlayerStates(newPlayerStates);
        setPlayersReadyForNextStep(new Set());
        setStep(newStep);
      }
    );

    return () => {
      socket.off("game:state");
      socket.off("game:player_ready_for_step");
      socket.off("game:step_update");
    };
  }, [socket, gameId, playerId]);

  const steps = [
    {
      title: "Step 1: Group Acceptance",
      icon: Users,
      description: "Together, we acknowledge our gaming demons...",
      instruction:
        "Both players must click 'Accept' to begin the healing process.",
      quote: "Strength in numbers, weakness in Steam numbers.",
    },
    {
      title: "Step 2: The Confession",
      icon: Heart,
      description: "Share your deepest gaming addiction...",
      instruction:
        "Type your gaming confession below. Be honest, we're all friends here.",
      quote: "Every uninstall begins with a confession.",
    },
    {
      title: "Final Step: Mutual Support",
      icon: Crown,
      description: "Support each other in touching grass...",
      instruction:
        "React to your partner's confession and plan your grass-touching journey together.",
      quote: "Two touch grass, twice the class.",
    },
  ];

  const handleStepComplete = () => {
    if (!socket || playersReadyForNextStep.has(playerId)) return;

    const nextStep = step + 1;
    // Emit player_ready_for_step instead of step_update
    socket.emit("game:player_ready_for_step", {
      gameId,
      playerId,
      step: nextStep,
    });

    // Add self to ready set locally
    setPlayersReadyForNextStep((prev) => new Set(prev).add(playerId));
  };

  const handleConfession = () => {
    if (!socket || !confessionInput.trim()) return;

    socket.emit("game:confession", {
      gameId,
      playerId,
      message: confessionInput.trim(),
    });
    setConfessionInput("");
  };

  // Update the progress button to show waiting state
  const renderProgressButton = () => {
    const otherPlayersReady = Array.from(playersReadyForNextStep).filter(
      (pid) => pid !== playerId
    ).length;
    const totalPlayers = Object.keys(playerStates).length;

    // If stage is confessed, disable the button until both players have confessed
    if (step === 1 && confessions.length < 2) {
      return (
        <Button
          disabled
          className="bg-gray-500 text-white/50 cursor-not-allowed"
        >
          Waiting for both players to confess...
        </Button>
      );
    }

    return (
      <Button
        onClick={handleStepComplete}
        disabled={playersReadyForNextStep.has(playerId)}
        className="bg-gradient-to-r from-[#FF5E62] to-[#FF9966] hover:opacity-90
          transition-opacity shadow-lg shadow-[#FF5E62]/20"
      >
        {playersReadyForNextStep.has(playerId)
          ? `Waiting for partner... (${otherPlayersReady}/${totalPlayers - 1})`
          : "Continue Journey Together"}
      </Button>
    );
  };

  useEffect(() => {
    if (!socket) return;
    socket.emit("lobby:players", gameId);

    socket.on("lobby:message", (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // Add handler for player leaving
    socket.on("lobby:player_left", (playerId) => {
      // Add system message
      setChatMessages((prev) => [
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
    if (!socket) return;
    socket.emit("lobby:message", { gameId, message });
  };

  const currentStep = steps[step];
  const allPlayersOnCurrentStep = Object.values(playerStates).every(
    (s) => s === step
  );
  const canProgress = step < steps.length - 1 && allPlayersOnCurrentStep;

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-4 flex flex-col items-center justify-center">
      <motion.div
        className="w-full max-w-4xl space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Floating particles in background */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [-20, 20],
                x: [-20, 20],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="absolute w-1 h-1 bg-[#FF5E62] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Main Content Card */}
        <Card className="p-6 bg-[#12121A] border-white/10">
          {/* Step Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF5E62] to-[#FF9966]">
                {currentStep.title}
              </h2>
              <p className="text-white/70">{currentStep.description}</p>
              <div className="bg-white/5 rounded-lg p-4 text-white/50">
                {currentStep.instruction}
              </div>
              <p className="italic text-sm text-[#FF5E62]/70">
                "{currentStep.quote}"
              </p>
            </div>

            <Separator className="bg-white/10" />

            {/* Confessions List */}
            <div className="space-y-2">
              {confessions.map((confession, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg ${
                    confession.playerId === playerId
                      ? "bg-[#FF5E62]/10 ml-8"
                      : "bg-white/5 mr-8"
                  }`}
                >
                  <div className="text-sm text-white/50 mb-1">
                    {confession.playerId === playerId ? "You" : "Partner"}
                  </div>
                  <div className="text-white/90">{confession.message}</div>
                </motion.div>
              ))}
            </div>

            {step === 2 && (
              <ChatSection
                gameId={gameId}
                currentPlayerId={playerId}
                socket={socket}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            )}

            {/* Confessions Section */}
            {step >= 1 && (
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  {step === 1 &&
                    (confessions.length < 2 ||
                      !confessions.some((c) => c.playerId === playerId)) && (
                      <>
                        <Input
                          value={confessionInput}
                          onChange={(e) => setConfessionInput(e.target.value)}
                          placeholder="Confess your gaming sins..."
                          className="flex-1 p-3 bg-[#1A1A2E] rounded-lg border border-[#FF5E62]/50 text-white/90
            focus:outline-none focus:ring-2 focus:ring-[#FF5E62]/70 transition duration-300"
                        />
                        <Button
                          size="icon"
                          onClick={handleConfession}
                          className="bg-gradient-to-r from-[#FF5E62] to-[#FF9966] hover:from-[#FF5E62]/90 hover:to-[#FF9966]/90
            text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300"
                        >
                          <Send />
                        </Button>
                      </>
                    )}
                </div>
              </div>
            )}

            {/* Progress Button */}
            {canProgress && (
              <div className="flex justify-center">
                {renderProgressButton()}
              </div>
            )}
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
