"use client";

import { formatCurrency, formatNumber, formatPercentage } from '@/lib/chart-utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface LegendEntry {
  name: string;
  value?: number;
  color: string;
  percentage?: number;
}

interface ChartLegendProps {
  entries: LegendEntry[];
  formatType?: 'currency' | 'number' | 'percentage' | 'none';
  layout?: 'horizontal' | 'vertical';
  showValues?: boolean;
  showPercentages?: boolean;
  interactive?: boolean;
  onToggle?: (name: string, visible: boolean) => void;
  className?: string;
}

export function ChartLegend({
  entries,
  formatType = 'none',
  layout = 'horizontal',
  showValues = false,
  showPercentages = false,
  interactive = false,
  onToggle,
  className,
}: ChartLegendProps) {
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const formatValue = (value: number): string => {
    switch (formatType) {
      case 'currency':
        return formatCurrency(value, 1);
      case 'percentage':
        return formatPercentage(value, 1);
      case 'number':
        return formatNumber(value);
      case 'none':
      default:
        return String(value);
    }
  };

  const handleToggle = (name: string) => {
    if (!interactive) return;

    const newHidden = new Set(hiddenItems);
    const isCurrentlyHidden = hiddenItems.has(name);

    if (isCurrentlyHidden) {
      newHidden.delete(name);
    } else {
      newHidden.add(name);
    }

    setHiddenItems(newHidden);
    onToggle?.(name, isCurrentlyHidden);
  };

  const layoutClasses =
    layout === 'horizontal'
      ? 'flex flex-wrap items-center gap-4'
      : 'flex flex-col space-y-2';

  return (
    <div className={`${layoutClasses} ${className || ''}`}>
      {entries.map((entry, index) => {
        const isHidden = hiddenItems.has(entry.name);
        const opacity = isHidden ? 0.4 : 1;

        return (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleToggle(entry.name)}
            className={`flex items-center gap-2 ${
              interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
            }`}
            style={{ opacity }}
          >
            {/* Color indicator */}
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                isHidden ? 'ring-2 ring-muted' : ''
              }`}
              style={{ backgroundColor: entry.color }}
            />

            {/* Name */}
            <span
              className={`text-sm ${
                isHidden ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {entry.name}
            </span>

            {/* Value */}
            {showValues && entry.value !== undefined && (
              <span className="text-sm font-medium text-muted-foreground tabular-nums">
                ({formatValue(entry.value)})
              </span>
            )}

            {/* Percentage */}
            {showPercentages && entry.percentage !== undefined && (
              <span className="text-sm font-medium text-muted-foreground tabular-nums">
                {formatPercentage(entry.percentage, 1)}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// Simple dot legend for sparklines and compact charts
interface DotLegendProps {
  entries: Array<{ name: string; color: string }>;
  className?: string;
}

export function DotLegend({ entries, className }: DotLegendProps) {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      {entries.map((entry) => (
        <div key={entry.name} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.name}</span>
        </div>
      ))}
    </div>
  );
}

// Icon legend with optional badges
interface IconLegendEntry {
  name: string;
  color: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface IconLegendProps {
  entries: IconLegendEntry[];
  className?: string;
}

export function IconLegend({ entries, className }: IconLegendProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className || ''}`}>
      {entries.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50"
        >
          {entry.icon && (
            <div style={{ color: entry.color }} className="flex-shrink-0">
              {entry.icon}
            </div>
          )}
          <span className="text-sm font-medium">{entry.name}</span>
          {entry.badge !== undefined && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: entry.color, color: 'white' }}
            >
              {entry.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
