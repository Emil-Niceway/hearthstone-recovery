import { motion } from "framer-motion";
import { CloudLightning } from "lucide-react";
import { useEffect } from "react";

export function MatchFoundAnimation({
  onComplete,
}: {
  onComplete: () => void;
}) {
  useEffect(() => {
    // Wait for animation to complete before transitioning
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // Adjust timing to match your animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Dark overlay with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative">
        {/* Pulsing circle background */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            times: [0, 0.5, 1],
            repeat: 0,
          }}
          className="absolute inset-0 bg-gradient-to-r from-[#FF5E62] to-[#FF9966] rounded-full blur-2xl"
        />

        {/* Main content */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative flex flex-col items-center gap-6"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              damping: 10,
              stiffness: 100,
              delay: 0.2,
            }}
            className="relative"
          >
            <div className="absolute inset-[-2px] bg-gradient-to-r from-[#FF5E62] to-[#FF9966] rounded-full blur-md" />
            <div className="relative w-16 h-16 bg-[#12121A] rounded-full flex items-center justify-center">
              <CloudLightning className="w-8 h-8 text-[#FF5E62]" />

              {/* Sparks */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 0],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute w-1 h-1 bg-[#FF5E62]"
                  style={{
                    left: `${50 + Math.cos((i * Math.PI) / 4) * 30}%`,
                    top: `${50 + Math.sin((i * Math.PI) / 4) * 30}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Text with glow effect */}
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-[#FF9966] to-[#FF5E62] drop-shadow-[0_0_10px_rgba(255,94,98,0.5)]"
            >
              Match Found!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-white/60"
            >
              Entering lobby...
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
