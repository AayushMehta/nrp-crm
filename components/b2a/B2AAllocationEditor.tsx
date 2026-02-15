// components/b2a/B2AAllocationEditor.tsx
// Asset allocation editor with pie chart and interactive sliders

"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BasePieChart } from "@/components/charts/BasePieChart";
import {
    PieChart,
    Sliders,
    AlertCircle,
    Check,
    RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AllocationEntry, RiskProfile } from "@/types/b2a";
import { RISK_PROFILE_LABELS } from "@/types/b2a";
import { B2AService } from "@/lib/services/b2a-service";

interface B2AAllocationEditorProps {
    allocations: AllocationEntry[];
    riskProfile: RiskProfile;
    weightedReturn: number;
    isEditable: boolean;
    onAllocationsChange: (allocations: AllocationEntry[]) => void;
    onApplyTemplate: (profile: RiskProfile) => void;
}

export function B2AAllocationEditor({
    allocations,
    riskProfile,
    weightedReturn,
    isEditable,
    onAllocationsChange,
    onApplyTemplate,
}: B2AAllocationEditorProps) {
    const totalPercentage = allocations.reduce(
        (sum, a) => sum + a.allocationPercentage,
        0
    );
    const isValid = Math.abs(totalPercentage - 100) < 0.01;

    const handlePercentageChange = (id: string, value: number) => {
        const updated = allocations.map((a) =>
            a.id === id ? { ...a, allocationPercentage: Math.max(0, Math.min(100, value)) } : a
        );
        onAllocationsChange(updated);
    };

    const handleReturnChange = (id: string, value: number) => {
        const updated = allocations.map((a) =>
            a.id === id ? { ...a, returnRate: Math.max(0, Math.min(50, value)) } : a
        );
        onAllocationsChange(updated);
    };

    // Pie chart data
    const pieData = allocations
        .filter((a) => a.allocationPercentage > 0)
        .map((a) => ({
            name: a.assetClassName,
            value: a.allocationPercentage,
        }));

    const pieColors = allocations
        .filter((a) => a.allocationPercentage > 0)
        .map((a) => a.color);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Pie Chart */}
            <Card variant="elevated">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-blue-600" />
                            <CardTitle>Asset Allocation</CardTitle>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Weighted Return
                            </p>
                            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                                {weightedReturn.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    <CardDescription>
                        Distribution across asset classes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pieData.length > 0 ? (
                        <BasePieChart
                            data={pieData}
                            colors={pieColors}
                            formatType="number"
                            showLegend
                            height={300}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-400">
                            Add allocations to see chart
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Right: Sliders / Inputs */}
            <Card variant="elevated">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sliders className="h-5 w-5 text-purple-600" />
                            <CardTitle>Allocation Mix</CardTitle>
                        </div>
                        {/* Validation badge */}
                        <Badge
                            className={
                                isValid
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }
                        >
                            {isValid ? (
                                <span className="flex items-center gap-1">
                                    <Check className="h-3 w-3" /> 100%
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {totalPercentage.toFixed(0)}%
                                </span>
                            )}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Quick Templates */}
                    {isEditable && (
                        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                            {(
                                Object.keys(RISK_PROFILE_LABELS) as RiskProfile[]
                            ).map((profile) => (
                                <Button
                                    key={profile}
                                    variant={riskProfile === profile ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onApplyTemplate(profile)}
                                    className="text-xs"
                                >
                                    {RISK_PROFILE_LABELS[profile]}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Allocation Rows */}
                    <div className="space-y-4">
                        {allocations.map((alloc) => (
                            <motion.div
                                key={alloc.id}
                                layout
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: alloc.color }}
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                                        {alloc.assetClassName}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pl-6">
                                    {/* Percentage */}
                                    <div>
                                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                                            Allocation %
                                        </Label>
                                        {isEditable ? (
                                            <div className="relative mt-1">
                                                <Input
                                                    type="number"
                                                    value={alloc.allocationPercentage}
                                                    onChange={(e) =>
                                                        handlePercentageChange(
                                                            alloc.id,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="pr-7 h-9 text-sm"
                                                    min={0}
                                                    max={100}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                                    %
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-semibold mt-1">
                                                {alloc.allocationPercentage}%
                                            </p>
                                        )}
                                    </div>

                                    {/* Expected Return */}
                                    <div>
                                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                                            Expected Return
                                        </Label>
                                        {isEditable ? (
                                            <div className="relative mt-1">
                                                <Input
                                                    type="number"
                                                    value={alloc.returnRate}
                                                    onChange={(e) =>
                                                        handleReturnChange(
                                                            alloc.id,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="pr-7 h-9 text-sm"
                                                    min={0}
                                                    max={50}
                                                    step={0.5}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                                    %
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-semibold mt-1">
                                                {alloc.returnRate}%
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="pl-6">
                                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: alloc.color }}
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${Math.min(alloc.allocationPercentage, 100)}%`,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Allocation
                            </span>
                            <span
                                className={`text-lg font-bold ${isValid
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                            >
                                {totalPercentage.toFixed(0)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Weighted Return
                            </span>
                            <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                {weightedReturn.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
