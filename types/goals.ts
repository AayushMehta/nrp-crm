// types/goals.ts
// Type definitions for financial goals

export type GoalType =
  | 'retirement'
  | 'education'
  | 'wealth_target'
  | 'home_purchase'
  | 'debt_free'
  | 'emergency_fund'
  | 'custom';

export type GoalStatus = 'on_track' | 'at_risk' | 'behind' | 'achieved' | 'not_started';

export interface FinancialGoal {
  id: string;
  family_id: string;

  // Goal details
  title: string;
  description?: string;
  type: GoalType;
  status: GoalStatus;

  // Financial targets
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;

  // Timeline
  target_date: string;
  start_date: string;

  // Progress tracking
  progress_percent: number;
  projected_completion_date?: string;
  is_achievable: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string;
}

export interface GoalStats {
  total_goals: number;
  by_status: Record<GoalStatus, number>;
  by_type: Record<GoalType, number>;
  total_target_amount: number;
  total_current_amount: number;
  overall_progress_percent: number;
}
