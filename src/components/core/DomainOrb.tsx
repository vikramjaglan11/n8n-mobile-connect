import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface DomainOrbProps {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick?: () => void;
  delay?: number;
  isActive?: boolean;
}

const colorMap: Record<string, { bg: string; glow: string; border: string; accent: string }> = {
  calendar: {
    bg: "from-blue-100 to-blue-50",
    glow: "shadow-[0_4px_20px_hsl(220_70%_50%/0.25)]",
    border: "border-blue-200",
    accent: "bg-blue-500",
  },
  email: {
    bg: "from-amber-100 to-amber-50",
    glow: "shadow-[0_4px_20px_hsl(40_80%_55%/0.25)]",
    border: "border-amber-200",
    accent: "bg-amber-500",
  },
  tasks: {
    bg: "from-emerald-100 to-emerald-50",
    glow: "shadow-[0_4px_20px_hsl(145_60%_42%/0.25)]",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
  },
  finance: {
    bg: "from-violet-100 to-violet-50",
    glow: "shadow-[0_4px_20px_hsl(260_60%_55%/0.25)]",
    border: "border-violet-200",
    accent: "bg-violet-500",
  },
  research: {
    bg: "from-pink-100 to-pink-50",
    glow: "shadow-[0_4px_20px_hsl(320_60%_55%/0.25)]",
    border: "border-pink-200",
    accent: "bg-pink-500",
  },
  network: {
    bg: "from-sky-100 to-sky-50",
    glow: "shadow-[0_4px_20px_hsl(195_70%_48%/0.25)]",
    border: "border-sky-200",
    accent: "bg-sky-500",
  },
};

const iconColorMap: Record<string, string> = {
  calendar: "text-blue-600",
  email: "text-amber-600",
  tasks: "text-emerald-600",
  finance: "text-violet-600",
  research: "text-pink-600",
  network: "text-sky-600",
};

export function DomainOrb({ icon: Icon, label, color, onClick, delay = 0, isActive = false }: DomainOrbProps) {
  const colors = colorMap[color] || colorMap.calendar;
  const iconColor = iconColorMap[color] || "text-foreground";

  return (
    <motion.button
      onClick={onClick}
      className="group relative flex flex-col items-center gap-2 focus:outline-none"
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect on hover */}
      <motion.div
        className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        style={{
          background: `radial-gradient(circle, ${color === 'calendar' ? 'hsl(220 70% 50% / 0.15)' : 
            color === 'email' ? 'hsl(40 80% 55% / 0.15)' :
            color === 'tasks' ? 'hsl(145 60% 42% / 0.15)' :
            color === 'finance' ? 'hsl(260 60% 55% / 0.15)' :
            color === 'research' ? 'hsl(320 60% 55% / 0.15)' :
            'hsl(195 70% 48% / 0.15)'} 0%, transparent 70%)`,
        }}
      />

      {/* Orb */}
      <div
        className={`
          relative w-14 h-14 rounded-full 
          bg-gradient-to-br ${colors.bg}
          border ${colors.border}
          backdrop-blur-sm
          flex items-center justify-center
          transition-all duration-300
          group-hover:${colors.glow}
          ${isActive ? colors.glow : "shadow-sm"}
        `}
      >
        {/* Active pulse */}
        {isActive && (
          <motion.div
            className={`absolute inset-0 rounded-full border ${colors.border}`}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        <Icon className={`w-6 h-6 ${iconColor} transition-transform duration-300 group-hover:scale-110`} />
      </div>

      {/* Label */}
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300 font-medium">
        {label}
      </span>
    </motion.button>
  );
}
