"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/circular-progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressGoalCardProps {
  title: string;
  description?: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
  variant?: "default" | "glass";
  className?: string;
}

export function ProgressGoalCard({
  title,
  description,
  current,
  target,
  unit = '',
  color = '#3b82f6',
  variant = "default",
  className,
}: ProgressGoalCardProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const remaining = Math.max(target - current, 0);

  return (
    <Card variant={variant} className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-6">
          {/* Circular Progress */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CircularProgress
              value={percentage}
              size={100}
              strokeWidth={8}
              color={color}
              showValue={true}
            />
          </motion.div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-between items-baseline"
            >
              <span className="text-sm text-muted-foreground">Current</span>
              <span className="text-xl font-bold tabular-nums">
                {current.toLocaleString()}{unit}
              </span>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-between items-baseline"
            >
              <span className="text-sm text-muted-foreground">Target</span>
              <span className="text-lg font-semibold tabular-nums text-muted-foreground">
                {target.toLocaleString()}{unit}
              </span>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-2 border-t"
            >
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span
                  className={cn(
                    'text-lg font-semibold tabular-nums',
                    percentage >= 100
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  )}
                >
                  {percentage >= 100 ? '✓ Complete' : `${remaining.toLocaleString()}${unit}`}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
