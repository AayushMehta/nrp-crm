'use client';

// TaskGroupList — Groups tasks into collapsible sections:
// "Action Required Today", "In Progress", "Snoozed / Waiting"

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, Loader2, Clock, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { isToday, isPast, parseISO } from 'date-fns';
import type { Task } from '@/types/tasks';
import { TaskManagerCard } from './TaskManagerCard';

interface TaskGroupListProps {
    tasks: Task[];
    snoozedTasks: Task[];
    onTaskClick?: (task: Task) => void;
    onSnooze?: (taskId: string, date: string, reason: string) => void;
    onStart?: (taskId: string) => void;
    onComplete?: (taskId: string) => void;
}

interface GroupConfig {
    key: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    badgeColor: string;
    defaultOpen: boolean;
}

const GROUPS: GroupConfig[] = [
    {
        key: 'action_required',
        title: 'Action Required',
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        defaultOpen: true,
    },
    {
        key: 'in_progress',
        title: 'In Progress',
        icon: Loader2,
        iconColor: 'text-blue-500',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        defaultOpen: true,
    },
    {
        key: 'snoozed',
        title: 'Snoozed / Waiting on Client',
        icon: Clock,
        iconColor: 'text-amber-500',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        defaultOpen: false,
    },
];

export function TaskGroupList({
    tasks,
    snoozedTasks,
    onTaskClick,
    onSnooze,
    onStart,
    onComplete,
}: TaskGroupListProps) {
    const [openGroups, setOpenGroups] = useState<Set<string>>(
        new Set(GROUPS.filter((g) => g.defaultOpen).map((g) => g.key))
    );

    const toggleGroup = (key: string) => {
        setOpenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // Categorize tasks
    const groupedTasks = useMemo(() => {
        const actionRequired: Task[] = [];
        const inProgress: Task[] = [];

        tasks.forEach((task) => {
            if (task.status === 'todo') {
                // Follow-up due tasks go to action required, otherwise check due date
                if (
                    task.is_follow_up_due ||
                    isToday(parseISO(task.due_date)) ||
                    isPast(parseISO(task.due_date))
                ) {
                    actionRequired.push(task);
                } else {
                    // Future todo items also go to action required (lower in list)
                    actionRequired.push(task);
                }
            } else if (task.status === 'in_progress' || task.status === 'in_review') {
                inProgress.push(task);
            }
        });

        // Sort: follow-up due first, then overdue, then by priority
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const sortFn = (a: Task, b: Task) => {
            if (a.is_follow_up_due && !b.is_follow_up_due) return -1;
            if (!a.is_follow_up_due && b.is_follow_up_due) return 1;
            const aPast = isPast(parseISO(a.due_date));
            const bPast = isPast(parseISO(b.due_date));
            if (aPast && !bPast) return -1;
            if (!aPast && bPast) return 1;
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        };

        actionRequired.sort(sortFn);
        inProgress.sort(sortFn);

        return {
            action_required: actionRequired,
            in_progress: inProgress,
            snoozed: snoozedTasks,
        };
    }, [tasks, snoozedTasks]);

    return (
        <div className="space-y-4">
            {GROUPS.map((group) => {
                const groupTasks = groupedTasks[group.key as keyof typeof groupedTasks];
                const isOpen = openGroups.has(group.key);
                const Icon = group.icon;

                return (
                    <div key={group.key} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                        {/* Group Header */}
                        <button
                            onClick={() => toggleGroup(group.key)}
                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <Icon className={cn('h-4 w-4', group.iconColor)} />
                                <span className="text-sm font-semibold text-foreground">{group.title}</span>
                                <Badge variant="outline" className={cn('text-[10px] px-1.5 border-0', group.badgeColor)}>
                                    {groupTasks.length}
                                </Badge>
                            </div>
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 text-muted-foreground transition-transform duration-200',
                                    isOpen && 'rotate-180'
                                )}
                            />
                        </button>

                        {/* Group Content */}
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 pt-1">
                                        {groupTasks.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <Inbox className="h-8 w-8 text-muted-foreground/40 mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    {group.key === 'snoozed'
                                                        ? 'No snoozed tasks — nothing waiting on clients'
                                                        : 'No tasks here — great job!'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                {groupTasks.map((task) => (
                                                    <TaskManagerCard
                                                        key={task.id}
                                                        task={task}
                                                        onClick={onTaskClick}
                                                        onSnooze={onSnooze}
                                                        onStart={onStart}
                                                        onComplete={onComplete}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
