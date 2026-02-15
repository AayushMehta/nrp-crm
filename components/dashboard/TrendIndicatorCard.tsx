"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TrendIndicatorCardProps {
  title: string;
  description?: string;
  value: string | number;
  trend: {
    value: number;
    label?: string;
  };
  variant?: "default" | "glass" | "gradient";
  className?: string;
}

export function TrendIndicatorCard({
  title,
  description,
  value,
  trend,
  variant = "default",
  className,
}: TrendIndicatorCardProps) {
  const isPositive = trend.value > 0;
  const trendLabel = trend.label || (isPositive ? 'increase' : 'decrease');

  return (
    <Card variant={variant} className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-4xl font-bold tabular-nums">{value}</p>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={cn(
              'flex flex-col items-end gap-1 px-4 py-2 rounded-lg',
              isPositive
                ? 'bg-green-100 dark:bg-green-950/30'
                : 'bg-red-100 dark:bg-red-950/30'
            )}
          >
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
              <span
                className={cn(
                  'text-2xl font-bold tabular-nums',
                  isPositive
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                )}
              >
                {Math.abs(trend.value).toFixed(1)}%
              </span>
            </div>
            <span
              className={cn(
                'text-xs font-medium uppercase tracking-wide',
                isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {trendLabel}
            </span>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
