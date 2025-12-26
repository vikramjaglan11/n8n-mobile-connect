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
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setIsSupported(false);
    }
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
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
        
        // Create organic, flowing levels
        const levels: number[] = [];
        const segmentSize = Math.floor(dataArray.length / 12);
        
        for (let i = 0; i < 12; i++) {
          let sum = 0;
          for (let j = 0; j < segmentSize; j++) {
            sum += dataArray[i * segmentSize + j];
          }
          const avg = sum / segmentSize / 255;
          // Add some organic variation
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

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow - responds to audio */}
      <motion.div
        className="absolute w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--foreground) / ${isListening ? 0.08 + avgLevel * 0.15 : 0.03}) 0%, transparent 70%)`,
        }}
        animate={{
          scale: isListening ? 1 + avgLevel * 0.2 : 1,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      />

      {/* Audio visualization rings */}
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

      {/* Breathing outer ring */}
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          border: `1px solid hsl(var(--foreground) / ${isListening ? 0.15 + avgLevel * 0.2 : 0.08})`,
        }}
        animate={{
          scale: isListening ? 1 + avgLevel * 0.15 : [1, 1.02, 1],
          opacity: isListening ? 0.5 + avgLevel * 0.5 : [0.3, 0.5, 0.3],
        }}
        transition={{
          type: isListening ? "spring" : "tween",
          stiffness: 100,
          damping: 15,
          duration: isListening ? undefined : 3,
          repeat: isListening ? 0 : Infinity,
        }}
      />

      {/* Secondary ring */}
      <motion.div
        className="absolute w-28 h-28 rounded-full"
        style={{
          border: `1px solid hsl(var(--foreground) / ${isListening ? 0.1 + avgLevel * 0.15 : 0.05})`,
        }}
        animate={{
          scale: isListening ? 1 + avgLevel * 0.1 : [1, 1.01, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          type: isListening ? "spring" : "tween",
          stiffness: 120,
          damping: 20,
          duration: isListening ? undefined : 4,
          repeat: isListening ? 0 : Infinity,
          delay: 0.3,
        }}
      />

      {/* Main 3D orb */}
      <motion.button
        className={`relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={startListening}
        disabled={disabled || isListening}
        animate={{
          scale: isListening ? 1 + avgLevel * 0.08 : 1,
        }}
        whileHover={!disabled && !isListening ? { scale: 1.08 } : {}}
        whileTap={!disabled && !isListening ? { scale: 0.95 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* 3D glass base - multiple layers for depth */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(135deg, 
                hsl(var(--foreground) / 0.08) 0%, 
                hsl(var(--foreground) / 0.03) 50%, 
                hsl(var(--foreground) / 0.06) 100%
              )
            `,
            boxShadow: `
              inset 0 2px 20px hsl(var(--foreground) / 0.05),
              inset 0 -4px 15px hsl(var(--foreground) / 0.03),
              0 10px 40px -10px hsl(var(--foreground) / 0.15),
              0 2px 8px hsl(var(--foreground) / 0.08)
            `,
            border: `1px solid hsl(var(--foreground) / 0.12)`,
          }}
        />

        {/* Inner highlight - creates 3D sphere illusion */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 30% 20%, 
                hsl(var(--foreground) / 0.12) 0%, 
                transparent 60%
              )
            `,
          }}
          animate={{
            opacity: isListening ? [0.6, 1, 0.6] : 0.8,
          }}
          transition={{
            duration: 1,
            repeat: isListening ? Infinity : 0,
          }}
        />

        {/* Audio reactive inner glow */}
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(var(--foreground) / ${isListening ? avgLevel * 0.2 : 0}) 0%, transparent 70%)`,
          }}
          animate={{
            scale: isListening ? 1 + avgLevel * 0.3 : 1,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />

        {/* Subtle rim lighting */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(180deg, 
                transparent 40%, 
                hsl(var(--foreground) / 0.04) 100%
              )
            `,
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
          animate={{
            scale: isListening ? 1 + avgLevel * 0.15 : 1,
            opacity: isListening ? 0.7 + avgLevel * 0.3 : 0.7,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
