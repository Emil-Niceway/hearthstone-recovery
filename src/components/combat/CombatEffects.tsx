import { FC } from "react";
import { motion } from "framer-motion";
import { Unit } from "../../types";

interface DamageNumberProps {
  damage: number;
  type: Unit["type"];
}

export const DamageNumber: FC<DamageNumberProps> = ({ damage, type }) => {
  const colors = {
    warrior: "text-red-500",
    archer: "text-green-500",
    mage: "text-blue-500",
  };

  return (
    <motion.div
      className={`absolute z-10 font-bold text-lg ${colors[type]}`}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -20, scale: 1.2 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      -{damage}
    </motion.div>
  );
};

interface AttackAnimationProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: Unit["type"];
}

const WarriorSlash: FC<{ x: number; y: number }> = ({ x, y }) => (
  <motion.div
    className="absolute z-20"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      transform: "translate(-50%, -50%)",
    }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 2, 0],
      opacity: [0, 1, 0],
      rotate: [-45, 45],
    }}
    transition={{ duration: 0.3 }}
  >
    <div className="relative">
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-2 bg-red-500/50 blur-sm" />
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-1 bg-red-500" />
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-white/50" />
    </div>
  </motion.div>
);

const ArcherArrow: FC<{
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}> = ({ sourceX, sourceY, targetX, targetY }) => {
  const angle =
    Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);

  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: `${sourceX}%`,
        top: `${sourceY}%`,
        rotate: `${angle}deg`,
        originX: 0,
        originY: 0.5,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: [0, 1, 1, 0],
        x: targetX - sourceX,
        y: targetY - sourceY,
      }}
      transition={{ duration: 0.3, ease: "linear" }}
    >
      <div className="relative">
        <div className="absolute w-12 h-3 bg-green-500/30 blur-xl" />
        <motion.div
          className="absolute w-16 h-0.5 bg-green-500/20"
          style={{ originX: 1 }}
          animate={{ scaleX: [0, 1], opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.3, ease: "linear" }}
        />
        <div className="absolute w-10 h-1 bg-green-500" />
        <div className="absolute right-0 w-3 h-3 rotate-45 bg-green-500" />
        <div className="absolute left-0 -translate-x-1/2">
          <div className="absolute w-2 h-2 rotate-45 bg-green-500 -translate-y-1" />
          <div className="absolute w-2 h-2 rotate-45 bg-green-500 translate-y-1" />
        </div>
      </div>
    </motion.div>
  );
};

const MageSpell: FC<{
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}> = ({ sourceX, sourceY, targetX, targetY }) => {
  return (
    <>
      {/* Main spell orb */}
      <motion.div
        className="absolute z-20"
        style={{
          left: `${sourceX}%`,
          top: `${sourceY}%`,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          left: [`${sourceX}%`, `${targetX}%`],
          top: [`${sourceY}%`, `${targetY}%`],
          scale: [0.5, 1.2, 0.5],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.4,
          ease: "linear",
        }}
      >
        <div className="relative w-8 h-8">
          {/* Core glow */}
          <div className="absolute inset-0 rounded-full bg-blue-500/50 animate-pulse blur-xl" />
          <div className="absolute inset-0 rounded-full bg-blue-500" />
          <div className="absolute inset-0 rounded-full bg-white/80" />
          {/* Outer glow */}
          <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-pulse blur-lg" />
        </div>
      </motion.div>

      {/* Trail particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 z-10"
          style={{
            left: `${sourceX}%`,
            top: `${sourceY}%`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            left: [`${sourceX}%`, `${targetX}%`],
            top: [`${sourceY}%`, `${targetY}%`],
            scale: [1, 0],
            opacity: [0.8, 0],
            x: Math.random() * 40 - 20,
            y: Math.random() * 40 - 20,
          }}
          transition={{
            duration: 0.35,
            delay: i * 0.05,
            ease: "linear",
          }}
        >
          <div className="w-full h-full rounded-full bg-blue-400/50 blur-sm" />
          <div className="absolute inset-0 rounded-full bg-white/30" />
        </motion.div>
      ))}
    </>
  );
};

export const AttackAnimation: FC<AttackAnimationProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  type,
}) => {
  switch (type) {
    case "warrior":
      return <WarriorSlash x={targetX} y={targetY} />;
    case "archer":
      return (
        <ArcherArrow
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
        />
      );
    case "mage":
      return (
        <MageSpell
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
        />
      );
  }
};
