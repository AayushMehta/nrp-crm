# B2A & A2B Planning and Tracking System - Complete Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [B2A: Before to After (Planning Phase)](#b2a-before-to-after-planning-phase)
3. [A2B: After to Before (Tracking Phase)](#a2b-after-to-before-tracking-phase)
4. [Data Structures](#data-structures)
5. [Mathematical Formulas](#mathematical-formulas)
6. [Implementation Guide](#implementation-guide)

---

## Overview

This system implements two complementary phases for financial planning and tracking:

- **B2A (Before to After)**: Planning phase where users define current wealth (Before/Point A) and target wealth (After/Point B), then calculate required investments
- **A2B (After to Before)**: Tracking phase where users monitor progress from Point A (plan start) to Point B (target), comparing actual vs. planned performance

### Key Concepts

- **Point A**: Current/Starting wealth
- **Point B**: Target wealth
- **Natural Timeline**: Time required to reach target with no additional investments (using risk profile returns)
- **Accelerated Timeline**: User-defined timeline (shorter than natural) requiring additional investments
- **Cash Flows**: SIP (monthly), Yearly SIP, Lumpsum (one-time), SWP (withdrawals), and Withdrawal (one-time)

---

## B2A: Before to After (Planning Phase)

### Purpose

Help users create a financial plan by calculating:
1. Natural timeline to reach target wealth (baseline scenario)
2. Accelerated timeline with required investments
3. Projected portfolio growth with various scenarios

### Core Components

#### 1. Natural Timeline Calculation

**Concept**: How long will it take to reach the target wealth without any additional investments, using only the risk profile's expected return?

**Formula**:
```
n = ln(FV / PV) / ln(1 + r)
```

Where:
- `n` = Number of years
- `FV` = Future Value (Target Wealth)
- `PV` = Present Value (Current Wealth)
- `r` = Annual return rate (from risk profile) as decimal

**Risk Profile Returns** (Default Values):
```typescript
{
  conservative: 8,    // 8% annual return
  moderate: 10,       // 10% annual return
  aggressive: 12,     // 12% annual return
  veryAggressive: 14  // 14% annual return
}
```

**Implementation**:

```typescript
export interface NaturalTimelineParams {
  currentWealth: number;
  targetWealth: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive' | 'veryAggressive';
  annualReturnOverride?: number; // Optional override
  maxTimelineYears?: number;     // Default: 80
}

export interface NaturalTimelineResult {
  years: number;                // Number of years to reach target
  annualReturn: number;         // Annual return rate used
  projectedValue: number;       // Projected final value
  isAlreadyAchieved: boolean;  // True if current >= target
}

function calculateNaturalTimeline(params: NaturalTimelineParams): NaturalTimelineResult {
  const { currentWealth, targetWealth, riskProfile, annualReturnOverride, maxTimelineYears = 80 } = params;

  const annualReturn = annualReturnOverride ?? riskProfileReturns[riskProfile] ?? riskProfileReturns.moderate;
  const r = annualReturn / 100;

  // Edge cases
  if (targetWealth <= 0) {
    return { years: maxTimelineYears, annualReturn, projectedValue: currentWealth, isAlreadyAchieved: false };
  }

  if (currentWealth >= targetWealth) {
    return { years: 0, annualReturn, projectedValue: currentWealth, isAlreadyAchieved: true };
  }

  if (currentWealth <= 0 || r <= 0) {
    return { years: maxTimelineYears, annualReturn, projectedValue: currentWealth, isAlreadyAchieved: false };
  }

  // Calculate timeline
  const years = Math.log(targetWealth / currentWealth) / Math.log(1 + r);
  const cappedYears = Math.min(Math.ceil(years), maxTimelineYears);
  const projectedValue = currentWealth * Math.pow(1 + r, cappedYears);

  return {
    years: cappedYears,
    annualReturn,
    projectedValue: Math.round(projectedValue),
    isAlreadyAchieved: false
  };
}
```

#### 2. Accelerated Timeline Calculation

**Concept**: User wants to achieve the target in a shorter timeline. Calculate what timeline is possible with the custom asset allocation.

**Formula**: Same as natural timeline, but uses weighted return from asset allocations instead of risk profile return.

```typescript
function calculateTimelineWithReturn(
  currentWealth: number,
  targetWealth: number,
  annualReturn: number,  // Weighted return from allocations
  maxTimelineYears: number = 80
): number {
  if (targetWealth <= 0) return maxTimelineYears;
  if (currentWealth >= targetWealth) return 0;
  if (currentWealth <= 0 || annualReturn <= 0) return maxTimelineYears;

  const r = annualReturn / 100;
  const years = Math.log(targetWealth / currentWealth) / Math.log(1 + r);

  return Math.min(Math.ceil(years), maxTimelineYears);
}
```

**Weighted Return Calculation**:

```typescript
function calculateWeightedReturn(allocations: AllocationEntry[]): number {
  if (!allocations || allocations.length === 0) return 0;

  const validAllocations = allocations.filter(
    (a) => a.allocationPercentage > 0 && a.returnRate !== undefined
  );

  if (validAllocations.length === 0) return 0;

  return validAllocations.reduce(
    (sum, a) => sum + ((a.allocationPercentage || 0) * (a.returnRate || 0)) / 100,
    0
  );
}
```

Example:
```
Allocations:
- Equity: 60% allocation, 12% return → 0.6 * 12 = 7.2
- Debt: 30% allocation, 8% return → 0.3 * 8 = 2.4
- Gold: 10% allocation, 6% return → 0.1 * 6 = 0.6

Weighted Return = 7.2 + 2.4 + 0.6 = 10.2%
```

#### 3. Required Investment Calculations

**Concept**: If the user wants to achieve the target in a shorter timeline than what's naturally possible, calculate the required additional investments.

##### 3.1 Calculate Projected Value with Existing Cash Flows

**Algorithm**: Month-by-month simulation with monthly compounding

```typescript
function calculateProjectedValueWithCashFlows(
  currentWealth: number,
  timeline: number,        // Years
  annualReturn: number,    // Percentage
  cashFlows: CashFlow[] = []
): number {
  const monthlyReturn = annualReturn / 100 / 12;
  let currentValue = currentWealth;
  const totalMonths = timeline * 12;

  for (let month = 1; month <= totalMonths; month++) {
    // 1. Apply monthly growth FIRST
    currentValue = currentValue * (1 + monthlyReturn);

    // 2. Apply cash flows
    for (const flow of cashFlows) {
      if (!flow.amount) continue;
      const amount = Number(flow.amount);
      const startMonth = (flow.startYear - 1) * 12 + 1;

      if (flow.type === 'SIP' || flow.type === 'SWP') {
        // Recurring monthly flows
        const endYear = flow.endYear || timeline;
        const endMonth = endYear * 12;

        if (month >= startMonth && month <= endMonth) {
          currentValue += (flow.type === 'SIP' ? amount : -amount);
        }
      } else if (flow.type === 'Lumpsum' || flow.type === 'Withdrawal') {
        // One-time flows
        if (month === startMonth) {
          currentValue += (flow.type === 'Lumpsum' ? amount : -amount);
        }
      }
    }

    currentValue = Math.max(0, currentValue); // Prevent negative wealth
  }

  return Math.round(currentValue);
}
```

**Important Notes**:
- Growth is applied FIRST in each month
- Then cash flows are added/subtracted
- SIP/SWP are monthly recurring
- Lumpsum/Withdrawal are one-time at startYear
- Year 1 starts at month 1 (not month 0)
- `startMonth = (startYear - 1) * 12 + 1`

##### 3.2 Calculate Required Investments

**Concept**: Calculate the gap between target and projected value, then solve for required SIP/Lumpsum.

```typescript
export interface AcceleratedRequirementsParams {
  currentWealth: number;
  targetWealth: number;
  desiredTimeline: number;     // User's desired timeline (years)
  annualReturn: number;        // Weighted return from allocations
  existingCashFlows?: CashFlow[];
}

export interface AcceleratedRequirementsResult {
  requiredMonthlySIP: number;
  requiredYearlySIP: number;
  requiredLumpsum: number;
  projectedValueWithCashFlows: number;
  remainingTarget: number;
  isAchievableWithCashFlows: boolean;
}

function calculateAcceleratedRequirements(
  params: AcceleratedRequirementsParams
): AcceleratedRequirementsResult {
  const { currentWealth, targetWealth, desiredTimeline, annualReturn, existingCashFlows = [] } = params;

  const r = annualReturn / 100;
  const n = desiredTimeline;

  // Step 1: Calculate projected value with existing cash flows
  const projectedValueWithCashFlows = calculateProjectedValueWithCashFlows(
    currentWealth,
    desiredTimeline,
    annualReturn,
    existingCashFlows
  );

  // Step 2: Check if already achievable
  if (projectedValueWithCashFlows >= targetWealth) {
    return {
      requiredMonthlySIP: 0,
      requiredYearlySIP: 0,
      requiredLumpsum: 0,
      projectedValueWithCashFlows,
      remainingTarget: 0,
      isAchievableWithCashFlows: true
    };
  }

  // Step 3: Calculate the gap
  const remainingTarget = targetWealth - projectedValueWithCashFlows;

  // Step 4: Calculate required lumpsum (Present Value of gap)
  const annualGrowthFactor = Math.pow(1 + r, n);
  const requiredLumpsum = remainingTarget / annualGrowthFactor;

  // Step 5: Calculate required monthly SIP
  let requiredMonthlySIP = 0;
  if (r === 0) {
    requiredMonthlySIP = remainingTarget / (n * 12);
  } else {
    const monthlyRate = r / 12;
    const totalMonths = n * 12;
    const monthlyGrowthFactor = Math.pow(1 + monthlyRate, totalMonths);

    if (monthlyGrowthFactor > 1) {
      // SIP Future Value formula: FV = PMT * [(1 + r)^n - 1] / r
      // Solving for PMT: PMT = FV * r / [(1 + r)^n - 1]
      requiredMonthlySIP = (remainingTarget * monthlyRate) / (monthlyGrowthFactor - 1);
    }
  }

  // Step 6: Calculate required yearly SIP
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
    isAchievableWithCashFlows: false
  };
}
```

**Key Formulas**:

1. **Required Lumpsum** (Present Value):
   ```
   PV = FV / (1 + r)^n
   ```

2. **Required Monthly SIP** (SIP Future Value formula):
   ```
   FV = PMT × [(1 + r)^n - 1] / r

   Solving for PMT:
   PMT = FV × r / [(1 + r)^n - 1]
   ```
   Where r is monthly rate (annual/12), n is total months

3. **Required Yearly SIP**:
   ```
   PMT = FV × r / [(1 + r)^n - 1]
   ```
   Where r is annual rate, n is total years

#### 4. Natural Growth Projections

**Concept**: Generate year-by-year projection points showing portfolio growth.

```typescript
export interface NaturalProjectionPoint {
  year: number;
  value: number;
}

function calculateNaturalGrowthProjection(
  startValue: number,
  timeline: number,
  annualReturn: number
): NaturalProjectionPoint[] {
  const points: NaturalProjectionPoint[] = [];
  const monthlyReturn = annualReturn / 100 / 12;
  let currentValue = startValue;

  // Add initial point
  points.push({ year: 0, value: Math.round(currentValue) });

  // Monthly compounding
  for (let month = 1; month <= timeline * 12; month++) {
    currentValue = currentValue * (1 + monthlyReturn);

    // Record yearly snapshots
    if (month % 12 === 0) {
      points.push({ year: month / 12, value: Math.round(currentValue) });
    }
  }

  return points;
}
```

#### 5. Multi-Scenario Projections

**Concept**: Calculate optimistic, base case, and pessimistic scenarios for portfolio growth.

```typescript
export interface ScenarioProjection {
  expectedReturn: number;
  finalValue: number;
  growth: number;
  projections: ProjectionPoint[];
}

export interface Projections {
  startingValue: number;
  timeline: number;
  optimistic: ScenarioProjection;
  baseCase: ScenarioProjection;
  pessimistic: ScenarioProjection;
}

function calculateProjections(params: {
  startingValue: number;
  timeline: number;
  expectedAnnualReturn: number;
  cashFlows?: CashFlow[];
  optimisticBonus?: number;      // Default: +2%
  pessimisticPenalty?: number;   // Default: -2%
}): Projections {
  const {
    startingValue,
    timeline,
    expectedAnnualReturn,
    cashFlows = [],
    optimisticBonus = 2,
    pessimisticPenalty = 2
  } = params;

  // Convert percentages to decimals
  const baseReturn = expectedAnnualReturn / 100;
  const optimisticReturn = baseReturn + optimisticBonus / 100;
  const pessimisticReturn = Math.max(0, baseReturn - pessimisticPenalty / 100);

  // Calculate projections for each scenario using the same algorithm
  const optimisticProjections = calculateProjection(startingValue, timeline, optimisticReturn, cashFlows);
  const baseProjections = calculateProjection(startingValue, timeline, baseReturn, cashFlows);
  const pessimisticProjections = calculateProjection(startingValue, timeline, pessimisticReturn, cashFlows);

  // Get final values
  const optimisticFinal = optimisticProjections[optimisticProjections.length - 1].value;
  const baseFinal = baseProjections[baseProjections.length - 1].value;
  const pessimisticFinal = pessimisticProjections[pessimisticProjections.length - 1].value;

  // Calculate growth percentages
  const calculateGrowth = (finalValue: number): number => {
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
      growth: calculateGrowth(optimisticFinal)
    },
    baseCase: {
      expectedReturn: baseReturn * 100,
      projections: baseProjections,
      finalValue: baseFinal,
      growth: calculateGrowth(baseFinal)
    },
    pessimistic: {
      expectedReturn: pessimisticReturn * 100,
      projections: pessimisticProjections,
      finalValue: pessimisticFinal,
      growth: calculateGrowth(pessimisticFinal)
    }
  };
}
```

**Projection Algorithm** (with cash flows):

```typescript
function calculateProjection(
  startValue: number,
  timeline: number,
  annualReturn: number,  // As decimal (e.g., 0.12)
  cashFlows: CashFlow[] = []
): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  const monthlyReturn = annualReturn / 12;
  let currentValue = startValue;

  // Add initial point (year 0)
  points.push({ year: 0, value: Math.round(currentValue) });

  const totalMonths = timeline * 12;

  for (let month = 1; month <= totalMonths; month++) {
    // 1. Apply monthly growth first
    currentValue = currentValue * (1 + monthlyReturn);

    // 2. Apply cash flows for this month
    for (const flow of cashFlows) {
      if (!flow.amount) continue;
      const amount = Number(flow.amount);
      const startMonth = (flow.startYear - 1) * 12 + 1;

      if (flow.type === 'SIP' || flow.type === 'SWP') {
        const endYear = flow.endYear || timeline;
        const endMonth = endYear * 12;

        if (month >= startMonth && month <= endMonth) {
          currentValue += (flow.type === 'SIP' ? amount : -amount);
        }
      } else if (flow.type === 'Lumpsum' || flow.type === 'Withdrawal') {
        if (month === startMonth) {
          currentValue += (flow.type === 'Lumpsum' ? amount : -amount);
        }
      }
    }

    currentValue = Math.max(0, currentValue); // Prevent negative wealth

    // Record yearly snapshot
    if (month % 12 === 0) {
      const year = month / 12;
      points.push({ year, value: Math.round(currentValue) });
    }
  }

  return points;
}
```

---

## A2B: After to Before (Tracking Phase)

### Purpose

Monitor actual progress against the planned trajectory from Point A (plan start) to Point B (target), including:
1. A→B Progress Tracking
2. Variance Analysis
3. Milestone Tracking
4. Performance by Asset Class
5. Rebalancing Alerts

### Core Components

#### 1. A→B Progress Tracking

**Concept**: Compare actual wealth accumulation vs. planned trajectory over time.

**Data Structure**:

```typescript
export interface ABProgressTrackingDto {
  // Point A: Starting wealth
  pointA: {
    value: number;
    label: string;
    percentage: number;  // Always 0%
  };

  // Point B: Target wealth
  pointB: {
    value: number;
    label: string;
    percentage: number;  // Always 100%
  };

  // Current position
  current: {
    value: number;
    percentage: number;  // Progress from A to B
  };

  // Progress metrics
  progress: {
    wealthProgress: {
      percentage: number;  // (current - pointA) / (pointB - pointA) * 100
      detail: string;
    };
    timeElapsed: {
      percentage: number;  // elapsedYears / totalTimeline * 100
      detail: string;
    };
    scheduleStatus: {
      days: number;        // +/- days relative to schedule
      status: 'ahead' | 'on-track' | 'behind';
      detail: string;
    };
  };

  projectedFinalNetWorth: number;
  targetAchievement: 'on-track' | 'ahead' | 'behind';
  overallStatus: 'ahead-of-schedule' | 'on-schedule' | 'behind-schedule';

  // Optional insights
  ageInsights?: {
    currentAge: number;
    targetAge: number;
    ageAtProjectedCompletion: number;
    yearsEarlyOrLate: number;  // Positive = early, negative = late
  };

  growthAnalysis?: {
    expectedCAGR: number;         // Expected annual growth rate
    actualCAGR: number;           // Actual CAGR achieved so far
    performanceVsExpected: number; // Percentage difference
  };

  // Chart data
  chart?: ABProgressTrackingChart;
}
```

**Chart Data Structure**:

```typescript
export interface ABProgressTrackingChart {
  startDate: string;        // ISO timestamp of plan start
  now: string;              // Current ISO timestamp
  timelineYears: number;    // Total timeline in years
  currentElapsedYears: number;

  // Required annual return to hit target (reverse-calculated)
  requiredAnnualReturn?: number;

  // Expected annual return from allocation profile
  expectedAnnualReturn?: number;

  // Data points for chart
  points: ABProgressTrackingSeriesPoint[];

  // Current position marker
  currentPoint: {
    date: string;
    elapsedYears: number;
    value: number;
  };
}

export interface ABProgressTrackingSeriesPoint {
  year: number;            // 0, 1, 2, ...
  date: string;            // ISO timestamp
  plannedValue: number;    // Required trajectory value
  actualValue: number | null;  // Actual holdings (null for future)
}
```

**Key Calculations**:

1. **Wealth Progress Percentage**:
   ```
   wealthProgress = (currentValue - pointA.value) / (pointB.value - pointA.value) * 100
   ```

2. **Time Elapsed Percentage**:
   ```
   timeElapsed = (elapsedYears / totalTimelineYears) * 100
   ```

3. **Schedule Status**:
   ```
   idealProgressRate = timeElapsed%
   actualProgressRate = wealthProgress%

   If actualProgressRate >= idealProgressRate + threshold: AHEAD
   If actualProgressRate <= idealProgressRate - threshold: BEHIND
   Else: ON-TRACK
   ```

4. **Required Annual Return** (Reverse Calculation):
   Given Point A, Point B, and timeline, solve for r:
   ```
   FV = PV * (1 + r)^n

   Solving for r:
   r = (FV / PV)^(1/n) - 1
   ```

   With cash flows, use iterative numerical methods (Newton-Raphson or binary search).

5. **Actual CAGR**:
   ```
   CAGR = (currentValue / startingValue)^(1 / yearsElapsed) - 1
   ```

6. **Projected Final Net Worth**:
   Apply actual CAGR to remaining years:
   ```
   projectedFinal = currentValue * (1 + actualCAGR)^remainingYears
   ```

**Example Backend Calculation Logic**:

```typescript
// Server-side logic (conceptual)
async function calculateABProgress(familyId: number): Promise<ABProgressTrackingDto> {
  // 1. Get active plan
  const plan = await getActivePlan(familyId);
  const { currentWealth, targetWealth, desiredTimeline, planStartDate } = plan.goalPlanning;

  // 2. Get current portfolio value
  const currentValue = await getCurrentPortfolioValue(familyId);

  // 3. Calculate time elapsed
  const now = new Date();
  const startDate = new Date(planStartDate);
  const elapsedYears = (now.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  // 4. Calculate wealth progress
  const wealthGap = targetWealth - currentWealth;
  const wealthProgress = ((currentValue - currentWealth) / wealthGap) * 100;

  // 5. Calculate time progress
  const timeProgress = (elapsedYears / desiredTimeline) * 100;

  // 6. Calculate actual CAGR
  const actualCAGR = Math.pow(currentValue / currentWealth, 1 / elapsedYears) - 1;

  // 7. Project final value
  const remainingYears = desiredTimeline - elapsedYears;
  const projectedFinal = currentValue * Math.pow(1 + actualCAGR, remainingYears);

  // 8. Generate chart data
  const chart = await generateChartData(plan, currentValue, elapsedYears);

  // 9. Determine status
  const overallStatus = determineStatus(wealthProgress, timeProgress);

  return {
    pointA: { value: currentWealth, label: 'Start', percentage: 0 },
    pointB: { value: targetWealth, label: 'Target', percentage: 100 },
    current: { value: currentValue, percentage: wealthProgress },
    progress: {
      wealthProgress: { percentage: wealthProgress, detail: `₹${formatCurrency(currentValue - currentWealth)} gained` },
      timeElapsed: { percentage: timeProgress, detail: `${elapsedYears.toFixed(1)} of ${desiredTimeline} years` },
      scheduleStatus: calculateScheduleStatus(wealthProgress, timeProgress)
    },
    projectedFinalNetWorth: projectedFinal,
    targetAchievement: projectedFinal >= targetWealth ? 'on-track' : 'behind',
    overallStatus,
    growthAnalysis: {
      expectedCAGR: plan.allocationProfile.overallReturnPercentage / 100,
      actualCAGR,
      performanceVsExpected: (actualCAGR - plan.allocationProfile.overallReturnPercentage / 100) * 100
    },
    chart
  };
}
```

#### 2. Variance Analysis

**Concept**: Compare actual net worth vs. planned net worth at the current point in time.

**Data Structure**:

```typescript
export interface VarianceAnalysisDto {
  actualNetWorth: {
    value: number;
    label: string;
  };

  plannedNetWorth: {
    value: number;
    label: string;
  };

  variance: {
    value: number;          // actualNetWorth - plannedNetWorth
    percentage: number;     // (variance / plannedNetWorth) * 100
    label: string;
  };

  projectedFinalNetWorth: {
    value: number;
    condition: string;
    timelineStatus: {
      status: 'target-achievable' | 'at-risk' | 'unachievable';
      label: string;
      detail: string;
    };
  };

  performanceSummary: {
    status: 'ahead-of-plan' | 'on-plan' | 'behind-plan';
    message: string;
    percentage: number;
  };

  keyInsights: string[];
}
```

**Key Calculations**:

1. **Planned Net Worth at Current Time**:
   ```
   plannedValue = startingValue * (1 + expectedReturn)^elapsedYears
   ```

   With cash flows, use month-by-month simulation up to current date.

2. **Variance**:
   ```
   variance = actualNetWorth - plannedNetWorth
   variancePercentage = (variance / plannedNetWorth) * 100
   ```

3. **Performance Status**:
   ```
   If variancePercentage > +5%: AHEAD-OF-PLAN
   If variancePercentage < -5%: BEHIND-PLAN
   Else: ON-PLAN
   ```

4. **Projected Final Net Worth**:
   Use actual CAGR to project:
   ```
   projectedFinal = currentValue * (1 + actualCAGR)^remainingYears
   ```

#### 3. Milestone Tracking

**Concept**: Break down the journey from Point A to Point B into milestones (25%, 50%, 75%, 100%).

**Data Structure**:

```typescript
export interface MilestoneTrackerDto {
  overallProgress: {
    percentage: number;
    milestonesCompleted: number;
    milestonesRemaining: number;
    totalMilestones: number;
  };

  milestones: MilestoneDto[];

  summary: {
    nextMilestone: number;  // Next milestone percentage
    onTrack: number;        // Count of on-track milestones
    atRisk: number;         // Count of at-risk milestones
    behind: number;         // Count of behind milestones
  };
}

export interface MilestoneDto {
  milestonePercentage: number;     // 25, 50, 75, 100
  targetAmount: number;            // pointA + (pointB - pointA) * percentage
  currentProgress: number;         // 0-100
  currentValue: number;
  remaining: number;               // targetAmount - currentValue

  targetDate: string;              // When should this be achieved?
  projectedDate: string;           // When will it be achieved at current pace?
  achievedDate?: string;           // Actual achievement date

  status: 'achieved' | 'on-track' | 'at-risk' | 'behind';
  riskStatus?: string;
  daysEarly?: number;
  daysLate?: number;
}
```

**Key Calculations**:

1. **Milestone Target Amount**:
   ```
   milestoneAmount = pointA + (pointB - pointA) * (milestonePercentage / 100)
   ```

2. **Milestone Target Date**:
   ```
   milestoneDate = planStartDate + (totalTimeline * milestonePercentage / 100)
   ```

3. **Current Progress to Milestone**:
   ```
   progress = (currentValue / milestoneAmount) * 100
   ```

4. **Projected Achievement Date**:
   ```
   If currentValue >= milestoneAmount: ACHIEVED
   Else:
     remainingAmount = milestoneAmount - currentValue
     monthsNeeded = calculateMonthsNeeded(currentValue, milestoneAmount, actualCAGR)
     projectedDate = now + monthsNeeded
   ```

5. **Milestone Status**:
   ```
   If achieved: 'achieved'
   If projectedDate <= targetDate + buffer: 'on-track'
   If projectedDate > targetDate + buffer && < targetDate + 2*buffer: 'at-risk'
   Else: 'behind'
   ```

#### 4. Performance by Asset Class

**Concept**: Track how each asset class is performing relative to its target allocation and expected returns.

**Data Structure**:

```typescript
export interface PerformanceByAssetClassDto {
  assetClasses: AssetClassPerformanceDto[];
  totalPortfolioValue: number;
  overallYtdReturn: number;
  overallTotalReturn: number;
}

export interface AssetClassPerformanceDto {
  assetClassId: number;
  assetClassName: string;
  assetClassCode: string;

  currentAllocation: {
    percentage: number;
    value: number;
  };

  targetAllocation: {
    percentage: number;
  };

  driftFromTarget: {
    percentage: number;     // currentAllocation% - targetAllocation%
    direction: 'over' | 'under' | 'in-range';
  };

  contribution: number;  // Amount invested in this asset class

  returns: {
    ytd: number;           // Year-to-date return %
    total: number;         // Total return since plan start %
    sinceInception: number; // CAGR since plan start
  };

  benchmark?: {
    name: string;
    comparison: number;    // Difference from benchmark
    status: 'outperforming' | 'underperforming' | 'matching';
  };

  status: 'in-range' | 'slight-drift' | 'significant-drift';
}
```

**Key Calculations**:

1. **Current Allocation**:
   ```
   currentAllocationValue = sum of all holdings in asset class
   currentAllocationPercentage = (currentAllocationValue / totalPortfolioValue) * 100
   ```

2. **Drift from Target**:
   ```
   drift = currentAllocationPercentage - targetAllocationPercentage

   If abs(drift) <= 5%: 'in-range'
   If abs(drift) > 5% && <= 10%: 'slight-drift'
   If abs(drift) > 10%: 'significant-drift'
   ```

3. **Returns Calculation**:
   ```
   totalReturn = ((currentValue - contribution) / contribution) * 100

   CAGR = (currentValue / contribution)^(1 / yearsElapsed) - 1
   ```

#### 5. Rebalancing Alerts

**Concept**: Alert users when portfolio allocations drift significantly from targets.

**Data Structure**:

```typescript
export interface RebalancingAlertsDto {
  alerts: RebalancingAlertDto[];
  totalAdjustmentsNeeded: number;  // Total rupees to adjust
  assetClassesAffected: number;
  lastUpdated: string;
  planTimeline: number;
  status: 'ahead' | 'on-track' | 'behind';
}

export interface RebalancingAlertDto {
  assetClassId: number;
  assetClassName: string;
  assetClassCode: string;

  currentAllocation: {
    percentage: number;
    value: number;
  };

  targetAllocation: {
    percentage: number;
  };

  drift: {
    percentage: number;
    direction: 'overweight' | 'underweight';
  };

  suggestedAction: {
    action: string;        // e.g., "Reduce equity holdings"
    amountToAdjust: number; // Rupees to buy/sell
  };

  priority: 'high' | 'medium' | 'low';
}
```

**Key Calculations**:

1. **Amount to Adjust**:
   ```
   targetValue = totalPortfolioValue * targetAllocationPercentage / 100
   currentValue = currentAllocationValue

   amountToAdjust = targetValue - currentValue
   ```

2. **Priority**:
   ```
   If abs(drift) > 15%: 'high'
   If abs(drift) > 10%: 'medium'
   Else: 'low'
   ```

3. **Suggested Action**:
   ```
   If amountToAdjust > 0: "Buy ₹X worth of [AssetClass]"
   If amountToAdjust < 0: "Sell ₹X worth of [AssetClass]"
   ```

---

## Data Structures

### Core Entities

#### 1. Cash Flow

```typescript
export interface CashFlow {
  type: 'SIP' | 'Lumpsum' | 'SWP' | 'Withdrawal';
  amount: number;
  startYear: number;  // 1-based (Year 1, Year 2, etc.)
  endYear?: number;   // For SIP/SWP (optional, defaults to timeline)
}
```

**Examples**:
```typescript
// Monthly SIP of ₹10,000 from Year 1 to Year 10
{ type: 'SIP', amount: 10000, startYear: 1, endYear: 10 }

// Lumpsum of ₹5,00,000 at Year 3
{ type: 'Lumpsum', amount: 500000, startYear: 3 }

// Monthly SWP of ₹20,000 from Year 8 to Year 15
{ type: 'SWP', amount: 20000, startYear: 8, endYear: 15 }

// One-time withdrawal of ₹1,00,000 at Year 5
{ type: 'Withdrawal', amount: 100000, startYear: 5 }
```

#### 2. Allocation Entry

```typescript
export interface AllocationEntry {
  id?: number;
  allocationProfileId?: number;
  assetClassId: number;
  assetClassName?: string;
  allocationPercentage: number;  // 0-100
  returnRate?: number;           // Expected annual return %
}
```

**Example**:
```typescript
[
  { assetClassId: 1, assetClassName: 'Equity', allocationPercentage: 60, returnRate: 12 },
  { assetClassId: 2, assetClassName: 'Debt', allocationPercentage: 30, returnRate: 8 },
  { assetClassId: 3, assetClassName: 'Gold', allocationPercentage: 10, returnRate: 6 }
]
```

#### 3. Goal Planning

```typescript
export interface GoalPlanningDto {
  id: number;
  familyId: number;
  planName: string | null;
  description: string | null;

  // B2A inputs
  currentWealth: number | null;
  targetWealth: number | null;
  currentAge: number | null;
  desiredTimeline: number | null;

  // Cash flows
  cashFlows: CashFlow[] | null;

  // Returns and rates
  expectedAnnualReturn: number | null;
  expectedInflationRate: number | null;
  expectedTaxRate: number | null;

  // Calculated requirements
  annualContribution: number | null;
  monthlyContribution: number | null;

  allocationProfileId: number | null;
  createdAt: string;
  updatedAt: string;
}
```

#### 4. Plan (Complete)

```typescript
export interface FamilyPlanDto {
  allocationProfileId: number;
  planName: string | null;
  description: string | null;
  isActive: boolean;

  allocationProfile: AllocationProfileDto;
  goalPlanning: GoalPlanningDto | null;

  createdAt: string;
  updatedAt: string;
}
```

---

## Mathematical Formulas

### 1. Compound Growth

**Annual Compounding**:
```
FV = PV * (1 + r)^n
```

**Monthly Compounding**:
```
FV = PV * (1 + r/12)^(n*12)
```

### 2. Timeline Calculation

**Solve for n (years)**:
```
FV = PV * (1 + r)^n

Taking natural log both sides:
ln(FV) = ln(PV) + n * ln(1 + r)

Solving for n:
n = [ln(FV) - ln(PV)] / ln(1 + r)
n = ln(FV / PV) / ln(1 + r)
```

### 3. SIP Future Value

**Formula**:
```
FV = PMT × [(1 + r)^n - 1] / r
```

Where:
- PMT = Periodic payment (monthly or yearly)
- r = Periodic interest rate (monthly or yearly)
- n = Number of periods

**Solving for PMT**:
```
PMT = FV × r / [(1 + r)^n - 1]
```

### 4. Lumpsum Present Value

**Formula**:
```
PV = FV / (1 + r)^n
```

### 5. CAGR (Compound Annual Growth Rate)

**Formula**:
```
CAGR = (Ending Value / Beginning Value)^(1 / Number of Years) - 1
```

Example:
```
Beginning Value: ₹10,00,000
Ending Value: ₹15,00,000
Years: 3

CAGR = (15,00,000 / 10,00,000)^(1/3) - 1
     = (1.5)^(0.333) - 1
     = 1.1447 - 1
     = 0.1447
     = 14.47%
```

### 6. Weighted Return

**Formula**:
```
Weighted Return = Σ (Allocation% × Return%) / 100
```

Example:
```
Equity: 60% × 12% = 7.2%
Debt: 30% × 8% = 2.4%
Gold: 10% × 6% = 0.6%

Weighted Return = 7.2% + 2.4% + 0.6% = 10.2%
```

### 7. Variance Percentage

**Formula**:
```
Variance% = (Actual Value - Planned Value) / Planned Value × 100
```

### 8. Progress Percentage

**Formula**:
```
Progress% = (Current Value - Starting Value) / (Target Value - Starting Value) × 100
```

---

## Implementation Guide

### Step 1: Planning Phase (B2A)

1. **Collect Inputs**:
   ```typescript
   const inputs = {
     currentWealth: 1000000,      // ₹10 Lakhs
     targetWealth: 5000000,       // ₹50 Lakhs
     currentAge: 30,
     desiredTimeline: 15,         // 15 years
     riskProfile: 'moderate',
     allocations: [
       { assetClassId: 1, assetClassName: 'Equity', allocationPercentage: 60, returnRate: 12 },
       { assetClassId: 2, assetClassName: 'Debt', allocationPercentage: 40, returnRate: 8 }
     ],
     cashFlows: []
   };
   ```

2. **Calculate Natural Timeline**:
   ```typescript
   const naturalResult = calculateNaturalTimeline({
     currentWealth: inputs.currentWealth,
     targetWealth: inputs.targetWealth,
     riskProfile: inputs.riskProfile
   });

   console.log(`Natural Timeline: ${naturalResult.years} years`);
   // Output: Natural Timeline: 17 years (using 10% moderate return)
   ```

3. **Calculate Weighted Return**:
   ```typescript
   const weightedReturn = calculateWeightedReturn(inputs.allocations);
   console.log(`Weighted Return: ${weightedReturn}%`);
   // Output: Weighted Return: 10.4% (60% × 12% + 40% × 8%)
   ```

4. **Calculate Accelerated Timeline**:
   ```typescript
   const acceleratedTimeline = calculateTimelineWithReturn(
     inputs.currentWealth,
     inputs.targetWealth,
     weightedReturn
   );

   console.log(`Accelerated Timeline: ${acceleratedTimeline} years`);
   // Output: Accelerated Timeline: 16 years (slightly better than natural)
   ```

5. **Calculate Required Investments**:
   ```typescript
   const requirements = calculateAcceleratedRequirements({
     currentWealth: inputs.currentWealth,
     targetWealth: inputs.targetWealth,
     desiredTimeline: inputs.desiredTimeline,  // 15 years (user wants to finish early)
     annualReturn: weightedReturn,
     existingCashFlows: inputs.cashFlows
   });

   console.log(`Required Monthly SIP: ₹${requirements.requiredMonthlySIP}`);
   console.log(`Required Yearly SIP: ₹${requirements.requiredYearlySIP}`);
   console.log(`Required Lumpsum: ₹${requirements.requiredLumpsum}`);

   // Example Output:
   // Required Monthly SIP: ₹12,500
   // Required Yearly SIP: ₹1,65,000
   // Required Lumpsum: ₹8,50,000
   ```

6. **Generate Projections**:
   ```typescript
   const projections = calculateProjections({
     startingValue: inputs.currentWealth,
     timeline: inputs.desiredTimeline,
     expectedAnnualReturn: weightedReturn,
     cashFlows: [
       { type: 'SIP', amount: 12500, startYear: 1, endYear: 15 }
     ],
     optimisticBonus: 2,
     pessimisticPenalty: 2
   });

   console.log('Base Case Final Value:', projections.baseCase.finalValue);
   console.log('Optimistic Final Value:', projections.optimistic.finalValue);
   console.log('Pessimistic Final Value:', projections.pessimistic.finalValue);
   ```

### Step 2: Tracking Phase (A2B)

1. **Initialize Tracking** (when plan is activated):
   ```typescript
   const trackingInitData = {
     planStartDate: new Date().toISOString(),
     pointA: inputs.currentWealth,
     pointB: inputs.targetWealth,
     timeline: inputs.desiredTimeline,
     expectedReturn: weightedReturn,
     cashFlows: [
       { type: 'SIP', amount: 12500, startYear: 1, endYear: 15 }
     ]
   };

   await savePlanTracking(trackingInitData);
   ```

2. **Calculate A→B Progress** (periodic update):
   ```typescript
   async function updateABProgress(familyId: number) {
     // Get plan data
     const plan = await getActivePlan(familyId);
     const { currentWealth, targetWealth, desiredTimeline, planStartDate } = plan.goalPlanning;

     // Get current portfolio value from holdings
     const currentValue = await getCurrentPortfolioValue(familyId);

     // Calculate elapsed time
     const now = new Date();
     const startDate = new Date(planStartDate);
     const elapsedYears = (now.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

     // Calculate actual CAGR
     const actualCAGR = Math.pow(currentValue / currentWealth, 1 / elapsedYears) - 1;

     // Calculate progress
     const wealthGap = targetWealth - currentWealth;
     const wealthProgress = ((currentValue - currentWealth) / wealthGap) * 100;
     const timeProgress = (elapsedYears / desiredTimeline) * 100;

     // Project final value
     const remainingYears = desiredTimeline - elapsedYears;
     const projectedFinal = currentValue * Math.pow(1 + actualCAGR, remainingYears);

     // Determine status
     let overallStatus: string;
     if (wealthProgress >= timeProgress + 5) {
       overallStatus = 'ahead-of-schedule';
     } else if (wealthProgress <= timeProgress - 5) {
       overallStatus = 'behind-schedule';
     } else {
       overallStatus = 'on-schedule';
     }

     return {
       pointA: { value: currentWealth, label: 'Start', percentage: 0 },
       pointB: { value: targetWealth, label: 'Target', percentage: 100 },
       current: { value: currentValue, percentage: wealthProgress },
       progress: {
         wealthProgress: {
           percentage: wealthProgress,
           detail: `₹${(currentValue - currentWealth).toLocaleString('en-IN')} gained`
         },
         timeElapsed: {
           percentage: timeProgress,
           detail: `${elapsedYears.toFixed(1)} of ${desiredTimeline} years`
         },
         scheduleStatus: calculateScheduleStatus(wealthProgress, timeProgress)
       },
       projectedFinalNetWorth: projectedFinal,
       targetAchievement: projectedFinal >= targetWealth ? 'on-track' : 'behind',
       overallStatus,
       growthAnalysis: {
         expectedCAGR: plan.allocationProfile.overallReturnPercentage / 100,
         actualCAGR,
         performanceVsExpected: ((actualCAGR - plan.allocationProfile.overallReturnPercentage / 100) / (plan.allocationProfile.overallReturnPercentage / 100)) * 100
       }
     };
   }
   ```

3. **Calculate Variance**:
   ```typescript
   async function calculateVariance(familyId: number) {
     const plan = await getActivePlan(familyId);
     const currentValue = await getCurrentPortfolioValue(familyId);

     // Calculate planned value at current time
     const elapsedYears = getElapsedYears(plan.goalPlanning.planStartDate);
     const plannedValue = calculatePlannedValueAtTime(
       plan.goalPlanning.currentWealth,
       elapsedYears,
       plan.allocationProfile.overallReturnPercentage,
       plan.goalPlanning.cashFlows
     );

     // Calculate variance
     const variance = currentValue - plannedValue;
     const variancePercentage = (variance / plannedValue) * 100;

     return {
       actualNetWorth: { value: currentValue, label: 'Current' },
       plannedNetWorth: { value: plannedValue, label: 'Expected' },
       variance: {
         value: variance,
         percentage: variancePercentage,
         label: variance >= 0 ? 'Ahead' : 'Behind'
       },
       performanceSummary: {
         status: variancePercentage > 5 ? 'ahead-of-plan' : variancePercentage < -5 ? 'behind-plan' : 'on-plan',
         message: generateVarianceMessage(variancePercentage),
         percentage: variancePercentage
       }
     };
   }
   ```

4. **Track Milestones**:
   ```typescript
   async function trackMilestones(familyId: number) {
     const plan = await getActivePlan(familyId);
     const { currentWealth, targetWealth, desiredTimeline, planStartDate } = plan.goalPlanning;
     const currentValue = await getCurrentPortfolioValue(familyId);

     const milestonePercentages = [25, 50, 75, 100];
     const milestones: MilestoneDto[] = [];

     for (const percentage of milestonePercentages) {
       const targetAmount = currentWealth + (targetWealth - currentWealth) * percentage / 100;
       const targetDate = addYears(planStartDate, desiredTimeline * percentage / 100);

       const currentProgress = (currentValue / targetAmount) * 100;
       const remaining = Math.max(0, targetAmount - currentValue);

       let status: string;
       let projectedDate: Date;
       let achievedDate: Date | undefined;

       if (currentValue >= targetAmount) {
         status = 'achieved';
         achievedDate = new Date(); // In real implementation, track actual achievement date
         projectedDate = achievedDate;
       } else {
         // Project achievement date based on actual CAGR
         const actualCAGR = calculateActualCAGR(currentWealth, currentValue, getElapsedYears(planStartDate));
         projectedDate = projectAchievementDate(currentValue, targetAmount, actualCAGR);

         const daysUntilTarget = differenceInDays(targetDate, new Date());
         const daysUntilProjected = differenceInDays(projectedDate, new Date());

         if (daysUntilProjected <= daysUntilTarget) {
           status = 'on-track';
         } else if (daysUntilProjected <= daysUntilTarget * 1.1) {
           status = 'at-risk';
         } else {
           status = 'behind';
         }
       }

       milestones.push({
         milestonePercentage: percentage,
         targetAmount,
         currentProgress,
         currentValue,
         remaining,
         targetDate: targetDate.toISOString(),
         projectedDate: projectedDate.toISOString(),
         achievedDate: achievedDate?.toISOString(),
         status,
         daysEarly: status === 'achieved' ? differenceInDays(targetDate, achievedDate) : undefined,
         daysLate: status === 'behind' ? differenceInDays(projectedDate, targetDate) : undefined
       });
     }

     const completed = milestones.filter(m => m.status === 'achieved').length;
     const onTrack = milestones.filter(m => m.status === 'on-track').length;
     const atRisk = milestones.filter(m => m.status === 'at-risk').length;

     return {
       overallProgress: {
         percentage: (currentValue / targetWealth) * 100,
         milestonesCompleted: completed,
         milestonesRemaining: milestones.length - completed,
         totalMilestones: milestones.length
       },
       milestones,
       summary: {
         nextMilestone: milestones.find(m => m.status !== 'achieved')?.milestonePercentage || 100,
         onTrack,
         atRisk,
         behind: milestones.filter(m => m.status === 'behind').length
       }
     };
   }
   ```

### Step 3: Frontend Integration

#### Planning Phase Components

1. **Goal Summary Display**:
   - Shows Point A (current wealth) and Point B (target wealth)
   - Displays natural timeline vs. accelerated timeline
   - Progress bar showing current position

2. **Accelerated Plan Display**:
   - Shows required investments (Monthly SIP, Yearly SIP, Lumpsum)
   - Timeline comparison
   - Years saved vs. natural growth

3. **Allocation Display**:
   - Asset allocation pie chart
   - Expected returns by asset class
   - Weighted return calculation

#### Tracking Phase Components

1. **AB Progress Card**:
   - Line chart with two lines:
     - Blue dashed line: Planned trajectory (Point A → Point B)
     - Green solid line: Actual progress
   - Key metrics:
     - Wealth Progress %
     - Time Elapsed %
     - Schedule Status (days ahead/behind)
     - Projected Final Net Worth

2. **Variance Analysis Card**:
   - Actual vs. Planned comparison
   - Variance amount and percentage
   - Performance summary
   - Key insights

3. **Milestone Tracker**:
   - Overall progress bar
   - Individual milestone cards (25%, 50%, 75%, 100%)
   - Status badges (achieved, on-track, at-risk, behind)
   - Target dates vs. projected dates

4. **Performance Table**:
   - Asset class breakdown
   - Current vs. target allocation
   - Drift indicators
   - Returns (YTD, Total, CAGR)

5. **Rebalancing Alerts**:
   - Alert cards for drifted allocations
   - Suggested actions (buy/sell amounts)
   - Priority indicators

---

## API Endpoints

### Planning Endpoints

```
POST   /api/plans                              # Create new plan
GET    /api/plans?familyId={id}                # Get all family plans
GET    /api/plans/{id}                         # Get specific plan
PUT    /api/plans/{id}                         # Update plan
DELETE /api/plans/{id}                         # Delete plan
GET    /api/plans/allocation-comparison        # Compare allocations
```

### Tracking Endpoints

```
GET /api/plans/tracking/ab-progress?familyId={id}           # A→B Progress
GET /api/plans/tracking/variance?familyId={id}              # Variance Analysis
GET /api/plans/tracking/milestones?familyId={id}            # Milestone Tracker
GET /api/plans/tracking/performance?familyId={id}           # Performance by Asset Class
GET /api/plans/tracking/rebalancing?familyId={id}           # Rebalancing Alerts
```

---

## Testing Scenarios

### Scenario 1: Simple Growth (No Cash Flows)

**Inputs**:
- Current Wealth: ₹10,00,000
- Target Wealth: ₹50,00,000
- Risk Profile: Moderate (10%)
- Desired Timeline: 15 years

**Expected Results**:
- Natural Timeline: ~17 years
- Required Monthly SIP: ~₹12,500
- Projected Final Value (with SIP): ₹50,00,000+

### Scenario 2: With Existing SIP

**Inputs**:
- Current Wealth: ₹10,00,000
- Target Wealth: ₹50,00,000
- Desired Timeline: 15 years
- Existing Cash Flow: Monthly SIP of ₹5,000

**Expected Results**:
- Additional Required Monthly SIP: ~₹7,500
- Total Monthly SIP: ₹12,500

### Scenario 3: With Lumpsum

**Inputs**:
- Current Wealth: ₹10,00,000
- Target Wealth: ₹50,00,000
- Desired Timeline: 15 years
- Existing Cash Flow: Lumpsum of ₹5,00,000 at Year 3

**Expected Results**:
- Required Monthly SIP: Reduced from ₹12,500 to ~₹10,000

### Scenario 4: Tracking - Ahead of Schedule

**Inputs**:
- Plan Start: 3 years ago
- Starting Wealth: ₹10,00,000
- Target Wealth: ₹50,00,000
- Expected Timeline: 15 years
- Current Value: ₹18,00,000
- Expected Value at Year 3: ₹15,00,000

**Expected Results**:
- Variance: +₹3,00,000 (+20%)
- Status: Ahead of Schedule
- Wealth Progress: 20% (vs. expected 15%)
- Time Progress: 20%

### Scenario 5: Tracking - Behind Schedule

**Inputs**:
- Plan Start: 3 years ago
- Starting Wealth: ₹10,00,000
- Target Wealth: ₹50,00,000
- Expected Timeline: 15 years
- Current Value: ₹12,00,000
- Expected Value at Year 3: ₹15,00,000

**Expected Results**:
- Variance: -₹3,00,000 (-20%)
- Status: Behind Schedule
- Wealth Progress: 5% (vs. expected 12.5%)
- Time Progress: 20%
- Alert: User needs to increase contributions

---

## Key Edge Cases

1. **Already Achieved**: Current wealth >= Target wealth
   - Natural timeline = 0
   - No additional investments required

2. **Zero Current Wealth**:
   - Cannot calculate timeline (return infinity)
   - Cap at max timeline (80 years)

3. **Negative Returns**:
   - Handle gracefully, cap at 0% minimum

4. **Very Long Timelines**:
   - Cap at reasonable maximum (e.g., 80 years)

5. **Cash Flow Conflicts**:
   - SWP > Portfolio value: Set portfolio to 0, don't go negative

6. **Zero Return Rate**:
   - Use simple division instead of compound growth formulas
   - SIP calculation: `requiredSIP = remainingTarget / (timeline * 12)`

---

## Performance Optimization

1. **Cache Calculations**:
   - Cache natural timeline results (doesn't change often)
   - Cache projected values for common scenarios

2. **Incremental Updates**:
   - Only recalculate tracking metrics when portfolio changes
   - Use debouncing for real-time updates

3. **Database Indexes**:
   - Index on `familyId`, `allocationProfileId`, `isActive`
   - Index on plan start dates for tracking queries

4. **Batch Operations**:
   - Calculate all tracking metrics in single database query
   - Fetch portfolio holdings once, use for all calculations

---

## Summary

This B2A & A2B system provides a comprehensive financial planning and tracking solution:

- **B2A (Planning)**: Helps users define goals and calculate required investments to accelerate from current wealth to target wealth
- **A2B (Tracking)**: Monitors actual progress against planned trajectory, provides variance analysis, milestone tracking, and rebalancing alerts

The system uses sophisticated financial mathematics (compound interest, CAGR, SIP formulas) combined with month-by-month simulation to provide accurate projections and tracking. All calculations are consistent between planning and tracking phases, ensuring users can trust the system to guide them toward their financial goals.
