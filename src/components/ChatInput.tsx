import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Mic, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      className="p-4 glass-strong"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <div className="flex items-end gap-3 max-w-2xl mx-auto">
        {/* Sparkle indicator */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex-shrink-0 mb-2"
            >
              <Sparkles className="w-4 h-4 text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input container */}
        <div className="flex-1 relative">
          <motion.div
            className={cn(
              "absolute inset-0 rounded-2xl transition-opacity duration-300",
              isFocused ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: "linear-gradient(135deg, hsl(0 0% 0% / 0.02) 0%, hsl(0 0% 0% / 0.01) 100%)",
              boxShadow: "0 0 20px hsl(0 0% 0% / 0.05)",
            }}
          />
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Command your Director..."
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none bg-muted/50 border border-border rounded-2xl px-4 py-3 pr-12",
              "text-sm placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-foreground/30",
              "transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "relative z-10"
            )}
          />
          
          {/* Mic button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2 text-muted-foreground/50 hover:text-foreground transition-colors z-10"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {/* Send button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className={cn(
              "rounded-full flex-shrink-0 h-10 w-10 transition-all duration-300",
              message.trim()
                ? "bg-foreground text-background shadow-[0_4px_16px_hsl(0_0%_0%/0.15)]"
                : "bg-muted text-muted-foreground"
            )}
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Keyboard hint */}
      <motion.p
        className="text-[10px] text-muted-foreground/50 text-center mt-2 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ENTER TO SEND • SHIFT+ENTER FOR NEW LINE
      </motion.p>
    </motion.div>
  );
}
