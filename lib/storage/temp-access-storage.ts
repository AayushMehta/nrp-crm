// lib/storage/temp-access-storage.ts
// Storage layer for temporary access tokens

import { TempAccessToken } from "@/types/temp-access";
import { getFromStorage, setToStorage } from "./localStorage";

export const TEMP_ACCESS_STORAGE_KEY = "nrp_crm_temp_tokens";

export const tempAccessStorage = {
  /**
   * Get all tokens
   */
  getAll(): TempAccessToken[] {
    return getFromStorage<TempAccessToken[]>(TEMP_ACCESS_STORAGE_KEY, []);
  },

  /**
   * Get token by ID
   */
  getById(tokenId: string): TempAccessToken | null {
    const tokens = this.getAll();
    return tokens.find((t) => t.id === tokenId) || null;
  },

  /**
   * Get token by token string
   */
  getByToken(token: string): TempAccessToken | null {
    const tokens = this.getAll();
    return tokens.find((t) => t.token === token) || null;
  },

  /**
   * Get token by checklist ID
   */
  getByChecklistId(checklistId: string): TempAccessToken | null {
    const tokens = this.getAll();
    return tokens.find((t) => t.checklist_id === checklistId) || null;
  },

  /**
   * Create new token
   */
  create(token: TempAccessToken): TempAccessToken {
    const tokens = this.getAll();
    tokens.push(token);
    setToStorage(TEMP_ACCESS_STORAGE_KEY, tokens);
    return token;
  },

  /**
   * Update existing token
   */
  update(tokenId: string, updates: Partial<TempAccessToken>): TempAccessToken | null {
    const tokens = this.getAll();
    const index = tokens.findIndex((t) => t.id === tokenId);

    if (index === -1) {
      return null;
    }

    tokens[index] = {
      ...tokens[index],
      ...updates,
    };

    setToStorage(TEMP_ACCESS_STORAGE_KEY, tokens);
    return tokens[index];
  },

  /**
   * Delete token
   */
  delete(tokenId: string): boolean {
    const tokens = this.getAll();
    const filtered = tokens.filter((t) => t.id !== tokenId);

    if (filtered.length === tokens.length) {
      return false;
    }

    setToStorage(TEMP_ACCESS_STORAGE_KEY, filtered);
    return true;
  },

  /**
   * Get active tokens
   */
  getActive(): TempAccessToken[] {
    const tokens = this.getAll();
    const now = new Date().toISOString();

    return tokens.filter((t) => t.is_active && t.expires_at > now && !t.revoked_at);
  },

  /**
   * Get expired tokens
   */
  getExpired(): TempAccessToken[] {
    const tokens = this.getAll();
    const now = new Date().toISOString();

    return tokens.filter((t) => t.expires_at <= now);
  },

  /**
   * Save all tokens (bulk update)
   */
  saveAll(tokens: TempAccessToken[]): void {
    setToStorage(TEMP_ACCESS_STORAGE_KEY, tokens);
  },
};
