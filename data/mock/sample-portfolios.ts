// data/mock/sample-portfolios.ts
// Generate realistic sample portfolio data for wealth management CRM

import { PortfolioService } from '@/lib/services/portfolio-service';
import { WealthMetricsService } from '@/lib/services/wealth-metrics-service';
import { TransactionService } from '@/lib/services/transaction-service';
import type { Portfolio, Holding, AssetClass } from '@/types/portfolio';
import type { Transaction, TransactionType } from '@/types/transactions';
import type { RiskAssessment, RiskProfile, ClientTier } from '@/types/wealth-metrics';

/**
 * Generate sample holdings based on tier
 */
export function generateSampleHoldings(portfolioId: string, familyId: string, tier: ClientTier): Holding[] {
  const baseHoldings: Array<{
    security_name: string;
    asset_class: AssetClass;
    quantity_base: number;
    avg_cost: number;
    current_price: number;
  }> = [
    // Equities
    { security_name: 'Reliance Industries Ltd', asset_class: 'equity', quantity_base: 100, avg_cost: 2450, current_price: 2850 },
    { security_name: 'HDFC Bank Ltd', asset_class: 'equity', quantity_base: 150, avg_cost: 1580, current_price: 1650 },
    { security_name: 'Infosys Ltd', asset_class: 'equity', quantity_base: 80, avg_cost: 1420, current_price: 1580 },
    { security_name: 'TCS Ltd', asset_class: 'equity', quantity_base: 50, avg_cost: 3200, current_price: 3650 },
    // Mutual Funds
    { security_name: 'ICICI Pru Bluechip Fund', asset_class: 'mutual_fund', quantity_base: 5000, avg_cost: 85.50, current_price: 92.30 },
    { security_name: 'Axis Long Term Equity Fund', asset_class: 'mutual_fund', quantity_base: 3000, avg_cost: 65.20, current_price: 72.80 },
    { security_name: 'SBI Large Cap Fund', asset_class: 'mutual_fund', quantity_base: 4000, avg_cost: 52.30, current_price: 58.90 },
    // Debt
    { security_name: 'HDFC Bank FD (3Y)', asset_class: 'debt', quantity_base: 1, avg_cost: 500000, current_price: 535000 },
    { security_name: '10Y Govt Bonds', asset_class: 'debt', quantity_base: 100, avg_cost: 1020, current_price: 1045 },
    { security_name: 'ICICI Liquid Fund', asset_class: 'debt', quantity_base: 15000, avg_cost: 98.50, current_price: 101.20 },
    // Gold
    { security_name: 'SBI Gold ETF', asset_class: 'gold', quantity_base: 500, avg_cost: 65.00, current_price: 70.50 },
    { security_name: 'Physical Gold (10g)', asset_class: 'gold', quantity_base: 50, avg_cost: 5800, current_price: 6200 },
    // Cash/Liquid
    { security_name: 'Savings Account', asset_class: 'cash', quantity_base: 1, avg_cost: 250000, current_price: 252000 },
  ];

  // Scale quantities based on tier
  const tierMultiplier = tier === 'tier_1' ? 40 : tier === 'tier_2' ? 15 : 1;

  const holdings: Holding[] = baseHoldings.map((base, index) => {
    const quantity = base.quantity_base * tierMultiplier;
    const invested_value = quantity * base.avg_cost;
    const current_value = quantity * base.current_price;
    const unrealized_gain = current_value - invested_value;
    const unrealized_gain_percent = (unrealized_gain / invested_value) * 100;

    return {
      id: `holding-${portfolioId}-${index + 1}`,
      portfolio_id: portfolioId,
      security_name: base.security_name,
      asset_class: base.asset_class,
      quantity,
      avg_cost: base.avg_cost,
      current_price: base.current_price,
      current_value,
      invested_value,
      unrealized_gain,
      unrealized_gain_percent,
      purchase_date: getPastDate(Math.floor(Math.random() * 365) + 180), // 6-18 months ago
    };
  });

  return holdings;
}

/**
 * Generate complete sample portfolio
 */
export function generateSamplePortfolio(
  familyId: string,
  familyName: string,
  tier: ClientTier
): Portfolio {
  const portfolioId = `portfolio-${familyId}`;
  const holdings = generateSampleHoldings(portfolioId, familyId, tier);

  const portfolio: Portfolio = {
    id: portfolioId,
    family_id: familyId,
    family_name: familyName,
    total_value: 0,
    total_invested: 0,
    total_gain: 0,
    total_gain_percent: 0,
    holdings,
    asset_allocation: [],
    last_updated: new Date().toISOString(),
  };

  // Calculate summary using service
  return PortfolioService.calculatePortfolioSummary(portfolio);
}

/**
 * Generate sample transactions for a portfolio
 */
export function generateSampleTransactions(
  portfolioId: string,
  familyId: string,
  familyName: string
): Transaction[] {
  const transactionTemplates: Array<{
    type: TransactionType;
    security_name?: string;
    asset_class?: string;
    amount_base: number;
  }> = [
    // Buys
    { type: 'buy', security_name: 'Reliance Industries Ltd', asset_class: 'equity', amount_base: 285000 },
    { type: 'buy', security_name: 'ICICI Pru Bluechip Fund', asset_class: 'mutual_fund', amount_base: 461500 },
    { type: 'buy', security_name: 'HDFC Bank FD (3Y)', asset_class: 'debt', amount_base: 500000 },
    // Sells
    { type: 'sell', security_name: 'Infosys Ltd', asset_class: 'equity', amount_base: 126400 },
    // Dividends
    { type: 'dividend', security_name: 'Reliance Industries Ltd', amount_base: 8500 },
    { type: 'dividend', security_name: 'HDFC Bank Ltd', amount_base: 4200 },
    // Interest
    { type: 'interest', security_name: 'HDFC Bank FD (3Y)', amount_base: 35000 },
    { type: 'interest', security_name: 'ICICI Liquid Fund', amount_base: 2500 },
    // Deposits/Withdrawals
    { type: 'deposit', amount_base: 500000 },
    { type: 'withdrawal', amount_base: 150000 },
  ];

  const transactions: Transaction[] = transactionTemplates.map((template, index) => {
    const daysAgo = Math.floor(Math.random() * 150) + 10; // 10-160 days ago
    const date = getPastDate(daysAgo);

    return {
      id: `txn-${portfolioId}-${index + 1}`,
      portfolio_id: portfolioId,
      family_id: familyId,
      family_name: familyName,
      type: template.type,
      security_name: template.security_name,
      asset_class: template.asset_class,
      quantity: template.type === 'buy' || template.type === 'sell' ? Math.floor(Math.random() * 100) + 10 : undefined,
      price: template.type === 'buy' || template.type === 'sell' ? Math.floor(Math.random() * 2000) + 500 : undefined,
      amount: template.amount_base + Math.floor(Math.random() * 50000),
      date,
      status: 'completed',
      notes: template.type === 'dividend' ? 'Quarterly dividend' : undefined,
      created_at: new Date(date).toISOString(),
    };
  });

  return transactions;
}

/**
 * Generate sample risk assessment
 */
export function generateSampleRiskAssessment(
  familyId: string,
  riskProfile: RiskProfile,
  isOverdue: boolean = false
): RiskAssessment {
  const lastReviewDate = getPastDate(isOverdue ? 400 : 120); // 13 months or 4 months ago
  const nextReviewDate = getFutureDate(isOverdue ? -30 : 240); // 30 days ago or 8 months ahead

  const riskScores: Record<RiskProfile, number> = {
    conservative: 25,
    moderate: 40,
    balanced: 55,
    aggressive: 75,
    very_aggressive: 90,
  };

  return {
    id: `risk-${familyId}`,
    family_id: familyId,
    risk_profile: riskProfile,
    risk_score: riskScores[riskProfile] + Math.floor(Math.random() * 10) - 5,
    last_review_date: lastReviewDate,
    next_review_date: nextReviewDate,
    is_overdue: isOverdue,
  };
}

/**
 * Initialize all sample portfolios
 */
export function initializeSamplePortfolios() {
  console.log('🔄 Initializing sample portfolio data...');

  // Check if already initialized
  const existing = PortfolioService.getAllPortfolios();
  if (existing.length > 0) {
    console.log('✅ Sample portfolios already exist, skipping initialization');
    return;
  }

  // Generate portfolios for 3 sample families
  const families = [
    { id: 'family-001', name: 'Sharma Family', tier: 'tier_1' as ClientTier, risk: 'balanced' as RiskProfile, isOverdue: false },
    { id: 'family-002', name: 'Patel Family', tier: 'tier_2' as ClientTier, risk: 'moderate' as RiskProfile, isOverdue: false },
    { id: 'family-003', name: 'Kumar Family', tier: 'tier_3' as ClientTier, risk: 'conservative' as RiskProfile, isOverdue: true },
  ];

  families.forEach(family => {
    // Generate and save portfolio
    const portfolio = generateSamplePortfolio(family.id, family.name, family.tier);
    PortfolioService.savePortfolio(portfolio);
    console.log(`✅ Created portfolio for ${family.name}: ₹${(portfolio.total_value / 10000000).toFixed(2)}Cr AUM`);

    // Generate and save transactions
    const transactions = generateSampleTransactions(portfolio.id, family.id, family.name);
    transactions.forEach(txn => {
      TransactionService.createTransaction({
        portfolio_id: txn.portfolio_id,
        family_id: txn.family_id,
        family_name: txn.family_name,
        type: txn.type,
        security_name: txn.security_name,
        asset_class: txn.asset_class,
        quantity: txn.quantity,
        price: txn.price,
        amount: txn.amount,
        date: txn.date,
        status: txn.status,
        notes: txn.notes,
      });
    });
    console.log(`✅ Created ${transactions.length} transactions for ${family.name}`);

    // Generate and save risk assessment
    const riskAssessment = generateSampleRiskAssessment(family.id, family.risk, family.isOverdue);
    WealthMetricsService.saveRiskAssessment(riskAssessment);
    console.log(`✅ Created risk assessment for ${family.name}: ${family.risk} (${family.isOverdue ? 'OVERDUE' : 'Current'})`);
  });

  // Display summary
  const systemMetrics = WealthMetricsService.calculateSystemAUM();
  console.log('\n📊 System Summary:');
  console.log(`   Total AUM: ₹${(systemMetrics.total_aum / 10000000).toFixed(2)}Cr`);
  console.log(`   Tier 1 (>5Cr): ₹${(systemMetrics.aum_by_tier.tier_1 / 10000000).toFixed(2)}Cr`);
  console.log(`   Tier 2 (2-5Cr): ₹${(systemMetrics.aum_by_tier.tier_2 / 10000000).toFixed(2)}Cr`);
  console.log(`   Tier 3 (<2Cr): ₹${(systemMetrics.aum_by_tier.tier_3 / 10000000).toFixed(2)}Cr`);
  console.log(`   Active Clients: ${systemMetrics.client_count}`);
  console.log('\n✅ Sample portfolio data initialized successfully!\n');
}

/**
 * Helper: Get date in the past (YYYY-MM-DD format)
 */
function getPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Helper: Get date in the future (YYYY-MM-DD format)
 */
function getFutureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}
