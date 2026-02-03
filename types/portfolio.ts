// types/portfolio.ts
// Portfolio and holdings data structures for wealth management

export type AssetClass =
  | 'equity'
  | 'debt'
  | 'mutual_fund'
  | 'gold'
  | 'real_estate'
  | 'cash'
  | 'alternative';

export interface Holding {
  id: string;
  portfolio_id: string;
  security_name: string;
  asset_class: AssetClass;
  quantity: number;
  avg_cost: number;               // Average purchase price
  current_price: number;          // Latest market price
  current_value: number;          // quantity * current_price
  invested_value: number;         // quantity * avg_cost
  unrealized_gain: number;        // current_value - invested_value
  unrealized_gain_percent: number; // (unrealized_gain / invested_value) * 100
  purchase_date?: string;         // YYYY-MM-DD
}

export interface AssetAllocation {
  asset_class: AssetClass;
  value: number;                  // Total value in this asset class
  percentage: number;             // Percentage of total portfolio
  count: number;                  // Number of holdings in this class
}

export interface Portfolio {
  id: string;
  family_id: string;
  family_name: string;
  total_value: number;            // Sum of all holding current values
  total_invested: number;         // Sum of all invested values
  total_gain: number;             // total_value - total_invested
  total_gain_percent: number;     // (total_gain / total_invested) * 100
  holdings: Holding[];
  asset_allocation: AssetAllocation[];
  last_updated: string;           // ISO timestamp
}
