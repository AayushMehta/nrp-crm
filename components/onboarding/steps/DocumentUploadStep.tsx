"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  X,
  AlertCircle,
  File,
} from "lucide-react";

interface UploadedDocument {
  id: string;
  type: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

interface DocumentUploadStepProps {
  formData: {
    kyc_already_done: boolean;
    uploaded_documents: UploadedDocument[];
  };
  onUpload: (documentType: string, file: File) => Promise<void>;
  onRemove: (documentId: string) => void;
  errors?: Record<string, string>;
}

interface DocumentType {
  id: string;
  label: string;
  required: boolean;
  requiredForKyc: boolean;
  description: string;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: "pan_card",
    label: "PAN Card",
    required: true,
    requiredForKyc: true,
    description: "Permanent Account Number card (PDF, JPG, or PNG)",
  },
  {
    id: "aadhaar_card",
    label: "Aadhaar Card",
    required: true,
    requiredForKyc: true,
    description: "Aadhaar identification document (PDF, JPG, or PNG)",
  },
  {
    id: "cancelled_cheque",
    label: "Cancelled Cheque",
    required: true,
    requiredForKyc: false,
    description: "Cancelled cheque or bank account proof (PDF, JPG, or PNG)",
  },
  {
    id: "bank_statement",
    label: "Bank Statement",
    required: true,
    requiredForKyc: false,
    description: "Recent bank statement (last 3 months, PDF)",
  },
  {
    id: "income_proof",
    label: "Income Proof",
    required: false,
    requiredForKyc: false,
    description: "Salary slip or IT returns (optional, PDF)",
  },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function DocumentUploadStep({
  formData,
  onUpload,
  onRemove,
  errors = {},
}: DocumentUploadStepProps) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  const isDocumentUploaded = (documentType: string) => {
    return formData.uploaded_documents.some((doc) => doc.type === documentType);
  };

  const getUploadedDocument = (documentType: string) => {
    return formData.uploaded_documents.find((doc) => doc.type === documentType);
  };

  const handleFileSelect = async (documentType: string, file: File | null) => {
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be less than 10MB");
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(
        "Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX files only."
      );
      return;
    }

    setUploading({ ...uploading, [documentType]: true });
    try {
      await onUpload(documentType, file);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading({ ...uploading, [documentType]: false });
    }
  };

  const handleDrop = (documentType: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    handleFileSelect(documentType, file);
  };

  const handleDragOver = (documentType: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(documentType);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getRelevantDocuments = () => {
    if (formData.kyc_already_done) {
      return DOCUMENT_TYPES.filter((doc) => !doc.requiredForKyc);
    }
    return DOCUMENT_TYPES;
  };

  const relevantDocuments = getRelevantDocuments();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600 mb-4">
          Please upload the required documents. All files will be securely
          encrypted and stored.
        </p>
        {formData.kyc_already_done && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <p>
              Since you&apos;ve completed KYC, you don&apos;t need to upload PAN or
              Aadhaar documents.
            </p>
          </div>
        )}
      </div>

      {/* Document Upload Cards */}
      <div className="space-y-4">
        {relevantDocuments.map((docType) => {
          const uploaded = isDocumentUploaded(docType.id);
          const uploadedDoc = getUploadedDocument(docType.id);
          const isUploading = uploading[docType.id];
          const isDragging = dragOver === docType.id;

          return (
            <div
              key={docType.id}
              className={`border-2 rounded-lg p-5 transition-all ${
                uploaded
                  ? "border-green-300 bg-green-50"
                  : isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {uploaded ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                  ) : (
                    <FileText className="w-6 h-6 text-slate-400 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {docType.label}
                      {docType.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {docType.description}
                    </p>
                  </div>
                </div>
              </div>

              {uploaded && uploadedDoc ? (
                <div className="bg-white border border-green-300 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {uploadedDoc.file_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(uploadedDoc.file_size)} • Uploaded
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(uploadedDoc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={(e) => handleDrop(docType.id, e)}
                  onDragOver={(e) => handleDragOver(docType.id, e)}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 mx-auto mb-2 ${
                      isDragging ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <p className="text-sm text-slate-700 mb-2">
                    {isDragging ? (
                      <span className="text-blue-600 font-semibold">
                        Drop file here
                      </span>
                    ) : (
                      <>
                        Drag and drop or{" "}
                        <label
                          htmlFor={`file-${docType.id}`}
                          className="text-blue-600 hover:underline cursor-pointer font-semibold"
                        >
                          browse
                        </label>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, JPG, PNG, DOC, DOCX (max 10MB)
                  </p>
                  <input
                    id={`file-${docType.id}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) =>
                      handleFileSelect(docType.id, e.target.files?.[0] || null)
                    }
                    className="hidden"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="mt-3">
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Uploading...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {errors.uploaded_documents && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{errors.uploaded_documents}</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-700">
          <strong>Document Security:</strong> All uploaded documents are
          encrypted using AES-256 encryption and stored securely. Only
          authorized personnel can access your documents for verification
          purposes.
        </p>
      </div>
    </div>
  );
}
