// components/documents/DocumentPreviewDialog.tsx
// Dialog for previewing documents

"use client";

import { DocumentMetadata } from "@/types/documents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DocumentPreviewDialogProps {
  document: DocumentMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (doc: DocumentMetadata) => void;
}

export function DocumentPreviewDialog({
  document,
  isOpen,
  onClose,
  onDownload,
}: DocumentPreviewDialogProps) {
  if (!document) return null;

  const canPreview = document.file_type.startsWith("image/");
  const isPDF = document.file_type === "application/pdf";

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Status badge config
  const statusConfig = {
    pending: {
      label: "Pending Review",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    verified: {
      label: "Verified",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const statusInfo = statusConfig[document.status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle>{document.file_name}</DialogTitle>
              <DialogDescription className="mt-2">
                Uploaded on {format(new Date(document.uploaded_at), "MMMM dd, yyyy 'at' hh:mm a")}
                {" • "}
                {formatFileSize(document.file_size)}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={cn("shrink-0", statusInfo.className)}
            >
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Document metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Category
              </p>
              <p className="text-sm font-semibold capitalize">
                {document.category?.replace("_", " ") || "Other"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Uploaded By
              </p>
              <p className="text-sm font-semibold">
                {document.uploaded_by_name}
              </p>
            </div>
            {document.notes && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-sm">{document.notes}</p>
              </div>
            )}
            {document.status === "rejected" && document.rejection_reason && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-red-700 mb-1">
                  Rejection Reason
                </p>
                <p className="text-sm text-red-600">{document.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4">
            {canPreview && document.base64_data ? (
              <div className="flex justify-center">
                <img
                  src={document.base64_data}
                  alt={document.file_name}
                  className="max-w-full h-auto max-h-[500px] rounded"
                />
              </div>
            ) : isPDF ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-red-600 mb-4" />
                <p className="text-lg font-semibold mb-2">PDF Document</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Preview not available. Download to view.
                </p>
                {onDownload && (
                  <Button
                    size="sm"
                    onClick={() => onDownload(document)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg font-semibold mb-2">Preview Not Available</p>
                <p className="text-sm text-muted-foreground mb-4">
                  This file type cannot be previewed
                </p>
                {onDownload && (
                  <Button
                    size="sm"
                    onClick={() => onDownload(document)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onDownload && (
            <Button onClick={() => onDownload(document)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
