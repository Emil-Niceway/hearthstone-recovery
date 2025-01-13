import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { GameMode } from "./types";

interface SearchingStatusProps {
  selectedMode: GameMode;
  onCancel: () => void;
}

export function SearchingStatus({
  selectedMode,
  onCancel,
}: SearchingStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <Card className="relative overflow-hidden border-0 bg-[#12121A]">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02))] bg-[length:6px_6px]" />

        {/* Pulsing radar effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-96 h-96 rounded-full border border-[#FF5E62]/20 animate-ping [animation-duration:3s]" />
          <div className="absolute w-96 h-96 rounded-full border border-[#FF5E62]/10 animate-ping [animation-duration:3s] [animation-delay:0.5s]" />
        </div>

        <div className="relative p-6">
          {/* Cancel button with hover effects */}
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-4 group
              bg-black/20 hover:bg-red-500/10 
              border-white/10 hover:border-red-500/50
              text-white/70 hover:text-red-500
              transition-all duration-300"
            onClick={onCancel}
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </Button>

          <div className="flex items-center gap-6">
            {/* Enhanced loading indicator */}
            <div className="relative flex items-center justify-center">
              {/* Outer spinning ring */}
              <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-[#FF5E62] to-[#FF9966] animate-spin [animation-duration:3s]" />

              {/* Inner container */}
              <div className="relative w-16 h-16 rounded-full bg-[#12121A] flex items-center justify-center">
                {/* Inner spinning gradient */}
                <div className="absolute inset-[2px] rounded-full bg-gradient-to-r from-[#FF5E62]/20 to-[#FF9966]/20 animate-spin [animation-duration:2s]" />

                {/* Center loader */}
                <Loader2 className="w-8 h-8 text-[#FF5E62] animate-spin relative z-10" />
              </div>
            </div>

            {/* Status text with animations */}
            <div className="space-y-2">
              <motion.h3
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF5E62] to-[#FF9966]"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Finding {selectedMode.title} Match
              </motion.h3>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-white/50">
                  Estimated wait:{" "}
                  <motion.span
                    className="text-[#FF5E62]"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    30s
                  </motion.span>
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/50">
                  Region: <span className="text-white/80">EU West</span>
                </span>
              </div>
            </div>
          </div>

          {/* Animated bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF5E62] to-transparent opacity-50" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF5E62] to-transparent"
              animate={{
                opacity: [0, 1, 0],
                translateX: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
