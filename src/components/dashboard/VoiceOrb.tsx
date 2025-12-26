import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";

interface VoiceOrbProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceOrb({ onTranscript, disabled }: VoiceOrbProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(12).fill(0));
  const [idlePhase, setIdlePhase] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const idleAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setIsSupported(false);
    }
    return () => {
      cleanup();
    };
  }, []);

  // Continuous idle animation for living effect
  useEffect(() => {
    if (!isListening) {
      const animateIdle = () => {
        setIdlePhase(Date.now() * 0.001);
        idleAnimationRef.current = requestAnimationFrame(animateIdle);
      };
      animateIdle();
    } else {
      if (idleAnimationRef.current) {
        cancelAnimationFrame(idleAnimationRef.current);
      }
    }

    return () => {
      if (idleAnimationRef.current) {
        cancelAnimationFrame(idleAnimationRef.current);
      }
    };
  }, [isListening]);

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (idleAnimationRef.current) {
      cancelAnimationFrame(idleAnimationRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;
      analyserRef.current.smoothingTimeConstant = 0.8;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const analyze = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        
        const levels: number[] = [];
        const segmentSize = Math.floor(dataArray.length / 12);
        
        for (let i = 0; i < 12; i++) {
          let sum = 0;
          for (let j = 0; j < segmentSize; j++) {
            sum += dataArray[i * segmentSize + j];
          }
          const avg = sum / segmentSize / 255;
          const time = Date.now() * 0.002;
          const variation = Math.sin(time + i * 0.5) * 0.1;
          levels.push(Math.min(1, Math.max(0.1, avg + variation)));
        }
        
        setAudioLevels(levels);
        animationRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setAudioLevels(Array(12).fill(0));
  }, []);

  const startListening = async () => {
    if (!isSupported || disabled || isListening) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      startAudioAnalysis();
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      stopAudioAnalysis();
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      stopAudioAnalysis();
    };

    recognitionRef.current.start();
  };

  if (!isSupported) return null;

  // Calculate average audio level for outer effects
  const avgLevel = audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length;

  // Idle animation values - organic, flowing movement
  const idleScale1 = 1 + Math.sin(idlePhase * 0.8) * 0.03 + Math.sin(idlePhase * 1.3) * 0.02;
  const idleScale2 = 1 + Math.sin(idlePhase * 0.6 + 1) * 0.025 + Math.cos(idlePhase * 1.1) * 0.02;
  const idleScale3 = 1 + Math.sin(idlePhase * 0.5 + 2) * 0.02 + Math.sin(idlePhase * 0.9) * 0.015;
  const idleOpacity1 = 0.15 + Math.sin(idlePhase * 0.7) * 0.1;
  const idleOpacity2 = 0.1 + Math.sin(idlePhase * 0.5 + 0.5) * 0.08;
  const idleGlow = 0.04 + Math.sin(idlePhase * 0.4) * 0.02;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow - always breathing */}
      <motion.div
        className="absolute w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--foreground) / ${isListening ? 0.08 + avgLevel * 0.15 : idleGlow}) 0%, transparent 70%)`,
        }}
        animate={{
          scale: isListening ? 1 + avgLevel * 0.2 : idleScale1,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      />

      {/* Flowing ambient particles when idle */}
      {!isListening && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2 + idlePhase * 0.2;
            const radius = 45 + Math.sin(idlePhase + i) * 8;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const size = 2 + Math.sin(idlePhase * 0.8 + i * 0.5) * 1;
            const opacity = 0.08 + Math.sin(idlePhase * 0.6 + i * 0.7) * 0.06;
            
            return (
              <motion.div
                key={i}
                className="absolute rounded-full bg-foreground"
                style={{
                  width: size,
                  height: size,
                  x,
                  y,
                  opacity,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Audio visualization rings when listening */}
      <AnimatePresence>
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {audioLevels.map((level, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const radius = 52 + level * 25;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-foreground"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 0.15 + level * 0.6,
                    scale: 1,
                    x,
                    y,
                    width: 4 + level * 8,
                    height: 4 + level * 8,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Breathing outer ring - always animated */}
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          border: `1px solid hsl(var(--foreground) / ${isListening ? 0.15 + avgLevel * 0.2 : idleOpacity1})`,
          transform: `scale(${isListening ? 1 + avgLevel * 0.15 : idleScale2})`,
        }}
      />

      {/* Secondary ring - always animated */}
      <motion.div
        className="absolute w-28 h-28 rounded-full"
        style={{
          border: `1px solid hsl(var(--foreground) / ${isListening ? 0.1 + avgLevel * 0.15 : idleOpacity2})`,
          transform: `scale(${isListening ? 1 + avgLevel * 0.1 : idleScale3})`,
        }}
      />

      {/* Third ring for more depth */}
      <motion.div
        className="absolute w-36 h-36 rounded-full pointer-events-none"
        style={{
          border: `1px solid hsl(var(--foreground) / ${isListening ? 0.08 : 0.03 + Math.sin(idlePhase * 0.3) * 0.02})`,
          transform: `scale(${isListening ? 1 + avgLevel * 0.2 : 1 + Math.sin(idlePhase * 0.4 + 1.5) * 0.02})`,
        }}
      />

      {/* Main 3D orb */}
      <motion.button
        className={`relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={startListening}
        disabled={disabled || isListening}
        style={{
          transform: `scale(${isListening ? 1 + avgLevel * 0.08 : idleScale1})`,
        }}
        whileHover={!disabled && !isListening ? { scale: 1.08 } : {}}
        whileTap={!disabled && !isListening ? { scale: 0.95 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* 3D glass base with dynamic gradient */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(${135 + Math.sin(idlePhase * 0.3) * 15}deg, 
                hsl(var(--foreground) / ${0.06 + Math.sin(idlePhase * 0.5) * 0.02}) 0%, 
                hsl(var(--foreground) / 0.03) 50%, 
                hsl(var(--foreground) / ${0.05 + Math.cos(idlePhase * 0.4) * 0.02}) 100%
              )
            `,
            boxShadow: `
              inset 0 2px 20px hsl(var(--foreground) / ${0.04 + Math.sin(idlePhase * 0.6) * 0.02}),
              inset 0 -4px 15px hsl(var(--foreground) / 0.03),
              0 10px 40px -10px hsl(var(--foreground) / ${0.1 + Math.sin(idlePhase * 0.5) * 0.05}),
              0 2px 8px hsl(var(--foreground) / 0.08)
            `,
            border: `1px solid hsl(var(--foreground) / ${0.1 + Math.sin(idlePhase * 0.7) * 0.04})`,
          }}
        />

        {/* Inner highlight - orbiting light effect */}
        <motion.div
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 40% at ${30 + Math.sin(idlePhase * 0.4) * 10}% ${20 + Math.cos(idlePhase * 0.5) * 8}%, 
                hsl(var(--foreground) / ${isListening ? 0.15 : 0.1 + Math.sin(idlePhase * 0.6) * 0.04}) 0%, 
                transparent 60%
              )
            `,
          }}
        />

        {/* Secondary moving highlight */}
        <motion.div
          className="absolute inset-3 rounded-full pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 50% 30% at ${70 + Math.cos(idlePhase * 0.3) * 10}% ${75 + Math.sin(idlePhase * 0.4) * 8}%, 
                hsl(var(--foreground) / ${0.05 + Math.sin(idlePhase * 0.5) * 0.02}) 0%, 
                transparent 50%
              )
            `,
          }}
        />

        {/* Audio reactive inner glow */}
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(var(--foreground) / ${isListening ? avgLevel * 0.2 : 0.02 + Math.sin(idlePhase * 0.8) * 0.01}) 0%, transparent 70%)`,
          }}
        />

        {/* Pulsing core when listening */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              className="absolute inset-4 rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(var(--foreground) / 0.15) 0%, transparent 60%)`,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1 + avgLevel * 0.5, 0.8],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          className="relative z-10"
          style={{
            transform: `scale(${isListening ? 1 + avgLevel * 0.15 : 1 + Math.sin(idlePhase * 0.5) * 0.03})`,
            opacity: isListening ? 0.7 + avgLevel * 0.3 : 0.6 + Math.sin(idlePhase * 0.4) * 0.1,
          }}
        >
          <Mic className="w-7 h-7 text-foreground" />
        </motion.div>

        {/* Expanding pulse rings when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid hsl(var(--foreground) / 0.3)` }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.6 + avgLevel * 0.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `1px solid hsl(var(--foreground) / 0.2)` }}
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: 2 + avgLevel * 0.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, repeat: Infinity, delay: 0.2 }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
