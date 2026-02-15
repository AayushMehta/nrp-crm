// lib/services/client-warning-service.ts
// Service for calculating and managing client warning badges

import { Client } from "@/types/clients";
import { OnboardingChecklist } from "@/types/onboarding-checklist";
import { ChecklistService } from "./checklist-service";

export type WarningSeverity = "low" | "medium" | "high" | "critical";

export interface ClientWarning {
  id: string;
  type: "kyc_pending" | "documents_missing" | "onboarding_incomplete" | "verification_needed" | "account_inactive";
  severity: WarningSeverity;
  message: string;
  description: string;
  actionable: boolean;
  checklistId?: string;
}

export interface ClientWarningResult {
  clientId: string;
  clientName: string;
  warnings: ClientWarning[];
  highestSeverity: WarningSeverity | null;
  warningCount: number;
  hasBlockers: boolean; // Critical warnings that should prevent activation
}

/**
 * Service for calculating client warnings based on checklist and onboarding status
 */
export class ClientWarningService {
  /**
   * Get all warnings for a specific client
   */
  static getWarningsForClient(client: Client): ClientWarningResult {
    const warnings: ClientWarning[] = [];

    // Get checklist for this client
    const checklists = ChecklistService.getAll().filter(
      (checklist) => checklist.family_id === client.id
    );
    const activeChecklist = checklists.find(
      (checklist) => checklist.current_step !== "completed"
    ) || checklists[0];

    // 1. Check onboarding status
    if (client.status === "onboarding" || client.status === "prospect") {
      warnings.push({
        id: "onboarding_incomplete",
        type: "onboarding_incomplete",
        severity: "medium",
        message: "Onboarding Incomplete",
        description: "Client has not completed the onboarding process",
        actionable: true,
      });
    }

    // 2. Check account inactive status
    if (client.status === "inactive") {
      warnings.push({
        id: "account_inactive",
        type: "account_inactive",
        severity: "high",
        message: "Account Inactive",
        description: "Client account is currently inactive",
        actionable: true,
      });
    }

    // 3. Check checklist items if exists
    if (activeChecklist) {
      const pendingItems = activeChecklist.items.filter(
        (item) => item.status === "pending" || item.status === "required"
      );
      const rejectedItems = activeChecklist.items.filter(
        (item) => item.status === "rejected"
      );

      // Check for KYC-related pending items
      const kycItems = pendingItems.filter(
        (item) =>
          item.category === "kyc" ||
          item.display_name.toLowerCase().includes("kyc") ||
          item.display_name.toLowerCase().includes("pan") ||
          item.display_name.toLowerCase().includes("aadhaar")
      );

      if (kycItems.length > 0) {
        warnings.push({
          id: "kyc_pending",
          type: "kyc_pending",
          severity: "high",
          message: "KYC Pending",
          description: `${kycItems.length} KYC item(s) require completion`,
          actionable: true,
          checklistId: activeChecklist.id,
        });
      }

      // Check for document-related pending items
      const docItems = pendingItems.filter(
        (item) =>
          item.category === "financial" ||
          item.category === "forms" ||
          item.display_name.toLowerCase().includes("document") ||
          item.display_name.toLowerCase().includes("upload") ||
          item.display_name.toLowerCase().includes("proof")
      );

      if (docItems.length > 0) {
        warnings.push({
          id: "documents_missing",
          type: "documents_missing",
          severity: "medium",
          message: "Documents Missing",
          description: `${docItems.length} document(s) need to be uploaded`,
          actionable: true,
          checklistId: activeChecklist.id,
        });
      }

      // Check for rejected items (needs re-submission)
      if (rejectedItems.length > 0) {
        warnings.push({
          id: "verification_needed",
          type: "verification_needed",
          severity: "critical",
          message: "Verification Failed",
          description: `${rejectedItems.length} item(s) rejected, need resubmission`,
          actionable: true,
          checklistId: activeChecklist.id,
        });
      }

      // Check overall checklist progress
      const completionRate = this.calculateChecklistCompletion(activeChecklist);
      if (completionRate < 100 && completionRate > 0 && client.status === "active") {
        warnings.push({
          id: "onboarding_incomplete_active",
          type: "onboarding_incomplete",
          severity: "low",
          message: "Checklist Incomplete",
          description: `Onboarding checklist is ${completionRate}% complete`,
          actionable: true,
          checklistId: activeChecklist.id,
        });
      }
    } else if (client.status !== "inactive") {
      // No checklist exists for non-inactive client
      warnings.push({
        id: "no_checklist",
        type: "onboarding_incomplete",
        severity: "medium",
        message: "No Checklist",
        description: "Client has no onboarding checklist assigned",
        actionable: true,
      });
    }

    // Calculate highest severity and blocker status
    const severityOrder: WarningSeverity[] = ["critical", "high", "medium", "low"];
    const highestSeverity = warnings.length > 0
      ? severityOrder.find((sev) => warnings.some((w) => w.severity === sev)) || null
      : null;

    const hasBlockers = warnings.some((w) => w.severity === "critical");

    return {
      clientId: client.id,
      clientName: client.name,
      warnings,
      highestSeverity,
      warningCount: warnings.length,
      hasBlockers,
    };
  }

  /**
   * Get warnings for multiple clients
   */
  static getWarningsForClients(clients: Client[]): ClientWarningResult[] {
    return clients.map((client) => this.getWarningsForClient(client));
  }

  /**
   * Check if client can be activated (no critical warnings)
   */
  static canActivateClient(client: Client): { canActivate: boolean; reason?: string } {
    const result = this.getWarningsForClient(client);

    if (result.hasBlockers) {
      const criticalWarning = result.warnings.find((w) => w.severity === "critical");
      return {
        canActivate: false,
        reason: criticalWarning?.description || "Client has critical warnings",
      };
    }

    // Can activate with warnings (they'll show as badges)
    return { canActivate: true };
  }

  /**
   * Get warning summary statistics
   */
  static getWarningSummary(clients: Client[]): {
    totalClients: number;
    clientsWithWarnings: number;
    criticalWarnings: number;
    highWarnings: number;
    mediumWarnings: number;
    lowWarnings: number;
  } {
    const results = this.getWarningsForClients(clients);

    const clientsWithWarnings = results.filter((r) => r.warningCount > 0).length;
    const allWarnings = results.flatMap((r) => r.warnings);

    return {
      totalClients: clients.length,
      clientsWithWarnings,
      criticalWarnings: allWarnings.filter((w) => w.severity === "critical").length,
      highWarnings: allWarnings.filter((w) => w.severity === "high").length,
      mediumWarnings: allWarnings.filter((w) => w.severity === "medium").length,
      lowWarnings: allWarnings.filter((w) => w.severity === "low").length,
    };
  }

  /**
   * Calculate checklist completion percentage
   */
  private static calculateChecklistCompletion(checklist: OnboardingChecklist): number {
    if (checklist.items.length === 0) return 0;

    const completedItems = checklist.items.filter(
      (item) => item.status === "verified"
    ).length;

    return Math.round((completedItems / checklist.items.length) * 100);
  }

  /**
   * Get severity color class for UI
   */
  static getSeverityColorClass(severity: WarningSeverity): string {
    const colorMap: Record<WarningSeverity, string> = {
      critical: "bg-red-100 text-red-700 border-red-300",
      high: "bg-orange-100 text-orange-700 border-orange-300",
      medium: "bg-amber-100 text-amber-700 border-amber-300",
      low: "bg-yellow-100 text-yellow-700 border-yellow-300",
    };
    return colorMap[severity];
  }

  /**
   * Get severity icon color for UI
   */
  static getSeverityIconColor(severity: WarningSeverity): string {
    const colorMap: Record<WarningSeverity, string> = {
      critical: "text-red-600",
      high: "text-orange-600",
      medium: "text-amber-600",
      low: "text-yellow-600",
    };
    return colorMap[severity];
  }
}
