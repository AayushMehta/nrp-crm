"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend, PolarAngleAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercentage, DEFAULT_ANIMATION_CONFIG } from '@/lib/chart-utils';
import { useTheme } from 'next-themes';

export interface RadialBarChartData {
  name: string;
  value: number;
  fill?: string;
  percentage?: number;
}

interface BaseRadialBarChartProps {
  data: RadialBarChartData[];
  title?: string;
  description?: string;
  colors?: string[];
  formatType?: 'currency' | 'number' | 'percentage';
  showLegend?: boolean;
  showCenterLabel?: boolean;
  centerLabel?: string;
  centerValue?: string;
  height?: number;
  className?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
];

export function BaseRadialBarChart({
  data,
  title,
  description,
  colors = DEFAULT_COLORS,
  formatType = 'percentage',
  showLegend = true,
  showCenterLabel = false,
  centerLabel,
  centerValue,
  height = 350,
  className,
}: BaseRadialBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatValue = (value: number) => {
    if (formatType === 'currency') return formatCurrency(value, 1);
    if (formatType === 'percentage') return formatPercentage(value, 1);
    return formatNumber(value);
  };

  // Add colors to data if not provided
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.fill || colors[index % colors.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0];

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{data.name}</p>
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.fill }}
          />
          <span className="text-muted-foreground">Value:</span>
          <span className="font-semibold">{formatValue(data.value)}</span>
        </div>
        {data.payload.percentage !== undefined && (
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-semibold">{formatPercentage(data.payload.percentage, 1)}</span>
          </div>
        )}
      </div>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">{entry.value}</span>
            </div>
            <span className="text-sm font-semibold">
              {formatValue(entry.payload.value)}
            </span>
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
          <div className="relative">
            <ResponsiveContainer width="100%" height={height}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="90%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  label={{
                    position: 'insideStart',
                    fill: isDark ? '#ffffff' : '#000000',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  {...DEFAULT_ANIMATION_CONFIG}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend content={<CustomLegend />} />}
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Center label */}
            {showCenterLabel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {centerLabel && (
                  <p className="text-sm text-muted-foreground">{centerLabel}</p>
                )}
                {centerValue && (
                  <p className="text-2xl font-bold">{centerValue}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
