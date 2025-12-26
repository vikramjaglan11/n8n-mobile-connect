import { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { VoiceOrb } from "./VoiceOrb";
import { DomainPanel } from "./DomainPanel";
import { useDomainBriefing } from "@/hooks/useDomainBriefing";

interface DashboardProps {
  onSendMessage: (message: string) => void;
  onInputFocus: (prefill?: string) => void;
}

export function Dashboard({ onSendMessage, onInputFocus }: DashboardProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { totalPending, isLoading } = useDomainBriefing();

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
      {/* Domain panel toggle - positioned below header */}
      <motion.button
        className="fixed top-16 left-4 z-40 w-11 h-11 rounded-xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-foreground/5 transition-colors shadow-sm"
        onClick={() => setIsPanelOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Menu className="w-5 h-5 text-foreground/70" />
        {/* Notification badge - shows real count */}
        {totalPending > 0 && (
          <motion.span 
            className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-foreground flex items-center justify-center shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <span className="text-[10px] text-background font-bold">
              {totalPending > 99 ? '99+' : totalPending}
            </span>
          </motion.span>
        )}
        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-foreground/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ borderTopColor: 'hsl(var(--foreground))' }}
          />
        )}
      </motion.button>

      {/* Main content - centered */}
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        {/* Greeting */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-light text-foreground mb-2 tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-muted-foreground text-sm">
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
          className="mt-20 text-xs text-muted-foreground/50 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          or type below
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
