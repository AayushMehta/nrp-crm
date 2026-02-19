// app/admin/onboarding/checklists/[checklistId]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
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
      <ConsoleLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="p-4 rounded-full bg-muted/30">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Checklist Not Found</h3>
            <p className="text-muted-foreground">The checklist you are looking for does not exist or has been removed.</p>
          </div>
          <Link href="/admin/onboarding">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Checklists
            </Button>
          </Link>
        </div>
      </ConsoleLayout>
    );
  }

  return (
    <ConsoleLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-8">
        {/* Header */}
        <div>
          <Link href="/admin/onboarding">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Checklists
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{checklist.family_name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">Admin Mode</Badge>
                <p className="text-muted-foreground text-lg">Onboarding Checklist</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="h-8 px-3">{checklist.selected_service.toUpperCase()}</Badge>
              {checklist.kyc_already_done && <Badge variant="outline" className="h-8 px-3 bg-green-50 text-green-700 border-green-200">KYC Done</Badge>}
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="rounded-xl border shadow-sm bg-card">
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
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold">{checklist.total_required}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Required</div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{checklist.completed_count}</div>
                <div className="text-xs text-yellow-600/80 dark:text-yellow-500/80 uppercase tracking-wider font-semibold">Uploaded</div>
              </div>
              <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">{checklist.verified_count}</div>
                <div className="text-xs text-green-600/80 dark:text-green-500/80 uppercase tracking-wider font-semibold">Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Verification Panel */}
        <Card className="rounded-xl border shadow-sm bg-card">
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
        <Card className="rounded-xl border shadow-sm bg-card">
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
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.display_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
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
                      className="capitalize"
                    >
                      {item.status.replace("_", " ")}
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
    </ConsoleLayout>
  );
}
