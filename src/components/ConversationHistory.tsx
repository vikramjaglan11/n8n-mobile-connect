import { motion } from "framer-motion";
import { Clock, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/hooks/useConversationHistory";
import { formatDistanceToNow } from "date-fns";

interface ConversationHistoryProps {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  currentConversationId: string | null;
}

export function ConversationHistory({
  conversations,
  onSelect,
  onDelete,
  currentConversationId,
}: ConversationHistoryProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground relative"
        >
          <Clock className="w-4 h-4" />
          {conversations.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
              {conversations.length > 9 ? '9+' : conversations.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[320px] sm:w-[380px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Conversation History
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start chatting to save conversations
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-card hover:bg-muted/50 border-border'
                  }`}
                  onClick={() => onSelect(conversation.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {conversation.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {formatDistanceToNow(conversation.updatedAt, { addSuffix: true })}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conversation.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
