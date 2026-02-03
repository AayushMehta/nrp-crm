// components/documents/DocumentUploadDialog.tsx
// Dialog for uploading documents

"use client";

import { useState } from "react";
import { DocumentMetadata, DocumentCategory } from "@/types/documents";
import { DocumentService } from "@/lib/services/document-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  familyName: string;
  userId: string;
  userName: string;
  onUploadComplete?: (doc: DocumentMetadata) => void;
  allowedCategories?: DocumentCategory[];
}

export function DocumentUploadDialog({
  isOpen,
  onClose,
  familyId,
  familyName,
  userId,
  userName,
  onUploadComplete,
  allowedCategories = ["kyc", "financial", "tax", "other"],
}: DocumentUploadDialogProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>("kyc");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const document = await DocumentService.uploadDocument(
        {
          file: selectedFile,
          entityType: "family",
          entityId: familyId,
          notes,
        },
        userId,
        userName,
        "family"
      );

      // Update with category and client visibility
      const updated = {
        ...document,
        category,
        is_client_uploaded: true,
        client_visible: true,
      };

      toast({
        title: "Document uploaded",
        description: `${selectedFile.name} has been uploaded successfully`,
      });

      onUploadComplete?.(updated as DocumentMetadata);
      handleClose();
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCategory("kyc");
    setNotes("");
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload KYC documents, financial documents, or other files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    PDF, JPG, or PNG (max 10MB)
                  </p>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as DocumentCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {allowedCategories.includes("kyc") && (
                  <SelectItem value="kyc">KYC Documents</SelectItem>
                )}
                {allowedCategories.includes("financial") && (
                  <SelectItem value="financial">Financial Documents</SelectItem>
                )}
                {allowedCategories.includes("tax") && (
                  <SelectItem value="tax">Tax Documents</SelectItem>
                )}
                {allowedCategories.includes("portfolio_statement") && (
                  <SelectItem value="portfolio_statement">Portfolio Statements</SelectItem>
                )}
                {allowedCategories.includes("agreement") && (
                  <SelectItem value="agreement">Agreements</SelectItem>
                )}
                {allowedCategories.includes("other") && (
                  <SelectItem value="other">Other</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this document..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
