import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchingStatus } from "./SearchingStatus";
import { FindMatchButton } from "./FindMatchButton";
import { GameModeCard } from "./GameModeCard";
import { gameModes } from "./gameModes";
import { GameMode } from "./types";
import { ClientLogger } from "../../utils/clientLogger";
import { MatchFoundAnimation } from "./MatchFoundAnimation";

const logger = new ClientLogger();

interface MatchmakingScreenProps {
  status: "idle" | "searching" | "found" | "joining";
  onFindMatch: (config: { maxPlayers: number }) => void;
  onAnimationComplete: () => void;
}

export function MatchmakingScreen({
  status,
  onFindMatch,
  onAnimationComplete,
}: MatchmakingScreenProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode["id"]>("1v1");
  logger.matchmaking("MatchmakingScreen rendered", { status });

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] overflow-hidden">
      {/* Dark metallic background with subtle pattern */}
      <div className="absolute inset-0 bg-[#12121A]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02))] bg-[length:8px_8px]" />

      {/* Top metallic edge */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5E62] to-transparent opacity-30" />

      <div className="relative h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-[#1A1A24] p-8 rounded-2xl border border-white/10 shadow-2xl"
        >
          {/* Title Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF5E62] via-[#FF9966] to-[#FF5E62]">
                Git Gud Therapy
              </span>
            </h1>
            <p className="mt-2 text-white/50">Choose your path to redemption</p>
          </motion.div>

          {/* Game Modes */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {gameModes.map((mode, index) => (
              <GameModeCard
                key={mode.id}
                mode={mode}
                isSelected={selectedMode === mode.id}
                onSelect={setSelectedMode}
                index={index}
              />
            ))}
          </div>

          {/* Action Button */}
          <AnimatePresence mode="wait">
            {status === "searching" ? (
              <SearchingStatus
                selectedMode={gameModes.find((m) => m.id === selectedMode)!}
                onCancel={() => onFindMatch({ maxPlayers: 0 })}
              />
            ) : (
              <FindMatchButton
                selectedMode={gameModes.find((m) => m.id === selectedMode)!}
                onFindMatch={onFindMatch}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Match Found Animation */}
        <AnimatePresence>
          {status === "found" && (
            <MatchFoundAnimation onComplete={onAnimationComplete} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
