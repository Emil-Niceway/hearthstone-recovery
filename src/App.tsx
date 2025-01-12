import { useState, useEffect } from "react";
import GameGrid from "./components/GameGrid";
import { BattleControls } from "./components/BattleControls";
import { ShopPanel } from "./components/shop/ShopPanel";
import { Cell, Unit } from "./types";

const BOARD_SIZE = 8;
const PLAYER_AREA_START = 5;

interface ShopSlot {
  unit?: Unit;
  isLocked: boolean;
}

function generateShopSlots(): ShopSlot[] {
  return Array(5)
    .fill(null)
    .map(() => ({
      unit: generateUnit(
        ["warrior", "archer", "mage"][
          Math.floor(Math.random() * 3)
        ] as Unit["type"]
      ),
      isLocked: false,
    }));
}

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

function createEmptyBoard(): Cell[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map((_, y) =>
      Array(BOARD_SIZE)
        .fill(null)
        .map((_, x) => ({
          x,
          y,
          isPlayerArea: y >= PLAYER_AREA_START,
        }))
    );
}

function generateUnit(type: Unit["type"], isPlayer: boolean = true): Unit {
  const names = {
    warrior: ["Berserker", "Knight", "Paladin", "Guardian"],
    archer: ["Ranger", "Hunter", "Sniper", "Scout"],
    mage: ["Wizard", "Sorcerer", "Warlock", "Elementalist"],
  };

  const id = Math.random().toString(36).substring(2, 9);
  const name = names[type][Math.floor(Math.random() * names[type].length)];

  const stats = {
    warrior: {
      health: 100,
      attack: 10,
      defense: 8,
      range: 1,
      speed: 1,
    },
    archer: {
      health: 70,
      attack: 15,
      defense: 4,
      range: 3,
      speed: 2,
    },
    mage: {
      health: 60,
      attack: 20,
      defense: 3,
      range: 2,
      speed: 1,
    },
  };

  return {
    id,
    name,
    type,
    isPlayerUnit: isPlayer,
    stats: stats[type],
  };
}

function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1); // Manhattan distance
}

function findClosestEnemy(
  x: number,
  y: number,
  cells: Cell[][],
  isPlayerUnit: boolean
): { x: number; y: number } | null {
  let closestEnemy = null;
  let minDistance = Infinity;

  cells.forEach((row, targetY) => {
    row.forEach((cell, targetX) => {
      if (cell.unit && cell.unit.isPlayerUnit !== isPlayerUnit) {
        const distance = calculateDistance(x, y, targetX, targetY);
        if (distance < minDistance) {
          minDistance = distance;
          closestEnemy = { x: targetX, y: targetY };
        }
      }
    });
  });

  return closestEnemy;
}

function moveUnitTowardsTarget(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  cells: Cell[][]
): Cell[][] {
  const distance = calculateDistance(sourceX, sourceY, targetX, targetY);
  if (distance <= 1) return cells;

  // Calculate direction vector
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  // Determine the primary direction (horizontal or vertical)
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  let moveX = 0;
  let moveY = 0;

  // Move one step at a time in the dominant direction
  if (absX > absY) {
    moveX = dx > 0 ? 1 : -1;
  } else {
    moveY = dy > 0 ? 1 : -1;
  }

  // Calculate new position
  const newX = Math.min(Math.max(0, sourceX + moveX), BOARD_SIZE - 1);
  const newY = Math.min(Math.max(0, sourceY + moveY), BOARD_SIZE - 1);

  // Try to move to the new position
  if (!cells[newY][newX].unit) {
    const newCells = cells.map((row) => [...row]);
    const unit = cells[sourceY][sourceX].unit;

    // Remove unit from old position
    newCells[sourceY][sourceX] = {
      ...cells[sourceY][sourceX],
      unit: undefined,
    };

    // Add unit to new position
    newCells[newY][newX] = {
      ...cells[newY][newX],
      unit: unit,
    };

    return newCells;
  }

  // If primary direction is blocked, try the other direction
  if (absX > absY) {
    moveX = 0;
    moveY = dy > 0 ? 1 : -1;
  } else {
    moveX = dx > 0 ? 1 : -1;
    moveY = 0;
  }

  const altX = Math.min(Math.max(0, sourceX + moveX), BOARD_SIZE - 1);
  const altY = Math.min(Math.max(0, sourceY + moveY), BOARD_SIZE - 1);

  // Try alternative move
  if (!cells[altY][altX].unit) {
    const newCells = cells.map((row) => [...row]);
    const unit = cells[sourceY][sourceX].unit;

    newCells[sourceY][sourceX] = {
      ...cells[sourceY][sourceX],
      unit: undefined,
    };

    newCells[altY][altX] = {
      ...cells[altY][altX],
      unit: unit,
    };

    return newCells;
  }

  return cells;
}

const App = () => {
  const [gold, setGold] = useState(10);
  const [cells, setCells] = useState<Cell[][]>(createEmptyBoard());
  const [isInBattle, setIsInBattle] = useState(false);
  const [round, setRound] = useState(1);
  const [shopSlots, setShopSlots] = useState<ShopSlot[]>(generateShopSlots());
  const [draggedUnit, setDraggedUnit] = useState<{
    unit: Unit;
    index: number;
  } | null>(null);
  const [combatEffects, setCombatEffects] = useState<CombatEffect[]>([]);
  const [battleInterval, setBattleInterval] = useState<number | null>(null);

  const handleCellClick = () => {
    // Remove unit creation on click - units should only be created through the shop
    return;
  };

  const handleRefresh = () => {
    if (gold >= 2) {
      setGold((prev) => prev - 2);
      setShopSlots((prev) =>
        prev.map((slot) =>
          slot.isLocked
            ? slot
            : {
                ...slot,
                unit: generateUnit(
                  ["warrior", "archer", "mage"][
                    Math.floor(Math.random() * 3)
                  ] as Unit["type"]
                ),
              }
        )
      );
    }
  };

  const handleToggleLock = (index: number) => {
    setShopSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, isLocked: !slot.isLocked } : slot
      )
    );
  };

  const spawnEnemies = () => {
    const numEnemies = Math.min(3 + Math.floor(round / 2), 8);

    setCells((prev) => {
      const newCells = [...prev];
      const enemyArea = prev.slice(0, PLAYER_AREA_START);
      let enemiesPlaced = 0;

      while (enemiesPlaced < numEnemies) {
        const y = Math.floor(Math.random() * PLAYER_AREA_START);
        const x = Math.floor(Math.random() * BOARD_SIZE);

        if (!enemyArea[y][x].unit) {
          if (!newCells[y][x].unit) {
            newCells[y] = [...prev[y]];
            newCells[y][x] = {
              ...prev[y][x],
              unit: generateUnit(
                ["warrior", "archer", "mage"][
                  Math.floor(Math.random() * 3)
                ] as Unit["type"],
                false // isPlayer = false for enemies
              ),
            };
            enemiesPlaced++;
          }
        }
      }

      return newCells;
    });
  };

  const handleStartBattle = () => {
    setIsInBattle(true);
    spawnEnemies();

    const interval = window.setInterval(() => {
      setCells((prevCells) => {
        let newCells = prevCells.map((row) => [...row]);

        // Process all unit turns
        prevCells.forEach((row, y) => {
          row.forEach((cell, x) => {
            const unit = cell.unit;
            if (unit) {
              const closestEnemy = findClosestEnemy(
                x,
                y,
                newCells,
                unit.isPlayerUnit
              );
              if (closestEnemy) {
                const distance = calculateDistance(
                  x,
                  y,
                  closestEnemy.x,
                  closestEnemy.y
                );

                if (distance <= unit.stats.range) {
                  // Attack if in range
                  const targetCell = newCells[closestEnemy.y][closestEnemy.x];
                  const targetUnit = targetCell.unit;
                  if (targetUnit) {
                    const damage = unit.stats.attack;
                    newCells[closestEnemy.y][closestEnemy.x] = {
                      ...targetCell,
                      unit: {
                        ...targetUnit,
                        stats: {
                          ...targetUnit.stats,
                          health: targetUnit.stats.health - damage,
                        },
                      },
                    };

                    // Add combat effects
                    const effectId = Math.random().toString(36).substring(2);
                    setCombatEffects((prev) => [
                      ...prev,
                      {
                        id: effectId + "-attack",
                        type: "attack",
                        sourceX: x,
                        sourceY: y,
                        targetX: closestEnemy.x,
                        targetY: closestEnemy.y,
                        unitType: unit.type,
                        timestamp: Date.now(),
                      },
                      {
                        id: effectId + "-damage",
                        type: "damage",
                        sourceX: x,
                        sourceY: y,
                        targetX: closestEnemy.x,
                        targetY: closestEnemy.y,
                        unitType: unit.type,
                        damage,
                        timestamp: Date.now(),
                      },
                    ]);

                    // Remove dead units
                    const updatedUnit =
                      newCells[closestEnemy.y][closestEnemy.x].unit;
                    if (updatedUnit && updatedUnit.stats.health <= 0) {
                      newCells[closestEnemy.y][closestEnemy.x] = {
                        ...newCells[closestEnemy.y][closestEnemy.x],
                        unit: undefined,
                      };
                    }
                  }
                } else {
                  // Move towards enemy if not in range
                  newCells = moveUnitTowardsTarget(
                    x,
                    y,
                    closestEnemy.x,
                    closestEnemy.y,
                    newCells
                  );
                }
              }
            }
          });
        });

        // Clean up old effects
        setCombatEffects((prev) =>
          prev.filter((effect) => Date.now() - effect.timestamp < 1000)
        );

        // Check if battle is over
        const playerUnits = newCells
          .flat()
          .some((cell) => cell.unit?.isPlayerUnit);
        const enemyUnits = newCells
          .flat()
          .some((cell) => cell.unit && !cell.unit.isPlayerUnit);

        if (!playerUnits || !enemyUnits) {
          handleEndBattle();
        }

        return newCells;
      });
    }, 1000);

    setBattleInterval(interval);
  };

  const handleEndBattle = () => {
    setIsInBattle(false);
    if (battleInterval !== null) {
      clearInterval(battleInterval);
      setBattleInterval(null);
    }
    setRound((prev) => prev + 1);
  };

  const handleUnitDrop = (x: number, y: number) => {
    if (!draggedUnit || !cells[y][x].isPlayerArea || isInBattle) return;

    // Check if player has enough gold
    if (gold >= 3) {
      setCells((prev) => {
        const newCells = [...prev];
        newCells[y] = [...prev[y]];
        newCells[y][x] = {
          ...prev[y][x],
          unit: draggedUnit.unit,
        };
        return newCells;
      });

      // Deduct gold and remove unit from shop
      setGold((prev) => prev - 3);
      setShopSlots((prev) =>
        prev.map((slot, i) =>
          i === draggedUnit.index ? { ...slot, unit: undefined } : slot
        )
      );
    }

    setDraggedUnit(null);
  };

  const handleDragStart = (unit: Unit, index: number) => {
    if (!isInBattle) {
      setDraggedUnit({ unit, index });
    }
  };

  useEffect(() => {
    return () => {
      if (battleInterval !== null) {
        clearInterval(battleInterval);
      }
    };
  }, [battleInterval]);

  return (
    <div className="min-h-screen bg-black text-white p-2">
      <div className="h-[98vh] flex flex-col gap-2">
        {/* Battle controls at the top */}
        <div className="w-full flex-shrink-0">
          <BattleControls
            isInBattle={isInBattle}
            onStartBattle={handleStartBattle}
            onEndBattle={handleEndBattle}
            round={round}
          />
        </div>

        {/* Game board in the middle */}
        <div className="flex-1">
          <GameGrid
            cells={cells}
            onCellClick={handleCellClick}
            onUnitDrop={handleUnitDrop}
            isDragging={!!draggedUnit}
            combatEffects={combatEffects}
          />
        </div>

        {/* Shop panel at the bottom */}
        <div className="w-full flex-shrink-0">
          <ShopPanel
            gold={gold}
            slots={shopSlots}
            onRefresh={handleRefresh}
            onToggleLock={handleToggleLock}
            onDragStart={handleDragStart}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
