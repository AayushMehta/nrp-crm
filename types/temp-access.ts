// types/temp-access.ts
// Type definitions for temporary access token system

export type TempAccessAction = "upload" | "view" | "download";

export interface TempAccessToken {
  id: string;
  token: string; // UUID or JWT

  // Association
  onboarding_request_id?: string;
  checklist_id: string;
  family_id: string;
  family_name: string;
  client_email: string;
  client_name?: string;

  // Permissions
  allowed_actions: TempAccessAction[];
  max_upload_size_mb: number;
  max_uploads?: number; // Total number of uploads allowed

  // Lifecycle
  created_at: string;
  created_by: string;
  created_by_name: string;
  expires_at: string;
  last_accessed_at?: string;
  access_count: number;
  is_active: boolean;

  // Revocation
  revoked_at?: string;
  revoked_by?: string;
  revoked_by_name?: string;
  revoked_reason?: string;

  // Tracking
  uploads_count: number;
  downloads_count: number;
}

export interface TempAccessValidation {
  valid: boolean;
  token?: TempAccessToken;
  checklist?: any; // OnboardingChecklist
  error?: string;
  error_code?:
    | "token_not_found"
    | "token_expired"
    | "token_revoked"
    | "token_inactive"
    | "max_uploads_reached";
}

export interface TempAccessLog {
  id: string;
  token_id: string;
  action: TempAccessAction | "login" | "logout";
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface TempAccessInvitation {
  to_email: string;
  to_name: string;
  family_name: string;
  access_url: string;
  expires_at: string;
  instructions?: string;
}
