// types/b2a.ts
// Type definitions for B2A (Before to After) financial planning system

// ─── Risk Profiles ──────────────────────────────────────────────
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive' | 'veryAggressive';

export const RISK_PROFILE_RETURNS: Record<RiskProfile, number> = {
  conservative: 8,
  moderate: 10,
  aggressive: 12,
  veryAggressive: 14,
};

export const RISK_PROFILE_LABELS: Record<RiskProfile, string> = {
  conservative: 'Conservative',
  moderate: 'Moderate',
  aggressive: 'Aggressive',
  veryAggressive: 'Very Aggressive',
};

// ─── Cash Flows ─────────────────────────────────────────────────
export type CashFlowType = 'SIP' | 'Lumpsum' | 'SWP' | 'Withdrawal';

export interface CashFlow {
  id: string;
  type: CashFlowType;
  amount: number;
  startYear: number;  // 1-based
  endYear?: number;   // For SIP/SWP
}

// ─── Allocation ─────────────────────────────────────────────────
export interface AllocationEntry {
  id: string;
  assetClassId: number;
  assetClassName: string;
  allocationPercentage: number; // 0-100
  returnRate: number;           // Expected annual return %
  color: string;                // For chart display
}

// ─── Calculation Results ────────────────────────────────────────
export interface NaturalTimelineResult {
  years: number;
  annualReturn: number;
  projectedValue: number;
  isAlreadyAchieved: boolean;
}

export interface AcceleratedRequirementsResult {
  requiredMonthlySIP: number;
  requiredYearlySIP: number;
  requiredLumpsum: number;
  projectedValueWithCashFlows: number;
  remainingTarget: number;
  isAchievableWithCashFlows: boolean;
}

// ─── Projections ────────────────────────────────────────────────
export interface ProjectionPoint {
  year: number;
  value: number;
}

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

// ─── Plan State ─────────────────────────────────────────────────
export type B2APlanMode = 'vision' | 'play';

export interface B2APlanState {
  mode: B2APlanMode;

  // Core inputs
  currentWealth: number;
  targetWealth: number;
  currentAge: number;
  riskProfile: RiskProfile;

  // Allocations & cash flows
  allocations: AllocationEntry[];
  cashFlows: CashFlow[];

  // User-desired timeline override (years)
  desiredTimeline: number | null;

  // Calculated outputs (derived, not stored)
  naturalTimeline: NaturalTimelineResult | null;
  acceleratedTimeline: number | null;
  weightedReturn: number;
  requirements: AcceleratedRequirementsResult | null;
  projections: Projections | null;

  // Persistence
  isSaved: boolean;
  lastSavedAt: string | null;
}
