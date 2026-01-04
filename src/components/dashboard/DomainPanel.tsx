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
  Loader2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { useDomainBriefing } from "@/hooks/useDomainBriefing";
import { CommunicationsInbox } from "@/components/communications/CommunicationsInbox";

interface BriefingItem {
  text: string;
  urgent?: boolean;
}

interface DomainConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  prompt: string;
  hasCustomPanel?: boolean;
}

interface DomainPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDomain: (prompt: string) => void;
}

const domainConfigs: DomainConfig[] = [
  {
    id: "communications",
    icon: MessageSquare,
    label: "Communications",
    prompt: "Show me messages that need my attention",
    hasCustomPanel: true,
  },
  {
    id: "calendar",
    icon: Calendar,
    label: "Calendar",
    prompt: "What's on my schedule today?",
  },
  {
    id: "tasks",
    icon: CheckSquare,
    label: "Tasks",
    prompt: "What tasks should I focus on?",
  },
  {
    id: "finance",
    icon: TrendingUp,
    label: "Finance",
    prompt: "Give me a financial overview",
  },
  {
    id: "research",
    icon: Search,
    label: "Research",
    prompt: "I need to research something",
  },
  {
    id: "network",
    icon: Users,
    label: "Network",
    prompt: "Who should I follow up with?",
  },
];

function DomainCard({ 
  config,
  items,
  count,
  onSelect, 
  index,
  isLoading,
}: { 
  config: DomainConfig;
  items: BriefingItem[];
  count: number;
  onSelect: () => void;
  index: number;
  isLoading: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = config.icon;
  const hasUrgent = items.some(b => b.urgent);
  const isCommunications = config.id === "communications";

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Card header */}
      <motion.button
        className="w-full flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50 hover:border-foreground/20 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Icon */}
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-foreground/50 animate-spin" />
            ) : (
              <Icon className="w-5 h-5 text-foreground/70" />
            )}
          </div>
          {/* Activity indicator */}
          {hasUrgent && !isLoading && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-foreground">
              <span className="absolute inset-0 rounded-full bg-foreground animate-ping opacity-75" />
            </span>
          )}
        </div>

        {/* Label */}
        <div className="flex-1 text-left">
          <h3 className="font-medium text-foreground">{config.label}</h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading..." : `${count} items`}
          </p>
        </div>

        {/* Count badge */}
        {count > 0 && !isLoading && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-foreground/10 text-foreground">
            {count}
          </span>
        )}

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
            {isCommunications ? (
              <div className="pt-2 pb-2">
                <CommunicationsInbox />
              </div>
            ) : (
              <div className="pt-2 pl-14 pr-4 pb-2 space-y-2">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items to show</p>
                ) : (
                  items.slice(0, 3).map((item, i) => (
                    <motion.div
                      key={i}
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
                  ))
                )}
                
                {/* Open domain button */}
                <motion.button
                  className="mt-3 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                  whileHover={{ x: 4 }}
                >
                  Open {config.label}
                  <ChevronRight className="w-3 h-3" />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DomainPanel({ isOpen, onClose, onSelectDomain }: DomainPanelProps) {
  const { briefing, isLoading, lastFetched, totalPending, refetch } = useDomainBriefing();

  // Format last fetched time
  const getLastFetchedText = () => {
    if (!lastFetched) return "Never";
    const diff = Math.floor((Date.now() - lastFetched.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

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
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Fetching latest..." : `${totalPending} items across workflows`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refetch}
                  disabled={isLoading}
                  className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Domain list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {domainConfigs.map((config, index) => {
                const domainData = briefing[config.id as keyof typeof briefing] || { items: [], count: 0 };
                return (
                  <DomainCard
                    key={config.id}
                    config={config}
                    items={domainData.items}
                    count={domainData.count}
                    index={index}
                    isLoading={isLoading}
                    onSelect={() => {
                      onSelectDomain(config.prompt);
                      onClose();
                    }}
                  />
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
                  </span>
                  <span>Connected to Director</span>
                </div>
                <span>Updated {getLastFetchedText()}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
