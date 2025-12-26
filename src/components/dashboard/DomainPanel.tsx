import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Mail,
  CheckSquare,
  TrendingUp,
  Search,
  Users,
  X,
  LucideIcon,
  ChevronRight,
} from "lucide-react";

interface BriefingItem {
  id: string;
  text: string;
  urgent?: boolean;
}

interface Domain {
  id: string;
  icon: LucideIcon;
  label: string;
  briefing: BriefingItem[];
}

interface DomainPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDomain: (prompt: string) => void;
}

const domains: Domain[] = [
  {
    id: "communications",
    icon: Mail,
    label: "Communications",
    briefing: [
      { id: "1", text: "5 messages need your response", urgent: true },
      { id: "2", text: "John wants to schedule a call" },
      { id: "3", text: "New partnership inquiry pending" },
    ],
  },
  {
    id: "calendar",
    icon: Calendar,
    label: "Calendar",
    briefing: [
      { id: "1", text: "Team standup in 30 minutes", urgent: true },
      { id: "2", text: "3 meetings today" },
      { id: "3", text: "Dinner plans at 7pm" },
    ],
  },
  {
    id: "tasks",
    icon: CheckSquare,
    label: "Tasks",
    briefing: [
      { id: "1", text: "8 tasks pending", urgent: true },
      { id: "2", text: "Q4 budget review due today" },
      { id: "3", text: "2 follow-ups overdue" },
    ],
  },
  {
    id: "finance",
    icon: TrendingUp,
    label: "Finance",
    briefing: [
      { id: "1", text: "Monthly expenses under budget" },
      { id: "2", text: "Invoice pending payment" },
    ],
  },
  {
    id: "research",
    icon: Search,
    label: "Research",
    briefing: [
      { id: "1", text: "No active research tasks" },
    ],
  },
  {
    id: "network",
    icon: Users,
    label: "Network",
    briefing: [
      { id: "1", text: "4 follow-ups suggested" },
      { id: "2", text: "Sarah's birthday in 3 days" },
    ],
  },
];

const domainPrompts: Record<string, string> = {
  communications: "Show me messages that need my attention",
  calendar: "What's on my schedule today?",
  tasks: "What tasks should I focus on?",
  finance: "Give me a financial overview",
  research: "I need to research something",
  network: "Who should I follow up with?",
};

function DomainCard({ 
  domain, 
  onSelect, 
  index 
}: { 
  domain: Domain; 
  onSelect: () => void;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = domain.icon;
  const hasUrgent = domain.briefing.some(b => b.urgent);

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Card header - always visible */}
      <motion.button
        className="w-full flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50 hover:border-foreground/20 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Icon */}
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-foreground/70" />
          </div>
          {/* Activity indicator */}
          {hasUrgent && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-foreground">
              <span className="absolute inset-0 rounded-full bg-foreground animate-ping opacity-75" />
            </span>
          )}
        </div>

        {/* Label */}
        <div className="flex-1 text-left">
          <h3 className="font-medium text-foreground">{domain.label}</h3>
          <p className="text-xs text-muted-foreground">
            {domain.briefing.length} items
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Expanded briefing */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pl-14 pr-4 pb-2 space-y-2">
              {domain.briefing.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="flex items-start gap-2 text-sm"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    item.urgent ? "bg-foreground" : "bg-foreground/30"
                  }`} />
                  <span className={item.urgent ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
              
              {/* Open domain button */}
              <motion.button
                className="mt-3 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                whileHover={{ x: 4 }}
              >
                Open {domain.label}
                <ChevronRight className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DomainPanel({ isOpen, onClose, onSelectDomain }: DomainPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-background border-r border-border z-50 flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-semibold text-foreground">Domains</h2>
                <p className="text-xs text-muted-foreground">Your workflows at a glance</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Domain list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {domains.map((domain, index) => (
                <DomainCard
                  key={domain.id}
                  domain={domain}
                  index={index}
                  onSelect={() => {
                    onSelectDomain(domainPrompts[domain.id]);
                    onClose();
                  }}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
                </span>
                <span>Last sync 1 minute ago</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
