import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CalendarEvent } from '@/lib/communications-api';

interface Props {
  event: CalendarEvent;
}

export function CalendarCard({ event }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <Card 
      className={`mb-2 hover:shadow-md transition-shadow cursor-pointer ${isNow() ? 'border-primary' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
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
        {isExpanded && (
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
