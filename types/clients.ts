// types/clients.ts
// Extended client management types

import { Family } from "./auth";

export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'onboarding' | 'churned';
export type ReviewStatus = 'current' | 'due_soon' | 'overdue';
export type ServiceType = 'nrp_light' | 'nrp_360';
export type ClientTier = 'tier_1' | 'tier_2' | 'tier_3' | 'prospect';
export type RiskProfile = 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive';

// Extended client interface with additional management fields
export interface Client extends Family {
  // Status tracking
  status: ClientStatus;
  review_status?: ReviewStatus;

  // Contact information
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // RM Assignment
  assigned_rm_id?: string;
  assigned_rm_name?: string;
  assigned_date?: string;

  // Relationship tracking
  last_contact_date?: string;
  next_review_date?: string;
  last_meeting_date?: string;

  // Financial overview
  total_aum: number;
  invested_amount?: number;
  current_value?: number;
  unrealized_gain?: number;
  unrealized_gain_percent?: number;
  one_year_return?: number;

  // Service details
  tier: ClientTier;
  service_type: ServiceType;
  risk_profile: RiskProfile;

  // Onboarding
  onboarding_status?: 'not_started' | 'in_progress' | 'completed';
  onboarding_completed_date?: string;
  kyc_status?: 'pending' | 'submitted' | 'verified' | 'rejected';

  // Portfolio
  portfolio_id?: string;
  first_investment_date?: string;

  // Tags and notes
  tags?: string[];
  notes?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ClientFilter {
  status?: ClientStatus | ClientStatus[];
  tier?: ClientTier | ClientTier[];
  assigned_rm_id?: string;
  service_type?: ServiceType;
  search_query?: string;
  review_status?: ReviewStatus;
  kyc_status?: 'pending' | 'submitted' | 'verified' | 'rejected';
}

export interface ClientStats {
  total: number;
  by_status: Record<ClientStatus, number>;
  by_tier: Record<ClientTier, number>;
  by_service_type: Record<ServiceType, number>;
  by_review_status: Record<ReviewStatus, number>;
  total_aum: number;
  average_aum: number;
  total_clients_with_rm: number;
  onboarding_in_progress: number;
}

export interface ClientCreateData {
  // Required fields
  name: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;

  // Optional fields
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  assigned_rm_id?: string;
  tier?: ClientTier;
  service_type?: ServiceType;
  risk_profile?: RiskProfile;
  notes?: string;
  tags?: string[];
}

export interface ClientUpdateData {
  name?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  assigned_rm_id?: string;
  tier?: ClientTier;
  service_type?: ServiceType;
  risk_profile?: RiskProfile;
  status?: ClientStatus;
  notes?: string;
  tags?: string[];
  total_aum?: number;
  next_review_date?: string;
  kyc_status?: 'pending' | 'submitted' | 'verified' | 'rejected';
}
