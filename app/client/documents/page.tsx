"use client";

// app/client/documents/page.tsx
// Client documents page - upload and view documents

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { DocumentService } from "@/lib/services/document-service";
import { DocumentMetadata } from "@/types/documents";
import {
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserFlowSection } from "@/components/ui/user-flow-section";

export default function ClientDocumentsPage() {
  const { user, family } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Load documents on mount
  useEffect(() => {
    if (family) {
      loadDocuments();
    }
  }, [family]);

  const loadDocuments = () => {
    if (!family) return;

    const allDocs = DocumentService.getClientDocuments(family.id);
    setDocuments(allDocs);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!family) {
      return {
        total: 0,
        by_status: { pending: 0, verified: 0, rejected: 0 },
        this_month: 0,
      };
    }

    return DocumentService.getClientDocumentStats(family.id);
  }, [documents, family]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.file_name.toLowerCase().includes(query) ||
          d.notes?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    return filtered;
  }, [documents, searchQuery, categoryFilter, statusFilter]);

  // Handle document download
  const handleDownload = (document: DocumentMetadata) => {
    try {
      DocumentService.downloadDocument(document.id);
      toast({
        title: "Download started",
        description: `Downloading ${document.file_name}`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "An error occurred while downloading the document",
        variant: "destructive",
      });
    }
  };

  // Handle document preview
  const handlePreview = (document: DocumentMetadata) => {
    setSelectedDocument(document);
    setIsPreviewDialogOpen(true);
  };

  // Handle upload complete
  const handleUploadComplete = () => {
    loadDocuments();
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage your documents and KYC submissions
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Total Documents"
            value={stats.total}
            description="All documents"
            icon={FileText}
            iconClassName="text-blue-600"
          />
          <StatCard
            title="Pending Review"
            value={stats.by_status.pending}
            description="Awaiting verification"
            icon={Clock}
            iconClassName="text-yellow-600"
          />
          <StatCard
            title="Verified"
            value={stats.by_status.verified}
            description="Approved documents"
            icon={CheckCircle2}
            iconClassName="text-green-600"
          />
          <StatCard
            title="This Month"
            value={stats.this_month}
            description="Uploaded this month"
            icon={Calendar}
            iconClassName="text-purple-600"
          />
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="kyc">KYC</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="tax">Tax</SelectItem>
                <SelectItem value="portfolio_statement">Statements</SelectItem>
                <SelectItem value="agreement">Agreements</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Result count */}
          <p className="text-sm text-muted-foreground mt-3">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}{" "}
            {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
              ? "found"
              : "total"}
          </p>
        </Card>

        {/* Document List */}
        <DocumentList
          documents={filteredDocuments}
          title="Your Documents"
          description="All your uploaded documents and statements"
          onDownload={handleDownload}
          onPreview={handlePreview}
        />

        {/* Upload Dialog */}
        {user && family && (
          <DocumentUploadDialog
            isOpen={isUploadDialogOpen}
            onClose={() => setIsUploadDialogOpen(false)}
            familyId={family.id}
            familyName={family.name}
            userId={user.id}
            userName={user.name}
            onUploadComplete={handleUploadComplete}
            allowedCategories={["kyc", "financial", "tax", "other"]}
          />
        )}

        {/* Preview Dialog */}
        <DocumentPreviewDialog
          document={selectedDocument}
          isOpen={isPreviewDialogOpen}
          onClose={() => setIsPreviewDialogOpen(false)}
          onDownload={handleDownload}
        />

        {/* User Flow Section */}
        <UserFlowSection
          pageName="Client Documents"
          description="Upload and track document submission during onboarding"
          userFlow={[
            {
              step: "View Document Status",
              description: "See all required documents with status badges: Required, Pending, Verified, Rejected."
            },
            {
              step: "Upload Documents",
              description: "Submit required documents securely.",
              subSteps: [
                "Click 'Upload' on required document",
                "Select file or drag-and-drop",
                "Confirm document type",
                "Click 'Upload'",
                "Status changes to 'Pending'",
                "Await verification from RM/Admin"
              ]
            },
            {
              step: "Re-upload Rejected Documents",
              description: "View rejection reason, upload corrected document, and status changes to 'Pending' again."
            },
            {
              step: "Track Progress",
              description: "Progress bar shows completion percentage and verified count vs. total required."
            }
          ]}
          bestPractices={[
            "Upload clear, readable documents",
            "Use correct document type",
            "Check rejection reasons carefully",
            "Re-upload promptly if rejected",
            "Contact RM if unclear about requirements"
          ]}
          roleSpecific={{
            role: "Client",
            notes: [
              "Only verified documents count toward completion",
              "Rejection reasons help you correct issues quickly",
              "Support PDF, JPG, and PNG formats",
              "File size limit: 10 MB per document",
              "Secure storage with encryption"
            ]
          }}
        />
      </div>
    </AppLayout>
  );
}
