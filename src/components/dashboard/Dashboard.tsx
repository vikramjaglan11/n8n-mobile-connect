import { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { VoiceOrb } from "./VoiceOrb";
import { DomainPanel } from "./DomainPanel";

interface DashboardProps {
  onSendMessage: (message: string) => void;
  onInputFocus: (prefill?: string) => void;
}

export function Dashboard({ onSendMessage, onInputFocus }: DashboardProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleVoiceTranscript = (text: string) => {
    onSendMessage(text);
  };

  const handleDomainSelect = (prompt: string) => {
    onInputFocus(prompt);
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 py-6">
      {/* Domain panel toggle */}
      <motion.button
        className="fixed top-4 left-4 z-30 w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-foreground/5 transition-colors"
        onClick={() => setIsPanelOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Menu className="w-5 h-5 text-foreground/70" />
        {/* Notification dot */}
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-foreground flex items-center justify-center">
          <span className="text-[8px] text-background font-bold">7</span>
        </span>
      </motion.button>

      {/* Main content - centered */}
      <div className="flex flex-col items-center justify-center flex-1">
        {/* Greeting */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-light text-foreground mb-2">
            {getGreeting()}
          </h1>
          <p className="text-muted-foreground">
            How can I help you today?
          </p>
        </motion.div>

        {/* Voice orb - center focus */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <VoiceOrb onTranscript={handleVoiceTranscript} />
        </motion.div>

        {/* Subtle hint */}
        <motion.p
          className="mt-16 text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Tap the menu for domain briefings
        </motion.p>
      </div>

      {/* Domain panel */}
      <DomainPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSelectDomain={handleDomainSelect}
      />
    </div>
  );
}
