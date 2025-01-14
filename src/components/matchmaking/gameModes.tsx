import { Swords, Users, Crown } from "lucide-react";
import { GameMode } from "./types";

export const gameModes: GameMode[] = [
  {
    id: "1v1",
    title: "Buddy System",
    description: "Find a recovery partner",
    icon: <Swords className="w-8 h-8" />,
    players: 2,
  },
  {
    id: "2v2",
    title: "Group Therapy",
    description: "Heal together with friends",
    icon: <Users className="w-8 h-8" />,
    players: 4,
    disabled: true,
  },
  {
    id: "ffa",
    title: "Support Group",
    description: "4-player intervention",
    icon: <Crown className="w-8 h-8" />,
    players: 4,
    disabled: true,
  },
];
