// components/b2a/B2ARequiredInvestments.tsx
// Cards showing required SIP/Lumpsum to hit the accelerated timeline

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Repeat,
    CalendarClock,
    Banknote,
    CheckCircle2,
    IndianRupee,
} from "lucide-react";
import { motion } from "framer-motion";
import type { AcceleratedRequirementsResult } from "@/types/b2a";
import { formatIndianCurrency } from "@/lib/services/b2a-calculations";

interface B2ARequiredInvestmentsProps {
    requirements: AcceleratedRequirementsResult | null;
    desiredTimeline: number | null;
}

export function B2ARequiredInvestments({
    requirements,
    desiredTimeline,
}: B2ARequiredInvestmentsProps) {
    if (!requirements) return null;

    // Already achievable
    if (requirements.isAchievableWithCashFlows) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-green-700 dark:text-green-300">
                                    Already on Track!
                                </h3>
                                <p className="text-sm text-green-600/80 dark:text-green-400/60">
                                    Your existing cash flows will reach the target in{" "}
                                    {desiredTimeline} years. No additional investment needed.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    const cards = [
        {
            title: "Monthly SIP",
            value: requirements.requiredMonthlySIP,
            icon: Repeat,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            iconBg: "bg-blue-100 dark:bg-blue-900/30",
            description: "per month",
        },
        {
            title: "Yearly SIP",
            value: requirements.requiredYearlySIP,
            icon: CalendarClock,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            iconBg: "bg-purple-100 dark:bg-purple-900/30",
            description: "per year",
        },
        {
            title: "One-Time Lumpsum",
            value: requirements.requiredLumpsum,
            icon: Banknote,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
            description: "invested today",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Required Additional Investments
                    </h3>
                    <Badge variant="outline" className="text-xs">
                        Choose any one
                    </Badge>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                    To close the gap of{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {formatIndianCurrency(requirements.remainingTarget)}
                    </span>
                    , you need any <em>one</em> of these:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                            >
                                <Card
                                    className={`${card.bgColor} border-0 shadow-none hover:shadow-md transition-shadow`}
                                >
                                    <CardContent className="pt-5 pb-5">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
                                            >
                                                <Icon className={`h-5 w-5 ${card.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    {card.title}
                                                </p>
                                                <p
                                                    className={`text-xl font-bold mt-0.5 ${card.color}`}
                                                >
                                                    {formatIndianCurrency(card.value)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {card.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
