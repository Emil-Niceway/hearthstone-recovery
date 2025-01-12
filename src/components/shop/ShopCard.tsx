import { FC } from "react";
import { Unit } from "../../types";
import { motion } from "framer-motion";
import { ClassIcon, CLASS_COLORS } from "../icons/ClassIcon";

interface ShopCardProps {
  unit?: Unit;
  isLocked: boolean;
  onToggleLock: () => void;
  onDragStart: (unit: Unit) => void;
  canBuy: boolean;
}

export const ShopCard: FC<ShopCardProps> = ({
  unit,
  isLocked,
  onToggleLock,
  onDragStart,
  canBuy,
}) => {
  return (
    <motion.div
      className={`
        relative aspect-[4/3] rounded-lg overflow-hidden cursor-grab active:cursor-grabbing
        ${!unit ? "bg-gray-900/50" : ""}
        transition-all duration-200 group
      `}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {/* Card background effects */}
      {unit && (
        <>
          <div
            className={`
            absolute inset-0 bg-gradient-to-br
            ${
              unit.type === "warrior"
                ? "from-red-900/90 to-red-950/90"
                : unit.type === "archer"
                ? "from-green-900/90 to-green-950/90"
                : "from-purple-900/90 to-purple-950/90"
            }
          `}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Animated border glow on hover */}
          <div className="absolute inset-px rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              className={`
              absolute inset-0 rounded-lg border border-white/20
              ${unit.type && CLASS_COLORS[unit.type].light}
            `}
            />
          </div>
        </>
      )}

      {/* Card content */}
      <div className="relative p-2 h-full flex flex-col">
        {/* Lock button */}
        <motion.button
          className={`
            absolute top-1 right-1 w-5 h-5
            flex items-center justify-center text-xs
            rounded-full bg-black/30 backdrop-blur-sm
            ${isLocked ? "text-yellow-500" : "text-gray-400"}
            hover:bg-black/50 transition-colors
            border border-white/10
          `}
          onClick={onToggleLock}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isLocked ? "🔒" : "🔓"}
        </motion.button>

        {unit ? (
          <motion.div
            className={`
              h-full flex flex-col items-center justify-between
              ${!canBuy ? "opacity-50" : ""}
            `}
            draggable={canBuy}
            onDragStart={() => canBuy && onDragStart(unit)}
          >
            <div className="flex items-center gap-2 mb-1">
              <ClassIcon type={unit.type} size="md" />
              <div className="text-xs font-medium text-white/90">
                {unit.name}
              </div>
            </div>

            {/* Stats */}
            <div className="w-full space-y-1">
              <StatBar
                label="HP"
                value={unit.stats.health}
                max={100}
                type={unit.type}
              />
              <StatBar
                label="ATK"
                value={unit.stats.attack}
                max={20}
                type={unit.type}
              />
              <StatBar
                label="DEF"
                value={unit.stats.defense}
                max={10}
                type={unit.type}
              />
            </div>

            {/* Cost */}
            <motion.div
              className={`
                mt-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm
                text-xs font-medium border border-white/10
                ${unit.type && CLASS_COLORS[unit.type].text}
              `}
              animate={{ scale: canBuy ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              3 Gold
            </motion.div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs">
            Empty
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  type: Unit["type"];
}

const StatBar: FC<StatBarProps> = ({ label, value, max, type }) => {
  const percentage = (value / max) * 100;
  const colors = CLASS_COLORS[type];

  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <div className="w-6 text-white/70">{label}</div>
      <div className="flex-1 h-1 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className={`h-full bg-gradient-to-r ${colors.from} ${colors.to}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};
