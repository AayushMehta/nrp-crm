// components/onboarding/ChecklistMaster.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ChecklistService } from "@/lib/services/checklist-service";
import { OnboardingChecklist, OnboardingStep } from "@/types/onboarding-checklist";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColoredBadge } from "@/components/ui/colored-badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Users,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface ChecklistMasterProps {
  onCreateNew?: () => void;
}

export function ChecklistMaster({ onCreateNew }: ChecklistMasterProps) {
  const [checklists, setChecklists] = useState<OnboardingChecklist[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    by_step: {
      kyc_docs: 0,
      data_input: 0,
      execution: 0,
      completed: 0,
    },
    pending_verification: 0,
    completed: 0,
  });
  const [activeTab, setActiveTab] = useState<"all" | OnboardingStep>("all");

  useEffect(() => {
    loadChecklists();
    loadStats();
  }, []);

  const loadChecklists = () => {
    const allChecklists = ChecklistService.getAll();
    setChecklists(allChecklists);
  };

  const loadStats = () => {
    const statsData = ChecklistService.getStats();
    setStats(statsData);
  };

  const getFilteredChecklists = () => {
    if (activeTab === "all") {
      return checklists;
    }
    return checklists.filter((c) => c.current_step === activeTab);
  };

  const getStepBadge = (step: OnboardingStep) => {
    const variants = {
      kyc_docs: { variant: "info" as const, label: "KYC & Docs" },
      data_input: { variant: "warning" as const, label: "Data Input" },
      execution: { variant: "purple" as const, label: "Execution" },
      completed: { variant: "success" as const, label: "Completed" },
    };
    const config = variants[step];
    return <ColoredBadge variant={config.variant}>{config.label}</ColoredBadge>;
  };

  const getPendingCount = (checklist: OnboardingChecklist) => {
    return checklist.items.filter((item) => item.status === "pending").length;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Onboarding Checklists</h1>
          <p className="text-muted-foreground">
            Manage client onboarding and document verification
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create Checklist
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Total Checklists"
          value={stats.total}
          description="Active onboarding clients"
          icon={Users}
          iconClassName="text-blue-600"
        />

        <StatCard
          title="Pending Verification"
          value={stats.pending_verification}
          description="Documents awaiting review"
          icon={Clock}
          iconClassName="text-yellow-600"
        />

        <StatCard
          title="In Progress"
          value={stats.by_step.kyc_docs + stats.by_step.data_input + stats.by_step.execution}
          description="Ongoing onboarding"
          icon={AlertCircle}
          iconClassName="text-orange-600"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          description="Fully onboarded clients"
          icon={CheckCircle2}
          iconClassName="text-green-600"
        />
      </div>

      {/* Checklists Table */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="kyc_docs">
            KYC & Docs ({stats.by_step.kyc_docs})
          </TabsTrigger>
          <TabsTrigger value="data_input">
            Data Input ({stats.by_step.data_input})
          </TabsTrigger>
          <TabsTrigger value="execution">
            Execution ({stats.by_step.execution})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({stats.by_step.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {getFilteredChecklists().length === 0 ? (
            <Card className="rounded-xl border shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <FileText className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <p className="text-muted-foreground font-medium">No checklists found</p>
                {activeTab === "all" && onCreateNew && (
                  <Button onClick={onCreateNew} className="mt-4">
                    Create your first checklist
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredChecklists().map((checklist) => (
                <Card key={checklist.id} className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{checklist.family_name}</h3>
                          {getStepBadge(checklist.current_step)}
                          {checklist.kyc_already_done && (
                            <ColoredBadge variant="info">KYC Done</ColoredBadge>
                          )}
                          <Badge variant="outline" className="font-medium">
                            {checklist.selected_service.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="space-y-3 mt-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold text-blue-600">
                                {checklist.completion_percentage}%
                              </span>
                            </div>
                            <Progress value={checklist.completion_percentage} className="h-2" />
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">
                                {checklist.verified_count}/{checklist.total_required} verified
                              </span>
                            </div>
                            {getPendingCount(checklist) > 0 && (
                              <div className="flex items-center gap-1.5 text-yellow-600">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">{getPendingCount(checklist)} pending</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span>Created {new Date(checklist.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/admin/onboarding/checklists/${checklist.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
