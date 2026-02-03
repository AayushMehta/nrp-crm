// lib/storage/invitation-storage.ts
// Storage layer for client invitations

import { ClientInvitation, OnboardingProgress, OnboardingDocument } from "@/types/client-invitation";
import { getFromStorage, setToStorage } from "./localStorage";

export const INVITATION_STORAGE_KEY = "nrp_crm_invitations";
export const ONBOARDING_PROGRESS_KEY = "nrp_crm_onboarding_progress";
export const ONBOARDING_DOCUMENTS_KEY = "nrp_crm_onboarding_documents";

export const invitationStorage = {
  /**
   * Get all invitations
   */
  getAll(): ClientInvitation[] {
    return getFromStorage<ClientInvitation[]>(INVITATION_STORAGE_KEY, []);
  },

  /**
   * Get invitation by ID
   */
  getById(invitationId: string): ClientInvitation | null {
    const invitations = this.getAll();
    return invitations.find((inv) => inv.id === invitationId) || null;
  },

  /**
   * Get invitation by email
   */
  getByEmail(email: string): ClientInvitation[] {
    const invitations = this.getAll();
    return invitations.filter((inv) => inv.email.toLowerCase() === email.toLowerCase());
  },

  /**
   * Get invitation by token
   */
  getByToken(token: string): ClientInvitation | null {
    const invitations = this.getAll();
    return invitations.find((inv) => inv.token === token) || null;
  },

  /**
   * Create new invitation
   */
  create(invitation: ClientInvitation): ClientInvitation {
    const invitations = this.getAll();
    invitations.push(invitation);
    setToStorage(INVITATION_STORAGE_KEY, invitations);
    return invitation;
  },

  /**
   * Update existing invitation
   */
  update(invitationId: string, updates: Partial<ClientInvitation>): ClientInvitation | null {
    const invitations = this.getAll();
    const index = invitations.findIndex((inv) => inv.id === invitationId);

    if (index === -1) {
      return null;
    }

    invitations[index] = {
      ...invitations[index],
      ...updates,
    };

    setToStorage(INVITATION_STORAGE_KEY, invitations);
    return invitations[index];
  },

  /**
   * Delete invitation
   */
  delete(invitationId: string): boolean {
    const invitations = this.getAll();
    const filtered = invitations.filter((inv) => inv.id !== invitationId);

    if (filtered.length === invitations.length) {
      return false;
    }

    setToStorage(INVITATION_STORAGE_KEY, filtered);
    return true;
  },

  /**
   * Get active invitations (not expired or completed)
   */
  getActive(): ClientInvitation[] {
    const invitations = this.getAll();
    const now = new Date().toISOString();

    return invitations.filter(
      (inv) =>
        inv.status !== 'completed' &&
        inv.status !== 'expired' &&
        !inv.revoked &&
        inv.expires_at > now
    );
  },

  /**
   * Get expired invitations
   */
  getExpired(): ClientInvitation[] {
    const invitations = this.getAll();
    const now = new Date().toISOString();

    return invitations.filter(
      (inv) => inv.status !== 'completed' && inv.expires_at <= now
    );
  },

  /**
   * Get invitations by status
   */
  getByStatus(status: ClientInvitation['status']): ClientInvitation[] {
    const invitations = this.getAll();
    return invitations.filter((inv) => inv.status === status);
  },
};

/**
 * Storage for onboarding progress (auto-save)
 */
export const onboardingProgressStorage = {
  /**
   * Get progress by token
   */
  getByToken(token: string): OnboardingProgress | null {
    const allProgress = getFromStorage<OnboardingProgress[]>(ONBOARDING_PROGRESS_KEY, []);
    return allProgress.find((p) => p.token === token) || null;
  },

  /**
   * Save progress
   */
  save(progress: OnboardingProgress): void {
    const allProgress = getFromStorage<OnboardingProgress[]>(ONBOARDING_PROGRESS_KEY, []);
    const index = allProgress.findIndex((p) => p.token === progress.token);

    if (index !== -1) {
      allProgress[index] = progress;
    } else {
      allProgress.push(progress);
    }

    setToStorage(ONBOARDING_PROGRESS_KEY, allProgress);
  },

  /**
   * Delete progress
   */
  delete(token: string): void {
    const allProgress = getFromStorage<OnboardingProgress[]>(ONBOARDING_PROGRESS_KEY, []);
    const filtered = allProgress.filter((p) => p.token !== token);
    setToStorage(ONBOARDING_PROGRESS_KEY, filtered);
  },
};

/**
 * Storage for onboarding documents (uploaded during wizard)
 */
export const onboardingDocumentStorage = {
  /**
   * Get all documents for a token
   */
  getByToken(token: string): OnboardingDocument[] {
    const allDocuments = getFromStorage<OnboardingDocument[]>(ONBOARDING_DOCUMENTS_KEY, []);
    return allDocuments.filter((doc) => doc.token === token);
  },

  /**
   * Save document
   */
  save(document: OnboardingDocument): void {
    const allDocuments = getFromStorage<OnboardingDocument[]>(ONBOARDING_DOCUMENTS_KEY, []);
    allDocuments.push(document);
    setToStorage(ONBOARDING_DOCUMENTS_KEY, allDocuments);
  },

  /**
   * Delete document
   */
  delete(documentId: string): void {
    const allDocuments = getFromStorage<OnboardingDocument[]>(ONBOARDING_DOCUMENTS_KEY, []);
    const filtered = allDocuments.filter((doc) => doc.id !== documentId);
    setToStorage(ONBOARDING_DOCUMENTS_KEY, filtered);
  },

  /**
   * Delete all documents for a token
   */
  deleteByToken(token: string): void {
    const allDocuments = getFromStorage<OnboardingDocument[]>(ONBOARDING_DOCUMENTS_KEY, []);
    const filtered = allDocuments.filter((doc) => doc.token !== token);
    setToStorage(ONBOARDING_DOCUMENTS_KEY, filtered);
  },
};
