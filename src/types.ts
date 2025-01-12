export interface Unit {
  id: string;
  name: string;
  type: "warrior" | "archer" | "mage";
  isPlayerUnit: boolean;
  stats: {
    health: number;
    attack: number;
    defense: number;
    range: number;
    speed: number;
  };
}

export interface Cell {
  x: number;
  y: number;
  isPlayerArea: boolean;
  unit?: Unit;
}
