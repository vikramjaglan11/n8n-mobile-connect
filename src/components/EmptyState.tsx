import { motion } from "framer-motion";
import {
  Calendar,
  Mail,
  CheckSquare,
  TrendingUp,
  Search,
  Users,
} from "lucide-react";
import { DirectorCore } from "./core/DirectorCore";
import { DomainOrb } from "./core/DomainOrb";

interface EmptyStateProps {
  onDomainClick?: (domain: string) => void;
}

const domains = [
  { icon: Calendar, label: "Calendar", color: "calendar", prompt: "What's on my calendar today?" },
  { icon: Mail, label: "Email", color: "email", prompt: "Show me pending emails that need my attention" },
  { icon: CheckSquare, label: "Tasks", color: "tasks", prompt: "What are my current tasks?" },
  { icon: TrendingUp, label: "Finance", color: "finance", prompt: "Give me a financial summary" },
  { icon: Search, label: "Research", color: "research", prompt: "I need help researching something" },
  { icon: Users, label: "Network", color: "network", prompt: "Who should I follow up with?" },
];

export function EmptyState({ onDomainClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 relative">
      {/* Title and subtitle */}
      <motion.div
        className="text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-3 tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-foreground">Your </span>
          <span className="gradient-text text-glow">Director</span>
        </motion.h1>
        <motion.p
          className="text-muted-foreground text-sm md:text-base max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Orchestrating your digital life across calendars, emails, tasks, finances, and beyond.
        </motion.p>
      </motion.div>

      {/* Director Core visualization */}
      <motion.div
        className="relative mb-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <DirectorCore isActive={true} />
      </motion.div>

      {/* Domain orbs */}
      <motion.div
        className="flex flex-wrap justify-center gap-6 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {domains.map((domain, index) => (
          <DomainOrb
            key={domain.label}
            icon={domain.icon}
            label={domain.label}
            color={domain.color}
            delay={0.7 + index * 0.1}
            onClick={() => onDomainClick?.(domain.prompt)}
          />
        ))}
      </motion.div>

      {/* Status indicator */}
      <motion.div
        className="mt-10 flex items-center gap-2 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="font-mono">CONNECTED</span>
        <span className="text-border">•</span>
        <span className="font-mono">4 BUSINESSES</span>
        <span className="text-border">•</span>
        <span className="font-mono">6 EMAILS</span>
      </motion.div>
    </div>
  );
}
