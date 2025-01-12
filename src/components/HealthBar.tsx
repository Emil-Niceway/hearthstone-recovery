import { FC } from "react";
import { motion } from "framer-motion";
import { Unit } from "../types";

interface HealthBarProps {
  currentHealth: number;
  maxHealth: number;
  type: Unit["type"];
  isPlayerUnit: boolean;
}

const HealthBar: FC<HealthBarProps> = ({
  currentHealth,
  maxHealth,
  type,
  isPlayerUnit,
}) => {
  const percentage = (currentHealth / maxHealth) * 100;

  const colors = {
    warrior: {
      bg: "bg-red-900/50",
      bar: "bg-red-500",
      glow: "bg-red-500/30",
    },
    archer: {
      bg: "bg-green-900/50",
      bar: "bg-green-500",
      glow: "bg-green-500/30",
    },
    mage: {
      bg: "bg-blue-900/50",
      bar: "bg-blue-500",
      glow: "bg-blue-500/30",
    },
  };

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 mb-1">
      {/* Background */}
      <div className={`h-2 rounded-full ${colors[type].bg} backdrop-blur-sm`}>
        {/* Glow effect */}
        <div
          className={`absolute inset-0 ${colors[type].glow} blur-sm rounded-full`}
        />

        {/* Health bar */}
        <motion.div
          className={`h-full rounded-full ${colors[type].bar}`}
          initial={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default HealthBar;
