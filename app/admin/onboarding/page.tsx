// app/admin/onboarding/page.tsx
"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ChecklistMaster } from "@/components/onboarding/ChecklistMaster";
import { ChecklistService } from "@/lib/services/checklist-service";
import { useRouter } from "next/navigation";
import { UserFlowSection } from "@/components/ui/user-flow-section";

export default function AdminOnboardingPage() {
  const router = useRouter();

  const handleCreateNew = () => {
    // For demo, create a sample checklist
    const checklist = ChecklistService.createFromTemplate(
      "fam-demo-" + Date.now(),
      "Demo Family",
      false,
      "nrp_360",
      "admin-1"
    );

    router.push(`/admin/onboarding/checklists/${checklist.id}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <ChecklistMaster onCreateNew={handleCreateNew} />

        <UserFlowSection
          pageName="Admin Onboarding"
          description="Master view of all client onboarding checklists. Track progress, verify documents, and manage the onboarding pipeline."
          userFlow={[
            {
              step: "View Onboarding Metrics",
              description: "StatCards show Total Checklists, Pending Verification, In Progress, and Completed. Track overall onboarding health.",
              subSteps: []
            },
            {
              step: "Filter by Stage",
              description: "Click stage tabs to filter checklists.",
              subSteps: [
                "All: View all checklists",
                "KYC & Docs: Document collection stage",
                "Data Input: Portfolio data entry",
                "Execution: Account setup and execution",
                "Completed: Fully onboarded clients"
              ]
            },
            {
              step: "Review Checklist Cards",
              description: "Each card shows family name, service type, progress bar, verification status, and current stage.",
              subSteps: []
            },
            {
              step: "Take Action",
              description: "Click 'View Details' on any card to navigate to checklist detail page for document verification.",
              subSteps: []
            },
            {
              step: "Create New Checklist",
              description: "Click 'New Checklist' button, select family, choose service type (NRP Light or NRP 360), indicate if KYC already done. System auto-generates conditional checklist.",
              subSteps: []
            }
          ]}
          bestPractices={[
            "Prioritize 'Pending Verification' items",
            "Review KYC & Docs stage first",
            "Verify documents within 2 business days",
            "Monitor completion percentages",
            "Communicate with clients about missing documents"
          ]}
          roleSpecific={{
            role: "Admin",
            notes: [
              "You see ALL family checklists",
              "Focus on pending verifications to unblock progress",
              "Use this page to monitor overall onboarding pipeline",
              "Move checklists to next stage when 100% verified"
            ]
          }}
        />
      </div>
    </AppLayout>
  );
}
