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

const colorMap: Record<string, { bg: string; glow: string; border: string }> = {
  calendar: {
    bg: "from-cyan-500/20 to-cyan-600/10",
    glow: "shadow-[0_0_30px_hsl(185_100%_50%/0.4)]",
    border: "border-cyan-500/30",
  },
  email: {
    bg: "from-amber-500/20 to-amber-600/10",
    glow: "shadow-[0_0_30px_hsl(45_100%_55%/0.4)]",
    border: "border-amber-500/30",
  },
  tasks: {
    bg: "from-emerald-500/20 to-emerald-600/10",
    glow: "shadow-[0_0_30px_hsl(145_80%_45%/0.4)]",
    border: "border-emerald-500/30",
  },
  finance: {
    bg: "from-violet-500/20 to-violet-600/10",
    glow: "shadow-[0_0_30px_hsl(280_100%_65%/0.4)]",
    border: "border-violet-500/30",
  },
  research: {
    bg: "from-pink-500/20 to-pink-600/10",
    glow: "shadow-[0_0_30px_hsl(320_100%_60%/0.4)]",
    border: "border-pink-500/30",
  },
  network: {
    bg: "from-blue-500/20 to-blue-600/10",
    glow: "shadow-[0_0_30px_hsl(200_100%_55%/0.4)]",
    border: "border-blue-500/30",
  },
};

const iconColorMap: Record<string, string> = {
  calendar: "text-cyan-400",
  email: "text-amber-400",
  tasks: "text-emerald-400",
  finance: "text-violet-400",
  research: "text-pink-400",
  network: "text-blue-400",
};

export function DomainOrb({ icon: Icon, label, color, onClick, delay = 0, isActive = false }: DomainOrbProps) {
  const colors = colorMap[color] || colorMap.calendar;
  const iconColor = iconColorMap[color] || "text-primary";

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
          background: `radial-gradient(circle, ${color === 'calendar' ? 'hsl(185 100% 50% / 0.3)' : 
            color === 'email' ? 'hsl(45 100% 55% / 0.3)' :
            color === 'tasks' ? 'hsl(145 80% 45% / 0.3)' :
            color === 'finance' ? 'hsl(280 100% 65% / 0.3)' :
            color === 'research' ? 'hsl(320 100% 60% / 0.3)' :
            'hsl(200 100% 55% / 0.3)'} 0%, transparent 70%)`,
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
          ${isActive ? colors.glow : ""}
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
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
        {label}
      </span>
    </motion.button>
  );
}
