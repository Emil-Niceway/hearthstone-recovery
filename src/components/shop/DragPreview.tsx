import { FC } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Unit } from "../GameBoard";

interface DragPreviewProps {
  unit: Unit;
  x: number;
  y: number;
}

export const DragPreview: FC<DragPreviewProps> = ({ unit, x, y }) =>
  createPortal(
    <motion.div
      className={`
        fixed w-24 h-24 select-none pointer-events-none z-50
        ${
          unit.type === "warrior"
            ? "bg-gradient-to-br from-red-600/90 to-red-800/90 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            : unit.type === "archer"
            ? "bg-gradient-to-br from-emerald-600/90 to-emerald-800/90 shadow-[0_0_20px_rgba(5,150,105,0.4)]"
            : "bg-gradient-to-br from-violet-600/90 to-violet-800/90 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
        }
        rounded-lg flex items-center justify-center
        ring-1 ring-white/20 backdrop-blur-sm
        before:absolute before:inset-0 before:rounded-lg 
        before:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]
      `}
      style={{
        left: x - 48,
        top: y - 48,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Unit type display */}
      <div className="relative text-3xl font-bold text-white/90">
        {unit.type === "warrior" ? "⚔️" : unit.type === "archer" ? "🏹" : "✨"}
      </div>

      {/* Subtle effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 rounded-lg animate-[pulse_2s_ease-in-out_infinite]">
          <div className="absolute inset-0 rounded-lg bg-current opacity-10 blur-md" />
        </div>
      </div>
    </motion.div>,
    document.body
  );
