// lib/services/goals-service.ts
// Business logic for financial goals management

import { FinancialGoal, GoalStats, GoalStatus } from "@/types/goals";
import { LocalStorageService } from "@/lib/storage/localStorage";

const STORAGE_KEY = "nrp_crm_goals";

export class GoalsService {
  /**
   * Get all goals
   */
  static getAll(): FinancialGoal[] {
    return LocalStorageService.get<FinancialGoal[]>(STORAGE_KEY, []);
  }

  /**
   * Get goals by family
   */
  static getByFamily(familyId: string): FinancialGoal[] {
    return this.getAll().filter((g) => g.family_id === familyId);
  }

  /**
   * Get goal by ID
   */
  static getById(id: string): FinancialGoal | null {
    return this.getAll().find((g) => g.id === id) || null;
  }

  /**
   * Create a new goal
   */
  static create(
    goal: Omit<FinancialGoal, "id" | "created_at" | "updated_at">
  ): FinancialGoal {
    const progress = this.calculateProgress(
      goal.current_amount,
      goal.target_amount
    );
    const status = this.determineStatus({
      ...goal,
      progress_percent: progress,
      id: "",
      created_at: "",
      updated_at: "",
    } as FinancialGoal);

    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress_percent: progress,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const goals = this.getAll();
    goals.push(newGoal);
    LocalStorageService.set(STORAGE_KEY, goals);

    return newGoal;
  }

  /**
   * Update a goal
   */
  static update(id: string, updates: Partial<FinancialGoal>): FinancialGoal | null {
    const goals = this.getAll();
    const index = goals.findIndex((g) => g.id === id);

    if (index === -1) return null;

    const updated = {
      ...goals[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Recalculate progress and status
    updated.progress_percent = this.calculateProgress(
      updated.current_amount,
      updated.target_amount
    );
    updated.status = this.determineStatus(updated);

    goals[index] = updated;
    LocalStorageService.set(STORAGE_KEY, goals);

    return updated;
  }

  /**
   * Delete a goal
   */
  static delete(id: string): boolean {
    const goals = this.getAll();
    const filtered = goals.filter((g) => g.id !== id);

    if (filtered.length < goals.length) {
      LocalStorageService.set(STORAGE_KEY, filtered);
      return true;
    }
    return false;
  }

  /**
   * Get statistics for a family's goals
   */
  static getStats(familyId: string): GoalStats {
    const goals = this.getByFamily(familyId);

    const by_status: Record<GoalStatus, number> = {
      on_track: 0,
      at_risk: 0,
      behind: 0,
      achieved: 0,
      not_started: 0,
    };

    const by_type: Record<string, number> = {};

    let totalTarget = 0;
    let totalCurrent = 0;

    goals.forEach((g) => {
      by_status[g.status]++;
      by_type[g.type] = (by_type[g.type] || 0) + 1;
      totalTarget += g.target_amount;
      totalCurrent += g.current_amount;
    });

    return {
      total_goals: goals.length,
      by_status,
      by_type: by_type as Record<any, number>,
      total_target_amount: totalTarget,
      total_current_amount: totalCurrent,
      overall_progress_percent: this.calculateProgress(totalCurrent, totalTarget),
    };
  }

  /**
   * Calculate progress percentage
   */
  private static calculateProgress(current: number, target: number): number {
    if (target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  }

  /**
   * Determine goal status based on progress and timeline
   */
  private static determineStatus(goal: FinancialGoal): GoalStatus {
    // If target achieved
    if (goal.progress_percent >= 100) {
      return "achieved";
    }

    // If nothing contributed yet
    if (goal.current_amount === 0) {
      return "not_started";
    }

    const today = new Date();
    const targetDate = new Date(goal.target_date);
    const startDate = new Date(goal.start_date);

    // Calculate time elapsed and time remaining
    const totalDays =
      (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays =
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (totalDays <= 0) {
      return "not_started";
    }

    const elapsedPercent = (elapsedDays / totalDays) * 100;

    // Compare progress to expected progress based on time elapsed
    // On track: within 5% of expected
    // At risk: 5-15% behind expected
    // Behind: more than 15% behind expected

    const difference = goal.progress_percent - elapsedPercent;

    if (difference >= -5) {
      return "on_track";
    } else if (difference >= -15) {
      return "at_risk";
    } else {
      return "behind";
    }
  }

  /**
   * Update goal progress (convenience method)
   */
  static updateProgress(
    id: string,
    currentAmount: number,
    monthlyContribution?: number
  ): FinancialGoal | null {
    const updates: Partial<FinancialGoal> = {
      current_amount: currentAmount,
      last_reviewed_at: new Date().toISOString(),
    };

    if (monthlyContribution !== undefined) {
      updates.monthly_contribution = monthlyContribution;
    }

    return this.update(id, updates);
  }

  /**
   * Save all goals (for bulk operations)
   */
  static saveAll(goals: FinancialGoal[]): void {
    LocalStorageService.set(STORAGE_KEY, goals);
  }
}
