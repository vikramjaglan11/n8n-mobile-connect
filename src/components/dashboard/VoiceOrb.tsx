import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";

interface VoiceOrbProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceOrb({ onTranscript, disabled }: VoiceOrbProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setIsSupported(false);
    }
  }, []);

  // Simulate audio visualization when listening
  useEffect(() => {
    if (isListening) {
      const animate = () => {
        // Smooth organic movement
        const time = Date.now() * 0.003;
        const level = 0.3 + Math.sin(time) * 0.15 + Math.sin(time * 1.7) * 0.1 + Math.random() * 0.15;
        setAudioLevel(level);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioLevel(0);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening]);

  const startListening = () => {
    if (!isSupported || disabled) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  if (!isSupported) return null;

  const orbScale = 1 + audioLevel * 0.3;
  const glowIntensity = 0.2 + audioLevel * 0.6;

  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient glow layers */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="absolute w-40 h-40 rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(var(--foreground) / ${glowIntensity * 0.15}) 0%, transparent 70%)`,
          }}
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isListening ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Outer ring - breathing effect */}
      <motion.div
        className="absolute w-32 h-32 rounded-full border border-foreground/10"
        animate={{
          scale: isListening ? [1, 1.1, 1] : [1, 1.03, 1],
          opacity: isListening ? [0.3, 0.6, 0.3] : [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: isListening ? 1 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute w-28 h-28 rounded-full border border-foreground/15"
        animate={{
          scale: isListening ? [1, 1.15, 1] : [1, 1.02, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: isListening ? 1.2 : 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />

      {/* Main orb */}
      <motion.button
        className={`relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={startListening}
        disabled={disabled || isListening}
        animate={{
          scale: isListening ? orbScale : 1,
        }}
        whileHover={!disabled && !isListening ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isListening ? { scale: 0.95 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Glass morphism background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-xl border border-foreground/20" />
        
        {/* Inner gradient */}
        <motion.div
          className="absolute inset-1 rounded-full"
          style={{
            background: isListening
              ? `radial-gradient(circle at 30% 30%, hsl(var(--foreground) / 0.15) 0%, hsl(var(--foreground) / 0.05) 50%, transparent 70%)`
              : `radial-gradient(circle at 30% 30%, hsl(var(--foreground) / 0.08) 0%, transparent 60%)`,
          }}
          animate={{
            opacity: isListening ? [0.5, 1, 0.5] : 1,
          }}
          transition={{
            duration: 0.8,
            repeat: isListening ? Infinity : 0,
            ease: "easeInOut",
          }}
        />

        {/* Flowing particles when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-foreground/40"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    x: [0, Math.cos(i * 60 * Math.PI / 180) * 30, 0],
                    y: [0, Math.sin(i * 60 * Math.PI / 180) * 30, 0],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          className="relative z-10"
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: isListening ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <Mic className={`w-8 h-8 ${isListening ? "text-foreground" : "text-foreground/70"}`} />
        </motion.div>

        {/* Pulse rings when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-foreground/30"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-foreground/20"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Label */}
      <motion.p
        className="mt-6 text-sm text-muted-foreground font-medium"
        animate={{
          opacity: isListening ? [0.5, 1, 0.5] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isListening ? Infinity : 0,
        }}
      >
        {isListening ? "Listening..." : "Tap to speak"}
      </motion.p>
    </div>
  );
}
