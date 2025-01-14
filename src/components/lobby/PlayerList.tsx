import { CheckCircle2, User, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
  id: string;
  ready: boolean;
}

interface PlayerListProps {
  players: Player[];
}

export function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#FF5E62]" />
          <h3 className="text-sm font-medium text-white/70">Players</h3>
        </div>
        <span className="text-xs text-white/50">
          {players.length} / 2 Players
        </span>
      </div>

      <div className="rounded-lg border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-3">
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {/* Always render 2 slots, filled or empty */}
            {[0, 1].map((index) => {
              const player = players[index];
              return (
                <motion.div
                  key={player?.id || `empty-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`flex items-center justify-between p-3 rounded-lg 
                    border transition-all duration-300
                    ${
                      player
                        ? "bg-gradient-to-r from-white/5 via-white/[0.07] to-white/5 border-white/10 hover:border-white/20"
                        : "bg-white/[0.02] border-dashed border-white/5"
                    }
                    group`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${
                          player
                            ? "bg-gradient-to-br from-[#FF5E62] to-[#FF9966] shadow-lg shadow-[#FF5E62]/20 group-hover:shadow-[#FF5E62]/30"
                            : "bg-white/5"
                        } transition-all duration-300`}
                    >
                      <User
                        className={`w-4 h-4 ${
                          player ? "text-white" : "text-white/20"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`font-medium ${
                          player ? "text-white/90" : "text-white/20"
                        }`}
                      >
                        {player ? player.id.slice(0, 6) : "Waiting..."}
                      </span>
                      <span className="text-xs text-white/50">
                        {player
                          ? player.ready
                            ? "Ready"
                            : "Not Ready"
                          : "Empty Slot"}
                      </span>
                    </div>
                  </div>
                  {player?.ready && (
                    <CheckCircle2 className="w-5 h-5 text-green-400 drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
