'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface TaskMetricCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trendInfo?: string;
    trendType?: 'up' | 'down' | 'neutral';
    iconContainerClassName?: string;
    iconClassName?: string;
}

export function TaskMetricCard({
    title,
    value,
    icon: Icon,
    trendInfo,
    trendType = 'neutral',
    iconContainerClassName,
    iconClassName,
}: TaskMetricCardProps) {
    return (
        <Card className="p-5 flex flex-col justify-between h-full bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {title}
                </span>
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', iconContainerClassName || 'bg-indigo-50 dark:bg-indigo-900/30')}>
                    <Icon className={cn('h-5 w-5', iconClassName || 'text-indigo-600 dark:text-indigo-400')} />
                </div>
            </div>

            <div>
                <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                    {value}
                </div>
                {trendInfo && (
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        {trendType === 'up' && (
                            <span className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                            </span>
                        )}
                        {trendType === 'down' && (
                            <span className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <polyline points="19 12 12 19 5 12"></polyline>
                                </svg>
                            </span>
                        )}
                        <span className={cn(
                            trendType === 'up' && 'text-emerald-600 dark:text-emerald-400',
                            trendType === 'down' && 'text-red-600 dark:text-red-400',
                            trendType === 'neutral' && 'text-slate-500 dark:text-slate-400',
                        )}>
                            {trendInfo}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
}
