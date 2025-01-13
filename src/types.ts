export type Position = {
  x: number;
  y: number;
};

export interface Stats {
  health: number;
  attack: number;
  defense: number;
  range: number;
  speed: number;
}

export interface Unit {
  id: string;
  name: string;
  type: "warrior" | "archer" | "mage";
  playerId: string;
  stats: Stats;
  isEnteringCombat?: boolean;
}

export interface Cell {
  x: number;
  y: number;
  isPlayerArea: boolean;
  isEnemyArea: boolean;
  unit?: Unit;
}

export interface ShopSlot {
  unit?: Unit;
  isLocked: boolean;
}

export interface CombatEffect {
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

export interface Player {
  id: string;
  gold: number;
  shopSlots: ShopSlot[];
  playerIndex: number;
}

export type GamePhase = "lobby" | "preparation" | "combat" | "victory";

export interface GameTimers {
  preparation: number; // Seconds remaining in preparation phase
  combat: number; // Seconds remaining in combat phase
}

export interface GameState {
  gameId: string;
  players: Map<string, Player>;
  phase: GamePhase;
}

// View of the game state specific to each player
export interface PlayerGameState {
  gameId: string;
  playerId: string;
  playerIndex: number;
  phase: GamePhase;
}
