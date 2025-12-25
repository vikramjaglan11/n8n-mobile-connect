import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
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
    <div className="p-4 border-t border-border/50 glass">
      <div className="flex items-end gap-2 max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your Director..."
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none bg-secondary/50 border border-border/50 rounded-2xl px-4 py-3 pr-12",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          <Button
            size="icon-sm"
            variant="ghost"
            className="absolute right-2 bottom-2 text-muted-foreground hover:text-foreground"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        <Button
          size="icon"
          variant="glow"
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className="rounded-full flex-shrink-0"
        >
          <SendHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
