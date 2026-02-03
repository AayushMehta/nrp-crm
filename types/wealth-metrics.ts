// types/wealth-metrics.ts
// Wealth management analytics and metrics

export type ClientTier = 'tier_1' | 'tier_2' | 'tier_3' | 'prospect';
// tier_1: >5 Crores AUM
// tier_2: 2-5 Crores AUM
// tier_3: <2 Crores AUM
// prospect: Not yet invested

export type RiskProfile =
  | 'conservative'      // 20% equity, 80% debt
  | 'moderate'          // 40% equity, 60% debt
  | 'balanced'          // 60% equity, 40% debt
  | 'aggressive'        // 80% equity, 20% debt
  | 'very_aggressive';  // 95% equity, 5% debt

export interface AUMMetrics {
  total_aum: number;                              // Total Assets Under Management
  aum_by_tier: Record<ClientTier, number>;        // AUM distribution by tier
  month_over_month_change: number;                // Absolute change from last month
  month_over_month_percent: number;               // Percentage change
  client_count: number;                           // Number of active clients
}

export interface PerformanceMetrics {
  returns_1m: number;      // 1 month returns (%)
  returns_3m: number;      // 3 month returns (%)
  returns_6m: number;      // 6 month returns (%)
  returns_1y: number;      // 1 year returns (%)
  xirr: number;            // Extended Internal Rate of Return (annualized %)
  benchmark_1y?: number;   // Benchmark index 1Y return (%)
  outperformance?: number; // Portfolio return - Benchmark return
}

export interface RevenueMetrics {
  total_fees: number;      // Total fees collected
  fees_by_service: {
    nrp_light: number;     // Fees from NRP Light clients
    nrp_360: number;       // Fees from NRP 360 clients
  };
  month_over_month_change: number;  // Absolute fee change
}

export interface RiskAssessment {
  id: string;
  family_id: string;
  risk_profile: RiskProfile;
  risk_score: number;              // 1-100 score
  last_review_date: string;        // YYYY-MM-DD
  next_review_date: string;        // YYYY-MM-DD
  is_overdue: boolean;             // true if past next_review_date
}

export interface ClientWealthSummary {
  family_id: string;
  family_name: string;
  aum: number;
  tier: ClientTier;
  risk_profile: RiskProfile;
  service_type: 'nrp_light' | 'nrp_360';
  returns_1y: number;
  next_review_date: string;
  review_status: 'current' | 'due_soon' | 'overdue';
  assigned_rm_id?: string;
  assigned_rm_name?: string;
}

export interface ChartDataPoint {
  date: string;          // YYYY-MM-DD
  value: number;
  label?: string;
}
