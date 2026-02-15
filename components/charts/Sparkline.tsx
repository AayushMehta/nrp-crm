"use client";

import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { DEFAULT_ANIMATION_CONFIG } from '@/lib/chart-utils';

export interface SparklineData {
  value: number;
}

interface SparklineProps {
  data: SparklineData[];
  color?: string;
  height?: number;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  color = '#3b82f6',
  height = 50,
  showArea = true,
  className,
}: SparklineProps) {
  if (data.length === 0) {
    return (
      <div
        className={className}
        style={{ height: `${height}px` }}
      >
        <div className="w-full h-full bg-muted/20 rounded" />
      </div>
    );
  }

  // Add index to data for x-axis
  const chartData = data.map((item, index) => ({
    ...item,
    index,
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={showArea ? 'url(#sparklineGradient)' : 'none'}
            isAnimationActive={true}
            {...DEFAULT_ANIMATION_CONFIG}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
