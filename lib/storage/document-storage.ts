// lib/storage/document-storage.ts
// Storage layer for documents

import { DocumentMetadata, DocumentFilter } from "@/types/documents";
import { getFromStorage, setToStorage } from "./localStorage";

export const DOCUMENT_STORAGE_KEY = "nrp_crm_documents";

export const documentStorage = {
  /**
   * Get all documents
   */
  getAll(): DocumentMetadata[] {
    return getFromStorage<DocumentMetadata[]>(DOCUMENT_STORAGE_KEY, []);
  },

  /**
   * Get document by ID
   */
  getById(documentId: string): DocumentMetadata | null {
    const documents = this.getAll();
    return documents.find((d) => d.id === documentId) || null;
  },

  /**
   * Create new document
   */
  create(document: DocumentMetadata): DocumentMetadata {
    const documents = this.getAll();
    documents.push(document);
    setToStorage(DOCUMENT_STORAGE_KEY, documents);
    return document;
  },

  /**
   * Update existing document
   */
  update(
    documentId: string,
    updates: Partial<DocumentMetadata>
  ): DocumentMetadata | null {
    const documents = this.getAll();
    const index = documents.findIndex((d) => d.id === documentId);

    if (index === -1) {
      return null;
    }

    documents[index] = {
      ...documents[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setToStorage(DOCUMENT_STORAGE_KEY, documents);
    return documents[index];
  },

  /**
   * Delete document
   */
  delete(documentId: string): boolean {
    const documents = this.getAll();
    const filtered = documents.filter((d) => d.id !== documentId);

    if (filtered.length === documents.length) {
      return false;
    }

    setToStorage(DOCUMENT_STORAGE_KEY, filtered);
    return true;
  },

  /**
   * Get documents by entity
   */
  getByEntity(entityType: string, entityId: string): DocumentMetadata[] {
    const documents = this.getAll();
    return documents.filter(
      (d) => d.entity_type === entityType && d.entity_id === entityId
    );
  },

  /**
   * Get documents by checklist
   */
  getByChecklist(checklistId: string): DocumentMetadata[] {
    const documents = this.getAll();
    return documents.filter((d) => d.checklist_id === checklistId);
  },

  /**
   * Get documents by checklist item
   */
  getByChecklistItem(checklistItemId: string): DocumentMetadata[] {
    const documents = this.getAll();
    return documents.filter((d) => d.checklist_item_id === checklistItemId);
  },

  /**
   * Get documents by status
   */
  getByStatus(status: DocumentMetadata["status"]): DocumentMetadata[] {
    const documents = this.getAll();
    return documents.filter((d) => d.status === status);
  },

  /**
   * Query documents with filters
   */
  query(filter: DocumentFilter): DocumentMetadata[] {
    let documents = this.getAll();

    if (filter.entity_type) {
      documents = documents.filter((d) => d.entity_type === filter.entity_type);
    }

    if (filter.entity_id) {
      documents = documents.filter((d) => d.entity_id === filter.entity_id);
    }

    if (filter.checklist_id) {
      documents = documents.filter((d) => d.checklist_id === filter.checklist_id);
    }

    if (filter.status) {
      documents = documents.filter((d) => d.status === filter.status);
    }

    if (filter.uploaded_by_id) {
      documents = documents.filter((d) => d.uploaded_by_id === filter.uploaded_by_id);
    }

    if (filter.date_from) {
      documents = documents.filter((d) => d.uploaded_at >= filter.date_from!);
    }

    if (filter.date_to) {
      documents = documents.filter((d) => d.uploaded_at <= filter.date_to!);
    }

    return documents;
  },

  /**
   * Save all documents (bulk update)
   */
  saveAll(documents: DocumentMetadata[]): void {
    setToStorage(DOCUMENT_STORAGE_KEY, documents);
  },
};
