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
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { ChecklistService } from "@/lib/services/checklist-service";
import { MeetingNoteService } from "@/lib/services/meeting-note-service";
import { DocumentService } from "@/lib/services/document-service";
import { ChecklistMaster } from "@/components/onboarding/ChecklistMaster";
import { WealthMetricsService } from "@/lib/services/wealth-metrics-service";
import { PortfolioService } from "@/lib/services/portfolio-service";
import { UserFlowSection } from "@/components/ui/user-flow-section";
import { BaseAreaChart } from "@/components/charts/BaseAreaChart";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import { BasePieChart } from "@/components/charts/BasePieChart";
import { CHART_COLORS } from "@/lib/chart-colors";
import { motion } from "framer-motion";
import { cardStaggerVariants, pageVariants } from "@/lib/animation-utils";

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

  // Chart data
  const chartData = useMemo(() => {
    return {
      historicalAUM: WealthMetricsService.getHistoricalAUM(12),
      tierDistribution: WealthMetricsService.getAUMByTierForChart(),
      revenueBreakdown: WealthMetricsService.getRevenueByServiceForChart(),
      clientStatus: WealthMetricsService.getClientStatusSummary(),
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
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">CRM Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage client relationships and communications</p>
        </motion.div>

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

          <TabsContent value="overview" className="space-y-6">
            {/* Alert Banner for Compliance Issues */}
            {wealthStats.compliance_pending > 0 && (
              <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      {wealthStats.compliance_pending} Compliance Review{wealthStats.compliance_pending > 1 ? 's' : ''} Overdue
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Risk assessments require immediate attention
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30">
                    Review Now
                  </Button>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* System AUM Trend - Spans 2 columns */}
              <div className="md:col-span-2">
                <BaseAreaChart
                  data={chartData.historicalAUM.map(item => ({
                    name: item.month,
                    value: item.value,
                  }))}
                  title="System AUM Trend"
                  description="12-month assets under management history"
                  dataKey="value"
                  xAxisKey="name"
                  color={CHART_COLORS.tiers.tier_1}
                  gradientId="systemAUMGradient"
                  formatType="currency"
                  height={350}
                />
              </div>

              {/* Revenue Breakdown Pie Chart */}
              <BasePieChart
                data={chartData.revenueBreakdown.map(item => ({
                  name: item.name,
                  value: item.value,
                }))}
                title="Revenue by Service"
                description="Monthly fee breakdown"
                colors={[CHART_COLORS.services.nrp_360, CHART_COLORS.services.nrp_light]}
                formatType="currency"
                showLegend={true}
                height={350}
              />
            </div>

            {/* Second Row - Tier Distribution */}
            <div className="grid gap-6 md:grid-cols-1">
              <BaseBarChart
                data={chartData.tierDistribution.map((item, index) => ({
                  name: item.name,
                  value: item.value,
                  color: [
                    CHART_COLORS.tiers.tier_1,
                    CHART_COLORS.tiers.tier_2,
                    CHART_COLORS.tiers.tier_3,
                    CHART_COLORS.tiers.prospect,
                  ][index],
                }))}
                title="AUM by Client Tier"
                description="Asset distribution across client segments"
                dataKey="value"
                xAxisKey="name"
                formatType="currency"
                layout="horizontal"
                height={280}
              />
            </div>

            {/* Client Status Grid */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
                      <p className="text-2xl font-bold mt-2">{chartData.clientStatus.onboarding_pending}</p>
                      <p className="text-xs text-muted-foreground mt-1">Pending verification</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                      <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                      <p className="text-2xl font-bold mt-2">{chartData.clientStatus.compliance_overdue}</p>
                      <p className="text-xs text-muted-foreground mt-1">Overdue reviews</p>
                    </div>
                    <div className={`p-3 rounded-lg ${chartData.clientStatus.compliance_overdue > 0 ? 'bg-orange-100 dark:bg-orange-950' : 'bg-green-100 dark:bg-green-950'}`}>
                      <FileCheck className={`h-5 w-5 ${chartData.clientStatus.compliance_overdue > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Meetings</p>
                      <p className="text-2xl font-bold mt-2">{chartData.clientStatus.meetings_this_month}</p>
                      <p className="text-xs text-muted-foreground mt-1">This month</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Documents</p>
                      <p className="text-2xl font-bold mt-2">{chartData.clientStatus.documents_pending}</p>
                      <p className="text-xs text-muted-foreground mt-1">Pending review</p>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions moved to bottom */}
            <Card className="rounded-xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Create Client
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
                </div>
              </CardContent>
            </Card>
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
      </motion.div>
    </AppLayout>
  );
}
