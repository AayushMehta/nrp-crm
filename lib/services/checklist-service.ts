// lib/services/checklist-service.ts
// Business logic for onboarding checklists

import {
  OnboardingChecklist,
  ChecklistItem,
  DocumentType,
  DocumentStatus,
  ChecklistTemplate
} from "@/types/onboarding-checklist";
import { checklistStorage } from "@/lib/storage/checklist-storage";
import { ReminderAutomationService } from "./reminder-automation-service";
import { generateId } from "@/lib/utils";

/**
 * Service for managing onboarding checklists
 */
export class ChecklistService {
  /**
   * Create a new checklist from template
   */
  static createFromTemplate(
    familyId: string,
    familyName: string,
    kycAlreadyDone: boolean,
    selectedService: "nrp_light" | "nrp_360",
    createdBy: string
  ): OnboardingChecklist {
    const items: ChecklistItem[] = [
      // Step 1: KYC Documents
      {
        id: generateId("item"),
        document_type: "pan_card",
        category: "kyc",
        display_name: "PAN Card",
        description: "Copy of PAN Card (both sides)",
        status: "required",
        is_mandatory: true,
        order: 1,
        conditional_on: {
          field: "kyc_already_done",
          value: true,
          if_true: false, // Hide if KYC done
        },
      },
      {
        id: generateId("item"),
        document_type: "aadhaar_card",
        category: "kyc",
        display_name: "Aadhaar Card",
        description: "Copy of Aadhaar Card (both sides)",
        status: "required",
        is_mandatory: true,
        order: 2,
        conditional_on: {
          field: "kyc_already_done",
          value: true,
          if_true: false, // Hide if KYC done
        },
      },
      {
        id: generateId("item"),
        document_type: "cancelled_check",
        category: "financial",
        display_name: "Cancelled Cheque",
        description: "Cancelled cheque for bank account verification",
        status: "required",
        is_mandatory: true,
        order: 3,
      },
      {
        id: generateId("item"),
        document_type: "kyc_certificate",
        category: "kyc",
        display_name: "KYC Certificate",
        description: "Existing KYC certificate from previous broker",
        status: "required",
        is_mandatory: false,
        order: 4,
        conditional_on: {
          field: "kyc_already_done",
          value: true,
          if_true: true, // Show only if KYC done
        },
      },
      {
        id: generateId("item"),
        document_type: "bank_statement",
        category: "financial",
        display_name: "Bank Statement",
        description: "Latest 6 months bank statement",
        status: "required",
        is_mandatory: false,
        order: 5,
      },
      {
        id: generateId("item"),
        document_type: "income_proof",
        category: "financial",
        display_name: "Income Proof",
        description: "Salary slips or ITR for income verification",
        status: "required",
        is_mandatory: false,
        order: 6,
      },

      // Step 2: Forms and Data Input
      {
        id: generateId("item"),
        document_type: "risk_profile_form",
        category: "forms",
        display_name: "Risk Profile Form",
        description: "Risk assessment questionnaire",
        status: "required",
        is_mandatory: true,
        order: 7,
      },
      {
        id: generateId("item"),
        document_type: "investor_declaration_form",
        category: "forms",
        display_name: "Investor Declaration Form",
        description: "Investment declaration and acknowledgment",
        status: "required",
        is_mandatory: true,
        order: 8,
      },
      {
        id: generateId("item"),
        document_type: "data_input_sheet_nrp_light",
        category: "forms",
        display_name: "Data Input Sheet (NRP Light)",
        description: "Client information form for NRP Light service",
        status: "required",
        is_mandatory: true,
        order: 9,
        conditional_on: {
          field: "selected_service",
          value: "nrp_light",
          if_true: true, // Show only for NRP Light
        },
      },
      {
        id: generateId("item"),
        document_type: "data_input_sheet_nrp_360",
        category: "forms",
        display_name: "Data Input Sheet (NRP 360)",
        description: "Comprehensive client information form for NRP 360 service",
        status: "required",
        is_mandatory: true,
        order: 10,
        conditional_on: {
          field: "selected_service",
          value: "nrp_360",
          if_true: true, // Show only for NRP 360
        },
      },
    ];

    const checklist: OnboardingChecklist = {
      id: generateId("checklist"),
      family_id: familyId,
      family_name: familyName,
      items,
      total_required: 0, // Will be calculated after conditional logic
      completed_count: 0,
      verified_count: 0,
      completion_percentage: 0,
      current_step: "kyc_docs",
      kyc_already_done: kycAlreadyDone,
      selected_service: selectedService,
      client_type: "individual", // Default, can be updated later
      full_login_granted: false,
      created_by: createdBy,
      created_by_name: "Admin", // TODO: Pass this as parameter
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Apply conditional logic
    const processedChecklist = this.applyConditionalLogic(checklist);

    // Save to storage
    return checklistStorage.create(processedChecklist);
  }

  /**
   * Apply conditional logic to show/hide items
   */
  static applyConditionalLogic(checklist: OnboardingChecklist): OnboardingChecklist {
    const processedItems = checklist.items.map((item) => {
      if (!item.conditional_on) {
        return item;
      }

      const { field, value, if_true } = item.conditional_on;
      const fieldValue = checklist[field as keyof OnboardingChecklist];
      const conditionMet = (fieldValue === value) === if_true;

      if (!conditionMet) {
        // Condition not met, mark as not_required
        return {
          ...item,
          status: "not_required" as DocumentStatus,
        };
      }

      return item;
    });

    return {
      ...checklist,
      items: processedItems,
    };
  }

  /**
   * Update item status (e.g., after document upload or verification)
   */
  static updateItemStatus(
    checklistId: string,
    itemId: string,
    status: DocumentStatus,
    uploadedFileId?: string,
    verifiedAt?: string,
    verifiedBy?: string,
    rejectionReason?: string
  ): OnboardingChecklist | null {
    const checklist = checklistStorage.getById(checklistId);
    if (!checklist) {
      return null;
    }

    const updatedItems = checklist.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          uploaded_file_id: uploadedFileId || item.uploaded_file_id,
          verified_at: verifiedAt || item.verified_at,
          verified_by: verifiedBy || item.verified_by,
          rejection_reason: rejectionReason || item.rejection_reason,
        };
      }
      return item;
    });

    // Recalculate progress
    const progress = this.calculateProgress({ ...checklist, items: updatedItems });
    const wasComplete = checklist.completion_percentage === 100;
    const isNowComplete = progress === 100;

    // Update checklist
    const updated = checklistStorage.update(checklistId, {
      items: updatedItems,
      completion_percentage: progress,
    });

    // Trigger automated reminder if checklist just became 100% complete
    if (!wasComplete && isNowComplete && updated) {
      try {
        ReminderAutomationService.onChecklistCompleted({
          checklistId,
          familyId: checklist.family_id,
          familyName: checklist.family_name,
          rmUserId: checklist.assigned_rm_id,
        });
      } catch (error) {
        console.error("Failed to create checklist completion reminder:", error);
        // Don't fail the update if reminder creation fails
      }
    }

    return updated;
  }

  /**
   * Calculate completion percentage
   */
  static calculateProgress(checklist: OnboardingChecklist): number {
    const requiredItems = checklist.items.filter(
      (item) => item.status !== "not_required"
    );

    if (requiredItems.length === 0) {
      return 100;
    }

    const completedItems = requiredItems.filter(
      (item) => item.status === "verified"
    );

    return Math.round((completedItems.length / requiredItems.length) * 100);
  }

  /**
   * Get checklist by ID with conditional logic applied
   */
  static getById(checklistId: string): OnboardingChecklist | null {
    const checklist = checklistStorage.getById(checklistId);
    if (!checklist) {
      return null;
    }

    return this.applyConditionalLogic(checklist);
  }

  /**
   * Get checklist by family ID
   */
  static getByFamilyId(familyId: string): OnboardingChecklist | null {
    const checklist = checklistStorage.getByFamilyId(familyId);
    if (!checklist) {
      return null;
    }

    return this.applyConditionalLogic(checklist);
  }

  /**
   * Get all checklists with filters
   */
  static getAll(filters?: {
    current_step?: OnboardingChecklist["current_step"];
    completed?: boolean;
  }): OnboardingChecklist[] {
    let checklists = checklistStorage.getAll();

    if (filters?.current_step) {
      checklists = checklists.filter((c) => c.current_step === filters.current_step);
    }

    if (filters?.completed !== undefined) {
      checklists = checklists.filter(
        (c) => (c.current_step === "completed") === filters.completed
      );
    }

    return checklists.map((c) => this.applyConditionalLogic(c));
  }

  /**
   * Move to next step
   */
  static moveToNextStep(checklistId: string): OnboardingChecklist | null {
    const checklist = checklistStorage.getById(checklistId);
    if (!checklist) {
      return null;
    }

    const stepOrder: OnboardingChecklist["current_step"][] = [
      "kyc_docs",
      "data_input",
      "execution",
      "completed",
    ];

    const currentIndex = stepOrder.indexOf(checklist.current_step);
    const nextStep = stepOrder[currentIndex + 1];

    if (!nextStep) {
      return checklist; // Already at last step
    }

    return checklistStorage.update(checklistId, {
      current_step: nextStep,
    });
  }

  /**
   * Get checklist statistics
   */
  static getStats() {
    const checklists = checklistStorage.getAll();

    return {
      total: checklists.length,
      by_step: {
        kyc_docs: checklists.filter((c) => c.current_step === "kyc_docs").length,
        data_input: checklists.filter((c) => c.current_step === "data_input").length,
        execution: checklists.filter((c) => c.current_step === "execution").length,
        completed: checklists.filter((c) => c.current_step === "completed").length,
      },
      pending_verification: checklists.filter((c) =>
        c.items.some((item) => item.status === "pending")
      ).length,
      completed: checklists.filter((c) => c.current_step === "completed").length,
    };
  }

  /**
   * Get pending items (uploaded but not verified)
   */
  static getPendingItems(checklistId: string): ChecklistItem[] {
    const checklist = checklistStorage.getById(checklistId);
    if (!checklist) {
      return [];
    }

    return checklist.items.filter((item) => item.status === "pending");
  }

  /**
   * Get required items (not yet uploaded)
   */
  static getRequiredItems(checklistId: string): ChecklistItem[] {
    const checklist = this.getById(checklistId);
    if (!checklist) {
      return [];
    }

    return checklist.items.filter((item) => item.status === "required");
  }
}
