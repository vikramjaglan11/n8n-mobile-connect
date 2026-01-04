import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { Task } from '@/lib/communications-api';

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Circle className="w-3 h-3" />, color: 'bg-muted text-muted-foreground', label: 'Pending' },
  in_progress: { icon: <Clock className="w-3 h-3" />, color: 'bg-blue-500/20 text-blue-600', label: 'In Progress' },
  blocked: { icon: <Circle className="w-3 h-3" />, color: 'bg-red-500/20 text-red-600', label: 'Blocked' },
  completed: { icon: <CheckCircle2 className="w-3 h-3" />, color: 'bg-green-500/20 text-green-600', label: 'Done' },
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-amber-500 text-white',
  normal: 'bg-muted text-muted-foreground',
  low: 'bg-muted text-muted-foreground',
};

interface Props {
  task: Task;
  onComplete?: (id: string) => void;
}

export function TaskCard({ task, onComplete }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[task.status] || statusConfig.pending;

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = () => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    const now = new Date();
    return due < now && task.status !== 'completed';
  };

  return (
    <Card 
      className={`mb-2 hover:shadow-md transition-shadow cursor-pointer ${isOverdue() ? 'border-red-500/50' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium text-sm text-foreground truncate ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                  {task.title}
                </span>
                {(task.priority === 'urgent' || task.priority === 'high') && (
                  <Badge className={`text-xs px-1 py-0 ${priorityColors[task.priority]}`}>
                    {task.priority === 'urgent' ? '!!' : '!'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs px-1 py-0 ${config.color}`}>
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {task.due_date && (
              <span className={`text-xs ${isOverdue() ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                {formatDueDate(task.due_date)}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            {task.description && (
              <p className="text-sm text-foreground/80">{task.description}</p>
            )}

            {task.status !== 'completed' && (
              <div className="pt-2" onClick={e => e.stopPropagation()}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onComplete?.(task.id)}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
