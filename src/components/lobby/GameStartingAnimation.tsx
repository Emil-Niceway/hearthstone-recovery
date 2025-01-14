import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { useEffect } from "react";

export function GameStartingAnimation({
  onComplete,
}: {
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }} // Keep opacity at 1 when exiting
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Dark overlay with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        className="absolute inset-0 bg-black backdrop-blur-md"
      />

      {/* Content */}
      <div className="relative">
        {/* Energy waves */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0, 0.5, 0],
          }}
          exit={{
            scale: 3,
            opacity: 0,
            transition: { duration: 0.8 },
          }}
          transition={{
            duration: 2,
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
          className="absolute inset-0 bg-gradient-to-r from-[#FF5E62] to-[#FF9966] rounded-full blur-3xl"
        />

        {/* Main content */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{
            scale: 1.2,
            y: -50,
            opacity: 0,
            transition: { duration: 0.5 },
          }}
          className="relative flex flex-col items-center gap-8"
        >
          {/* Battle icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{
              scale: 2,
              rotate: 180,
              opacity: 0,
              transition: { duration: 0.5 },
            }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 100,
              delay: 0.3,
            }}
            className="relative"
          >
            <div className="absolute inset-[-4px] bg-gradient-to-r from-[#FF5E62] to-[#FF9966] rounded-full blur-xl opacity-75" />
            <div className="relative w-24 h-24 bg-[#12121A] rounded-full flex items-center justify-center">
              <Swords className="w-12 h-12 text-[#FF5E62]" />
            </div>

            {/* Battle sparks */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 0],
                  opacity: [1, 0],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                className="absolute w-2 h-2 bg-gradient-to-r from-[#FF5E62] to-[#FF9966]"
                style={{
                  left: "50%",
                  top: "50%",
                  borderRadius: "50%",
                }}
              />
            ))}
          </motion.div>

          {/* Text with epic effect */}
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                y: -30,
                opacity: 0,
                transition: { duration: 0.3 },
              }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-[#FF9966] to-[#FF5E62] drop-shadow-[0_0_15px_rgba(255,94,98,0.6)]"
            >
              Group Therapy Starting!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                y: -20,
                opacity: 0,
                transition: { duration: 0.2 },
              }}
              transition={{ delay: 0.7 }}
              className="mt-3 text-lg text-white/70"
            >
              Time to face your gaming addiction...
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
