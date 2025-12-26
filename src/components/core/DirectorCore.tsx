import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface DirectorCoreProps {
  isActive?: boolean;
  isProcessing?: boolean;
}

export function DirectorCore({ isActive = true, isProcessing = false }: DirectorCoreProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(185 100% 50% / 0.1) 0%, transparent 70%)",
        }}
        animate={{
          scale: isProcessing ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: isProcessing ? 1 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbital rings */}
      <motion.div
        className="absolute w-48 h-48 rounded-full border border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary"
          style={{ boxShadow: "0 0 20px hsl(185 100% 50% / 0.8)" }}
        />
      </motion.div>

      <motion.div
        className="absolute w-56 h-56 rounded-full border border-accent/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-accent/80"
          style={{ boxShadow: "0 0 15px hsl(280 100% 65% / 0.6)" }}
        />
      </motion.div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-primary/60"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: [0, particle.x, particle.x * 0.5, 0],
            y: [0, particle.y, particle.y * 1.5, 0],
            opacity: [0, 0.8, 0.4, 0],
            scale: [0, 1, 0.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 6px hsl(185 100% 50% / 0.5)",
          }}
        />
      ))}

      {/* Core sphere */}
      <motion.div
        className="relative w-28 h-28 rounded-full"
        animate={{
          scale: isProcessing ? [1, 1.1, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: isProcessing ? 0.5 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Core gradient */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 35% 35%, 
                hsl(185 100% 75% / 0.9) 0%, 
                hsl(185 100% 50%) 30%, 
                hsl(200 100% 40%) 60%,
                hsl(230 60% 25%) 100%
              )
            `,
            boxShadow: isActive
              ? `
                0 0 60px hsl(185 100% 50% / 0.5),
                0 0 120px hsl(185 100% 50% / 0.3),
                inset 0 0 40px hsl(185 100% 30% / 0.5)
              `
              : "none",
          }}
        />

        {/* Inner highlight */}
        <div
          className="absolute top-3 left-4 w-8 h-6 rounded-full opacity-40"
          style={{
            background: "linear-gradient(180deg, white 0%, transparent 100%)",
            filter: "blur(4px)",
          }}
        />

        {/* Pulse ring when processing */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Connection lines to domains */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const radian = (angle * Math.PI) / 180;
          const x2 = 128 + Math.cos(radian) * 150;
          const y2 = 128 + Math.sin(radian) * 150;
          return (
            <motion.line
              key={angle}
              x1="128"
              y1="128"
              x2={x2}
              y2={y2}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
            />
          );
        })}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(185 100% 50%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(185 100% 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
