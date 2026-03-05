'use client';

// TaskActivityTimeline — Vertical timeline showing task history
// Used inside TaskDetailSheet to display the synthesized activity log

import { cn } from '@/lib/utils';
import {
    PlusCircle, Clock, RotateCcw, ArrowRight, CheckCircle2,
    UserPlus, AlertCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { TaskActivityLogEntry } from '@/types/tasks';

interface TaskActivityTimelineProps {
    entries: TaskActivityLogEntry[];
}

const ACTION_CONFIG: Record<string, {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
}> = {
    created: {
        icon: PlusCircle,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    assigned: {
        icon: UserPlus,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    snoozed: {
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    resurfaced: {
        icon: RotateCcw,
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    status_changed: {
        icon: ArrowRight,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
    completed: {
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    updated: {
        icon: ArrowRight,
        color: 'text-slate-500',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
    },
    deleted: {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
};

export function TaskActivityTimeline({ entries }: TaskActivityTimelineProps) {
    if (entries.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                No activity recorded yet.
            </p>
        );
    }

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border/60" />

            <div className="space-y-4">
                {entries.map((entry) => {
                    const config = ACTION_CONFIG[entry.action_type] || ACTION_CONFIG.updated;
                    const Icon = config.icon;

                    return (
                        <div key={entry.id} className="flex gap-3 relative">
                            {/* Icon circle */}
                            <div
                                className={cn(
                                    'relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full flex-shrink-0',
                                    config.bgColor
                                )}
                            >
                                <Icon className={cn('h-3.5 w-3.5', config.color)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-sm text-foreground leading-snug">
                                    {entry.details}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-muted-foreground">
                                        {entry.action_by_name}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground/50">·</span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {format(parseISO(entry.action_at), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
