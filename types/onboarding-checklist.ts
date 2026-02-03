// types/onboarding-checklist.ts
// Type definitions for onboarding checklist system

export type DocumentCategory = "kyc" | "forms" | "financial" | "additional";

export type DocumentType =
  // KYC Documents
  | "pan_card"
  | "aadhaar_card"
  | "cancelled_check"
  | "kyc_certificate" // If KYC already done

  // Mandatory Forms
  | "risk_profile_form"
  | "investor_declaration_form"
  | "customer_profile_form"
  | "nominee_declaration_form"

  // Data Input Sheets
  | "data_input_sheet_nrp_light"
  | "data_input_sheet_nrp_360"

  // Financial Documents
  | "bank_statement"
  | "income_proof"
  | "net_worth_statement"

  // Additional
  | "other";

export type DocumentStatus =
  | "required" // Not yet uploaded
  | "pending" // Uploaded, awaiting verification
  | "verified" // Admin verified
  | "rejected" // Admin rejected, needs reupload
  | "not_required"; // Based on conditional logic

export type OnboardingStep =
  | "kyc_docs" // Step 1: KYC & Documentation
  | "data_input" // Step 2: Data Input Sheet
  | "execution" // Step 3: Fund Discussion & Execution
  | "completed"; // Fully onboarded

export type ClientType = "individual" | "huf" | "trust" | "company";

export type ServiceType = "nrp_light" | "nrp_360";

export interface ChecklistItem {
  id: string;
  document_type: DocumentType;
  category: DocumentCategory;
  display_name: string;
  description: string;
  status: DocumentStatus;
  is_mandatory: boolean;

  // Conditional logic
  conditional_on?: {
    field: string; // e.g., 'kyc_already_done'
    value: any; // Expected value
    if_true: boolean; // Show if condition true/false
  };

  // File tracking
  uploaded_file_id?: string;
  uploaded_at?: string;
  uploaded_by?: string;
  verified_at?: string;
  verified_by?: string;
  verified_by_name?: string;
  rejection_reason?: string;

  // Order and grouping
  order: number;
  group?: string;
}

export interface OnboardingChecklist {
  id: string;
  onboarding_request_id?: string;
  family_id: string;
  family_name: string;

  // Checklist state
  items: ChecklistItem[];
  total_required: number;
  completed_count: number;
  verified_count: number;
  completion_percentage: number;

  // Workflow state
  current_step: OnboardingStep;
  kyc_already_done: boolean; // Exception flag
  selected_service: ServiceType;
  client_type: ClientType;

  // Access control
  temporary_access_token?: string;
  temporary_access_expires?: string;
  full_login_granted: boolean;
  first_purchase_date?: string;

  // Assignment
  created_by: string;
  created_by_name: string;
  assigned_rm_id?: string;
  assigned_rm_name?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  client_type: ClientType;
  service_type: ServiceType | "both";
  items: Omit<
    ChecklistItem,
    | "id"
    | "status"
    | "uploaded_file_id"
    | "uploaded_at"
    | "verified_at"
    | "uploaded_by"
    | "verified_by"
  >[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistProgress {
  total: number;
  completed: number;
  verified: number;
  rejected: number;
  percentage: number;
}

export interface ChecklistFilter {
  status?: "not_started" | "in_progress" | "pending_verification" | "completed";
  family_id?: string;
  assigned_rm_id?: string;
  current_step?: OnboardingStep;
  date_from?: string;
  date_to?: string;
}
