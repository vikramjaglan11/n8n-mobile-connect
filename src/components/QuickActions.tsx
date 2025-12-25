import { Button } from "@/components/ui/button";
import {
  Calendar,
  Mail,
  CheckSquare,
  Search,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

interface QuickActionsProps {
  onAction: (prompt: string) => void;
}

const actions = [
  {
    icon: Calendar,
    label: "Today's Schedule",
    prompt: "What's on my calendar for today?",
    color: "text-info",
  },
  {
    icon: Mail,
    label: "Check Emails",
    prompt: "Do I have any pending emails that need attention?",
    color: "text-warning",
  },
  {
    icon: CheckSquare,
    label: "My Tasks",
    prompt: "What are my current tasks and their status?",
    color: "text-success",
  },
  {
    icon: TrendingUp,
    label: "Finance",
    prompt: "Give me a summary of recent financial activity",
    color: "text-primary",
  },
  {
    icon: Search,
    label: "Research",
    prompt: "I need help researching something",
    color: "text-purple-400",
  },
  {
    icon: MessageSquare,
    label: "Draft Message",
    prompt: "Help me draft a message",
    color: "text-pink-400",
  },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="action"
          className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-[1.02] transition-transform"
          onClick={() => onAction(action.prompt)}
        >
          <action.icon className={`w-5 h-5 ${action.color}`} />
          <span className="text-xs text-muted-foreground">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
