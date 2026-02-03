// lib/auth/mockAuth.ts
// Mock Authentication System for NRP CRM

import { userStorage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { UserRole } from "@/types/auth";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  family_id?: string;
  username?: string;
}

/**
 * Mock Authentication Service
 * Provides authentication without external services
 */
export const mockAuth = {
  /**
   * Sign in with username and password
   */
  signIn: async (
    emailOrUsername: string,
    password: string
  ): Promise<{ user: AuthUser }> => {
    // Get all users
    const users = userStorage.getAll();

    // Find user by email or username
    const persona = users.find(
      (u: any) =>
        u.user.email === emailOrUsername || u.user.username === emailOrUsername
    );

    if (!persona) {
      throw new Error("Invalid credentials");
    }

    // For mock purposes, check password matches credentials
    if (persona.credentials.password !== password) {
      throw new Error("Invalid credentials");
    }

    const authUser: AuthUser = {
      id: persona.user.id,
      email: persona.user.email,
      role: persona.user.role,
      full_name: persona.user.name,
      family_id: persona.user.familyId,
      username: persona.user.username,
    };

    // Store session
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(authUser));
    }

    return { user: authUser };
  },

  /**
   * Sign out current user
   */
  signOut: async (): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<AuthUser | null> => {
    if (typeof window === "undefined") return null;

    const sessionData = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  },

  /**
   * Check if user has specific role
   */
  hasRole: async (role: UserRole): Promise<boolean> => {
    const user = await mockAuth.getCurrentUser();
    return user?.role === role;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const user = await mockAuth.getCurrentUser();
    return user !== null;
  },
};
