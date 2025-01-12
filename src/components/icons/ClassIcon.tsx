import { FC } from "react";
import { Unit } from "../../types";
import { motion } from "framer-motion";

interface ClassIconProps {
  type: Unit["type"];
  size?: "sm" | "md" | "lg";
  showParticles?: boolean;
}

const ICONS = {
  warrior: (
    <path d="M12 2L9 7H3L6 12L3 17H9L12 22L15 17H21L18 12L21 7H15L12 2Z" />
  ),
  archer: (
    <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3M11 12.5L9.5 14L5 9.5L9.5 5L11 6.5L8 9.5L11 12.5M15 18.5L10.5 14L12 12.5L15 15.5L18 12.5L19.5 14L15 18.5Z" />
  ),
  mage: (
    <path d="M12 2L9.5 7L3 7.5L7 11.5L6 18L12 15L18 18L17 11.5L21 7.5L14.5 7L12 2Z" />
  ),
} as const;

const COLORS = {
  warrior: {
    from: "from-red-500",
    to: "to-red-700",
    glow: "shadow-red-500/50",
    light: "bg-red-500/10",
    text: "text-red-300",
  },
  archer: {
    from: "from-green-500",
    to: "to-green-700",
    glow: "shadow-green-500/50",
    light: "bg-green-500/10",
    text: "text-green-300",
  },
  mage: {
    from: "from-purple-500",
    to: "to-purple-700",
    glow: "shadow-purple-500/50",
    light: "bg-purple-500/10",
    text: "text-purple-300",
  },
} as const;

const SIZES = {
  sm: {
    container: "w-6 h-6",
    icon: "w-3 h-3",
    particle: "w-0.5 h-0.5",
    particleOffset: "-6px",
  },
  md: {
    container: "w-8 h-8",
    icon: "w-4 h-4",
    particle: "w-1 h-1",
    particleOffset: "-8px",
  },
  lg: {
    container: "w-12 h-12",
    icon: "w-6 h-6",
    particle: "w-1.5 h-1.5",
    particleOffset: "-12px",
  },
} as const;

export const ClassIcon: FC<ClassIconProps> = ({
  type,
  size = "md",
  showParticles = true,
}) => {
  const colors = COLORS[type];
  const sizeConfig = SIZES[size];

  return (
    <div className={`relative ${sizeConfig.container}`}>
      {/* Glowing background */}
      <div
        className={`
        absolute inset-0 rounded-full 
        bg-gradient-to-br ${colors.from} ${colors.to}
        blur-sm opacity-50
      `}
      />

      {/* Icon container */}
      <div
        className={`
        absolute inset-0 rounded-full 
        bg-gradient-to-br ${colors.from} ${colors.to}
        flex items-center justify-center 
        border border-white/20
        ${colors.glow}
      `}
      >
        <svg
          viewBox="0 0 24 24"
          className={`${sizeConfig.icon} text-white`}
          fill="currentColor"
        >
          {ICONS[type]}
        </svg>
      </div>

      {/* Animated particles */}
      {showParticles && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`
                absolute ${sizeConfig.particle} rounded-full 
                bg-gradient-to-br ${colors.from} ${colors.to}
              `}
              style={{
                left: "50%",
                top: "50%",
                transform: `rotate(${i * 120}deg) translateY(${
                  sizeConfig.particleOffset
                })`,
              }}
              animate={{ opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 1.5, delay: i * 0.5, repeat: Infinity }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export { COLORS as CLASS_COLORS };
