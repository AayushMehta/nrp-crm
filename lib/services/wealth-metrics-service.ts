// lib/services/wealth-metrics-service.ts
// Wealth analytics and metrics calculations

import { PortfolioService } from './portfolio-service';
import { LocalStorageService } from '@/lib/storage/localStorage';
import type {
  AUMMetrics,
  ClientWealthSummary,
  RiskAssessment,
  ClientTier,
  PerformanceMetrics,
  RevenueMetrics
} from '@/types/wealth-metrics';
import type { Portfolio } from '@/types/portfolio';
import { parseISO, isAfter, differenceInDays } from 'date-fns';

const STORAGE_KEY_RISK = 'nrp_crm_risk_assessments';

export class WealthMetricsService {

  /**
   * Calculate system-wide AUM metrics
   */
  static calculateSystemAUM(): AUMMetrics {
    const portfolios = PortfolioService.getAllPortfolios();

    const totalAUM = portfolios.reduce((sum, p) => sum + p.total_value, 0);

    const aumByTier: Record<ClientTier, number> = {
      tier_1: 0,
      tier_2: 0,
      tier_3: 0,
      prospect: 0,
    };

    portfolios.forEach(portfolio => {
      const tier = this.determineTier(portfolio.total_value);
      aumByTier[tier] += portfolio.total_value;
    });

    // Mock MoM change (in real app, would compare with last month's snapshot)
    const momChange = totalAUM * 0.025; // 2.5% growth
    const momPercent = 2.5;

    return {
      total_aum: totalAUM,
      aum_by_tier: aumByTier,
      month_over_month_change: momChange,
      month_over_month_percent: momPercent,
      client_count: portfolios.length,
    };
  }

  /**
   * Calculate RM-specific AUM metrics
   */
  static calculateRMAUM(rmId: string, familyIds: string[]): AUMMetrics {
    const allPortfolios = PortfolioService.getAllPortfolios();
    const rmPortfolios = allPortfolios.filter(p => familyIds.includes(p.family_id));

    const totalAUM = rmPortfolios.reduce((sum, p) => sum + p.total_value, 0);

    const aumByTier: Record<ClientTier, number> = {
      tier_1: 0,
      tier_2: 0,
      tier_3: 0,
      prospect: 0,
    };

    rmPortfolios.forEach(portfolio => {
      const tier = this.determineTier(portfolio.total_value);
      aumByTier[tier] += portfolio.total_value;
    });

    const momChange = totalAUM * 0.03; // 3% growth
    const momPercent = 3.0;

    return {
      total_aum: totalAUM,
      aum_by_tier: aumByTier,
      month_over_month_change: momChange,
      month_over_month_percent: momPercent,
      client_count: rmPortfolios.length,
    };
  }

  /**
   * Get client wealth summaries for given families
   */
  static getClientSummaries(familyIds: string[]): ClientWealthSummary[] {
    const portfolios = PortfolioService.getAllPortfolios();
    const riskAssessments = this.getAllRiskAssessments();

    return portfolios
      .filter(p => familyIds.includes(p.family_id))
      .map(portfolio => {
        const risk = riskAssessments.find(r => r.family_id === portfolio.family_id);
        const tier = this.determineTier(portfolio.total_value);

        return {
          family_id: portfolio.family_id,
          family_name: portfolio.family_name,
          aum: portfolio.total_value,
          tier,
          risk_profile: risk?.risk_profile || 'balanced',
          service_type: tier === 'tier_3' ? 'nrp_light' : 'nrp_360',
          returns_1y: portfolio.total_gain_percent,
          next_review_date: risk?.next_review_date || '',
          review_status: this.getReviewStatus(risk),
          assigned_rm_id: undefined,
          assigned_rm_name: undefined,
        };
      });
  }

  /**
   * Determine client tier based on AUM
   */
  static determineTier(aum: number): ClientTier {
    if (aum >= 50000000) return 'tier_1';      // ₹5 Cr+
    if (aum >= 20000000) return 'tier_2';      // ₹2-5 Cr
    if (aum > 0) return 'tier_3';              // < ₹2 Cr
    return 'prospect';
  }

  /**
   * Get risk assessment for a family
   */
  static getRiskAssessment(familyId: string): RiskAssessment | null {
    const assessments = this.getAllRiskAssessments();
    return assessments.find(a => a.family_id === familyId) || null;
  }

  /**
   * Get all risk assessments
   */
  static getAllRiskAssessments(): RiskAssessment[] {
    return LocalStorageService.get<RiskAssessment[]>(STORAGE_KEY_RISK, []);
  }

  /**
   * Save risk assessment
   */
  static saveRiskAssessment(assessment: RiskAssessment): void {
    const assessments = this.getAllRiskAssessments();
    const index = assessments.findIndex(a => a.id === assessment.id);

    // Update is_overdue based on dates
    const today = new Date();
    const nextReview = parseISO(assessment.next_review_date);
    assessment.is_overdue = isAfter(today, nextReview);

    if (index >= 0) {
      assessments[index] = assessment;
    } else {
      assessments.push(assessment);
    }

    LocalStorageService.set(STORAGE_KEY_RISK, assessments);
  }

  /**
   * Calculate average returns across portfolios
   */
  static calculateAverageReturns(familyIds: string[]): number {
    const portfolios = PortfolioService.getAllPortfolios();
    const filtered = portfolios.filter(p => familyIds.includes(p.family_id));

    if (filtered.length === 0) return 0;

    const totalReturns = filtered.reduce((sum, p) => sum + p.total_gain_percent, 0);
    return totalReturns / filtered.length;
  }

  /**
   * Get count of overdue risk reviews
   */
  static getOverdueReviewCount(familyIds: string[]): number {
    const assessments = this.getAllRiskAssessments();
    return assessments.filter(a =>
      familyIds.includes(a.family_id) && a.is_overdue
    ).length;
  }

  /**
   * Calculate revenue metrics
   */
  static calculateRevenueMetrics(familyIds?: string[]): RevenueMetrics {
    const portfolios = familyIds
      ? PortfolioService.getAllPortfolios().filter(p => familyIds.includes(p.family_id))
      : PortfolioService.getAllPortfolios();

    const riskAssessments = this.getAllRiskAssessments();

    let nrpLightFees = 0;
    let nrp360Fees = 0;

    portfolios.forEach(portfolio => {
      const tier = this.determineTier(portfolio.total_value);
      const serviceType = tier === 'tier_3' ? 'nrp_light' : 'nrp_360';

      // Mock fee calculation: 1% of AUM annually (simplified)
      const annualFee = portfolio.total_value * 0.01;
      const monthlyFee = annualFee / 12;

      if (serviceType === 'nrp_light') {
        nrpLightFees += monthlyFee;
      } else {
        nrp360Fees += monthlyFee;
      }
    });

    const totalFees = nrpLightFees + nrp360Fees;
    const momChange = totalFees * 0.02; // 2% growth

    return {
      total_fees: totalFees,
      fees_by_service: {
        nrp_light: nrpLightFees,
        nrp_360: nrp360Fees,
      },
      month_over_month_change: momChange,
    };
  }

  /**
   * Get historical AUM snapshots (mock data for charts)
   * In production, this would query actual monthly snapshots from database
   */
  static getHistoricalAUM(months: number = 12, familyIds?: string[]): Array<{ month: string; value: number }> {
    const currentMetrics = familyIds
      ? this.calculateRMAUM('', familyIds)
      : this.calculateSystemAUM();

    const currentAUM = currentMetrics.total_aum;
    const data = [];
    const now = new Date();

    // Generate historical data with realistic growth trend
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Simulate historical values with growth trend + some volatility
      const growthFactor = (months - i) / months; // Linear growth from past to present
      const volatility = (Math.random() - 0.5) * 0.1; // ±5% random variation
      const historicalValue = currentAUM * (0.8 + 0.2 * growthFactor + volatility);

      data.push({
        month: monthName,
        value: Math.round(historicalValue),
      });
    }

    return data;
  }

  /**
   * Get AUM distribution by tier for charts
   */
  static getAUMByTierForChart(): Array<{ name: string; value: number; tier: ClientTier }> {
    const metrics = this.calculateSystemAUM();

    return [
      { name: 'Tier 1 (>₹5Cr)', value: metrics.aum_by_tier.tier_1, tier: 'tier_1' as ClientTier },
      { name: 'Tier 2 (₹2-5Cr)', value: metrics.aum_by_tier.tier_2, tier: 'tier_2' as ClientTier },
      { name: 'Tier 3 (<₹2Cr)', value: metrics.aum_by_tier.tier_3, tier: 'tier_3' as ClientTier },
      { name: 'Prospects', value: metrics.aum_by_tier.prospect, tier: 'prospect' as ClientTier },
    ].filter(item => item.value > 0); // Only show tiers with AUM
  }

  /**
   * Get revenue breakdown by service type for charts
   */
  static getRevenueByServiceForChart(): Array<{ name: string; value: number; percentage: number }> {
    const revenue = this.calculateRevenueMetrics();
    const total = revenue.total_fees;

    return [
      {
        name: 'NRP 360',
        value: revenue.fees_by_service.nrp_360,
        percentage: (revenue.fees_by_service.nrp_360 / total) * 100,
      },
      {
        name: 'NRP Light',
        value: revenue.fees_by_service.nrp_light,
        percentage: (revenue.fees_by_service.nrp_light / total) * 100,
      },
    ];
  }

  /**
   * Get client status summary for dashboard widgets
   */
  static getClientStatusSummary(familyIds?: string[]): {
    onboarding_pending: number;
    compliance_overdue: number;
    meetings_this_month: number;
    documents_pending: number;
  } {
    const assessments = familyIds
      ? this.getAllRiskAssessments().filter(a => familyIds.includes(a.family_id))
      : this.getAllRiskAssessments();

    // Mock values - in production, integrate with actual services
    return {
      onboarding_pending: 3,
      compliance_overdue: assessments.filter(a => a.is_overdue).length,
      meetings_this_month: 12,
      documents_pending: 5,
    };
  }

  /**
   * Determine review status from risk assessment
   */
  private static getReviewStatus(risk: RiskAssessment | undefined): 'current' | 'due_soon' | 'overdue' {
    if (!risk) return 'overdue';

    const today = new Date();
    const nextReview = parseISO(risk.next_review_date);

    if (risk.is_overdue || isAfter(today, nextReview)) {
      return 'overdue';
    }

    const daysUntil = differenceInDays(nextReview, today);
    if (daysUntil <= 30) {
      return 'due_soon';
    }

    return 'current';
  }
}
