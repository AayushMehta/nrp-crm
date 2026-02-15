"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MetricComparisonCardProps {
  title: string;
  metrics: {
    label: string;
    value: string | number;
    change?: number;
    color?: string;
  }[];
  variant?: "default" | "glass";
  className?: string;
}

export function MetricComparisonCard({
  title,
  metrics,
  variant = "default",
  className,
}: MetricComparisonCardProps) {
  return (
    <Card variant={variant} className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {metrics.map((metric, index) => {
            const changeDirection = metric.change
              ? metric.change > 0
                ? 'up'
                : metric.change < 0
                ? 'down'
                : 'neutral'
              : null;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2">
                  {metric.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                  )}
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold tabular-nums">{metric.value}</p>

                  {changeDirection && (
                    <div className="flex items-center gap-1">
                      {changeDirection === 'up' && (
                        <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                      {changeDirection === 'down' && (
                        <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      {changeDirection === 'neutral' && (
                        <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-semibold',
                          changeDirection === 'up' && 'text-green-600 dark:text-green-400',
                          changeDirection === 'down' && 'text-red-600 dark:text-red-400',
                          changeDirection === 'neutral' && 'text-gray-600 dark:text-gray-400'
                        )}
                      >
                        {Math.abs(metric.change!).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
