// lib/services/portfolio-service.ts
// Portfolio management service with CRUD operations and calculations

import { LocalStorageService } from '@/lib/storage/localStorage';
import type { Portfolio, Holding, AssetAllocation, AssetClass } from '@/types/portfolio';

const STORAGE_KEY_PORTFOLIOS = 'nrp_crm_portfolios';

export class PortfolioService {

  /**
   * Get portfolio for a specific family
   */
  static getPortfolioByFamily(familyId: string): Portfolio | null {
    const portfolios = this.getAllPortfolios();
    return portfolios.find(p => p.family_id === familyId) || null;
  }

  /**
   * Get all portfolios (Admin only)
   */
  static getAllPortfolios(): Portfolio[] {
    return LocalStorageService.get<Portfolio[]>(STORAGE_KEY_PORTFOLIOS, []);
  }

  /**
   * Calculate asset allocation breakdown from holdings
   */
  static calculateAssetAllocation(holdings: Holding[]): AssetAllocation[] {
    const allocationMap = new Map<AssetClass, AssetAllocation>();

    holdings.forEach(holding => {
      const existing = allocationMap.get(holding.asset_class);
      if (existing) {
        existing.value += holding.current_value;
        existing.count += 1;
      } else {
        allocationMap.set(holding.asset_class, {
          asset_class: holding.asset_class,
          value: holding.current_value,
          percentage: 0,
          count: 1,
        });
      }
    });

    const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0);
    const allocations = Array.from(allocationMap.values());

    // Calculate percentages
    allocations.forEach(allocation => {
      allocation.percentage = totalValue > 0
        ? (allocation.value / totalValue) * 100
        : 0;
    });

    return allocations.sort((a, b) => b.value - a.value);
  }

  /**
   * Calculate complete portfolio summary with all metrics
   */
  static calculatePortfolioSummary(portfolio: Portfolio): Portfolio {
    const totalValue = portfolio.holdings.reduce((sum, h) => sum + h.current_value, 0);
    const totalInvested = portfolio.holdings.reduce((sum, h) => sum + h.invested_value, 0);
    const totalGain = totalValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return {
      ...portfolio,
      total_value: totalValue,
      total_invested: totalInvested,
      total_gain: totalGain,
      total_gain_percent: totalGainPercent,
      asset_allocation: this.calculateAssetAllocation(portfolio.holdings),
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Save portfolio to localStorage
   */
  static savePortfolio(portfolio: Portfolio): void {
    const portfolios = this.getAllPortfolios();
    const index = portfolios.findIndex(p => p.id === portfolio.id);

    if (index >= 0) {
      portfolios[index] = portfolio;
    } else {
      portfolios.push(portfolio);
    }

    LocalStorageService.set(STORAGE_KEY_PORTFOLIOS, portfolios);
  }

  /**
   * Delete portfolio
   */
  static deletePortfolio(portfolioId: string): boolean {
    const portfolios = this.getAllPortfolios();
    const filtered = portfolios.filter(p => p.id !== portfolioId);

    if (filtered.length < portfolios.length) {
      LocalStorageService.set(STORAGE_KEY_PORTFOLIOS, filtered);
      return true;
    }

    return false;
  }

  /**
   * Add holding to portfolio
   */
  static addHolding(portfolioId: string, holding: Holding): Portfolio | null {
    const portfolio = this.getAllPortfolios().find(p => p.id === portfolioId);
    if (!portfolio) return null;

    portfolio.holdings.push(holding);
    const updated = this.calculatePortfolioSummary(portfolio);
    this.savePortfolio(updated);

    return updated;
  }

  /**
   * Update holding in portfolio
   */
  static updateHolding(portfolioId: string, holdingId: string, updates: Partial<Holding>): Portfolio | null {
    const portfolio = this.getAllPortfolios().find(p => p.id === portfolioId);
    if (!portfolio) return null;

    const holdingIndex = portfolio.holdings.findIndex(h => h.id === holdingId);
    if (holdingIndex === -1) return null;

    portfolio.holdings[holdingIndex] = { ...portfolio.holdings[holdingIndex], ...updates };
    const updated = this.calculatePortfolioSummary(portfolio);
    this.savePortfolio(updated);

    return updated;
  }

  /**
   * Remove holding from portfolio
   */
  static removeHolding(portfolioId: string, holdingId: string): Portfolio | null {
    const portfolio = this.getAllPortfolios().find(p => p.id === portfolioId);
    if (!portfolio) return null;

    portfolio.holdings = portfolio.holdings.filter(h => h.id !== holdingId);
    const updated = this.calculatePortfolioSummary(portfolio);
    this.savePortfolio(updated);

    return updated;
  }

  /**
   * Get historical portfolio values (mock data for charts)
   * In production, would query actual snapshots from database
   */
  static getHistoricalValues(familyId: string, months: number = 12): Array<{ month: string; invested: number; current: number }> {
    const portfolio = this.getPortfolioByFamily(familyId);
    if (!portfolio) return [];

    const currentValue = portfolio.total_value;
    const investedValue = portfolio.total_invested;
    const data = [];
    const now = new Date();

    // Generate historical data with realistic growth trend
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Simulate historical values with growth trend + volatility
      const growthFactor = (months - i) / months;
      const volatility = (Math.random() - 0.5) * 0.08; // ±4% variation

      const historicalCurrent = currentValue * (0.75 + 0.25 * growthFactor + volatility);
      const historicalInvested = investedValue * (0.9 + 0.1 * growthFactor); // Gradual increase in invested capital

      data.push({
        month: monthName,
        invested: Math.round(historicalInvested),
        current: Math.round(historicalCurrent),
      });
    }

    return data;
  }

  /**
   * Get top performing holdings for charts
   */
  static getTopHoldings(familyId: string, limit: number = 5): Array<{ name: string; gainPercent: number }> {
    const portfolio = this.getPortfolioByFamily(familyId);
    if (!portfolio) return [];

    return portfolio.holdings
      .map(h => ({
        name: h.security_name.length > 20 ? h.security_name.substring(0, 20) + '...' : h.security_name,
        gainPercent: h.invested_value > 0 ? ((h.current_value - h.invested_value) / h.invested_value) * 100 : 0,
      }))
      .sort((a, b) => b.gainPercent - a.gainPercent)
      .slice(0, limit);
  }
}
