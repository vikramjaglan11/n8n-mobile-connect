import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Eye, 
  X, 
  Clock, 
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommunicationCard as CardType } from '@/lib/communications-api';

// Platform icons
const platformIcons: Record<string, string> = {
  whatsapp: '💬',
  telegram: '✈️',
  slack: '🔷',
  google_chat: '💭',
  email: '📧'
};

// Platform colors
const platformColors: Record<string, string> = {
  whatsapp: 'bg-green-500',
  telegram: 'bg-blue-500',
  slack: 'bg-purple-500',
  google_chat: 'bg-emerald-500',
  email: 'bg-red-500'
};

interface Props {
  message: CardType;
  onIgnore: (id: string) => void;
  onWatch: (id: string) => void;
  onResolve: (id: string) => void;
  onReply: (id: string, content: string) => void;
}

export function CommunicationCard({ message, onIgnore, onWatch, onResolve, onReply }: Props) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
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

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(message.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar with platform indicator */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                {message.sender_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${platformColors[message.platform]} flex items-center justify-center text-xs`}>
                {platformIcons[message.platform]}
              </div>
            </div>

            {/* Name and time */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{message.sender_name}</span>
                {message.priority === 'urgent' && (
                  <Badge variant="destructive" className="text-xs">Urgent</Badge>
                )}
                {message.is_watch_item && (
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" /> Watching
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{timeAgo(message.received_at)}</span>
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              {!message.is_watch_item && (
                <DropdownMenuItem onClick={() => onWatch(message.id)}>
                  <Eye className="w-4 h-4 mr-2" /> Add to Watch
                </DropdownMenuItem>
              )}
              {message.is_watch_item && (
                <DropdownMenuItem onClick={() => onResolve(message.id)}>
                  <X className="w-4 h-4 mr-2" /> Resolve & Remove
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onIgnore(message.id)}>
                <X className="w-4 h-4 mr-2" /> Ignore
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Message content */}
        <div className="mb-3">
          <p className="text-sm text-foreground/90 line-clamp-2">
            {message.content_preview}
          </p>
        </div>

        {/* Watch item status */}
        {message.is_watch_item && message.watch_status === 'waiting' && (
          <div className="mb-3 p-2 bg-amber-500/10 rounded-md">
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <Clock className="w-4 h-4" />
              Waiting for response from {message.awaiting_from_name}
            </div>
          </div>
        )}

        {/* Reply section */}
        {showReplyInput ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleReply()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowReplyInput(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleReply}>
                <Send className="w-4 h-4 mr-1" /> Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowReplyInput(true)}
            >
              <MessageSquare className="w-4 h-4 mr-1" /> Reply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIgnore(message.id)}
            >
              Ignore
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
