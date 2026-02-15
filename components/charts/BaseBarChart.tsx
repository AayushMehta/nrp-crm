"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, DEFAULT_CHART_MARGIN, DEFAULT_ANIMATION_CONFIG } from '@/lib/chart-utils';
import { GRID_COLORS } from '@/lib/chart-colors';
import { useTheme } from 'next-themes';

export interface BarChartData {
  name: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

interface BaseBarChartProps {
  data: BarChartData[];
  title?: string;
  description?: string;
  dataKey: string;
  secondaryDataKey?: string;
  xAxisKey?: string;
  color?: string;
  secondaryColor?: string;
  formatType?: 'currency' | 'number';
  showGrid?: boolean;
  showValues?: boolean;
  stacked?: boolean;
  layout?: 'horizontal' | 'vertical';
  height?: number;
  className?: string;
}

export function BaseBarChart({
  data,
  title,
  description,
  dataKey = 'value',
  secondaryDataKey,
  xAxisKey = 'name',
  color = '#3b82f6',
  secondaryColor = '#10b981',
  formatType = 'currency',
  showGrid = true,
  showValues = false,
  stacked = false,
  layout = 'horizontal',
  height = 350,
  className,
}: BaseBarChartProps) {
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
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold">{formatValue(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderLabel = (value: any) => {
    if (!showValues || typeof value !== 'number') return null;
    return formatValue(value);
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
            <BarChart
              data={data}
              margin={DEFAULT_CHART_MARGIN}
              layout={layout}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? GRID_COLORS.dark : GRID_COLORS.light}
                  vertical={layout === 'vertical'}
                  horizontal={layout === 'horizontal'}
                />
              )}

              {layout === 'horizontal' ? (
                <>
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
                </>
              ) : (
                <>
                  <XAxis
                    type="number"
                    stroke={isDark ? '#a1a1a1' : '#737373'}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatValue(value)}
                  />
                  <YAxis
                    type="category"
                    dataKey={xAxisKey}
                    stroke={isDark ? '#a1a1a1' : '#737373'}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                </>
              )}

              <Tooltip content={<CustomTooltip />} />

              {/* Secondary bars */}
              {secondaryDataKey && (
                <Bar
                  dataKey={secondaryDataKey}
                  fill={secondaryColor}
                  radius={[4, 4, 0, 0]}
                  stackId={stacked ? 'stack' : undefined}
                  {...DEFAULT_ANIMATION_CONFIG}
                >
                  {showValues && (
                    <LabelList
                      dataKey={secondaryDataKey}
                      position="top"
                      formatter={renderLabel}
                      fontSize={11}
                      fill={isDark ? '#a1a1a1' : '#737373'}
                    />
                  )}
                </Bar>
              )}

              {/* Primary bars */}
              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[4, 4, 0, 0]}
                stackId={stacked ? 'stack' : undefined}
                {...DEFAULT_ANIMATION_CONFIG}
              >
                {/* Use custom colors for each bar if provided */}
                {data.map((entry, index) => (
                  entry.color ? (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ) : null
                ))}
                {showValues && (
                  <LabelList
                    dataKey={dataKey}
                    position="top"
                    formatter={renderLabel}
                    fontSize={11}
                    fill={isDark ? '#a1a1a1' : '#737373'}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
