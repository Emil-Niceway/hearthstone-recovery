import { ReactNode } from "react";

export interface GameMode {
  id: "1v1" | "2v2" | "ffa";
  title: string;
  description: string;
  icon: ReactNode;
  players: number;
  disabled?: boolean;
}
