"use client";

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/charts/Sparkline';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: number[];
  sparklineColor?: string;
  variant?: "default" | "glass" | "gradient" | "elevated";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  trend,
  sparklineData,
  sparklineColor,
  variant = "elevated",
  className,
}: StatCardProps) {
  // Simplified icon backgrounds - cleaner look
  const getIconStyles = () => {
    if (iconClassName?.includes('text-blue')) return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' };
    if (iconClassName?.includes('text-green')) return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' };
    if (iconClassName?.includes('text-red')) return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' };
    if (iconClassName?.includes('text-orange')) return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' };
    if (iconClassName?.includes('text-purple')) return { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' };
    if (iconClassName?.includes('text-amber')) return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
    return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
  };

  const styles = getIconStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card variant={variant} className={cn('h-full group hover:shadow-lg transition-all duration-300 border-transparent hover:border-border/50', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("p-2.5 rounded-xl transition-colors duration-300", styles.bg)}>
              <Icon className={cn("h-5 w-5", styles.text)} />
            </div>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                trend.isPositive
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {value}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between min-h-[40px]">
            {description ? (
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[60%]">{description}</p>
            ) : <div />}

            {/* Sparkline chart */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="w-[80px] h-[30px]">
                <Sparkline
                  data={sparklineData.map(value => ({ value }))}
                  color={sparklineColor || (trend?.isPositive ? '#10b981' : '#3b82f6')}
                  height={30}
                  showArea={true}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
