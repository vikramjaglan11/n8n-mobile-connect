import { motion } from "framer-motion";

interface QuickActionsProps {
  onAction: (prompt: string) => void;
}

const suggestions = [
  "What's on my schedule today?",
  "Show me pending emails",
  "Create a task for tomorrow",
  "Check my finances",
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <motion.div
      className="px-4 pb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3 }}
    >
      <p className="text-[10px] text-muted-foreground/50 text-center mb-3 font-mono tracking-wider">
        QUICK COMMANDS
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion}
            onClick={() => onAction(suggestion)}
            className="px-3 py-1.5 text-xs rounded-full bg-secondary/50 border border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-secondary transition-all duration-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
