// components/b2a/B2AReverseCalculator.tsx
// Interactive slider to adjust desired retirement age and see required SIP

"use client";

import { useState, useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";
import { motion } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";
import {
    calculateReverseTimeline,
    formatIndianCurrency,
} from "@/lib/services/b2a-calculations";
import type { CashFlow } from "@/types/b2a";

interface B2AReverseCalculatorProps {
    currentWealth: number;
    targetWealth: number;
    currentAge: number;
    naturalRetireAge: number;
    annualReturn: number;
    existingCashFlows: CashFlow[];
}

export function B2AReverseCalculator({
    currentWealth,
    targetWealth,
    currentAge,
    naturalRetireAge,
    annualReturn,
    existingCashFlows,
}: B2AReverseCalculatorProps) {
    const minAge = currentAge + 1;
    const maxAge = Math.min(naturalRetireAge, currentAge + 50);
    const [desiredAge, setDesiredAge] = useState(
        Math.max(minAge, Math.round((minAge + maxAge) / 2))
    );

    // Recalculate when slider moves
    const result = useMemo(() => {
        return calculateReverseTimeline({
            currentWealth,
            targetWealth,
            currentAge,
            desiredRetirementAge: desiredAge,
            annualReturn,
            existingCashFlows,
        });
    }, [
        currentWealth,
        targetWealth,
        currentAge,
        desiredAge,
        annualReturn,
        existingCashFlows,
    ]);

    const yearsToRetire = desiredAge - currentAge;
    const yearsSavedVsNatural = naturalRetireAge - desiredAge;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
        >
            <Card variant="elevated">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-violet-600" />
                        <CardTitle>Reverse Calculator</CardTitle>
                    </div>
                    <CardDescription>
                        Drag the slider to choose when you want to retire — see the SIP needed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Age display */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Current Age
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {currentAge}
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Desired Retirement
                            </p>
                            <motion.p
                                key={desiredAge}
                                initial={{ scale: 1.2, color: "#7c3aed" }}
                                animate={{ scale: 1, color: undefined }}
                                className="text-3xl font-bold text-violet-600 dark:text-violet-400"
                            >
                                {desiredAge}
                            </motion.p>
                            {yearsSavedVsNatural > 0 && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs mt-1">
                                    {yearsSavedVsNatural}y earlier
                                </Badge>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Natural Retirement
                            </p>
                            <p className="text-lg font-bold text-orange-500">
                                {naturalRetireAge}
                            </p>
                        </div>
                    </div>

                    {/* Slider */}
                    <div className="px-1">
                        <Slider.Root
                            className="relative flex items-center select-none touch-none w-full h-5"
                            value={[desiredAge]}
                            onValueChange={(values) => setDesiredAge(values[0])}
                            min={minAge}
                            max={maxAge}
                            step={1}
                        >
                            <Slider.Track className="relative grow rounded-full h-2 bg-gradient-to-r from-green-200 via-yellow-200 to-orange-200 dark:from-green-900/30 dark:via-yellow-900/30 dark:to-orange-900/30">
                                <Slider.Range className="absolute rounded-full h-full bg-gradient-to-r from-violet-400 to-violet-600" />
                            </Slider.Track>
                            <Slider.Thumb className="block w-6 h-6 bg-white dark:bg-gray-200 border-2 border-violet-500 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-grab active:cursor-grabbing transition-shadow" />
                        </Slider.Root>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-gray-400">
                                Age {minAge}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                Age {maxAge}
                            </span>
                        </div>
                    </div>

                    {/* Result */}
                    <div className="rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                                To retire at age {desiredAge} ({yearsToRetire} years):
                            </span>
                        </div>

                        {result.isAchievableWithCashFlows ? (
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                ✓ Already achievable with your current cash flows!
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Monthly SIP
                                    </p>
                                    <p className="text-base font-bold text-violet-700 dark:text-violet-300">
                                        {formatIndianCurrency(result.requiredMonthlySIP)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Yearly SIP
                                    </p>
                                    <p className="text-base font-bold text-violet-700 dark:text-violet-300">
                                        {formatIndianCurrency(result.requiredYearlySIP)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Lumpsum
                                    </p>
                                    <p className="text-base font-bold text-violet-700 dark:text-violet-300">
                                        {formatIndianCurrency(result.requiredLumpsum)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
