// lib/services/temp-access-service.ts
// Business logic for temporary access tokens

import {
  TempAccessToken,
  TempAccessValidation,
  TempAccessInvitation,
  TempAccessAction,
  TempAccessLog,
} from "@/types/temp-access";
import { tempAccessStorage } from "@/lib/storage/temp-access-storage";
import { checklistStorage } from "@/lib/storage/checklist-storage";
import { generateId } from "@/lib/utils";

/**
 * Service for managing temporary access tokens
 */
export class TempAccessService {
  /**
   * Generate a unique token string
   */
  private static generateTokenString(): string {
    // Generate a secure random token (UUID-like)
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate a temporary access token
   */
  static generateToken(
    checklistId: string,
    familyId: string,
    familyName: string,
    clientEmail: string,
    clientName: string,
    createdBy: string,
    createdByName: string,
    expiryDays: number = 7,
    allowedActions: TempAccessAction[] = ["upload", "view"],
    maxUploadSizeMb: number = 10,
    maxUploads?: number
  ): TempAccessToken | null {
    // Check if checklist exists
    const checklist = checklistStorage.getById(checklistId);
    if (!checklist) {
      return null;
    }

    // Check if token already exists for this checklist
    const existingToken = tempAccessStorage.getByChecklistId(checklistId);
    if (existingToken && existingToken.is_active) {
      // Return existing active token
      return existingToken;
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Create token
    const token: TempAccessToken = {
      id: generateId("token"),
      token: this.generateTokenString(),
      onboarding_request_id: undefined,
      checklist_id: checklistId,
      family_id: familyId,
      family_name: familyName,
      client_email: clientEmail,
      client_name: clientName,
      allowed_actions: allowedActions,
      max_upload_size_mb: maxUploadSizeMb,
      max_uploads: maxUploads,
      created_at: new Date().toISOString(),
      created_by: createdBy,
      created_by_name: createdByName,
      expires_at: expiresAt.toISOString(),
      access_count: 0,
      is_active: true,
      uploads_count: 0,
      downloads_count: 0,
    };

    // Save token
    const savedToken = tempAccessStorage.create(token);

    // Update checklist with token
    checklistStorage.update(checklistId, {
      temporary_access_token: savedToken.token,
    });

    return savedToken;
  }

  /**
   * Validate a token
   */
  static validateToken(tokenString: string): TempAccessValidation {
    const token = tempAccessStorage.getByToken(tokenString);

    if (!token) {
      return {
        valid: false,
        error: "Token not found",
        error_code: "token_not_found",
      };
    }

    // Check if revoked
    if (token.revoked_at) {
      return {
        valid: false,
        token,
        error: "Token has been revoked",
        error_code: "token_revoked",
      };
    }

    // Check if active
    if (!token.is_active) {
      return {
        valid: false,
        token,
        error: "Token is inactive",
        error_code: "token_inactive",
      };
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(token.expires_at);
    if (now > expiresAt) {
      // Auto-deactivate expired token
      tempAccessStorage.update(token.id, { is_active: false });

      return {
        valid: false,
        token,
        error: "Token has expired",
        error_code: "token_expired",
      };
    }

    // Check max uploads
    if (token.max_uploads && token.uploads_count >= token.max_uploads) {
      return {
        valid: false,
        token,
        error: "Maximum uploads reached",
        error_code: "max_uploads_reached",
      };
    }

    // Get checklist
    const checklist = checklistStorage.getById(token.checklist_id);

    // Increment access count
    tempAccessStorage.update(token.id, {
      access_count: token.access_count + 1,
      last_accessed_at: new Date().toISOString(),
    });

    return {
      valid: true,
      token,
      checklist,
    };
  }

  /**
   * Revoke a token
   */
  static revokeToken(
    tokenId: string,
    revokedBy: string,
    revokedByName: string,
    reason?: string
  ): boolean {
    const token = tempAccessStorage.getById(tokenId);
    if (!token) {
      return false;
    }

    const updated = tempAccessStorage.update(tokenId, {
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by: revokedBy,
      revoked_by_name: revokedByName,
      revoked_reason: reason,
    });

    return !!updated;
  }

  /**
   * Increment upload count
   */
  static incrementUploadCount(tokenId: string): void {
    const token = tempAccessStorage.getById(tokenId);
    if (!token) {
      return;
    }

    tempAccessStorage.update(tokenId, {
      uploads_count: token.uploads_count + 1,
    });
  }

  /**
   * Increment download count
   */
  static incrementDownloadCount(tokenId: string): void {
    const token = tempAccessStorage.getById(tokenId);
    if (!token) {
      return;
    }

    tempAccessStorage.update(tokenId, {
      downloads_count: token.downloads_count + 1,
    });
  }

  /**
   * Get token by ID
   */
  static getById(tokenId: string): TempAccessToken | null {
    return tempAccessStorage.getById(tokenId);
  }

  /**
   * Get token by token string
   */
  static getByToken(tokenString: string): TempAccessToken | null {
    return tempAccessStorage.getByToken(tokenString);
  }

  /**
   * Get all tokens
   */
  static getAll(): TempAccessToken[] {
    return tempAccessStorage.getAll();
  }

  /**
   * Get active tokens
   */
  static getActive(): TempAccessToken[] {
    return tempAccessStorage.getActive();
  }

  /**
   * Get expired tokens
   */
  static getExpired(): TempAccessToken[] {
    return tempAccessStorage.getExpired();
  }

  /**
   * Generate invitation details for email
   */
  static generateInvitation(tokenId: string, baseUrl: string): TempAccessInvitation | null {
    const token = tempAccessStorage.getById(tokenId);
    if (!token) {
      return null;
    }

    const accessUrl = `${baseUrl}/client/temp-access/${token.token}`;

    return {
      to_email: token.client_email,
      to_name: token.client_name || "Valued Client",
      family_name: token.family_name,
      access_url: accessUrl,
      expires_at: token.expires_at,
      instructions: `You have been granted temporary access to upload documents for your onboarding. This link will expire on ${new Date(token.expires_at).toLocaleDateString()}.`,
    };
  }

  /**
   * Get token statistics
   */
  static getStats() {
    const tokens = tempAccessStorage.getAll();
    const active = tempAccessStorage.getActive();
    const expired = tempAccessStorage.getExpired();

    return {
      total: tokens.length,
      active: active.length,
      expired: expired.length,
      revoked: tokens.filter((t) => t.revoked_at).length,
      total_accesses: tokens.reduce((acc, t) => acc + t.access_count, 0),
      total_uploads: tokens.reduce((acc, t) => acc + t.uploads_count, 0),
    };
  }

  /**
   * Clean up expired tokens (optional maintenance)
   */
  static cleanupExpiredTokens(): number {
    const tokens = tempAccessStorage.getAll();
    const now = new Date().toISOString();
    let deactivatedCount = 0;

    tokens.forEach((token) => {
      if (token.is_active && token.expires_at <= now) {
        tempAccessStorage.update(token.id, { is_active: false });
        deactivatedCount++;
      }
    });

    return deactivatedCount;
  }
}
