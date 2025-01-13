import { useEffect, useState } from "react";
import { useGameConnection } from "./hooks/useGameConnection";
import { MatchmakingScreen } from "./components/matchmaking/MatchMakingScreen";
import { LobbyScreen } from "./components/lobby/LobbyScreen";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { GameView } from "./components/game/GameView";

export default function App() {
  const [hasShownMatchFound, setHasShownMatchFound] = useState(false);

  const {
    gameState,
    matchmakingStatus,
    gameId,
    socket,
    playerId,
    findMatch,
    setReady,
    leaveLobby,
  } = useGameConnection();

  const isInGame =
    gameState?.phase === "preparation" ||
    gameState?.phase === "combat" ||
    gameState?.phase === "victory";

  useEffect(() => {
    if (gameState?.phase === "preparation") {
      // Instead of immediately showing game, wait for animation
      // Wait for exit animation to complete before showing game
      setTimeout(() => {
        setHasShownMatchFound(false);
      }, 800); // Match the exit animation duration
    }
  }, [gameState]);

  const handleLobbyLeave = () => {
    setHasShownMatchFound(false); // Reset the match found state
    leaveLobby(); // Call existing leave handler
  };

  return (
    <div className="h-screen bg-black text-white">
      <AnimatePresence mode="wait">
        {isInGame && gameState ? (
          <motion.div
            key="game"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameView />
          </motion.div>
        ) : matchmakingStatus === "found" && !hasShownMatchFound ? (
          <MatchmakingScreen
            key="matchmaking"
            status={matchmakingStatus}
            onFindMatch={findMatch}
            onAnimationComplete={() => setHasShownMatchFound(true)}
          />
        ) : hasShownMatchFound || matchmakingStatus === "joining" ? (
          <LobbyScreen
            key="lobby"
            gameId={gameId!}
            socket={socket!}
            onReady={setReady}
            onLeave={handleLobbyLeave}
            playerId={playerId}
          />
        ) : (
          <MatchmakingScreen
            key="initial"
            status={matchmakingStatus}
            onFindMatch={findMatch}
            onAnimationComplete={() => setHasShownMatchFound(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
