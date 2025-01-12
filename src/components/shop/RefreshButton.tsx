import { FC } from "react";
import { motion } from "framer-motion";

interface RefreshButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const RefreshButton: FC<RefreshButtonProps> = ({
  onClick,
  disabled,
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-8 py-3 rounded-lg text-lg font-bold
        bg-gradient-to-r from-blue-600/80 via-blue-500/80 to-blue-600/80
        hover:from-blue-500/80 hover:via-blue-400/80 hover:to-blue-500/80
        disabled:from-gray-600/50 disabled:via-gray-500/50 disabled:to-gray-600/50
        disabled:cursor-not-allowed disabled:hover:from-gray-600/50 disabled:hover:via-gray-500/50 disabled:hover:to-gray-600/50
        shadow-[0_0_15px_rgba(37,99,235,0.5)]
        disabled:shadow-none
        overflow-hidden
        group
      `}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {/* Background pulse effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

      {/* Border glow effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-300/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-300/50 to-transparent" />
      </div>

      {/* Top radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Energy orb effect */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6">
        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
      </div>

      {/* Button content */}
      <div className="relative flex items-center gap-3">
        <span className="text-xl text-blue-200">⚡</span>
        <span className="text-white/90 group-hover:text-white transition-colors">
          Refresh
          <span className="ml-1 text-blue-300/80 group-hover:text-blue-200/90 transition-colors">
            (2 Gold)
          </span>
        </span>
      </div>
    </motion.button>
  );
};
