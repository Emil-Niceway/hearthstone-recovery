import { FC } from "react";
import { Unit } from "../../types";
import { ShopCard } from "./ShopCard";
import { motion } from "framer-motion";

interface ShopPanelProps {
  gold: number;
  slots: { unit?: Unit; isLocked: boolean }[];
  onRefresh: () => void;
  onToggleLock: (index: number) => void;
  onDragStart: (unit: Unit, index: number) => void;
}

export const ShopPanel: FC<ShopPanelProps> = ({
  gold,
  slots,
  onRefresh,
  onToggleLock,
  onDragStart,
}) => {
  return (
    <div className="relative">
      {/* Epic background */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-indigo-900/20 to-transparent rounded-xl" />
      <div className="absolute inset-0 backdrop-blur-sm rounded-xl" />

      {/* Main content */}
      <div className="relative p-4 rounded-xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              className="text-2xl font-bold bg-gradient-to-br from-yellow-300 to-yellow-600 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {gold} Gold
            </motion.div>
            <div className="h-8 w-px bg-white/10" />
            <motion.button
              onClick={onRefresh}
              disabled={gold < 2}
              className={`
                px-4 py-1.5 rounded-lg font-semibold text-sm
                bg-gradient-to-br from-blue-500 to-blue-700
                hover:from-blue-400 hover:to-blue-600
                disabled:from-gray-700 disabled:to-gray-800
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                border border-white/10 shadow-lg
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Refresh (2 Gold)
            </motion.button>
          </div>
        </div>

        {/* Shop cards */}
        <div className="grid grid-cols-5 gap-4">
          {slots.map((slot, index) => (
            <ShopCard
              key={index}
              unit={slot.unit}
              isLocked={slot.isLocked}
              onToggleLock={() => onToggleLock(index)}
              onDragStart={(unit) => onDragStart(unit, index)}
              canBuy={gold >= 3}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
