// lib/services/document-service.ts
// Business logic for document management

import {
  DocumentMetadata,
  DocumentUploadOptions,
  DocumentVerificationResult,
  DocumentFilter,
} from "@/types/documents";
import { documentStorage } from "@/lib/storage/document-storage";
import { checklistStorage } from "@/lib/storage/checklist-storage";
import { ChecklistService } from "./checklist-service";
import { ReminderAutomationService } from "./reminder-automation-service";
import { generateId } from "@/lib/utils";

/**
 * Service for managing documents
 */
export class DocumentService {
  /**
   * Convert File to base64 string
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload a document
   */
  static async uploadDocument(
    options: DocumentUploadOptions,
    uploadedById: string,
    uploadedByName: string,
    uploadedByRole: DocumentMetadata["uploaded_by_role"]
  ): Promise<DocumentMetadata> {
    const { file, checklistId, checklistItemId, entityType, entityId, documentType, notes, tags } = options;

    // Convert file to base64
    const base64Data = await this.fileToBase64(file);

    // Create document metadata
    const document: DocumentMetadata = {
      id: generateId("doc"),
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      uploaded_by_id: uploadedById,
      uploaded_by_name: uploadedByName,
      uploaded_by_role: uploadedByRole,
      entity_type: entityType,
      entity_id: entityId,
      checklist_id: checklistId,
      checklist_item_id: checklistItemId,
      document_type: documentType,
      status: "pending",
      base64_data: base64Data,
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes,
      tags,
    };

    // Save document
    const savedDocument = documentStorage.create(document);

    // Update checklist item status if applicable
    if (checklistId && checklistItemId) {
      ChecklistService.updateItemStatus(
        checklistId,
        checklistItemId,
        "pending",
        savedDocument.id
      );
    }

    // Trigger automated reminder for document verification
    if (checklistId) {
      const checklist = checklistStorage.getById(checklistId);
      if (checklist) {
        try {
          ReminderAutomationService.onDocumentUploaded({
            checklistId,
            documentName: file.name,
            familyId: checklist.family_id,
            familyName: checklist.family_name,
            uploadedBy: uploadedById,
          });
        } catch (error) {
          console.error("Failed to create automated reminder:", error);
          // Don't fail the upload if reminder creation fails
        }
      }
    }

    return savedDocument;
  }

  /**
   * Verify a document
   */
  static verifyDocument(
    documentId: string,
    verifiedById: string,
    verifiedByName: string,
    notes?: string
  ): DocumentVerificationResult | null {
    const document = documentStorage.getById(documentId);
    if (!document) {
      return null;
    }

    const verifiedAt = new Date().toISOString();

    // Update document
    const updated = documentStorage.update(documentId, {
      status: "verified",
      verified_by_id: verifiedById,
      verified_by_name: verifiedByName,
      verified_at: verifiedAt,
      notes: notes || document.notes,
    });

    if (!updated) {
      return null;
    }

    // Update checklist item status if applicable
    if (document.checklist_id && document.checklist_item_id) {
      ChecklistService.updateItemStatus(
        document.checklist_id,
        document.checklist_item_id,
        "verified",
        documentId,
        verifiedAt,
        verifiedByName
      );
    }

    return {
      documentId,
      status: "verified",
      verifiedBy: verifiedByName,
      verifiedAt,
      notes,
    };
  }

  /**
   * Reject a document
   */
  static rejectDocument(
    documentId: string,
    rejectedById: string,
    rejectedByName: string,
    rejectionReason: string
  ): DocumentVerificationResult | null {
    const document = documentStorage.getById(documentId);
    if (!document) {
      return null;
    }

    const verifiedAt = new Date().toISOString();

    // Update document
    const updated = documentStorage.update(documentId, {
      status: "rejected",
      verified_by_id: rejectedById,
      verified_by_name: rejectedByName,
      verified_at: verifiedAt,
      rejection_reason: rejectionReason,
    });

    if (!updated) {
      return null;
    }

    // Update checklist item status if applicable
    if (document.checklist_id && document.checklist_item_id) {
      ChecklistService.updateItemStatus(
        document.checklist_id,
        document.checklist_item_id,
        "rejected",
        documentId,
        verifiedAt,
        rejectedByName,
        rejectionReason
      );
    }

    return {
      documentId,
      status: "rejected",
      verifiedBy: rejectedByName,
      verifiedAt,
      rejectionReason,
    };
  }

  /**
   * Get document by ID
   */
  static getById(documentId: string): DocumentMetadata | null {
    return documentStorage.getById(documentId);
  }

  /**
   * Get documents by checklist
   */
  static getByChecklist(checklistId: string): DocumentMetadata[] {
    return documentStorage.getByChecklist(checklistId);
  }

  /**
   * Get documents by entity
   */
  static getByEntity(entityType: string, entityId: string): DocumentMetadata[] {
    return documentStorage.getByEntity(entityType, entityId);
  }

  /**
   * Query documents with filters
   */
  static query(filter: DocumentFilter): DocumentMetadata[] {
    return documentStorage.query(filter);
  }

  /**
   * Get pending documents (uploaded but not verified)
   */
  static getPendingDocuments(): DocumentMetadata[] {
    return documentStorage.getByStatus("pending");
  }

  /**
   * Download document as file
   */
  static downloadDocument(documentId: string): void {
    const document = documentStorage.getById(documentId);
    if (!document || !document.base64_data) {
      throw new Error("Document not found or no data available");
    }

    // Create a temporary link and trigger download
    const link = window.document.createElement("a");
    link.href = document.base64_data;
    link.download = document.file_name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  }

  /**
   * Delete document
   */
  static deleteDocument(documentId: string): boolean {
    const document = documentStorage.getById(documentId);
    if (!document) {
      return false;
    }

    // Reset checklist item status if applicable
    if (document.checklist_id && document.checklist_item_id) {
      ChecklistService.updateItemStatus(
        document.checklist_id,
        document.checklist_item_id,
        "required"
      );
    }

    return documentStorage.delete(documentId);
  }

  /**
   * Get document statistics
   */
  static getStats() {
    const documents = documentStorage.getAll();

    return {
      total: documents.length,
      by_status: {
        pending: documents.filter((d) => d.status === "pending").length,
        verified: documents.filter((d) => d.status === "verified").length,
        rejected: documents.filter((d) => d.status === "rejected").length,
      },
      by_type: documents.reduce((acc, doc) => {
        const type = doc.document_type || "other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_size_bytes: documents.reduce((acc, doc) => acc + doc.file_size, 0),
    };
  }

  /**
   * Check if document can be previewed (image types)
   */
  static canPreview(document: DocumentMetadata): boolean {
    const previewableTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    return previewableTypes.includes(document.file_type);
  }

  /**
   * Get preview URL for document
   */
  static getPreviewUrl(documentId: string): string | null {
    const document = documentStorage.getById(documentId);
    if (!document || !this.canPreview(document)) {
      return null;
    }

    return document.base64_data || null;
  }

  /**
   * Get client-visible documents for a family
   */
  static getClientDocuments(
    familyId: string,
    category?: string
  ): DocumentMetadata[] {
    const docs = this.getByEntity("family", familyId);

    // Filter for client-visible documents (default is visible unless explicitly set to false)
    const clientDocs = docs.filter((d) => d.client_visible !== false);

    if (category) {
      return clientDocs.filter((d) => d.category === category);
    }

    return clientDocs.sort(
      (a, b) =>
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }

  /**
   * Get recent documents for a family
   */
  static getRecentDocuments(
    familyId: string,
    limit: number = 3
  ): DocumentMetadata[] {
    return this.getClientDocuments(familyId).slice(0, limit);
  }

  /**
   * Get documents grouped by category
   */
  static getDocumentsByCategory(
    familyId: string
  ): Record<string, DocumentMetadata[]> {
    const docs = this.getClientDocuments(familyId);

    const categories: Record<string, DocumentMetadata[]> = {
      kyc: [],
      financial: [],
      tax: [],
      portfolio_statement: [],
      agreement: [],
      onboarding: [],
      other: [],
    };

    docs.forEach((doc) => {
      const cat = doc.category || "other";
      if (categories[cat]) {
        categories[cat].push(doc);
      }
    });

    return categories;
  }

  /**
   * Get document statistics for client portal
   */
  static getClientDocumentStats(familyId: string) {
    const docs = this.getClientDocuments(familyId);
    const now = new Date();
    const thisMonth = docs.filter((d) => {
      const uploadDate = new Date(d.uploaded_at);
      return (
        uploadDate.getMonth() === now.getMonth() &&
        uploadDate.getFullYear() === now.getFullYear()
      );
    });

    return {
      total: docs.length,
      by_status: {
        pending: docs.filter((d) => d.status === "pending").length,
        verified: docs.filter((d) => d.status === "verified").length,
        rejected: docs.filter((d) => d.status === "rejected").length,
      },
      by_category: docs.reduce((acc, doc) => {
        const cat = doc.category || "other";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      this_month: thisMonth.length,
    };
  }
}
