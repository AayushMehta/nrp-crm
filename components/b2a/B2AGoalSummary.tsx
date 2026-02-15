// components/b2a/B2AGoalSummary.tsx
// Hero card showing Point A → Point B with key metrics

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Target,
    TrendingUp,
    Calendar,
    User,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import type { RiskProfile, NaturalTimelineResult } from "@/types/b2a";
import { RISK_PROFILE_LABELS } from "@/types/b2a";
import { formatIndianCurrency } from "@/lib/services/b2a-calculations";

interface B2AGoalSummaryProps {
    currentWealth: number;
    targetWealth: number;
    currentAge: number;
    riskProfile: RiskProfile;
    naturalTimeline: NaturalTimelineResult | null;
    acceleratedTimeline: number | null;
    weightedReturn: number;
    isEditable: boolean;
    onCurrentWealthChange: (value: number) => void;
    onTargetWealthChange: (value: number) => void;
    onCurrentAgeChange: (value: number) => void;
    onRiskProfileChange: (value: RiskProfile) => void;
}

export function B2AGoalSummary({
    currentWealth,
    targetWealth,
    currentAge,
    riskProfile,
    naturalTimeline,
    acceleratedTimeline,
    weightedReturn,
    isEditable,
    onCurrentWealthChange,
    onTargetWealthChange,
    onCurrentAgeChange,
    onRiskProfileChange,
}: B2AGoalSummaryProps) {
    const naturalRetireAge = naturalTimeline
        ? currentAge + naturalTimeline.years
        : null;
    const acceleratedRetireAge = acceleratedTimeline
        ? currentAge + acceleratedTimeline
        : null;
    const yearsSaved =
        naturalTimeline && acceleratedTimeline
            ? naturalTimeline.years - acceleratedTimeline
            : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="overflow-hidden border-0 shadow-lg">
                {/* Gradient header */}
                <div className="bg-gradient-to-r from-[#1f2f5c] via-[#2a4080] to-[#3b5998] px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Your Financial Journey
                                </h2>
                                <p className="text-sm text-blue-100">
                                    Before → After Plan
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-xs">
                            {RISK_PROFILE_LABELS[riskProfile]} Profile
                        </Badge>
                    </div>
                </div>

                <CardContent className="pt-6 pb-6">
                    {/* Point A → Point B */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-8">
                        {/* Point A */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                        A
                                    </span>
                                </div>
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Current Wealth
                                </Label>
                            </div>
                            {isEditable ? (
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                        ₹
                                    </span>
                                    <Input
                                        type="number"
                                        value={currentWealth}
                                        onChange={(e) =>
                                            onCurrentWealthChange(Number(e.target.value))
                                        }
                                        className="pl-7 text-lg font-semibold h-12"
                                    />
                                </div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {formatIndianCurrency(currentWealth)}
                                </p>
                            )}
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex flex-col items-center gap-1">
                            <motion.div
                                animate={{ x: [0, 6, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight className="h-8 w-8 text-blue-500" />
                            </motion.div>
                            {yearsSaved > 0 && (
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                    {yearsSaved}y faster
                                </span>
                            )}
                        </div>

                        {/* Point B */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                        B
                                    </span>
                                </div>
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Target Wealth
                                </Label>
                            </div>
                            {isEditable ? (
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                        ₹
                                    </span>
                                    <Input
                                        type="number"
                                        value={targetWealth}
                                        onChange={(e) =>
                                            onTargetWealthChange(Number(e.target.value))
                                        }
                                        className="pl-7 text-lg font-semibold h-12"
                                    />
                                </div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {formatIndianCurrency(targetWealth)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Meta row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Current Age */}
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Current Age
                                </span>
                            </div>
                            {isEditable ? (
                                <Input
                                    type="number"
                                    value={currentAge}
                                    onChange={(e) => onCurrentAgeChange(Number(e.target.value))}
                                    className="h-9 text-base font-semibold"
                                    min={18}
                                    max={80}
                                />
                            ) : (
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {currentAge} yrs
                                </p>
                            )}
                        </div>

                        {/* Risk Profile */}
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-gray-500" />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Risk Profile
                                </span>
                            </div>
                            {isEditable ? (
                                <Select
                                    value={riskProfile}
                                    onValueChange={(v) => onRiskProfileChange(v as RiskProfile)}
                                >
                                    <SelectTrigger className="h-9 text-sm font-semibold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(RISK_PROFILE_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {RISK_PROFILE_LABELS[riskProfile]}
                                </p>
                            )}
                        </div>

                        {/* Natural Retire Age */}
                        <div className="rounded-xl bg-orange-50 dark:bg-orange-900/10 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                    Natural Path
                                </span>
                            </div>
                            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                                {naturalRetireAge ? `Age ${naturalRetireAge}` : "—"}
                            </p>
                            <p className="text-xs text-orange-600/70 dark:text-orange-400/60 mt-0.5">
                                {naturalTimeline
                                    ? `${naturalTimeline.years}y at ${naturalTimeline.annualReturn}%`
                                    : ""}
                            </p>
                        </div>

                        {/* NRP Accelerated */}
                        <div className="rounded-xl bg-green-50 dark:bg-green-900/10 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                    NRP Path
                                </span>
                            </div>
                            <p className="text-xl font-bold text-green-700 dark:text-green-300">
                                {acceleratedRetireAge ? `Age ${acceleratedRetireAge}` : "—"}
                            </p>
                            <p className="text-xs text-green-600/70 dark:text-green-400/60 mt-0.5">
                                {acceleratedTimeline
                                    ? `${acceleratedTimeline}y at ${weightedReturn.toFixed(1)}%`
                                    : ""}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
