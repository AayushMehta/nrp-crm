// components/documents/DocumentList.tsx
// List of documents with search and filter

"use client";

import { useState, useMemo } from "react";
import { DocumentMetadata } from "@/types/documents";
import { DocumentCard } from "./DocumentCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface DocumentListProps {
  documents: DocumentMetadata[];
  title?: string;
  description?: string;
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
  showSearch?: boolean;
  onDocumentClick?: (doc: DocumentMetadata) => void;
  onDownload?: (doc: DocumentMetadata) => void;
  onPreview?: (doc: DocumentMetadata) => void;
  onDelete?: (doc: DocumentMetadata) => void;
}

export function DocumentList({
  documents,
  title,
  description,
  onDocumentClick,
  onDownload,
  onPreview,
  onDelete,
}: DocumentListProps) {
  return (
    <Card className="rounded-xl border shadow-sm">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={title || description ? "" : "p-6"}>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDownload={onDownload}
                onPreview={onPreview}
                onDelete={onDelete}
                showActions={true}
                variant="list"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              No documents found
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Your documents will appear here when uploaded
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
