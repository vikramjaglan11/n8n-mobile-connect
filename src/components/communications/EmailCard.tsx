import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  ChevronDown,
  ChevronUp,
  Reply,
  Archive
} from 'lucide-react';
import { Email } from '@/lib/communications-api';

interface Props {
  email: Email;
  onArchive?: (id: string) => void;
  onReply?: (id: string) => void;
}

export function EmailCard({ email, onArchive, onReply }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

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
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground truncate">
                  {email.sender_name}
                </span>
                {(email.priority === 'urgent' || email.priority === 'high') && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">!</Badge>
                )}
                {email.status === 'unread' && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              {email.subject && (
                <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-muted-foreground">{timeAgo(email.received_at)}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Content */}
        <p className={`text-sm text-foreground/80 ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {isExpanded && email.content ? email.content : email.content_preview}
        </p>

        {/* Expanded actions */}
        {isExpanded && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onReply?.(email.id)}
            >
              <Reply className="w-3 h-3 mr-1" /> Reply
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onArchive?.(email.id)}
            >
              <Archive className="w-3 h-3 mr-1" /> Archive
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
