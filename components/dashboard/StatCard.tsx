"use client";

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/charts/Sparkline';
import { motion } from 'framer-motion';
import { cardStaggerVariants } from '@/lib/animation-utils';

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
  variant?: "default" | "glass" | "gradient";
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
  variant = "default",
  className,
}: StatCardProps) {
  // Extract gradient color from iconClassName for the icon container
  const getIconBgStyle = () => {
    if (iconClassName?.includes('text-blue')) {
      return {
        background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)',
        shadow: '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
      };
    }
    if (iconClassName?.includes('text-green')) {
      return {
        background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)',
        shadow: '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
      };
    }
    if (iconClassName?.includes('text-red')) {
      return {
        background: 'linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(220, 38, 38) 100%)',
        shadow: '0 4px 14px 0 rgba(239, 68, 68, 0.25)',
      };
    }
    if (iconClassName?.includes('text-orange')) {
      return {
        background: 'linear-gradient(135deg, rgb(249, 115, 22) 0%, rgb(234, 88, 12) 100%)',
        shadow: '0 4px 14px 0 rgba(249, 115, 22, 0.25)',
      };
    }
    if (iconClassName?.includes('text-purple')) {
      return {
        background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)',
        shadow: '0 4px 14px 0 rgba(139, 92, 246, 0.25)',
      };
    }
    if (iconClassName?.includes('text-amber')) {
      return {
        background: 'linear-gradient(135deg, rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)',
        shadow: '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
      };
    }
    return {
      background: 'linear-gradient(135deg, rgb(107, 114, 128) 0%, rgb(75, 85, 99) 100%)',
      shadow: '0 4px 14px 0 rgba(107, 114, 128, 0.25)',
    };
  };

  const iconStyle = getIconBgStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card variant={variant} className={cn('h-full', className)}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
              <p className="text-3xl font-bold mt-2 tabular-nums">{value}</p>
            </div>
            <motion.div
              className="p-3 rounded-xl ml-4"
              style={{
                background: iconStyle.background,
                boxShadow: iconStyle.shadow,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
          </div>

          {/* Sparkline chart if data provided */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="mb-3 -mx-2">
              <Sparkline
                data={sparklineData.map(value => ({ value }))}
                color={sparklineColor || (trend?.isPositive ? '#10b981' : '#3b82f6')}
                height={40}
                showArea={true}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    trend.isPositive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
