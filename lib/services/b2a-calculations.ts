// lib/services/b2a-calculations.ts
// Pure calculation engine for B2A financial planning
// All formulas from B2A-A2B-Planning-Tracking-Logic.md

import type {
    RiskProfile,
    CashFlow,
    AllocationEntry,
    NaturalTimelineResult,
    AcceleratedRequirementsResult,
    ProjectionPoint,
    Projections,
} from '@/types/b2a';
import { RISK_PROFILE_RETURNS } from '@/types/b2a';

// ─── Natural Timeline ───────────────────────────────────────────
// How long to reach target with no additional investments

export function calculateNaturalTimeline(params: {
    currentWealth: number;
    targetWealth: number;
    riskProfile: RiskProfile;
    annualReturnOverride?: number;
    maxTimelineYears?: number;
}): NaturalTimelineResult {
    const {
        currentWealth,
        targetWealth,
        riskProfile,
        annualReturnOverride,
        maxTimelineYears = 80,
    } = params;

    const annualReturn =
        annualReturnOverride ?? RISK_PROFILE_RETURNS[riskProfile] ?? RISK_PROFILE_RETURNS.moderate;
    const r = annualReturn / 100;

    if (targetWealth <= 0) {
        return { years: maxTimelineYears, annualReturn, projectedValue: currentWealth, isAlreadyAchieved: false };
    }
    if (currentWealth >= targetWealth) {
        return { years: 0, annualReturn, projectedValue: currentWealth, isAlreadyAchieved: true };
    }
    if (currentWealth <= 0 || r <= 0) {
        return { years: maxTimelineYears, annualReturn, projectedValue: currentWealth, isAlreadyAchieved: false };
    }

    const years = Math.log(targetWealth / currentWealth) / Math.log(1 + r);
    const cappedYears = Math.min(Math.ceil(years), maxTimelineYears);
    const projectedValue = currentWealth * Math.pow(1 + r, cappedYears);

    return {
        years: cappedYears,
        annualReturn,
        projectedValue: Math.round(projectedValue),
        isAlreadyAchieved: false,
    };
}

// ─── Weighted Return ────────────────────────────────────────────

export function calculateWeightedReturn(allocations: AllocationEntry[]): number {
    if (!allocations || allocations.length === 0) return 0;

    const valid = allocations.filter(
        (a) => a.allocationPercentage > 0 && a.returnRate !== undefined
    );
    if (valid.length === 0) return 0;

    return valid.reduce(
        (sum, a) => sum + ((a.allocationPercentage || 0) * (a.returnRate || 0)) / 100,
        0
    );
}

// ─── Timeline With Custom Return ────────────────────────────────

export function calculateTimelineWithReturn(
    currentWealth: number,
    targetWealth: number,
    annualReturn: number,
    maxTimelineYears: number = 80
): number {
    if (targetWealth <= 0) return maxTimelineYears;
    if (currentWealth >= targetWealth) return 0;
    if (currentWealth <= 0 || annualReturn <= 0) return maxTimelineYears;

    const r = annualReturn / 100;
    const years = Math.log(targetWealth / currentWealth) / Math.log(1 + r);
    return Math.min(Math.ceil(years), maxTimelineYears);
}

// ─── Projected Value With Cash Flows ────────────────────────────
// Month-by-month simulation with monthly compounding

export function calculateProjectedValueWithCashFlows(
    currentWealth: number,
    timeline: number,
    annualReturn: number,
    cashFlows: CashFlow[] = []
): number {
    const monthlyReturn = annualReturn / 100 / 12;
    let currentValue = currentWealth;
    const totalMonths = timeline * 12;

    for (let month = 1; month <= totalMonths; month++) {
        // 1. Apply monthly growth first
        currentValue = currentValue * (1 + monthlyReturn);

        // 2. Apply cash flows
        for (const flow of cashFlows) {
            if (!flow.amount) continue;
            const amount = Number(flow.amount);
            const startMonth = (flow.startYear - 1) * 12 + 1;

            if (flow.type === 'SIP' || flow.type === 'SWP') {
                const endYear = flow.endYear || timeline;
                const endMonth = endYear * 12;

                if (month >= startMonth && month <= endMonth) {
                    currentValue += flow.type === 'SIP' ? amount : -amount;
                }
            } else if (flow.type === 'Lumpsum' || flow.type === 'Withdrawal') {
                if (month === startMonth) {
                    currentValue += flow.type === 'Lumpsum' ? amount : -amount;
                }
            }
        }

        currentValue = Math.max(0, currentValue);
    }

    return Math.round(currentValue);
}

// ─── Accelerated Requirements ───────────────────────────────────
// Calculate gap and required SIP/Lumpsum to hit target in shorter time

export function calculateAcceleratedRequirements(params: {
    currentWealth: number;
    targetWealth: number;
    desiredTimeline: number;
    annualReturn: number;
    existingCashFlows?: CashFlow[];
}): AcceleratedRequirementsResult {
    const {
        currentWealth,
        targetWealth,
        desiredTimeline,
        annualReturn,
        existingCashFlows = [],
    } = params;

    const r = annualReturn / 100;
    const n = desiredTimeline;

    // Step 1: Projected value with existing cash flows
    const projectedValueWithCashFlows = calculateProjectedValueWithCashFlows(
        currentWealth,
        desiredTimeline,
        annualReturn,
        existingCashFlows
    );

    // Step 2: Already achievable?
    if (projectedValueWithCashFlows >= targetWealth) {
        return {
            requiredMonthlySIP: 0,
            requiredYearlySIP: 0,
            requiredLumpsum: 0,
            projectedValueWithCashFlows,
            remainingTarget: 0,
            isAchievableWithCashFlows: true,
        };
    }

    // Step 3: Gap
    const remainingTarget = targetWealth - projectedValueWithCashFlows;

    // Step 4: Required lumpsum (PV of gap)
    const annualGrowthFactor = Math.pow(1 + r, n);
    const requiredLumpsum = remainingTarget / annualGrowthFactor;

    // Step 5: Required monthly SIP
    let requiredMonthlySIP = 0;
    if (r === 0) {
        requiredMonthlySIP = remainingTarget / (n * 12);
    } else {
        const monthlyRate = r / 12;
        const totalMonths = n * 12;
        const monthlyGrowthFactor = Math.pow(1 + monthlyRate, totalMonths);
        if (monthlyGrowthFactor > 1) {
            requiredMonthlySIP = (remainingTarget * monthlyRate) / (monthlyGrowthFactor - 1);
        }
    }

    // Step 6: Required yearly SIP
    let requiredYearlySIP = 0;
    if (r === 0) {
        requiredYearlySIP = remainingTarget / n;
    } else {
        if (annualGrowthFactor > 1) {
            requiredYearlySIP = (remainingTarget * r) / (annualGrowthFactor - 1);
        }
    }

    return {
        requiredMonthlySIP: Math.round(Math.max(0, requiredMonthlySIP)),
        requiredYearlySIP: Math.round(Math.max(0, requiredYearlySIP)),
        requiredLumpsum: Math.round(Math.max(0, requiredLumpsum)),
        projectedValueWithCashFlows,
        remainingTarget: Math.round(remainingTarget),
        isAchievableWithCashFlows: false,
    };
}

// ─── Natural Growth Projection ──────────────────────────────────

export function calculateNaturalGrowthProjection(
    startValue: number,
    timeline: number,
    annualReturn: number
): ProjectionPoint[] {
    const points: ProjectionPoint[] = [];
    const monthlyReturn = annualReturn / 100 / 12;
    let currentValue = startValue;

    points.push({ year: 0, value: Math.round(currentValue) });

    for (let month = 1; month <= timeline * 12; month++) {
        currentValue = currentValue * (1 + monthlyReturn);
        if (month % 12 === 0) {
            points.push({ year: month / 12, value: Math.round(currentValue) });
        }
    }

    return points;
}

// ─── Multi-Scenario Projections ─────────────────────────────────

function calculateProjection(
    startValue: number,
    timeline: number,
    annualReturn: number, // as decimal (e.g. 0.12)
    cashFlows: CashFlow[] = []
): ProjectionPoint[] {
    const points: ProjectionPoint[] = [];
    const monthlyReturn = annualReturn / 12;
    let currentValue = startValue;

    points.push({ year: 0, value: Math.round(currentValue) });

    const totalMonths = timeline * 12;

    for (let month = 1; month <= totalMonths; month++) {
        currentValue = currentValue * (1 + monthlyReturn);

        for (const flow of cashFlows) {
            if (!flow.amount) continue;
            const amount = Number(flow.amount);
            const startMonth = (flow.startYear - 1) * 12 + 1;

            if (flow.type === 'SIP' || flow.type === 'SWP') {
                const endYear = flow.endYear || timeline;
                const endMonth = endYear * 12;
                if (month >= startMonth && month <= endMonth) {
                    currentValue += flow.type === 'SIP' ? amount : -amount;
                }
            } else if (flow.type === 'Lumpsum' || flow.type === 'Withdrawal') {
                if (month === startMonth) {
                    currentValue += flow.type === 'Lumpsum' ? amount : -amount;
                }
            }
        }

        currentValue = Math.max(0, currentValue);

        if (month % 12 === 0) {
            points.push({ year: month / 12, value: Math.round(currentValue) });
        }
    }

    return points;
}

export function calculateProjections(params: {
    startingValue: number;
    timeline: number;
    expectedAnnualReturn: number;
    cashFlows?: CashFlow[];
    optimisticBonus?: number;
    pessimisticPenalty?: number;
}): Projections {
    const {
        startingValue,
        timeline,
        expectedAnnualReturn,
        cashFlows = [],
        optimisticBonus = 2,
        pessimisticPenalty = 2,
    } = params;

    const baseReturn = expectedAnnualReturn / 100;
    const optimisticReturn = baseReturn + optimisticBonus / 100;
    const pessimisticReturn = Math.max(0, baseReturn - pessimisticPenalty / 100);

    const optimisticProjections = calculateProjection(startingValue, timeline, optimisticReturn, cashFlows);
    const baseProjections = calculateProjection(startingValue, timeline, baseReturn, cashFlows);
    const pessimisticProjections = calculateProjection(startingValue, timeline, pessimisticReturn, cashFlows);

    const optimisticFinal = optimisticProjections[optimisticProjections.length - 1].value;
    const baseFinal = baseProjections[baseProjections.length - 1].value;
    const pessimisticFinal = pessimisticProjections[pessimisticProjections.length - 1].value;

    const calcGrowth = (finalValue: number): number => {
        if (startingValue <= 0) return 0;
        return ((finalValue - startingValue) / startingValue) * 100;
    };

    return {
        startingValue,
        timeline,
        optimistic: {
            expectedReturn: optimisticReturn * 100,
            projections: optimisticProjections,
            finalValue: optimisticFinal,
            growth: calcGrowth(optimisticFinal),
        },
        baseCase: {
            expectedReturn: baseReturn * 100,
            projections: baseProjections,
            finalValue: baseFinal,
            growth: calcGrowth(baseFinal),
        },
        pessimistic: {
            expectedReturn: pessimisticReturn * 100,
            projections: pessimisticProjections,
            finalValue: pessimisticFinal,
            growth: calcGrowth(pessimisticFinal),
        },
    };
}

// ─── Reverse Calculator ─────────────────────────────────────────
// Given a desired retirement age, calculate extra SIP needed

export function calculateReverseTimeline(params: {
    currentWealth: number;
    targetWealth: number;
    currentAge: number;
    desiredRetirementAge: number;
    annualReturn: number;
    existingCashFlows?: CashFlow[];
}): AcceleratedRequirementsResult & { desiredTimeline: number } {
    const {
        currentAge,
        desiredRetirementAge,
        ...rest
    } = params;

    const desiredTimeline = Math.max(1, desiredRetirementAge - currentAge);

    const result = calculateAcceleratedRequirements({
        ...rest,
        desiredTimeline,
    });

    return { ...result, desiredTimeline };
}

// ─── Utility: Format Indian Currency ────────────────────────────

export function formatIndianCurrency(value: number): string {
    if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} L`;
    } else {
        return `₹${value.toLocaleString('en-IN')}`;
    }
}

export function formatIndianCurrencyShort(value: number): string {
    if (value >= 10000000) {
        return `${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
        return `${(value / 100000).toFixed(1)}L`;
    } else {
        return value.toLocaleString('en-IN');
    }
}
