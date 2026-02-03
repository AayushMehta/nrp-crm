// components/client-portal/ClientChecklistView.tsx
"use client";

import React, { useState } from "react";
import { OnboardingChecklist, ChecklistItem } from "@/types/onboarding-checklist";
import { DocumentService } from "@/lib/services/document-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploadZone } from "@/components/documents/FileUploadZone";
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
  Clock,
  XCircle,
  Upload,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react";

interface ClientChecklistViewProps {
  checklist: OnboardingChecklist;
  onUpload?: (itemId: string, file: File) => void;
  currentUserId: string;
  currentUserName: string;
}

export function ClientChecklistView({
  checklist,
  onUpload,
  currentUserId,
  currentUserName,
}: ClientChecklistViewProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<ChecklistItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadClick = (item: ChecklistItem) => {
    setUploadingItem(item);
    setSelectedFile(null);
    setUploadDialogOpen(true);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUploadConfirm = async () => {
    if (!uploadingItem || !selectedFile) {
      return;
    }

    setUploading(true);
    try {
      await DocumentService.uploadDocument(
        {
          file: selectedFile,
          checklistId: checklist.id,
          checklistItemId: uploadingItem.id,
          entityType: "checklist_item",
          entityId: uploadingItem.id,
          documentType: uploadingItem.document_type,
        },
        currentUserId,
        currentUserName,
        "family"
      );

      onUpload?.(uploadingItem.id, selectedFile);
      setUploadDialogOpen(false);
      setUploadingItem(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (item: ChecklistItem) => {
    const variants = {
      required: { variant: "outline" as const, label: "Required", icon: AlertCircle },
      pending: { variant: "warning" as const, label: "Under Review", icon: Clock },
      verified: { variant: "success" as const, label: "Verified", icon: CheckCircle2 },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: XCircle },
      not_required: { variant: "outline" as const, label: "Not Required", icon: Info },
    };
    const config = variants[item.status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getItemsByCategory = () => {
    const requiredItems = checklist.items.filter((item) => item.status !== "not_required");
    const grouped = requiredItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ChecklistItem[]>);

    return grouped;
  };

  const getCategoryTitle = (category: string) => {
    const titles = {
      kyc: "KYC Documents",
      forms: "Forms & Declarations",
      financial: "Financial Documents",
      additional: "Additional Documents",
    };
    return titles[category as keyof typeof titles] || category;
  };

  const itemsByCategory = getItemsByCategory();

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-2xl font-bold">{checklist.completion_percentage}%</span>
            </div>
            <Progress value={checklist.completion_percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{checklist.total_required}</div>
              <div className="text-xs text-muted-foreground">Total Required</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {checklist.items.filter((i) => i.status === "pending").length}
              </div>
              <div className="text-xs text-muted-foreground">Under Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{checklist.verified_count}</div>
              <div className="text-xs text-muted-foreground">Verified</div>
            </div>
          </div>

          {checklist.completion_percentage === 100 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">All documents verified!</p>
                <p className="text-sm text-green-700">
                  Your onboarding is complete. We'll contact you soon for the next steps.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Checklist by Category */}
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{getCategoryTitle(category)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium">{item.display_name}</span>
                    {getStatusBadge(item)}
                    {item.is_mandatory && (
                      <Badge variant="outline" className="text-xs">
                        Mandatory
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>

                  {item.status === "rejected" && item.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-900">
                      <strong>Rejection Reason:</strong> {item.rejection_reason}
                    </div>
                  )}

                  {item.status === "verified" && item.verified_at && (
                    <div className="mt-1 text-xs text-green-600">
                      Verified on {new Date(item.verified_at).toLocaleDateString()}
                    </div>
                  )}

                  {item.status === "pending" && item.uploaded_at && (
                    <div className="mt-1 text-xs text-yellow-600">
                      Uploaded on {new Date(item.uploaded_at).toLocaleDateString()} - Under review
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {(item.status === "required" || item.status === "rejected") && (
                    <Button onClick={() => handleUploadClick(item)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  )}
                  {item.status === "pending" && (
                    <Button variant="outline" disabled>
                      <Clock className="mr-2 h-4 w-4" />
                      Under Review
                    </Button>
                  )}
                  {item.status === "verified" && (
                    <Button variant="outline" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                      Verified
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              {uploadingItem && (
                <>
                  Upload your <strong>{uploadingItem.display_name}</strong>
                  <br />
                  {uploadingItem.description}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <FileUploadZone
              onFileSelect={handleFileSelect}
              onFileRemove={() => setSelectedFile(null)}
              selectedFile={selectedFile}
              maxSizeMB={10}
              disabled={uploading}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadConfirm}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
