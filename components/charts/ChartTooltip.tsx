"use client";

import { formatCurrency, formatNumber, formatPercentage } from '@/lib/chart-utils';
import { useTheme } from 'next-themes';

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
  payload?: any;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  formatType?: 'currency' | 'number' | 'percentage';
  labelFormatter?: (label: string) => string;
  showTotal?: boolean;
  className?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatType = 'currency',
  labelFormatter,
  showTotal = false,
  className,
}: ChartTooltipProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!active || !payload?.length) return null;

  const formatValue = (value: number): string => {
    switch (formatType) {
      case 'currency':
        return formatCurrency(value, 1);
      case 'percentage':
        return formatPercentage(value, 1);
      case 'number':
      default:
        return formatNumber(value);
    }
  };

  const total = showTotal ? payload.reduce((sum, entry) => sum + entry.value, 0) : 0;
  const formattedLabel = labelFormatter ? labelFormatter(label || '') : label;

  return (
    <div
      className={`rounded-lg border shadow-lg backdrop-blur-sm ${
        isDark
          ? 'bg-background/95 border-border'
          : 'bg-background/95 border-border'
      } ${className || ''}`}
    >
      <div className="p-3 space-y-2">
        {/* Label */}
        {formattedLabel && (
          <p className="text-sm font-medium border-b border-border pb-2">
            {formattedLabel}
          </p>
        )}

        {/* Entries */}
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-semibold tabular-nums">{formatValue(entry.value)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        {showTotal && payload.length > 1 && (
          <div className="flex items-center justify-between gap-4 text-sm border-t border-border pt-2">
            <span className="font-medium">Total:</span>
            <span className="font-bold tabular-nums">{formatValue(total)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Simplified tooltip for sparklines and mini charts
interface MiniTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  formatType?: 'currency' | 'number' | 'percentage';
}

export function MiniChartTooltip({ active, payload, formatType = 'currency' }: MiniTooltipProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!active || !payload?.length) return null;

  const formatValue = (value: number): string => {
    switch (formatType) {
      case 'currency':
        return formatCurrency(value, 1);
      case 'percentage':
        return formatPercentage(value, 1);
      case 'number':
      default:
        return formatNumber(value);
    }
  };

  return (
    <div
      className={`rounded px-2 py-1 text-xs font-medium shadow-md ${
        isDark ? 'bg-background/95 text-foreground' : 'bg-background/95 text-foreground'
      }`}
    >
      {formatValue(payload[0].value)}
    </div>
  );
}

// Pie chart tooltip with percentage
interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      percentage?: number;
      fill: string;
    };
  }>;
  formatType?: 'currency' | 'number';
}

export function PieChartTooltip({ active, payload, formatType = 'currency' }: PieTooltipProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const formatValue = formatType === 'currency'
    ? (v: number) => formatCurrency(v, 1)
    : (v: number) => formatNumber(v);

  return (
    <div
      className={`rounded-lg border shadow-lg backdrop-blur-sm p-3 ${
        isDark
          ? 'bg-background/95 border-border'
          : 'bg-background/95 border-border'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.payload.fill }}
          />
          <span className="text-sm font-medium">{entry.name}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Value:</span>
            <span className="font-semibold tabular-nums">{formatValue(entry.value)}</span>
          </div>
          {entry.payload.percentage !== undefined && (
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Share:</span>
              <span className="font-semibold tabular-nums">
                {formatPercentage(entry.payload.percentage, 1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
