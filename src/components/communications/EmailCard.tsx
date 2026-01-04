import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  ChevronDown,
  ChevronUp,
  Reply,
  Archive,
  Loader2
} from 'lucide-react';
import { Email } from '@/lib/communications-api';
import { ReplyInput } from './ReplyInput';

interface Props {
  email: Email;
  onArchive?: (id: string) => Promise<void>;
  onReply?: (id: string, message: string) => Promise<void>;
}

export function EmailCard({ email, onArchive, onReply }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

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

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onArchive || isArchiving) return;
    setIsArchiving(true);
    try {
      await onArchive(email.id);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReplying(true);
  };

  const handleSendReply = async (message: string) => {
    if (onReply) {
      await onReply(email.id, message);
    }
  };

  return (
    <Card 
      className="mb-2 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => !isReplying && setIsExpanded(!isExpanded)}
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
        {isExpanded && !isReplying && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleReplyClick}
            >
              <Reply className="w-3 h-3 mr-1" /> Reply
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleArchive}
              disabled={isArchiving}
            >
              {isArchiving ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Archive className="w-3 h-3 mr-1" />
              )}
              Archive
            </Button>
          </div>
        )}

        {/* Reply input */}
        {isReplying && (
          <ReplyInput
            onSend={handleSendReply}
            onCancel={() => setIsReplying(false)}
            placeholder={`Reply to ${email.sender_name}...`}
          />
        )}
      </CardContent>
    </Card>
  );
}