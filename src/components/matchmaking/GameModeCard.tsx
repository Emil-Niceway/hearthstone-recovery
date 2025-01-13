import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { GameMode } from "./types";
import { cn } from "../../lib/utils";

interface GameModeCardProps {
  mode: GameMode;
  isSelected: boolean;
  onSelect: (id: GameMode["id"]) => void;
  index: number;
}

export function GameModeCard({
  mode,
  isSelected,
  onSelect,
  index,
}: GameModeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.3 }}
    >
      <Button
        variant="outline"
        disabled={mode.disabled}
        className={cn(
          // Base styles
          "relative w-full h-[180px] p-0 group border",
          "bg-[#12121A] hover:bg-[#16161F] transition-all duration-300",

          // Border styles
          isSelected
            ? "border-[#FF5E62]"
            : "border-[#2A2A35] hover:border-[#3A3A45]",

          // Disabled state
          mode.disabled && "opacity-75"
        )}
        onClick={() => !mode.disabled && onSelect(mode.id)}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02))] bg-[length:8px_8px]" />

        {/* Selected state accent */}
        {isSelected && (
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5E62] to-transparent" />
        )}

        {/* Content container */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
          {/* Icon container */}
          <div
            className={cn(
              "relative mb-4 p-4 rounded-lg",
              "bg-[#1A1A24] border border-white/5",
              isSelected && "border-[#FF5E62]/20"
            )}
          >
            <div
              className={cn(
                "w-10 h-10",
                "flex items-center justify-center",
                "text-white/80 group-hover:text-white/90",
                "transition duration-300",
                isSelected && "text-[#FF5E62]"
              )}
            >
              {mode.icon}
            </div>
          </div>

          {/* Text content */}
          <div className="text-center space-y-1">
            <h3
              className={cn(
                "text-lg font-semibold",
                isSelected ? "text-[#FF5E62]" : "text-white/90"
              )}
            >
              {mode.title}
            </h3>
            <p className="text-sm text-white/50">{mode.description}</p>
          </div>

          {/* Coming soon badge */}
          {mode.disabled && (
            <div className="absolute inset-x-0 top-4 flex justify-center">
              <Badge
                variant="secondary"
                className="bg-black/40 text-white/70 border-white/10 px-2 py-0.5"
              >
                Coming Soon
              </Badge>
            </div>
          )}
        </div>

        {/* Subtle hover effect */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
    </motion.div>
  );
}
