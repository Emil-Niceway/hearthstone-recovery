import { motion } from "framer-motion";
import { Laptop, XCircle } from "lucide-react";
import { Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export function GameView() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Step 1: Face Your Mistakes",
      icon: Laptop,
      description: "Time to confront your past decisions...",
      instruction:
        "Press Win + R, type 'control panel', and begin your redemption",
      quote: "The first step towards recovery is admitting you have a problem.",
    },
    {
      title: "Step 2: The Path to Freedom",
      icon: XCircle,
      description: "29GB of regrettable life choices await...",
      instruction:
        "Navigate to 'Programs and Features' - your salvation lies within",
      quote: "Every journey begins with a single uninstall.",
    },
    {
      title: "Step 3: The Final Release",
      icon: Trash2,
      description: "Break free from the chains of RNG!",
      instruction:
        "Find Hearthstone, right-click, and choose the path of enlightenment",
      quote: "Let go of that which does not serve you.",
    },
    {
      title: "Victory Achieved! 🎉",
      icon: Check,
      description: "You've taken your first step towards gaming redemption!",
      instruction: "Your hard drive thanks you for its newfound freedom",
      quote: "Congratulations on choosing skill over luck.",
    },
  ];

  const currentStep = steps[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col items-center justify-center gap-8 px-4 max-w-screen-xl mx-auto"
    >
      {/* Floating particles in background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [-20, 20],
              x: [-20, 20],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-1 h-1 bg-[#FF5E62] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Tutorial Card with enhanced animations */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#12121A]/90 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl"
      >
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full ${
                index <= step
                  ? "bg-gradient-to-r from-[#FF5E62] to-[#FF9966]"
                  : "bg-white/10"
              }`}
              style={{ width: index === step ? 32 : 16 }}
              animate={{ width: index === step ? 32 : 16 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Icon with enhanced glow */}
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-[-8px] bg-gradient-to-r from-[#FF5E62] to-[#FF9966] rounded-full blur-xl opacity-75"
            />
            <div className="relative w-20 h-20 bg-[#12121A] rounded-full flex items-center justify-center">
              {currentStep.icon && (
                <currentStep.icon className="w-10 h-10 text-[#FF5E62]" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Content with quote */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF5E62] to-[#FF9966]">
            {currentStep.title}
          </h2>
          <p className="text-white/70">{currentStep.description}</p>
          <div className="bg-white/5 rounded-lg p-4 text-white/50">
            {currentStep.instruction}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="italic text-sm text-[#FF5E62]/70"
          >
            "{currentStep.quote}"
          </motion.p>
        </motion.div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-gradient-to-r from-[#FF5E62] to-[#FF9966] hover:opacity-90
                transition-opacity shadow-lg shadow-[#FF5E62]/20"
            >
              Continue Journey
            </Button>
          ) : (
            <Button
              onClick={() => window.close()}
              className="bg-gradient-to-r from-[#FF5E62] to-[#FF9966] hover:opacity-90
                transition-opacity shadow-lg shadow-[#FF5E62]/20"
            >
              Embrace Freedom
            </Button>
          )}
        </div>
      </motion.div>

      {/* Enhanced bonus tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/30 text-sm italic"
      >
        Pro tip: While you're at it, Battle.net is just taking up space... Just
        saying 💅
      </motion.p>
    </motion.div>
  );
}
