"use client";

// context/AuthContext.tsx
// Authentication context for NRP CRM

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, Family, UserPersona } from "@/types/auth";
import {
  authenticateUser,
  SAMPLE_USERS,
  initializeSampleUsers,
} from "@/data/mock/sample-users";
import { mockAuth } from "@/lib/auth/mockAuth";
import { seedDemoData } from "@/lib/services/seed-data";

interface AuthContextType {
  user: User | null;
  family: Family | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getSampleUsers: () => typeof SAMPLE_USERS;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize sample users and load session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Initialize sample users if needed
        initializeSampleUsers();
        seedDemoData();

        // Check if there's an existing session
        const currentUser = await mockAuth.getCurrentUser();

        if (currentUser) {
          // Find user persona from sample data
          const persona = SAMPLE_USERS.find(
            (p) => p.user.id === currentUser.id
          );
          if (persona) {
            setUser(persona.user);
            setFamily(persona.family || null);
            console.log(`🔐 Session restored for ${persona.user.username}`);
          }
        }
      } catch (error) {
        console.error("Failed to load user session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoading(true);

      try {
        // Use mock authentication
        const persona = authenticateUser(username, password);
        if (persona) {
          // Store session in mockAuth
          await mockAuth.signIn(username, password);

          setUser(persona.user);
          setFamily(persona.family || null);
          console.log(
            `🔐 Login successful for ${persona.user.username} (${persona.user.role})`
          );
          return true;
        }

        return false;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    console.log("🚪 Logging out");

    try {
      await mockAuth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear auth state
    setUser(null);
    setFamily(null);

    // Hard redirect to login page
    window.location.href = '/auth/login';
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;

    try {
      // Find updated user persona from sample data
      const persona = SAMPLE_USERS.find((p) => p.user.id === user.id);
      if (persona) {
        setUser(persona.user);
        setFamily(persona.family || null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, [user]);

  const getSampleUsers = useCallback(() => {
    return SAMPLE_USERS;
  }, []);

  const value: AuthContextType = {
    user,
    family,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getSampleUsers,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
