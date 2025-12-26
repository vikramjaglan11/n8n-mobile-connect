import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Mail,
  CheckSquare,
  TrendingUp,
  Search,
  Users,
} from "lucide-react";
import { DomainCard } from "./DomainCard";
import { VoiceButton } from "./VoiceButton";

interface DashboardProps {
  onSendMessage: (message: string) => void;
  onInputFocus: (prefill?: string) => void;
}

// Mock data - in real app, this would come from the backend
const domainData = [
  {
    icon: Mail,
    label: "Communications",
    description: "Messages across all platforms",
    color: "email",
    activityCount: 5,
    activities: [
      { id: "1", preview: "John wants to schedule a call about the project", source: "Slack", time: "2m ago", urgent: true },
      { id: "2", preview: "New partnership inquiry from TechCorp", source: "Email", time: "15m ago" },
    ],
    prompt: "Show me messages that need my attention",
  },
  {
    icon: Calendar,
    label: "Calendar",
    description: "Meetings & schedule",
    color: "calendar",
    activityCount: 3,
    activities: [
      { id: "1", preview: "Team standup in 30 minutes", source: "Work", time: "Soon", urgent: true },
      { id: "2", preview: "Dinner with Sarah at 7pm", source: "Personal", time: "Today" },
    ],
    prompt: "What's on my schedule today?",
  },
  {
    icon: CheckSquare,
    label: "Tasks",
    description: "To-dos & action items",
    color: "tasks",
    activityCount: 8,
    activities: [
      { id: "1", preview: "Review Q4 budget proposal", time: "Due today", urgent: true },
      { id: "2", preview: "Send follow-up to investors", time: "Due tomorrow" },
    ],
    prompt: "What tasks should I focus on?",
  },
  {
    icon: TrendingUp,
    label: "Finance",
    description: "Money & investments",
    color: "finance",
    activityCount: 2,
    activities: [
      { id: "1", preview: "Monthly expenses are 12% under budget", time: "This month" },
      { id: "2", preview: "Invoice from Adobe pending payment", time: "Due in 3 days" },
    ],
    prompt: "Give me a financial overview",
  },
  {
    icon: Search,
    label: "Research",
    description: "Information & insights",
    color: "research",
    activityCount: 0,
    activities: [],
    prompt: "I need to research something",
  },
  {
    icon: Users,
    label: "Network",
    description: "People & relationships",
    color: "network",
    activityCount: 4,
    activities: [
      { id: "1", preview: "Haven't connected with Mike in 2 weeks", source: "Professional", time: "Follow up" },
      { id: "2", preview: "Sarah's birthday is coming up", source: "Personal", time: "In 3 days" },
    ],
    prompt: "Who should I follow up with?",
  },
];

export function Dashboard({ onSendMessage, onInputFocus }: DashboardProps) {
  const handleVoiceTranscript = (text: string) => {
    onSendMessage(text);
  };

  const handleCardClick = (prompt: string) => {
    onInputFocus(prompt);
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 pb-32">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Good morning
        </h1>
        <p className="text-muted-foreground text-sm">
          How can I help you today?
        </p>
      </motion.div>

      {/* Voice button - center focus */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <VoiceButton onTranscript={handleVoiceTranscript} />
      </motion.div>

      {/* Domain cards grid */}
      <div className="w-full max-w-lg space-y-3">
        {domainData.map((domain, index) => (
          <DomainCard
            key={domain.label}
            icon={domain.icon}
            label={domain.label}
            description={domain.description}
            color={domain.color}
            activityCount={domain.activityCount}
            activities={domain.activities}
            onClick={() => handleCardClick(domain.prompt)}
            delay={0.3 + index * 0.08}
          />
        ))}
      </div>

      {/* Quick stats footer */}
      <motion.div
        className="mt-8 flex items-center gap-4 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-medium">Live</span>
        </div>
        <span className="text-border">•</span>
        <span>22 pending items</span>
        <span className="text-border">•</span>
        <span>Last sync 1m ago</span>
      </motion.div>
    </div>
  );
}
