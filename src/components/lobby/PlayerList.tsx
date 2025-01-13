import { CheckCircle2, User, Users } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
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

      <div className="rounded-lg border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
        <ScrollArea className="h-[120px]">
          <div className="p-3 space-y-2">
            <AnimatePresence initial={false}>
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 rounded-lg 
                    bg-gradient-to-r from-white/5 via-white/[0.07] to-white/5
                    border border-white/10 transition-all duration-300
                    hover:border-white/20 hover:from-white/[0.07] hover:to-white/[0.07]
                    group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5E62] to-[#FF9966] 
                      flex items-center justify-center shadow-lg shadow-[#FF5E62]/20 
                      group-hover:shadow-[#FF5E62]/30 transition-shadow"
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/90 font-medium">
                        {player.id.slice(0, 6)}
                      </span>
                      <span className="text-xs text-white/50">
                        {player.ready ? "Ready" : "Not Ready"}
                      </span>
                    </div>
                  </div>
                  {player.ready && (
                    <CheckCircle2 className="w-5 h-5 text-green-400 drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
