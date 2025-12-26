import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, User } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  timestamp?: Date;
  isLoading?: boolean;
}

export function ChatMessage({ content, role, timestamp, isLoading }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      {/* Avatar */}
      <motion.div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          isUser
            ? "bg-secondary border border-border/50"
            : "bg-gradient-to-br from-primary to-info"
        )}
        style={!isUser ? {
          boxShadow: "0 0 20px hsl(185 100% 50% / 0.3)",
        } : {}}
        whileHover={{ scale: 1.05 }}
      >
        {isUser ? (
          <User className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Activity className="w-4 h-4 text-primary-foreground" />
        )}
      </motion.div>

      {/* Message bubble */}
      <div
        className={cn(
          "flex flex-col max-w-[85%] gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <motion.div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "glass rounded-tl-sm"
          )}
          style={!isUser ? {
            background: "linear-gradient(135deg, hsl(230 25% 10% / 0.8) 0%, hsl(230 25% 7% / 0.9) 100%)",
          } : {
            boxShadow: "0 4px 20px hsl(185 100% 50% / 0.2)",
          }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {isLoading ? (
            <div className="flex items-center gap-1.5 py-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </motion.div>

        {timestamp && (
          <motion.span
            className="text-[10px] text-muted-foreground/60 px-2 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
