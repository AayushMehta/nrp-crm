// app/admin/onboarding/checklists/[checklistId]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChecklistService } from "@/lib/services/checklist-service";
import { DocumentService } from "@/lib/services/document-service";
import { OnboardingChecklist } from "@/types/onboarding-checklist";
import { DocumentMetadata } from "@/types/documents";
import { DocumentVerificationPanel } from "@/components/onboarding/DocumentVerificationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, FileText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserFlowSection } from "@/components/ui/user-flow-section";

interface PageProps {
  params: Promise<{
    checklistId: string;
  }>;
}

export default function ChecklistDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [checklist, setChecklist] = useState<OnboardingChecklist | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);

  useEffect(() => {
    loadChecklist();
    loadDocuments();
  }, [resolvedParams.checklistId]);

  const loadChecklist = () => {
    const data = ChecklistService.getById(resolvedParams.checklistId);
    setChecklist(data);
  };

  const loadDocuments = () => {
    const docs = DocumentService.getByChecklist(resolvedParams.checklistId);
    setDocuments(docs);
  };

  const handleVerify = () => {
    loadChecklist();
    loadDocuments();
  };

  const handleReject = () => {
    loadChecklist();
    loadDocuments();
  };

  if (!checklist) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center">
            <p>Checklist not found</p>
            <Link href="/admin/onboarding">
              <Button className="mt-4">Back to Checklists</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/onboarding">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Checklists
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{checklist.family_name}</h1>
            <p className="text-muted-foreground">Onboarding Checklist</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{checklist.selected_service.toUpperCase()}</Badge>
            {checklist.kyc_already_done && <Badge variant="outline">KYC Done</Badge>}
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completion</span>
              <span className="text-2xl font-bold">{checklist.completion_percentage}%</span>
            </div>
            <Progress value={checklist.completion_percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">{checklist.total_required}</div>
              <div className="text-xs text-muted-foreground">Total Required</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{checklist.completed_count}</div>
              <div className="text-xs text-muted-foreground">Uploaded</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{checklist.verified_count}</div>
              <div className="text-xs text-muted-foreground">Verified</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Verification Panel */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle>Document Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentVerificationPanel
            documents={documents}
            onVerify={handleVerify}
            onReject={handleReject}
            currentUserId={user?.id || "admin-1"}
            currentUserName={user?.name || "Admin"}
          />
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle>Checklist Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checklist.items
              .filter((item) => item.status !== "not_required")
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{item.display_name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.status === "verified"
                        ? "success"
                        : item.status === "pending"
                        ? "warning"
                        : item.status === "rejected"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* User Flow Section */}
      <UserFlowSection
        pageName="Checklist Detail"
        description="Detailed view of individual checklist with document verification capabilities"
        userFlow={[
          {
            step: "View Progress Card",
            description: "See completion percentage, total required, uploaded, and verified counts, and current stage."
          },
          {
            step: "Review Service Info",
            description: "Check service type (NRP Light or NRP 360), KYC status, and client type."
          },
          {
            step: "Verify Documents",
            description: "Review uploaded documents, preview each file, and approve or reject with detailed reasons.",
            subSteps: [
              "Click 'View' to preview document",
              "Click 'Verify' to approve",
              "Click 'Reject' and provide clear reason",
              "System updates status automatically"
            ]
          },
          {
            step: "Track Checklist Items",
            description: "Review all required documents and monitor status badges (Required, Pending, Verified, Rejected)."
          },
          {
            step: "Communicate with Client",
            description: "Request missing documents or send automated reminders via message system."
          }
        ]}
        bestPractices={[
          "Verify documents promptly within 2 business days",
          "Provide clear, specific rejection reasons",
          "Check document quality and completeness",
          "Move to next stage when 100% verified",
          "Communicate clearly about missing items"
        ]}
        roleSpecific={{
          role: "Admin/RM",
          notes: [
            "Document verification is critical for compliance",
            "Rejection reasons are visible to clients",
            "Verified documents count toward completion progress",
            "System creates automated reminders on document upload"
          ]
        }}
      />
      </div>
    </AppLayout>
  );
}
