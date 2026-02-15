// components/b2a/B2ATimelineComparison.tsx
// Visual comparison: Natural path vs NRP accelerated path

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Zap, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { NaturalTimelineResult } from "@/types/b2a";
import { formatIndianCurrency } from "@/lib/services/b2a-calculations";

interface B2ATimelineComparisonProps {
    currentAge: number;
    naturalTimeline: NaturalTimelineResult | null;
    acceleratedTimeline: number | null;
    weightedReturn: number;
    targetWealth: number;
}

export function B2ATimelineComparison({
    currentAge,
    naturalTimeline,
    acceleratedTimeline,
    weightedReturn,
    targetWealth,
}: B2ATimelineComparisonProps) {
    if (!naturalTimeline) return null;

    const naturalYears = naturalTimeline.years;
    const accelYears = acceleratedTimeline ?? naturalYears;
    const yearsSaved = naturalYears - accelYears;
    const maxYears = Math.max(naturalYears, 1);
    const naturalBarWidth = 100;
    const accelBarWidth = Math.max((accelYears / maxYears) * 100, 8);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <Card variant="elevated">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/20 p-2">
                            <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Timeline Comparison
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                When will you reach {formatIndianCurrency(targetWealth)}?
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Natural Path */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-orange-500" />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        Natural Growth (No Extra Investment)
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                    Age {currentAge + naturalYears} ({naturalYears} yrs)
                                </span>
                            </div>
                            <div className="relative h-8 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <motion.div
                                    className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${naturalBarWidth}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-white drop-shadow-sm">
                                        {naturalYears} years @ {naturalTimeline.annualReturn}% return
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* NRP Accelerated Path */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-3.5 w-3.5 text-green-500" />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        With NRP Plan
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                    Age {currentAge + accelYears} ({accelYears} yrs)
                                </span>
                            </div>
                            <div className="relative h-8 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <motion.div
                                    className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${accelBarWidth}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                />
                                <div className="absolute inset-0 flex items-center px-3">
                                    <span className="text-xs font-semibold text-white drop-shadow-sm">
                                        {accelYears} years @ {weightedReturn.toFixed(1)}% return
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Years Saved Highlight */}
                        {yearsSaved > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.6 }}
                                className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 p-4"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                        {yearsSaved} years faster!
                                    </p>
                                    <p className="text-xs text-green-600/80 dark:text-green-400/60">
                                        Retire at age {currentAge + accelYears} instead of{" "}
                                        {currentAge + naturalYears}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
