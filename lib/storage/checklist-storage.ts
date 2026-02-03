// lib/storage/checklist-storage.ts
// Storage layer for onboarding checklists

import { OnboardingChecklist } from "@/types/onboarding-checklist";
import { getFromStorage, setToStorage } from "./localStorage";

export const CHECKLIST_STORAGE_KEY = "nrp_crm_checklists";

export const checklistStorage = {
  /**
   * Get all checklists
   */
  getAll(): OnboardingChecklist[] {
    return getFromStorage<OnboardingChecklist[]>(CHECKLIST_STORAGE_KEY, []);
  },

  /**
   * Get checklist by ID
   */
  getById(checklistId: string): OnboardingChecklist | null {
    const checklists = this.getAll();
    return checklists.find((c) => c.id === checklistId) || null;
  },

  /**
   * Get checklist by family ID
   */
  getByFamilyId(familyId: string): OnboardingChecklist | null {
    const checklists = this.getAll();
    return checklists.find((c) => c.family_id === familyId) || null;
  },

  /**
   * Create new checklist
   */
  create(checklist: OnboardingChecklist): OnboardingChecklist {
    const checklists = this.getAll();
    checklists.push(checklist);
    setToStorage(CHECKLIST_STORAGE_KEY, checklists);
    return checklist;
  },

  /**
   * Update existing checklist
   */
  update(checklistId: string, updates: Partial<OnboardingChecklist>): OnboardingChecklist | null {
    const checklists = this.getAll();
    const index = checklists.findIndex((c) => c.id === checklistId);

    if (index === -1) {
      return null;
    }

    checklists[index] = {
      ...checklists[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setToStorage(CHECKLIST_STORAGE_KEY, checklists);
    return checklists[index];
  },

  /**
   * Delete checklist
   */
  delete(checklistId: string): boolean {
    const checklists = this.getAll();
    const filtered = checklists.filter((c) => c.id !== checklistId);

    if (filtered.length === checklists.length) {
      return false; // Nothing deleted
    }

    setToStorage(CHECKLIST_STORAGE_KEY, filtered);
    return true;
  },

  /**
   * Get checklists by status
   */
  getByCurrentStep(step: OnboardingChecklist["current_step"]): OnboardingChecklist[] {
    const checklists = this.getAll();
    return checklists.filter((c) => c.current_step === step);
  },

  /**
   * Get checklists by completion status
   */
  getByCompletionStatus(isComplete: boolean): OnboardingChecklist[] {
    const checklists = this.getAll();
    return checklists.filter((c) => (c.current_step === "completed") === isComplete);
  },

  /**
   * Save all checklists (bulk update)
   */
  saveAll(checklists: OnboardingChecklist[]): void {
    setToStorage(CHECKLIST_STORAGE_KEY, checklists);
  },
};
