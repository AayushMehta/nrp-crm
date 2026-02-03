// types/documents.ts
// Type definitions for document management

import { DocumentType } from "./onboarding-checklist";

export type DocumentEntityType =
  | "user"
  | "family"
  | "onboarding"
  | "checklist_item"
  | "meeting_note"
  | "general";

export type DocumentUploadRole = "admin" | "rm" | "family" | "temp_client";

export type DocumentCategory =
  | "kyc"
  | "financial"
  | "tax"
  | "portfolio_statement"
  | "agreement"
  | "onboarding"
  | "other";

export interface DocumentMetadata {
  id: string;
  file_name: string;
  file_type: string; // MIME type
  file_size: number; // in bytes

  // Ownership
  uploaded_by_id: string;
  uploaded_by_name: string;
  uploaded_by_role: DocumentUploadRole;

  // Association
  entity_type: DocumentEntityType;
  entity_id: string;

  // For checklist items
  checklist_id?: string;
  checklist_item_id?: string;
  document_type?: DocumentType;

  // Status
  status: "pending" | "verified" | "rejected";
  verified_by_id?: string;
  verified_by_name?: string;
  verified_at?: string;
  rejection_reason?: string;

  // Client portal fields
  category?: DocumentCategory;
  is_client_uploaded?: boolean;
  client_visible?: boolean; // Default true - whether clients can see this document

  // Storage
  base64_data?: string; // For localStorage
  storage_path?: string; // For Supabase Storage
  storage_url?: string; // Public URL if applicable

  // Metadata
  uploaded_at: string;
  updated_at: string;
  tags?: string[];
  notes?: string;
  version?: number; // For document versioning
}

export interface DocumentUploadOptions {
  file: File;
  checklistId?: string;
  checklistItemId?: string;
  entityType: DocumentEntityType;
  entityId: string;
  documentType?: DocumentType;
  notes?: string;
  tags?: string[];
}

export interface DocumentVerificationResult {
  documentId: string;
  status: "verified" | "rejected";
  verifiedBy: string;
  verifiedAt: string;
  notes?: string;
  rejectionReason?: string;
}

export interface DocumentFilter {
  entity_type?: DocumentEntityType;
  entity_id?: string;
  checklist_id?: string;
  status?: "pending" | "verified" | "rejected";
  uploaded_by_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface DocumentPreview {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  preview_url?: string; // For images
  can_preview: boolean;
}
