// app/client/b2a/page.tsx
// B2A (Before to After) Financial Planning Dashboard
// Two tabs: Asset Allocation + Dashboard
// Two modes: Vision Setting (persistent) vs Play Tool (sandbox)

"use client";

import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Eye,
    Gamepad2,
    Save,
    RotateCcw,
    PieChart,
    LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import { pageVariants } from "@/lib/animation-utils";

// Types
import type {
    B2APlanState,
    B2APlanMode,
    RiskProfile,
    AllocationEntry,
    CashFlow,
} from "@/types/b2a";

// Calculations
import {
    calculateNaturalTimeline,
    calculateWeightedReturn,
    calculateTimelineWithReturn,
    calculateAcceleratedRequirements,
    calculateProjections,
} from "@/lib/services/b2a-calculations";

// Service
import { B2AService } from "@/lib/services/b2a-service";

// Components
import { B2AGoalSummary } from "@/components/b2a/B2AGoalSummary";
import { B2AAllocationEditor } from "@/components/b2a/B2AAllocationEditor";
import { B2ACashFlowEditor } from "@/components/b2a/B2ACashFlowEditor";
import { B2ATimelineComparison } from "@/components/b2a/B2ATimelineComparison";
import { B2ARequiredInvestments } from "@/components/b2a/B2ARequiredInvestments";
import { B2AProjectionsChart } from "@/components/b2a/B2AProjectionsChart";
import { B2AReverseCalculator } from "@/components/b2a/B2AReverseCalculator";

// ─── Hook: Recalculate derived values whenever inputs change ────

function useB2ACalculations(plan: B2APlanState): B2APlanState {
    return useMemo(() => {
        const { currentWealth, targetWealth, riskProfile, allocations, cashFlows } =
            plan;

        // 1. Natural timeline
        const naturalTimeline = calculateNaturalTimeline({
            currentWealth,
            targetWealth,
            riskProfile,
        });

        // 2. Weighted return
        const weightedReturn = calculateWeightedReturn(allocations);

        // 3. Accelerated timeline
        const acceleratedTimeline =
            weightedReturn > 0
                ? calculateTimelineWithReturn(currentWealth, targetWealth, weightedReturn)
                : null;

        // 4. Desired timeline — use accelerated if user hasn't set one
        const desiredTimeline =
            plan.desiredTimeline ?? acceleratedTimeline ?? naturalTimeline.years;

        // 5. Requirements
        const requirements =
            desiredTimeline > 0 && weightedReturn > 0
                ? calculateAcceleratedRequirements({
                    currentWealth,
                    targetWealth,
                    desiredTimeline,
                    annualReturn: weightedReturn,
                    existingCashFlows: cashFlows,
                })
                : null;

        // 6. Projections (use requirement's monthly SIP as an existing cash flow for projections)
        const projectionCashFlows: CashFlow[] = [
            ...cashFlows,
            ...(requirements && !requirements.isAchievableWithCashFlows
                ? [
                    {
                        id: "proj-sip",
                        type: "SIP" as const,
                        amount: requirements.requiredMonthlySIP,
                        startYear: 1,
                        endYear: desiredTimeline,
                    },
                ]
                : []),
        ];

        const projections =
            desiredTimeline > 0 && weightedReturn > 0
                ? calculateProjections({
                    startingValue: currentWealth,
                    timeline: desiredTimeline,
                    expectedAnnualReturn: weightedReturn,
                    cashFlows: projectionCashFlows,
                })
                : null;

        return {
            ...plan,
            naturalTimeline,
            weightedReturn,
            acceleratedTimeline,
            desiredTimeline,
            requirements,
            projections,
        };
    }, [plan]);
}

// ─── Main Page Component ────────────────────────────────────────

export default function B2ADashboard() {
    // Load saved plan or defaults
    const [plan, setPlan] = useState<B2APlanState>(() => {
        // Try to load saved vision plan
        const saved = B2AService.loadPlan();
        if (saved) return { ...saved, mode: "vision" as B2APlanMode };
        return B2AService.getDefaultPlan("play");
    });

    const calculated = useB2ACalculations(plan);

    const isEditable = plan.mode === "play" || !plan.isSaved;

    // ── Handlers ──────────────────────────────────────────────────

    const updatePlan = useCallback(
        (partial: Partial<B2APlanState>) => {
            setPlan((prev) => ({ ...prev, ...partial }));
        },
        []
    );

    const handleModeSwitch = useCallback(
        (mode: B2APlanMode) => {
            if (mode === "vision") {
                const saved = B2AService.loadPlan();
                if (saved) {
                    setPlan({ ...saved, mode: "vision" });
                } else {
                    setPlan((prev) => ({ ...prev, mode: "vision" }));
                }
            } else {
                // Play mode: clone current state
                setPlan((prev) => ({
                    ...prev,
                    mode: "play",
                    isSaved: false,
                    lastSavedAt: null,
                }));
            }
        },
        []
    );

    const handleSaveVision = useCallback(() => {
        const toSave: B2APlanState = { ...plan, mode: "vision", isSaved: true };
        B2AService.savePlan(toSave);
        setPlan(toSave);
    }, [plan]);

    const handleReset = useCallback(() => {
        setPlan(B2AService.getDefaultPlan(plan.mode));
    }, [plan.mode]);

    const handleApplyTemplate = useCallback(
        (profile: RiskProfile) => {
            const allocations = B2AService.getAllocationsForProfile(profile);
            updatePlan({ riskProfile: profile, allocations });
        },
        [updatePlan]
    );

    // Natural retire age for reverse calculator
    const naturalRetireAge = calculated.naturalTimeline
        ? plan.currentAge + calculated.naturalTimeline.years
        : plan.currentAge + 30;

    return (
        <AppLayout>
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-6 space-y-6"
            >
                {/* ── Page Header ──────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            B2A Financial Planner
                        </h1>
                        <p className="text-muted-foreground">
                            Plan your journey from current wealth to your target
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mode Toggle */}
                        <div className="flex bg-muted rounded-lg p-1">
                            <Button
                                variant={plan.mode === "vision" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleModeSwitch("vision")}
                                className="gap-1.5 text-xs"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Vision Setting
                            </Button>
                            <Button
                                variant={plan.mode === "play" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleModeSwitch("play")}
                                className="gap-1.5 text-xs"
                            >
                                <Gamepad2 className="h-3.5 w-3.5" />
                                Play Tool
                            </Button>
                        </div>

                        {/* Actions */}
                        {plan.mode === "vision" && !plan.isSaved && (
                            <Button size="sm" onClick={handleSaveVision} className="gap-1.5">
                                <Save className="h-3.5 w-3.5" />
                                Save Plan
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="gap-1.5"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </Button>
                    </div>
                </motion.div>

                {/* Status badge */}
                <div className="flex items-center gap-2">
                    {plan.mode === "vision" ? (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            <Eye className="h-3 w-3 mr-1" />
                            Vision Mode{plan.isSaved ? " (Saved)" : ""}
                        </Badge>
                    ) : (
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            <Gamepad2 className="h-3 w-3 mr-1" />
                            Play Mode — sandbox, changes aren&apos;t saved
                        </Badge>
                    )}
                </div>

                {/* ── Goal Summary (always visible) ────────────────────── */}
                <B2AGoalSummary
                    currentWealth={plan.currentWealth}
                    targetWealth={plan.targetWealth}
                    currentAge={plan.currentAge}
                    riskProfile={plan.riskProfile}
                    naturalTimeline={calculated.naturalTimeline}
                    acceleratedTimeline={calculated.acceleratedTimeline}
                    weightedReturn={calculated.weightedReturn}
                    isEditable={isEditable}
                    onCurrentWealthChange={(v) => updatePlan({ currentWealth: v })}
                    onTargetWealthChange={(v) => updatePlan({ targetWealth: v })}
                    onCurrentAgeChange={(v) => updatePlan({ currentAge: v })}
                    onRiskProfileChange={(v) => handleApplyTemplate(v)}
                />

                {/* ── Tabs: Asset Allocation + Dashboard ───────────────── */}
                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="allocation" className="gap-1.5">
                            <PieChart className="h-3.5 w-3.5" />
                            Asset Allocation
                        </TabsTrigger>
                        <TabsTrigger value="dashboard" className="gap-1.5">
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            Dashboard
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Asset Allocation Tab ─────────────────────────── */}
                    <TabsContent value="allocation" className="space-y-6">
                        <B2AAllocationEditor
                            allocations={plan.allocations}
                            riskProfile={plan.riskProfile}
                            weightedReturn={calculated.weightedReturn}
                            isEditable={isEditable}
                            onAllocationsChange={(a) => updatePlan({ allocations: a })}
                            onApplyTemplate={handleApplyTemplate}
                        />

                        <B2ACashFlowEditor
                            cashFlows={plan.cashFlows}
                            isEditable={isEditable}
                            onCashFlowsChange={(cf) => updatePlan({ cashFlows: cf })}
                        />
                    </TabsContent>

                    {/* ── Dashboard Tab ────────────────────────────────── */}
                    <TabsContent value="dashboard" className="space-y-6">
                        {/* Timeline Comparison */}
                        <B2ATimelineComparison
                            currentAge={plan.currentAge}
                            naturalTimeline={calculated.naturalTimeline}
                            acceleratedTimeline={calculated.acceleratedTimeline}
                            weightedReturn={calculated.weightedReturn}
                            targetWealth={plan.targetWealth}
                        />

                        {/* Required Investments */}
                        <B2ARequiredInvestments
                            requirements={calculated.requirements}
                            desiredTimeline={calculated.desiredTimeline}
                        />

                        {/* Projections Chart */}
                        <B2AProjectionsChart
                            projections={calculated.projections}
                            targetWealth={plan.targetWealth}
                        />

                        {/* Reverse Calculator */}
                        {calculated.naturalTimeline && (
                            <B2AReverseCalculator
                                currentWealth={plan.currentWealth}
                                targetWealth={plan.targetWealth}
                                currentAge={plan.currentAge}
                                naturalRetireAge={naturalRetireAge}
                                annualReturn={calculated.weightedReturn}
                                existingCashFlows={plan.cashFlows}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </motion.div>
        </AppLayout>
    );
}
