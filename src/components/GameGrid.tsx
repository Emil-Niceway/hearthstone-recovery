import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Unit } from "../types";
import { ClassIcon } from "./icons/ClassIcon";
import { DamageNumber, AttackAnimation } from "./combat/CombatEffects";
import HealthBar from "./HealthBar";

const BOARD_SIZE = 8;

interface CombatEffect {
  id: string;
  type: "damage" | "attack";
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  unitType: Unit["type"];
  damage?: number;
  timestamp: number;
}

interface GameGridProps {
  cells: Cell[][];
  onCellClick?: (x: number, y: number) => void;
  onUnitDrop?: (x: number, y: number) => void;
  isDragging?: boolean;
  combatEffects: CombatEffect[];
}

const GameGrid: FC<GameGridProps> = ({
  cells,
  onCellClick,
  onUnitDrop,
  isDragging,
  combatEffects,
}) => {
  return (
    <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />

      {/* Battle divider */}
      <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

      {/* Territory labels */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-red-500 font-bold text-lg">
        Enemy Territory
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-blue-500 font-bold text-lg">
        Player Territory
      </div>

      {/* Combat effects layer */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {combatEffects.map((effect) => {
            const cellWidth = 100 / BOARD_SIZE;
            const x = effect.sourceX * cellWidth + cellWidth / 2;
            const y = effect.sourceY * cellWidth + cellWidth / 2;
            const targetX = effect.targetX * cellWidth + cellWidth / 2;
            const targetY = effect.targetY * cellWidth + cellWidth / 2;

            if (effect.type === "damage" && effect.damage) {
              return (
                <div
                  key={effect.id}
                  className="absolute"
                  style={{
                    left: `${targetX}%`,
                    top: `${targetY}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <DamageNumber damage={effect.damage} type={effect.unitType} />
                </div>
              );
            }

            if (effect.type === "attack") {
              return (
                <AttackAnimation
                  key={effect.id}
                  sourceX={x}
                  sourceY={y}
                  targetX={targetX}
                  targetY={targetY}
                  type={effect.unitType}
                />
              );
            }

            return null;
          })}
        </AnimatePresence>
      </div>

      {/* Game grid */}
      <div className="relative grid grid-cols-8 grid-rows-8 gap-1 p-4 h-full">
        {cells.map((row, y) =>
          row.map((cell, x) => (
            <motion.div
              key={`${x}-${y}`}
              className={`
                relative rounded-lg border-2 transition-colors duration-200
                ${
                  cell.isPlayerArea ? "border-blue-500/30" : "border-red-500/30"
                }
                ${isDragging ? "hover:border-yellow-500/50" : ""}
                ${cell.unit ? "bg-gray-800/50" : "bg-gray-800/20"}
              `}
              onClick={() => onCellClick?.(x, y)}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-yellow-500/50");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("border-yellow-500/50");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-yellow-500/50");
                onUnitDrop?.(x, y);
              }}
            >
              {cell.unit && (
                <>
                  <motion.div
                    layoutId={`unit-${cell.unit.id}`}
                    className={`
                      absolute justify-center items-center flex inset-0 rounded-md p-2
                      ${
                        cell.unit.type === "warrior"
                          ? "bg-red-500/20"
                          : cell.unit.type === "archer"
                          ? "bg-green-500/20"
                          : "bg-blue-500/20"
                      }
                      ${
                        cell.unit.isPlayerUnit
                          ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/50"
                          : "ring-2 ring-red-500 shadow-lg shadow-red-500/50"
                      }
                    `}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 200,
                      mass: 1,
                    }}
                    layout="position"
                  >
                    <motion.div
                      className="w-full h-full flex items-center justify-center"
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                    >
                      <ClassIcon type={cell.unit.type} size="lg" />
                    </motion.div>
                  </motion.div>

                  {/* Health bar container */}
                  <motion.div
                    layoutId={`health-${cell.unit.id}`}
                    className="absolute inset-0 pointer-events-none"
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 200,
                      mass: 1,
                    }}
                  >
                    <HealthBar
                      currentHealth={cell.unit.stats.health}
                      maxHealth={100}
                      type={cell.unit.type}
                      isPlayerUnit={cell.unit.isPlayerUnit}
                    />
                  </motion.div>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameGrid;
