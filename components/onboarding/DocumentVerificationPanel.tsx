// components/onboarding/DocumentVerificationPanel.tsx
"use client";

import React, { useState } from "react";
import { DocumentMetadata } from "@/types/documents";
import { DocumentService } from "@/lib/services/document-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Download,
  Eye,
  FileText,
  Calendar,
  User,
} from "lucide-react";

interface DocumentVerificationPanelProps {
  documents: DocumentMetadata[];
  onVerify?: (documentId: string) => void;
  onReject?: (documentId: string, reason: string) => void;
  currentUserId: string;
  currentUserName: string;
}

export function DocumentVerificationPanel({
  documents,
  onVerify,
  onReject,
  currentUserId,
  currentUserName,
}: DocumentVerificationPanelProps) {
  const [previewDocument, setPreviewDocument] = useState<DocumentMetadata | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingDocument, setRejectingDocument] = useState<DocumentMetadata | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleVerify = (document: DocumentMetadata) => {
    DocumentService.verifyDocument(document.id, currentUserId, currentUserName);
    onVerify?.(document.id);
  };

  const handleRejectClick = (document: DocumentMetadata) => {
    setRejectingDocument(document);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectingDocument || !rejectionReason.trim()) {
      return;
    }

    DocumentService.rejectDocument(
      rejectingDocument.id,
      currentUserId,
      currentUserName,
      rejectionReason
    );
    onReject?.(rejectingDocument.id, rejectionReason);
    setRejectDialogOpen(false);
    setRejectingDocument(null);
    setRejectionReason("");
  };

  const handleDownload = (document: DocumentMetadata) => {
    DocumentService.downloadDocument(document.id);
  };

  const handlePreview = (document: DocumentMetadata) => {
    if (DocumentService.canPreview(document)) {
      setPreviewDocument(document);
    }
  };

  const getStatusBadge = (status: DocumentMetadata["status"]) => {
    const variants = {
      pending: { variant: "warning" as const, label: "Pending", icon: FileText },
      verified: { variant: "success" as const, label: "Verified", icon: CheckCircle2 },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: XCircle },
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const pendingDocuments = documents.filter((d) => d.status === "pending");
  const verifiedDocuments = documents.filter((d) => d.status === "verified");
  const rejectedDocuments = documents.filter((d) => d.status === "rejected");

  return (
    <div className="space-y-6">
      {/* Pending Documents */}
      {pendingDocuments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Pending Verification ({pendingDocuments.length})
          </h3>
          <div className="space-y-3">
            {pendingDocuments.map((document) => (
              <Card key={document.id} className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{document.file_name}</span>
                        {getStatusBadge(document.status)}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Uploaded by {document.uploaded_by_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(document.uploaded_at).toLocaleString()}</span>
                          </div>
                          <span>{formatFileSize(document.file_size)}</span>
                        </div>
                        {document.document_type && (
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {document.document_type.replace(/_/g, " ").toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {DocumentService.canPreview(document) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(document)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleVerify(document)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectClick(document)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Verified Documents */}
      {verifiedDocuments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Verified Documents ({verifiedDocuments.length})
          </h3>
          <div className="space-y-3">
            {verifiedDocuments.map((document) => (
              <Card key={document.id} className="border-green-200 bg-green-50/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{document.file_name}</span>
                        {getStatusBadge(document.status)}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>Verified by {document.verified_by_name}</span>
                          <span>{new Date(document.verified_at!).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {DocumentService.canPreview(document) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(document)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Documents */}
      {rejectedDocuments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Rejected Documents ({rejectedDocuments.length})
          </h3>
          <div className="space-y-3">
            {rejectedDocuments.map((document) => (
              <Card key={document.id} className="border-red-200 bg-red-50/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{document.file_name}</span>
                        {getStatusBadge(document.status)}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="text-red-600 font-medium">
                          Reason: {document.rejection_reason}
                        </div>
                        <div className="text-muted-foreground">
                          Rejected by {document.verified_by_name} on{" "}
                          {new Date(document.verified_at!).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents to verify</p>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. The client will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Input
                id="reason"
                placeholder="e.g., Document is not clear, wrong document uploaded"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim()}
            >
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {previewDocument && (
        <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewDocument.file_name}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[600px] overflow-auto">
              <img
                src={previewDocument.base64_data}
                alt={previewDocument.file_name}
                className="w-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
