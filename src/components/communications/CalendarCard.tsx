import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Loader2,
  Send,
  X
} from 'lucide-react';
import { CalendarEvent } from '@/lib/communications-api';

interface Props {
  event: CalendarEvent;
  onEdit?: (eventId: string, action: 'delete' | 'update', message?: string) => Promise<void>;
  onOpen?: (id: string) => void;
}

export function CalendarCard({ event, onEdit, onOpen }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExpand = () => {
    if (!isEditing) {
      const wasExpanded = isExpanded;
      setIsExpanded(!isExpanded);
      if (!wasExpanded && onOpen && event.id) {
        onOpen(event.id);
      }
    }
  };
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isNow = () => {
    if (!event.start || !event.end) return false;
    const now = new Date();
    const start = new Date(event.start);
    const end = new Date(event.end);
    return now >= start && now <= end;
  };

  const isSoon = () => {
    if (!event.start) return false;
    const now = new Date();
    const start = new Date(event.start);
    const diffMins = (start.getTime() - now.getTime()) / 60000;
    return diffMins > 0 && diffMins <= 30;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteWithMessage = async () => {
    if (!onEdit || !event.id || isProcessing) return;
    setIsProcessing(true);
    try {
      await onEdit(event.id, 'delete', cancelMessage || undefined);
      setIsDeleting(false);
      setIsEditing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(false);
    setIsDeleting(false);
    setCancelMessage('');
  };

  return (
    <Card 
      className={`mb-2 hover:shadow-md transition-shadow cursor-pointer ${isNow() ? 'border-primary' : ''}`}
      onClick={handleExpand}
    >
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isNow() ? 'bg-primary/20' : isSoon() ? 'bg-amber-500/20' : 'bg-blue-500/10'
            }`}>
              <Calendar className={`w-4 h-4 ${
                isNow() ? 'text-primary' : isSoon() ? 'text-amber-500' : 'text-blue-500'
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground truncate">
                  {event.title || '(No Title)'}
                </span>
                {isNow() && (
                  <Badge className="text-xs px-1 py-0 bg-primary">Now</Badge>
                )}
                {isSoon() && !isNow() && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 bg-amber-500/20 text-amber-600">Soon</Badge>
                )}
              </div>
              {event.calendar_account && (
                <span className="text-xs text-muted-foreground">{event.calendar_account}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-3 h-3" />
          {event.is_all_day ? (
            <span>All day</span>
          ) : event.start && event.end ? (
            <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
          ) : (
            <span>Time not specified</span>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && !isEditing && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            {event.description && (
              <p className="text-sm text-foreground/80">{event.description}</p>
            )}
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{event.attendees.join(', ')}</span>
              </div>
            )}

            {/* Edit button */}
            {onEdit && event.id && (
              <div className="pt-2" onClick={e => e.stopPropagation()}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleEditClick}
                >
                  <Edit className="w-3 h-3 mr-1" /> Edit Event
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Edit mode */}
        {isEditing && (
          <div className="mt-3 pt-3 border-t border-border space-y-3" onClick={e => e.stopPropagation()}>
            {!isDeleting ? (
              <div className="space-y-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setIsDeleting(true)}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Delete & Notify Attendees
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Send a message to attendees (optional):
                </p>
                <Textarea
                  value={cancelMessage}
                  onChange={(e) => setCancelMessage(e.target.value)}
                  placeholder="I'm sorry, I won't be able to make it..."
                  className="min-h-[60px] text-sm"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleDeleteWithMessage}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    Delete & Send
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isProcessing}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}