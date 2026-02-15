// types/auth.ts
// Authentication and user management types for NRP CRM

export type UserRole = "admin" | "rm" | "family" | "back_office";

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  familyId?: string;  // For family users
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  primaryContactId: string;
  members: FamilyMember[];
  assignedRMId?: string;  // Assigned Relationship Manager

  // Wealth Management Fields
  total_aum?: number;
  tier?: 'tier_1' | 'tier_2' | 'tier_3' | 'prospect';
  service_type?: 'nrp_light' | 'nrp_360';
  risk_profile?: 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive';
  portfolio_id?: string;
  onboarding_completed_date?: string;
  first_investment_date?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  id: string;
  userId?: string;  // If they have a user account
  name: string;
  relationship: "self" | "spouse" | "child" | "parent" | "other";
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserPersona {
  user: User;
  family?: Family;
  credentials: LoginCredentials;
  description: string;
}

export interface AuthState {
  user: User | null;
  family: Family | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
