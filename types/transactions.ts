// types/transactions.ts
// Transaction tracking for portfolio activities

export type TransactionType =
  | 'buy'           // Purchase of securities
  | 'sell'          // Sale of securities
  | 'dividend'      // Dividend received
  | 'interest'      // Interest earned
  | 'deposit'       // Cash deposit
  | 'withdrawal';   // Cash withdrawal

export type TransactionStatus =
  | 'pending'       // Awaiting execution
  | 'completed'     // Successfully executed
  | 'failed'        // Failed to execute
  | 'cancelled';    // Cancelled by user

export interface Transaction {
  id: string;
  portfolio_id: string;
  family_id: string;
  family_name: string;
  type: TransactionType;
  security_name?: string;    // Only for buy/sell/dividend
  asset_class?: string;      // Only for buy/sell
  quantity?: number;         // Only for buy/sell
  price?: number;            // Only for buy/sell
  amount: number;            // Transaction amount in ₹
  date: string;              // YYYY-MM-DD
  status: TransactionStatus;
  notes?: string;
  created_at: string;        // ISO timestamp
}

export interface TransactionSummary {
  total_transactions: number;
  total_invested: number;    // Sum of buy + deposit
  total_withdrawn: number;   // Sum of sell + withdrawal
  total_income: number;      // Sum of dividend + interest
  net_cashflow: number;      // invested - withdrawn
}
