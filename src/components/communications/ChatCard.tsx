import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  ChevronDown,
  ChevronUp,
  Reply,
  Eye,
  X
} from 'lucide-react';
import { ChatCard as ChatCardType } from '@/lib/communications-api';

// Platform icons and colors
const platformConfig: Record<string, { icon: string; color: string }> = {
  whatsapp: { icon: '💬', color: 'bg-green-500' },
  telegram: { icon: '✈️', color: 'bg-blue-500' },
  slack: { icon: '🔷', color: 'bg-purple-500' },
  google_chat: { icon: '💭', color: 'bg-emerald-500' },
};

interface Props {
  chat: ChatCardType;
  onIgnore?: (id: string) => void;
  onWatch?: (id: string) => void;
  onReply?: (id: string) => void;
}

export function ChatCard({ chat, onIgnore, onWatch, onReply }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = platformConfig[chat.platform] || { icon: '💬', color: 'bg-muted' };

  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card 
      className="mb-2 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-medium">
                {chat.sender_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${config.color} flex items-center justify-center text-[10px]`}>
                {config.icon}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground truncate">
                  {chat.sender_name}
                </span>
                {chat.priority === 'urgent' && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">!</Badge>
                )}
                {chat.is_watch_item && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    <Eye className="w-2 h-2" />
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground capitalize">{chat.platform.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-muted-foreground">{timeAgo(chat.received_at)}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Content */}
        <p className={`text-sm text-foreground/80 ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {isExpanded && chat.content ? chat.content : chat.content_preview}
        </p>

        {/* Expanded actions */}
        {isExpanded && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onReply?.(chat.id)}
            >
              <MessageSquare className="w-3 h-3 mr-1" /> Reply
            </Button>
            {!chat.is_watch_item && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onWatch?.(chat.id)}
              >
                <Eye className="w-3 h-3 mr-1" /> Watch
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onIgnore?.(chat.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
