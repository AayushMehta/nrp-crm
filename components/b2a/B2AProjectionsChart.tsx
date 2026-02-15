// components/b2a/B2AProjectionsChart.tsx
// Multi-line chart with optimistic/base/pessimistic scenarios

"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import type { Projections } from "@/types/b2a";
import { formatIndianCurrencyShort } from "@/lib/services/b2a-calculations";
import { GRID_COLORS } from "@/lib/chart-colors";

interface B2AProjectionsChartProps {
    projections: Projections | null;
    targetWealth: number;
}

export function B2AProjectionsChart({
    projections,
    targetWealth,
}: B2AProjectionsChartProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    if (!projections) return null;

    // Merge all 3 scenario projections into one data array for Recharts
    const chartData = projections.baseCase.projections.map((point, i) => ({
        year: `Year ${point.year}`,
        yearNum: point.year,
        optimistic: projections.optimistic.projections[i]?.value ?? 0,
        baseCase: point.value,
        pessimistic: projections.pessimistic.projections[i]?.value ?? 0,
        target: targetWealth,
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="rounded-lg border bg-background p-3 shadow-lg min-w-[200px]">
                <p className="text-sm font-medium mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">{entry.name}</span>
                        </div>
                        <span className="font-semibold">
                            ₹{formatIndianCurrencyShort(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
        >
            <Card variant="elevated">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <CardTitle>Wealth Projections</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                                +{projections.optimistic.expectedReturn.toFixed(0)}%
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs">
                                {projections.baseCase.expectedReturn.toFixed(0)}%
                            </Badge>
                            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 text-xs">
                                {projections.pessimistic.expectedReturn.toFixed(0)}%
                            </Badge>
                        </div>
                    </div>
                    <CardDescription>
                        Three scenarios over {projections.timeline} years
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={380}>
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={isDark ? GRID_COLORS.dark : GRID_COLORS.light}
                                vertical={false}
                            />

                            <XAxis
                                dataKey="year"
                                stroke={isDark ? "#a1a1a1" : "#737373"}
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                interval={Math.max(0, Math.floor(chartData.length / 6) - 1)}
                            />

                            <YAxis
                                stroke={isDark ? "#a1a1a1" : "#737373"}
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `₹${formatIndianCurrencyShort(v)}`}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="line"
                                formatter={(value: string) => (
                                    <span className="text-xs font-medium">{value}</span>
                                )}
                            />

                            {/* Target line */}
                            <ReferenceLine
                                y={targetWealth}
                                stroke={isDark ? "#ef4444" : "#dc2626"}
                                strokeDasharray="6 4"
                                strokeWidth={1.5}
                                label={{
                                    value: `Target ₹${formatIndianCurrencyShort(targetWealth)}`,
                                    position: "right",
                                    fontSize: 10,
                                    fill: isDark ? "#f87171" : "#dc2626",
                                }}
                            />

                            {/* Optimistic */}
                            <Line
                                type="monotone"
                                dataKey="optimistic"
                                name="Optimistic"
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="5 3"
                                dot={false}
                                activeDot={{ r: 5 }}
                                animationDuration={1200}
                            />

                            {/* Base Case */}
                            <Line
                                type="monotone"
                                dataKey="baseCase"
                                name="Base Case"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5 }}
                                animationDuration={1200}
                            />

                            {/* Pessimistic */}
                            <Line
                                type="monotone"
                                dataKey="pessimistic"
                                name="Pessimistic"
                                stroke="#f97316"
                                strokeWidth={2}
                                strokeDasharray="5 3"
                                dot={false}
                                activeDot={{ r: 5 }}
                                animationDuration={1200}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Final Values Summary */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Pessimistic
                            </p>
                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                {formatIndianCurrencyShort(projections.pessimistic.finalValue)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                                {projections.pessimistic.growth.toFixed(0)}% growth
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Base Case
                            </p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatIndianCurrencyShort(projections.baseCase.finalValue)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                                {projections.baseCase.growth.toFixed(0)}% growth
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Optimistic
                            </p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                {formatIndianCurrencyShort(projections.optimistic.finalValue)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                                {projections.optimistic.growth.toFixed(0)}% growth
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
