import { motion } from "framer-motion";
import { Settings, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationHistory } from "@/components/ConversationHistory";
import { Conversation } from "@/hooks/useConversationHistory";

interface HeaderProps {
  isConnected: boolean;
  agentName?: string;
  conversations?: Conversation[];
  currentConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export function Header({ 
  isConnected, 
  agentName = "Director",
  conversations = [],
  currentConversationId = null,
  onSelectConversation,
  onDeleteConversation,
}: HeaderProps) {
  return (
    <motion.header
      className="flex items-center justify-between px-4 py-3 glass-strong sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="relative">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden bg-foreground"
            style={{
              boxShadow: isConnected ? "0 4px 20px hsl(0 0% 0% / 0.15)" : "none",
            }}
            animate={{
              scale: isConnected ? [1, 1.02, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Activity className="w-4 h-4 text-background" />
          </motion.div>
          
          {/* Connection indicator */}
          <motion.span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
              isConnected ? "bg-emerald-500" : "bg-destructive"
            }`}
            animate={isConnected ? {
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </div>

        <div className="flex flex-col">
          <h1 className="font-semibold text-foreground tracking-tight text-sm">{agentName}</h1>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`font-mono ${isConnected ? "text-emerald-600" : "text-destructive"}`}>
              {isConnected ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ConversationHistory
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelect={onSelectConversation || (() => {})}
          onDelete={onDeleteConversation || (() => {})}
        />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </motion.header>
  );
}
