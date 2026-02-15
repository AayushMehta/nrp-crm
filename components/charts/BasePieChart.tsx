"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercentage, DEFAULT_ANIMATION_CONFIG } from '@/lib/chart-utils';
import { useTheme } from 'next-themes';

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface BasePieChartProps {
  data: PieChartData[];
  title?: string;
  description?: string;
  colors?: string[];
  formatType?: 'currency' | 'number';
  showLegend?: boolean;
  donutMode?: boolean;
  innerRadius?: number;
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
  '#ec4899', // Pink
  '#f97316', // Orange
  '#6b7280', // Gray
];

export function BasePieChart({
  data,
  title,
  description,
  colors = DEFAULT_COLORS,
  formatType = 'currency',
  showLegend = true,
  donutMode = false,
  innerRadius = 60,
  showCenterLabel = false,
  centerLabel,
  centerValue,
  height = 350,
  className,
}: BasePieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatValue = (value: number) => {
    return formatType === 'currency' ? formatCurrency(value, 1) : formatNumber(value);
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0];
    const percentage = total > 0 ? (data.value / total) * 100 : 0;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{data.name}</p>
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="text-muted-foreground">Value:</span>
          <span className="font-semibold">{formatValue(data.value)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm mt-1">
          <span className="text-muted-foreground">Percentage:</span>
          <span className="font-semibold">{formatPercentage(percentage, 1)}</span>
        </div>
      </div>
    );
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is > 5%
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill={isDark ? '#ffffff' : '#000000'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {formatPercentage(percent * 100, 0)}
      </text>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = total > 0 ? (entry.payload.value / total) * 100 : 0;
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.value}: {formatPercentage(percentage, 1)}
              </span>
            </div>
          );
        })}
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
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={donutMode ? 120 : 130}
                  innerRadius={donutMode ? innerRadius : 0}
                  fill="#8884d8"
                  dataKey="value"
                  {...DEFAULT_ANIMATION_CONFIG}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend content={<CustomLegend />} />}
              </PieChart>
            </ResponsiveContainer>

            {/* Center label for donut chart */}
            {donutMode && showCenterLabel && (
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
