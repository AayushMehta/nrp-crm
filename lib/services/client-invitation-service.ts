// lib/services/client-invitation-service.ts
// Business logic for client invitations and self-service onboarding

import {
  ClientInvitation,
  InvitationStatus,
  InvitationCreateData,
  TokenValidationResult,
  InvitationStats,
  OnboardingFormData,
} from "@/types/client-invitation";
import { Client } from "@/types/clients";
import { OnboardingChecklist } from "@/types/onboarding-checklist";
import { invitationStorage, onboardingDocumentStorage } from "@/lib/storage/invitation-storage";
import { ClientService } from "./client-service";
import { ChecklistService } from "./checklist-service";
import { generateId } from "@/lib/utils";

/**
 * Service for managing client invitations and onboarding flow
 */
export class ClientInvitationService {
  /**
   * Generate a unique token string
   */
  private static generateToken(): string {
    // Generate a secure random token (UUID-like)
    return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Create a new client invitation
   */
  static createInvitation(
    data: InvitationCreateData,
    createdById: string,
    createdByName: string
  ): ClientInvitation {
    const expiryDays = data.expiry_days || 14;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const invitation: ClientInvitation = {
      id: generateId("inv"),
      email: data.email.toLowerCase().trim(),
      token: this.generateToken(),
      status: 'pending',
      created_by_id: createdById,
      created_by_name: createdByName,
      assigned_rm_id: data.assigned_rm_id,
      assigned_rm_name: data.assigned_rm_id ? this.getRMName(data.assigned_rm_id) : undefined,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      access_count: 0,
      revoked: false,
      email_sent_at: new Date().toISOString(), // Mock - in real app, send actual email
    };

    return invitationStorage.create(invitation);
  }

  /**
   * Get RM name (helper - in real app, fetch from user service)
   */
  private static getRMName(rmId: string): string {
    const rmNames: Record<string, string> = {
      "rm-1": "Relationship Manager",
      "user-rm": "Rajesh Kumar",
    };
    return rmNames[rmId] || "Assigned RM";
  }

  /**
   * Validate invitation token
   */
  static validateToken(token: string): TokenValidationResult {
    const invitation = invitationStorage.getByToken(token);

    if (!invitation) {
      return {
        valid: false,
        error: "Invitation not found",
        error_code: 'not_found',
      };
    }

    // Check if revoked
    if (invitation.revoked) {
      return {
        valid: false,
        invitation,
        error: "This invitation has been revoked",
        error_code: 'revoked',
      };
    }

    // Check if already completed
    if (invitation.status === 'completed') {
      return {
        valid: false,
        invitation,
        error: "This invitation has already been completed",
        error_code: 'completed',
      };
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      // Auto-update status to expired
      invitationStorage.update(invitation.id, { status: 'expired' });

      return {
        valid: false,
        invitation: { ...invitation, status: 'expired' },
        error: "This invitation has expired",
        error_code: 'expired',
      };
    }

    // Increment access count and update last accessed
    invitationStorage.update(invitation.id, {
      access_count: invitation.access_count + 1,
      last_accessed_at: new Date().toISOString(),
    });

    return {
      valid: true,
      invitation,
    };
  }

  /**
   * Mark invitation as accepted (client clicked the link)
   */
  static acceptInvitation(token: string): ClientInvitation | null {
    const invitation = invitationStorage.getByToken(token);

    if (!invitation) {
      return null;
    }

    // Only update if not already accepted
    if (!invitation.accepted_at) {
      const updated = invitationStorage.update(invitation.id, {
        status: 'in_progress',
        accepted_at: new Date().toISOString(),
      });
      return updated;
    }

    return invitation;
  }

  /**
   * Complete onboarding and create client + checklist
   */
  static completeInvitation(
    token: string,
    formData: OnboardingFormData
  ): { client: Client; checklist: OnboardingChecklist } | null {
    const invitation = invitationStorage.getByToken(token);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status === 'completed') {
      throw new Error("Invitation already completed");
    }

    // 1. Create client record
    const client = ClientService.create(
      {
        name: formData.family_name,
        primary_contact_name: formData.primary_contact_name,
        primary_contact_email: invitation.email,
        primary_contact_phone: formData.primary_contact_phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        assigned_rm_id: invitation.assigned_rm_id,
        service_type: formData.selected_service,
        tier: 'prospect',
        notes: formData.notes,
      },
      invitation.created_by_id
    );

    // Update client status to onboarding
    ClientService.update(client.id, {
      status: 'onboarding',
    });

    // 2. Create onboarding checklist
    const checklist = ChecklistService.createFromTemplate(
      client.id,
      client.name,
      formData.kyc_already_done,
      formData.selected_service,
      invitation.created_by_id
    );

    // 3. Link uploaded documents to checklist (if any)
    const uploadedDocs = onboardingDocumentStorage.getByToken(token);
    // TODO: Link documents to checklist items

    // 4. Update invitation status
    invitationStorage.update(invitation.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      client_id: client.id,
      checklist_id: checklist.id,
    });

    // 5. Clean up progress and documents
    onboardingDocumentStorage.deleteByToken(token);

    return { client, checklist };
  }

  /**
   * Revoke an invitation
   */
  static revokeInvitation(
    invitationId: string,
    revokedBy: string,
    reason?: string
  ): boolean {
    const invitation = invitationStorage.getById(invitationId);

    if (!invitation) {
      return false;
    }

    if (invitation.status === 'completed') {
      return false; // Can't revoke completed invitations
    }

    const updated = invitationStorage.update(invitationId, {
      revoked: true,
      revoked_at: new Date().toISOString(),
      revoked_by: revokedBy,
      revoked_reason: reason,
    });

    return !!updated;
  }

  /**
   * Resend invitation (generate new token)
   */
  static resendInvitation(
    invitationId: string,
    expiryDays: number = 14
  ): ClientInvitation | null {
    const old = invitationStorage.getById(invitationId);

    if (!old) {
      return null;
    }

    // Create new token and expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const updated = invitationStorage.update(invitationId, {
      token: this.generateToken(),
      expires_at: expiresAt.toISOString(),
      status: 'pending',
      revoked: false,
      access_count: 0,
      email_sent_at: new Date().toISOString(),
    });

    return updated;
  }

  /**
   * Get invitation by ID
   */
  static getById(invitationId: string): ClientInvitation | null {
    return invitationStorage.getById(invitationId);
  }

  /**
   * Get invitation by token
   */
  static getByToken(token: string): ClientInvitation | null {
    return invitationStorage.getByToken(token);
  }

  /**
   * Get all invitations
   */
  static getAll(): ClientInvitation[] {
    return invitationStorage.getAll();
  }

  /**
   * Get invitations by status
   */
  static getByStatus(status: InvitationStatus): ClientInvitation[] {
    return invitationStorage.getByStatus(status);
  }

  /**
   * Get active invitations
   */
  static getActive(): ClientInvitation[] {
    return invitationStorage.getActive();
  }

  /**
   * Get invitation statistics
   */
  static getStats(): InvitationStats {
    const invitations = invitationStorage.getAll();
    const completed = invitations.filter((inv) => inv.status === 'completed');

    // Calculate completion rate
    const totalSent = invitations.length;
    const completionRate = totalSent > 0 ? (completed.length / totalSent) * 100 : 0;

    // Calculate average time to complete
    let avgTimeToComplete: number | undefined;
    if (completed.length > 0) {
      const totalDays = completed.reduce((sum, inv) => {
        if (inv.completed_at) {
          const start = new Date(inv.created_at);
          const end = new Date(inv.completed_at);
          const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }
        return sum;
      }, 0);
      avgTimeToComplete = totalDays / completed.length;
    }

    return {
      total: totalSent,
      pending: invitations.filter((inv) => inv.status === 'pending').length,
      in_progress: invitations.filter((inv) => inv.status === 'in_progress').length,
      completed: completed.length,
      expired: invitations.filter((inv) => inv.status === 'expired').length,
      revoked: invitations.filter((inv) => inv.revoked).length,
      completion_rate: Math.round(completionRate),
      average_time_to_complete: avgTimeToComplete ? Math.round(avgTimeToComplete) : undefined,
    };
  }

  /**
   * Generate invitation URL
   */
  static generateInvitationUrl(token: string, baseUrl: string = 'http://localhost:3000'): string {
    return `${baseUrl}/client/onboarding/${token}`;
  }

  /**
   * Clean up expired invitations (maintenance)
   */
  static cleanupExpired(): number {
    const invitations = invitationStorage.getAll();
    const now = new Date().toISOString();
    let updatedCount = 0;

    invitations.forEach((invitation) => {
      if (
        invitation.status !== 'completed' &&
        invitation.status !== 'expired' &&
        invitation.expires_at <= now
      ) {
        invitationStorage.update(invitation.id, { status: 'expired' });
        updatedCount++;
      }
    });

    return updatedCount;
  }
}
