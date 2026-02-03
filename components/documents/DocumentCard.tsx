// components/documents/DocumentCard.tsx
// Document card component for displaying document information

import { DocumentMetadata } from "@/types/documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Image,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DocumentCardProps {
  document: DocumentMetadata;
  onDownload?: (doc: DocumentMetadata) => void;
  onPreview?: (doc: DocumentMetadata) => void;
  onDelete?: (doc: DocumentMetadata) => void;
  showActions?: boolean;
  variant?: "list" | "grid";
}

export function DocumentCard({
  document,
  onDownload,
  onPreview,
  onDelete,
  showActions = true,
  variant = "list",
}: DocumentCardProps) {
  // File icon based on type
  const getFileIcon = () => {
    if (document.file_type.startsWith("image/")) {
      return <Image className="h-8 w-8 text-blue-600" />;
    }
    if (document.file_type === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-600" />;
    }
    return <File className="h-8 w-8 text-gray-600" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Status badge config
  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending Review",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    verified: {
      icon: CheckCircle2,
      label: "Verified",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const statusInfo = statusConfig[document.status];
  const StatusIcon = statusInfo.icon;

  // Category badge color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "kyc":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "financial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "tax":
        return "bg-green-100 text-green-800 border-green-200";
      case "portfolio_statement":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "agreement":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const canPreview = document.file_type.startsWith("image/");

  if (variant === "grid") {
    return (
      <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            {/* File Icon */}
            <div className="mb-3">{getFileIcon()}</div>

            {/* File Name */}
            <h4 className="text-sm font-semibold mb-2 line-clamp-2">
              {document.file_name}
            </h4>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              <Badge
                variant="outline"
                className={cn("text-xs", statusInfo.className)}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
              {document.category && (
                <Badge
                  variant="outline"
                  className={cn("text-xs", getCategoryColor(document.category))}
                >
                  {document.category.replace("_", " ")}
                </Badge>
              )}
            </div>

            {/* File Info */}
            <p className="text-xs text-muted-foreground mb-3">
              {formatFileSize(document.file_size)} •{" "}
              {format(new Date(document.uploaded_at), "MMM dd, yyyy")}
            </p>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 w-full">
                {canPreview && onPreview && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onPreview(document)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                )}
                {onDownload && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onDownload(document)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* File Icon */}
        <div className="shrink-0">{getFileIcon()}</div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate">{document.file_name}</h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge
              variant="outline"
              className={cn("text-xs", statusInfo.className)}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
            {document.category && (
              <Badge
                variant="outline"
                className={cn("text-xs", getCategoryColor(document.category))}
              >
                {document.category.replace("_", " ")}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatFileSize(document.file_size)}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(document.uploaded_at), "MMM dd, yyyy")}
            </span>
          </div>
          {document.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {document.notes}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {canPreview && onPreview && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPreview(document)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onDownload && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDownload(document)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(document)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
