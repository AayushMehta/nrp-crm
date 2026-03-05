'use client';

// TaskManagerCard — Clean Desk task card
// Shows operation type pill, client name, priority, due date, and action buttons

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar, User, Play, CheckCircle2, Clock, AlertCircle, Pause,
} from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import type { Task } from '@/types/tasks';
import {
    OPERATION_TYPE_LABELS,
    OPERATION_TYPE_COLORS,
    TASK_PRIORITY_LABELS,
} from '@/types/tasks';
import { SnoozePopover } from './SnoozePopover';

interface TaskManagerCardProps {
    task: Task;
    onClick?: (task: Task) => void;
    onSnooze?: (taskId: string, date: string, reason: string) => void;
    onStart?: (taskId: string) => void;
    onComplete?: (taskId: string) => void;
}

const PRIORITY_STYLES: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function TaskManagerCard({ task, onClick, onSnooze, onStart, onComplete }: TaskManagerCardProps) {
    const dueDate = parseISO(task.due_date);
    const dueDateValid = !isNaN(dueDate.getTime());
    const isOverdue = dueDateValid && task.status !== 'done' && isPast(dueDate) && !isToday(dueDate);
    const isDueToday = dueDateValid && task.status !== 'done' && isToday(dueDate);
    const isFollowUpDue = task.is_follow_up_due;

    const opColors = task.operation_type ? OPERATION_TYPE_COLORS[task.operation_type] : null;
    const opLabel = task.operation_type ? OPERATION_TYPE_LABELS[task.operation_type] : null;

    return (
        <div
            onClick={() => onClick?.(task)}
            className={cn(
                'group relative bg-card rounded-xl border p-4 cursor-pointer transition-all duration-200',
                'hover:shadow-lg hover:border-border hover:scale-[1.01]',
                isFollowUpDue && 'border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-900/5 ring-1 ring-red-200 dark:ring-red-800',
                isOverdue && !isFollowUpDue && 'border-orange-300 dark:border-orange-700',
                isDueToday && !isFollowUpDue && !isOverdue && 'border-blue-200 dark:border-blue-800',
                !isFollowUpDue && !isOverdue && !isDueToday && 'border-border/50',
            )}
        >
            {/* Follow-up Due Badge */}
            {isFollowUpDue && (
                <div className="absolute -top-2.5 left-4 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <AlertCircle className="h-3 w-3" />
                    Follow-up Due
                </div>
            )}

            {/* Top row: Operation type + Priority */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {opLabel && opColors && (
                        <Badge variant="outline" className={cn('text-[10px] font-semibold px-2 py-0.5 border-0', opColors.bg, opColors.text)}>
                            {opLabel}
                        </Badge>
                    )}
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0.5 border-0', PRIORITY_STYLES[task.priority])}>
                        {TASK_PRIORITY_LABELS[task.priority]}
                    </Badge>
                </div>

                {/* Snooze count indicator */}
                {(task.snooze_count ?? 0) > 0 && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Pause className="h-3 w-3" />
                        Snoozed {task.snooze_count}x
                    </span>
                )}
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
                {task.title}
            </h4>

            {/* Context row: Client + Due date */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1 truncate">
                    <User className="h-3 w-3 flex-shrink-0" />
                    {task.family_name}
                </span>
                <span className={cn(
                    'flex items-center gap-1 flex-shrink-0',
                    isOverdue && 'text-red-600 dark:text-red-400 font-medium',
                    isDueToday && 'text-blue-600 dark:text-blue-400 font-medium',
                )}>
                    <Calendar className="h-3 w-3" />
                    {isOverdue ? 'Overdue · ' : isDueToday ? 'Today · ' : ''}
                    {dueDateValid ? format(dueDate, 'MMM d') : task.due_date}
                </span>
            </div>

            {/* Snooze reason (if currently snoozed) */}
            {task.status === 'waiting_on_client' && task.snooze_reason && !isFollowUpDue && (
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg mb-3 flex items-start gap-1.5">
                    <Clock className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span>{task.snooze_reason} · Follow-up {task.snooze_date ? format(parseISO(task.snooze_date), 'MMM d') : ''}</span>
                </div>
            )}

            {/* Action buttons */}
            {task.status !== 'done' && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/30"
                    onClick={(e) => e.stopPropagation()}
                >
                    {task.status === 'todo' && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1"
                            onClick={() => onStart?.(task.id)}
                        >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                        onClick={() => onComplete?.(task.id)}
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                    </Button>
                    {task.status !== 'waiting_on_client' && (
                        <SnoozePopover onSnooze={(date, reason) => onSnooze?.(task.id, date, reason)}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                Snooze
                            </Button>
                        </SnoozePopover>
                    )}
                </div>
            )}

            {/* Subtle hover gradient */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/[0.02] group-hover:to-primary/[0.04] transition-all pointer-events-none" />
        </div>
    );
}
