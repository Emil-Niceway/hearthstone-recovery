import { FC } from "react";
import { motion } from "framer-motion";

interface BattleControlsProps {
  isInBattle: boolean;
  onStartBattle: () => void;
  onEndBattle: () => void;
  round: number;
}

export const BattleControls: FC<BattleControlsProps> = ({
  isInBattle,
  onStartBattle,
  onEndBattle,
  round,
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto mb-2">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/90 rounded-lg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,0,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(0,0,0,0.3),transparent_70%)]" />

      {/* Battle-worn texture */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj4NCiAgPGZpbHRlciBpZD0ibm9pc2UiIHg9IjAiIHk9IjAiPg0KICAgIDxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+DQogICAgPGZlQmxlbmQgbW9kZT0ic2NyZWVuIi8+DQogIDwvZmlsdGVyPg0KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC40Ii8+DQo8L3N2Zz4=')]" />

      {/* Main content */}
      <div className="relative p-2 backdrop-blur-sm flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">⚔️</span>
          <span className="text-xl font-bold text-white/90">Round {round}</span>
        </div>

        <motion.button
          onClick={isInBattle ? onEndBattle : onStartBattle}
          className={`
            px-4 py-1.5 rounded-lg
            bg-gradient-to-br ${
              isInBattle
                ? "from-red-900 to-red-950"
                : "from-emerald-900 to-emerald-950"
            }
            shadow-lg ${
              isInBattle ? "shadow-red-900/30" : "shadow-emerald-900/30"
            }
            hover:shadow-xl hover:shadow-black/70
            transition-all duration-300
            group/battle relative overflow-hidden
            border ${isInBattle ? "border-red-900/30" : "border-emerald-900/30"}
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Energy orb effect */}
          <div
            className={`
            absolute inset-0 
            bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)] 
            opacity-0 group-hover/battle:opacity-100 
            transition-opacity duration-300
          `}
          />

          {/* Button content */}
          <div className="relative flex items-center gap-1.5">
            <span className="text-lg">{isInBattle ? "🛑" : "⚔️"}</span>
            <span className="font-bold text-white/90">
              {isInBattle ? "End Battle" : "Start Battle"}
            </span>
          </div>
        </motion.button>
      </div>

      {/* Bottom edge highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/30 to-transparent" />
    </div>
  );
};
