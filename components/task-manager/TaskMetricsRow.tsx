'use client';

// TaskMetricsRow — 4 stat cards for the "Clean Desk" dashboard
// Shows: Urgent Follow-ups, Pending Client Action, In Progress, Completed This Week

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import type { TaskManagerStats } from '@/types/tasks';

interface TaskMetricsRowProps {
    stats: TaskManagerStats;
    activeFilter?: string;
    onFilterClick?: (filter: string) => void;
}

const METRICS = [
    {
        key: 'urgent_followups',
        label: 'Urgent Follow-ups',
        description: 'Resurfaced today',
        icon: AlertTriangle,
        gradient: 'from-red-500 to-rose-600',
        bgLight: 'bg-red-50 dark:bg-red-900/10',
        textColor: 'text-red-600 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
        activeRing: 'ring-red-400',
    },
    {
        key: 'pending_client_action',
        label: 'Pending Client',
        description: 'Awaiting response',
        icon: Clock,
        gradient: 'from-amber-500 to-orange-500',
        bgLight: 'bg-amber-50 dark:bg-amber-900/10',
        textColor: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-800',
        activeRing: 'ring-amber-400',
    },
    {
        key: 'in_progress',
        label: 'In Progress',
        description: 'Active work',
        icon: Loader2,
        gradient: 'from-blue-500 to-cyan-500',
        bgLight: 'bg-blue-50 dark:bg-blue-900/10',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800',
        activeRing: 'ring-blue-400',
    },
    {
        key: 'completed_this_week',
        label: 'Completed',
        description: 'This week',
        icon: CheckCircle2,
        gradient: 'from-emerald-500 to-teal-500',
        bgLight: 'bg-emerald-50 dark:bg-emerald-900/10',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        activeRing: 'ring-emerald-400',
    },
];

export function TaskMetricsRow({ stats, activeFilter, onFilterClick }: TaskMetricsRowProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((metric, index) => {
                const Icon = metric.icon;
                const value = stats[metric.key as keyof TaskManagerStats];
                const isActive = activeFilter === metric.key;

                return (
                    <motion.div
                        key={metric.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                        <button
                            onClick={() => onFilterClick?.(isActive ? '' : metric.key)}
                            className={cn(
                                'w-full text-left rounded-xl border bg-card p-5 transition-all duration-300',
                                'hover:shadow-lg hover:scale-[1.02] cursor-pointer group',
                                isActive
                                    ? `ring-2 ${metric.activeRing} shadow-md ${metric.borderColor}`
                                    : 'border-border/50 hover:border-border'
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div
                                    className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
                                        metric.gradient
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                {value > 0 && metric.key === 'urgent_followups' && (
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                    </span>
                                )}
                            </div>

                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {metric.label}
                                </p>
                                <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                                    {value}
                                </p>
                                <p className="text-xs text-muted-foreground">{metric.description}</p>
                            </div>

                            {/* Bottom accent bar */}
                            <div className={cn('mt-4 h-1 rounded-full bg-gradient-to-r opacity-60', metric.gradient)} />
                        </button>
                    </motion.div>
                );
            })}
        </div>
    );
}
