import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface DirectorCoreProps {
  isActive?: boolean;
  isProcessing?: boolean;
}

export function DirectorCore({ isActive = true, isProcessing = false }: DirectorCoreProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 16 }, (_, i) => ({
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
          background: "radial-gradient(circle, hsl(0 0% 0% / 0.04) 0%, transparent 70%)",
        }}
        animate={{
          scale: isProcessing ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: isProcessing ? 1 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbital rings */}
      <motion.div
        className="absolute w-48 h-48 rounded-full border border-foreground/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground"
          style={{ boxShadow: "0 4px 12px hsl(0 0% 0% / 0.2)" }}
        />
      </motion.div>

      <motion.div
        className="absolute w-56 h-56 rounded-full border border-muted-foreground/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground/60"
          style={{ boxShadow: "0 4px 8px hsl(0 0% 0% / 0.15)" }}
        />
      </motion.div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-foreground/40"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: [0, particle.x, particle.x * 0.5, 0],
            y: [0, particle.y, particle.y * 1.5, 0],
            opacity: [0, 0.6, 0.3, 0],
            scale: [0, 1, 0.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
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
        {/* Core gradient - black/charcoal for light theme */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 35% 35%, 
                hsl(0 0% 50%) 0%, 
                hsl(0 0% 25%) 30%, 
                hsl(0 0% 12%) 60%,
                hsl(0 0% 5%) 100%
              )
            `,
            boxShadow: isActive
              ? `
                0 8px 40px hsl(0 0% 0% / 0.15),
                0 16px 80px hsl(0 0% 0% / 0.1),
                inset 0 0 30px hsl(0 0% 100% / 0.1)
              `
              : "0 4px 20px hsl(0 0% 0% / 0.1)",
          }}
        />

        {/* Inner highlight */}
        <div
          className="absolute top-3 left-4 w-8 h-6 rounded-full opacity-50"
          style={{
            background: "linear-gradient(180deg, white 0%, transparent 100%)",
            filter: "blur(4px)",
          }}
        />

        {/* Pulse ring when processing */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-foreground/30"
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
              stroke="url(#lineGradientLight)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.2 }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
            />
          );
        })}
        <defs>
          <linearGradient id="lineGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(0 0% 0%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(0 0% 0%)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
