"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, DEFAULT_CHART_MARGIN, DEFAULT_ANIMATION_CONFIG } from '@/lib/chart-utils';
import { GRID_COLORS } from '@/lib/chart-colors';
import { useTheme } from 'next-themes';

export interface ComposedChartData {
  name: string;
  barValue1?: number;
  barValue2?: number;
  lineValue?: number;
}

interface BaseComposedChartProps {
  data: ComposedChartData[];
  title?: string;
  description?: string;
  barDataKey1?: string;
  barDataKey2?: string;
  lineDataKey?: string;
  xAxisKey?: string;
  barColor1?: string;
  barColor2?: string;
  lineColor?: string;
  barLabel1?: string;
  barLabel2?: string;
  lineLabel?: string;
  formatType?: 'currency' | 'number';
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
  className?: string;
}

export function BaseComposedChart({
  data,
  title,
  description,
  barDataKey1 = 'barValue1',
  barDataKey2 = 'barValue2',
  lineDataKey = 'lineValue',
  xAxisKey = 'name',
  barColor1 = '#3b82f6',
  barColor2 = '#ef4444',
  lineColor = '#10b981',
  barLabel1 = 'Bar 1',
  barLabel2 = 'Bar 2',
  lineLabel = 'Line',
  formatType = 'currency',
  showGrid = true,
  showLegend = true,
  height = 350,
  className,
}: BaseComposedChartProps) {
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

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
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
            <ComposedChart data={data} margin={DEFAULT_CHART_MARGIN}>
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
              {showLegend && <Legend content={<CustomLegend />} />}

              {/* First bar series */}
              <Bar
                dataKey={barDataKey1}
                name={barLabel1}
                fill={barColor1}
                radius={[4, 4, 0, 0]}
                {...DEFAULT_ANIMATION_CONFIG}
              />

              {/* Second bar series */}
              {barDataKey2 && (
                <Bar
                  dataKey={barDataKey2}
                  name={barLabel2}
                  fill={barColor2}
                  radius={[4, 4, 0, 0]}
                  {...DEFAULT_ANIMATION_CONFIG}
                />
              )}

              {/* Line series */}
              {lineDataKey && (
                <Line
                  type="monotone"
                  dataKey={lineDataKey}
                  name={lineLabel}
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={{ fill: lineColor, r: 4 }}
                  activeDot={{ r: 6 }}
                  {...DEFAULT_ANIMATION_CONFIG}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
