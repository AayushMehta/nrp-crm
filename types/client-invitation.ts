// types/client-invitation.ts
// Type definitions for client invitation and self-service onboarding

export type InvitationStatus = 'pending' | 'in_progress' | 'completed' | 'expired';

/**
 * Client Invitation
 * Represents an invitation sent to a prospective client for self-service onboarding
 */
export interface ClientInvitation {
  id: string;
  email: string;
  token: string;
  status: InvitationStatus;

  // Admin context
  created_by_id: string;
  created_by_name: string;
  assigned_rm_id?: string;
  assigned_rm_name?: string;

  // Lifecycle timestamps
  created_at: string;
  expires_at: string;
  accepted_at?: string;  // When client first clicked the link
  completed_at?: string; // When onboarding was submitted

  // Links to created entities
  client_id?: string;
  checklist_id?: string;

  // Tracking
  access_count: number;
  last_accessed_at?: string;

  // Email tracking (for future integration)
  email_sent_at?: string;
  email_opened_at?: string;

  // Revocation
  revoked: boolean;
  revoked_at?: string;
  revoked_by?: string;
  revoked_reason?: string;
}

/**
 * Onboarding Form Data
 * Data collected through the self-service onboarding wizard
 */
export interface OnboardingFormData {
  // Step 1: Basic Information
  family_name: string;
  primary_contact_name: string;
  primary_contact_phone: string;

  // Step 2: Address Details
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Step 3: Service Selection
  selected_service: 'nrp_light' | 'nrp_360';
  kyc_already_done: boolean;

  // Step 4: Family Members (optional)
  family_members?: FamilyMemberData[];

  // Additional preferences
  preferred_communication?: 'email' | 'phone' | 'both';
  notes?: string;
}

/**
 * Family Member Data
 * Information about additional family members
 */
export interface FamilyMemberData {
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
}

/**
 * Onboarding Progress
 * Tracks partial completion and auto-save data
 */
export interface OnboardingProgress {
  token: string;
  current_step: number;
  total_steps: number;
  form_data: Partial<OnboardingFormData>;
  last_saved_at: string;
  completed_steps: number[];
}

/**
 * Document Upload Metadata
 * Tracks documents uploaded during onboarding
 */
export interface OnboardingDocument {
  id: string;
  token: string;
  document_type: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_data: string; // Base64 encoded
  uploaded_at: string;
}

/**
 * Invitation Statistics
 */
export interface InvitationStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  expired: number;
  revoked: number;
  completion_rate: number; // Percentage
  average_time_to_complete?: number; // Days
}

/**
 * Invitation Creation Data
 */
export interface InvitationCreateData {
  email: string;
  assigned_rm_id?: string;
  expiry_days?: number; // Default 14
  notes?: string;
}

/**
 * Token Validation Result
 */
export interface TokenValidationResult {
  valid: boolean;
  invitation?: ClientInvitation;
  error?: string;
  error_code?: 'not_found' | 'expired' | 'revoked' | 'completed';
}
