import { motion } from "framer-motion";
import { LucideIcon, ChevronRight } from "lucide-react";

interface ActivityItem {
  id: string;
  preview: string;
  source?: string;
  time?: string;
  urgent?: boolean;
}

interface DomainCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  activityCount: number;
  activities: ActivityItem[];
  onClick: () => void;
  delay?: number;
}

const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  calendar: {
    bg: "bg-domain-calendar/10",
    border: "border-domain-calendar/30",
    text: "text-domain-calendar",
    glow: "shadow-[0_0_20px_hsl(var(--domain-calendar)/0.15)]",
  },
  email: {
    bg: "bg-domain-email/10",
    border: "border-domain-email/30",
    text: "text-domain-email",
    glow: "shadow-[0_0_20px_hsl(var(--domain-email)/0.15)]",
  },
  tasks: {
    bg: "bg-domain-tasks/10",
    border: "border-domain-tasks/30",
    text: "text-domain-tasks",
    glow: "shadow-[0_0_20px_hsl(var(--domain-tasks)/0.15)]",
  },
  finance: {
    bg: "bg-domain-finance/10",
    border: "border-domain-finance/30",
    text: "text-domain-finance",
    glow: "shadow-[0_0_20px_hsl(var(--domain-finance)/0.15)]",
  },
  research: {
    bg: "bg-domain-research/10",
    border: "border-domain-research/30",
    text: "text-domain-research",
    glow: "shadow-[0_0_20px_hsl(var(--domain-research)/0.15)]",
  },
  network: {
    bg: "bg-domain-network/10",
    border: "border-domain-network/30",
    text: "text-domain-network",
    glow: "shadow-[0_0_20px_hsl(var(--domain-network)/0.15)]",
  },
};

export function DomainCard({
  icon: Icon,
  label,
  description,
  color,
  activityCount,
  activities,
  onClick,
  delay = 0,
}: DomainCardProps) {
  const colors = colorClasses[color] || colorClasses.calendar;

  return (
    <motion.button
      className={`w-full text-left p-4 rounded-2xl border ${colors.border} ${colors.bg} ${colors.glow} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${colors.bg} ${colors.text}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{label}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {activityCount > 0 && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            {activityCount}
          </div>
        )}
      </div>

      {/* Activity preview */}
      {activities.length > 0 && (
        <div className="space-y-2 mb-3">
          {activities.slice(0, 2).map((activity) => (
            <div
              key={activity.id}
              className={`text-sm p-2.5 rounded-xl bg-background/50 border border-border/50 ${
                activity.urgent ? "border-l-2 border-l-destructive" : ""
              }`}
            >
              <p className="text-foreground/90 truncate">{activity.preview}</p>
              <div className="flex items-center gap-2 mt-1">
                {activity.source && (
                  <span className="text-xs text-muted-foreground">{activity.source}</span>
                )}
                {activity.time && (
                  <span className="text-xs text-muted-foreground">• {activity.time}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Tap to interact</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.button>
  );
}
