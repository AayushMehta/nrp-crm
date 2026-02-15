"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, DEFAULT_CHART_MARGIN, DEFAULT_ANIMATION_CONFIG } from '@/lib/chart-utils';
import { GRID_COLORS } from '@/lib/chart-colors';
import { useTheme } from 'next-themes';

export interface AreaChartData {
  name: string;
  value: number;
  secondaryValue?: number;
}

interface BaseAreaChartProps {
  data: AreaChartData[];
  title?: string;
  description?: string;
  dataKey: string;
  secondaryDataKey?: string;
  xAxisKey?: string;
  color?: string;
  secondaryColor?: string;
  gradientId?: string;
  secondaryGradientId?: string;
  formatType?: 'currency' | 'number';
  showGrid?: boolean;
  height?: number;
  className?: string;
}

export function BaseAreaChart({
  data,
  title,
  description,
  dataKey = 'value',
  secondaryDataKey,
  xAxisKey = 'name',
  color = '#3b82f6',
  secondaryColor = '#10b981',
  gradientId = 'areaGradient',
  secondaryGradientId = 'secondaryAreaGradient',
  formatType = 'currency',
  showGrid = true,
  height = 350,
  className,
}: BaseAreaChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatValue = (value: number) => {
    return formatType === 'currency' ? formatCurrency(value, 1) : formatNumber(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold">{formatValue(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={DEFAULT_CHART_MARGIN}>
              <defs>
                {/* Primary gradient */}
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>

                {/* Secondary gradient (if applicable) */}
                {secondaryDataKey && (
                  <linearGradient id={secondaryGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>

              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? GRID_COLORS.dark : GRID_COLORS.light}
                  vertical={false}
                />
              )}

              <XAxis
                dataKey={xAxisKey}
                stroke={isDark ? '#a1a1a1' : '#737373'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke={isDark ? '#a1a1a1' : '#737373'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatValue(value)}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Secondary area (render first so it's behind) */}
              {secondaryDataKey && (
                <Area
                  type="monotone"
                  dataKey={secondaryDataKey}
                  stroke={secondaryColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${secondaryGradientId})`}
                  {...DEFAULT_ANIMATION_CONFIG}
                />
              )}

              {/* Primary area */}
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                {...DEFAULT_ANIMATION_CONFIG}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
