"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Users,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Bell,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  IndianRupee,
  FileCheck,
} from "lucide-react";
import { ChecklistService } from "@/lib/services/checklist-service";
import { MeetingNoteService } from "@/lib/services/meeting-note-service";
import { DocumentService } from "@/lib/services/document-service";
import { ChecklistMaster } from "@/components/onboarding/ChecklistMaster";
import { WealthMetricsService } from "@/lib/services/wealth-metrics-service";
import { PortfolioService } from "@/lib/services/portfolio-service";
import { UserFlowSection } from "@/components/ui/user-flow-section";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    onboarding: { total: 0, pending_verification: 0, completed: 0 },
    meetings: { total: 0, this_month: 0, pending_actions: 0 },
    documents: { total: 0, pending: 0 },
    reminders: { overdue: 0, due_today: 0 },
  });

  // Calculate wealth metrics
  const wealthStats = useMemo(() => {
    const systemMetrics = WealthMetricsService.calculateSystemAUM();
    const allPortfolios = PortfolioService.getAllPortfolios();
    const avgReturn = allPortfolios.length > 0
      ? allPortfolios.reduce((sum, p) => sum + p.total_gain_percent, 0) / allPortfolios.length
      : 0;

    const allRisks = WealthMetricsService.getAllRiskAssessments();
    const overdueReviews = allRisks.filter(r => r.is_overdue).length;

    const revenueMetrics = WealthMetricsService.calculateRevenueMetrics();

    return {
      total_aum: systemMetrics.total_aum,
      aum_change_percent: systemMetrics.month_over_month_percent,
      active_rms: 5, // Mock count
      avg_clients_per_rm: Math.round(systemMetrics.client_count / 5),
      compliance_pending: overdueReviews,
      system_revenue: revenueMetrics.total_fees,
      avg_return: avgReturn,
    };
  }, []);

  useEffect(() => {
    const checklistStats = ChecklistService.getStats();
    const meetingStats = MeetingNoteService.getStats();
    const documentStats = DocumentService.getStats();

    setStats({
      onboarding: {
        total: checklistStats.total,
        pending_verification: checklistStats.pending_verification,
        completed: checklistStats.completed,
      },
      meetings: {
        total: meetingStats.total,
        this_month: meetingStats.completed_this_month,
        pending_actions: meetingStats.pending_actions,
      },
      documents: {
        total: documentStats.total,
        pending: documentStats.by_status.pending || 0,
      },
      reminders: { overdue: 0, due_today: 0 },
    });
  }, []);

  return (
    <AppLayout>
      <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">CRM Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage client relationships and communications</p>
        </div>

        {/* Wealth Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Total System AUM"
            value={`₹${(wealthStats.total_aum / 10000000).toFixed(1)}Cr`}
            description={`${wealthStats.aum_change_percent > 0 ? '+' : ''}${wealthStats.aum_change_percent.toFixed(1)}% MoM`}
            icon={TrendingUp}
            iconClassName="text-blue-600"
            trend={{ value: wealthStats.aum_change_percent, isPositive: wealthStats.aum_change_percent > 0 }}
          />

          <StatCard
            title="Active RMs"
            value={wealthStats.active_rms}
            description={`${wealthStats.avg_clients_per_rm} avg clients each`}
            icon={Users}
            iconClassName="text-purple-600"
          />

          <StatCard
            title="Compliance"
            value={wealthStats.compliance_pending}
            description="Pending reviews"
            icon={FileCheck}
            iconClassName={wealthStats.compliance_pending > 0 ? "text-orange-600" : "text-green-600"}
          />

          <StatCard
            title="System Revenue"
            value={`₹${(wealthStats.system_revenue / 100000).toFixed(1)}L`}
            description="This month"
            icon={IndianRupee}
            iconClassName="text-green-600"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding ({stats.onboarding.total})</TabsTrigger>
            <TabsTrigger value="meetings">Meetings ({stats.meetings.total})</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Document Verified</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New Onboarding Created</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Meeting Scheduled</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Create New Client
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Meeting
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Bell className="mr-2 h-4 w-4" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="onboarding">
            <ChecklistMaster onCreateNew={() => {}} />
          </TabsContent>

          <TabsContent value="meetings">
            <Card className="rounded-xl border shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <Calendar className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Meetings Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and manage all client meetings
                  </p>
                  <Button>View All Meetings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="rounded-xl border shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <MessageSquare className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Messaging Trail</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and manage all client communications with role-based visibility
                  </p>
                  <Button onClick={() => window.location.href = '/communications'}>
                    Open Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="rounded-xl border shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-purple-100 rounded-full">
                      <TrendingUp className="w-12 h-12 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Communication Timeline</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track all client interactions and communications
                  </p>
                  <Button>View Timeline</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <UserFlowSection
          pageName="Admin Dashboard"
          description="System-wide overview of wealth metrics, onboarding, and operations. View all families and track system performance."
          userFlow={[
            {
              step: "View Metrics",
              description: "Top StatCards show: Total System AUM, Active RMs, Compliance pending, and System Revenue. Compare month-over-month changes.",
              subSteps: []
            },
            {
              step: "Navigate Tabs",
              description: "Switch between different views to access specific information.",
              subSteps: [
                "Overview: Recent activity and quick actions",
                "Onboarding: Active checklists and pending verifications",
                "Meetings: All client meetings",
                "Messages: Client communications",
                "Timeline: Recent activity across all families"
              ]
            },
            {
              step: "Quick Actions",
              description: "Use quick action buttons to create clients, schedule meetings, upload documents, or create reminders.",
              subSteps: []
            }
          ]}
          bestPractices={[
            "Check dashboard daily for system-wide overview",
            "Review pending items in each tab",
            "Monitor overdue reviews and compliance issues",
            "Use Timeline tab to track recent activity",
            "Keep AUM metrics updated monthly"
          ]}
          roleSpecific={{
            role: "Admin",
            notes: [
              "You have access to ALL families and system-wide data",
              "Compliance monitoring is your responsibility",
              "Review pending verifications regularly",
              "Use this dashboard to oversee RM performance"
            ]
          }}
        />
      </div>
    </AppLayout>
  );
}
