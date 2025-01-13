import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { GameMode } from "./types";
import { Flame } from "lucide-react";

interface FindMatchButtonProps {
  selectedMode: GameMode;
  onFindMatch: (config: { maxPlayers: number }) => void;
}

export function FindMatchButton({
  selectedMode,
  onFindMatch,
}: FindMatchButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="relative"
    >
      <Button
        className="group relative w-full h-[68px] bg-transparent border-0 overflow-hidden
          transition-all duration-300 ease-out"
        onClick={() => onFindMatch({ maxPlayers: selectedMode.players })}
      >
        {/* Dark metallic background with subtle pattern */}
        <div className="absolute inset-0 bg-[#1A1A24]" />

        {/* Subtle diagonal pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.04)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.04)_75%,rgba(255,255,255,0.04))] bg-[length:8px_8px]" />

        {/* Top metallic edge */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5E62] to-transparent opacity-70" />

        {/* Bottom metallic edge */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF9966] to-transparent opacity-70" />

        {/* Side edges with animated gradient on hover */}
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-[#FF5E62] to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-[#FF9966] to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />

        {/* Content wrapper */}
        <div className="relative z-10 flex items-center justify-center gap-3">
          <span className="text-lg font-bold tracking-wide text-white/90">
            Find {selectedMode.title} Match
          </span>
          <Flame className="w-5 h-5 text-[#FF5E62] transition-transform duration-300 group-hover:scale-110" />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF5E62]/0 to-[#FF9966]/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

        {/* Click effect */}
        <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-150 active:opacity-10" />
      </Button>
    </motion.div>
  );
}
