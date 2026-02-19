"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { formatIndianCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  ShieldCheck,
  Briefcase,
  ArrowRight,
  Target
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
import { pageVariants } from "@/lib/animation-utils";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const router = useRouter();
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
    <ConsoleLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-8">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="space-y-8 pb-8"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                System-wide overview and operations
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Button variant="outline" className="hidden sm:flex rounded-xl border-border/60 hover:bg-muted/50">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                View Reports
              </Button>
            </motion.div>
          </div>

          {/* Wealth Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total System AUM"
              value={formatIndianCurrency(wealthStats.total_aum)}
              description={`${wealthStats.aum_change_percent > 0 ? '+' : ''}${wealthStats.aum_change_percent.toFixed(1)}% MoM`}
              icon={TrendingUp}
              iconClassName="text-blue-600"
              trend={{ value: wealthStats.aum_change_percent, isPositive: wealthStats.aum_change_percent > 0 }}
              variant="elevated"
            />

            <StatCard
              title="Active RMs"
              value={wealthStats.active_rms}
              description={`${wealthStats.avg_clients_per_rm} avg clients/RM`}
              icon={Users}
              iconClassName="text-purple-600"
              variant="elevated"
            />

            <StatCard
              title="Compliance Pending"
              value={wealthStats.compliance_pending}
              description="Reviews overdue"
              icon={FileCheck}
              iconClassName={wealthStats.compliance_pending > 0 ? "text-orange-600" : "text-green-600"}
              variant="elevated"
            />

            <StatCard
              title="System Revenue"
              value={formatIndianCurrency(wealthStats.system_revenue)}
              description="Recurring (Monthly)"
              icon={IndianRupee}
              iconClassName="text-green-600"
              variant="elevated"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-px overflow-x-auto">
              <TabsList className="h-10 bg-transparent p-0 space-x-6">
                {[
                  { value: "overview", label: "Overview" },
                  { value: "onboarding", label: `Onboarding (${stats.onboarding.total})` },
                  { value: "meetings", label: `Meetings (${stats.meetings.total})` },
                  { value: "messages", label: "Messages" },
                  { value: "timeline", label: "Timeline" }
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none transition-all hover:text-foreground"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Alert Banner for Compliance Issues */}
              {wealthStats.compliance_pending > 0 && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        {wealthStats.compliance_pending} Compliance Review{wealthStats.compliance_pending > 1 ? 's' : ''} Required
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        Risk assessments and KYC verifications pending.
                      </p>
                    </div>
                    <Button size="sm" variant="default" className="bg-orange-600 hover:bg-orange-700 text-white border-none shadow-none" onClick={() => router.push('/admin/onboarding')}>
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
                    className="card-elevated"
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
                  className="card-elevated"
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
                  className="card-elevated"
                />
              </div>

              {/* Client Status Grid */}
              <h3 className="text-lg font-semibold tracking-tight">System Health</h3>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  {
                    title: "Onboarding",
                    value: chartData.clientStatus.onboarding_pending,
                    label: "Pending Verification",
                    icon: UserCheck,
                    colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  },
                  {
                    title: "Compliance",
                    value: chartData.clientStatus.compliance_overdue,
                    label: "Overdue Reviews",
                    icon: FileCheck,
                    colorClass: chartData.clientStatus.compliance_overdue > 0 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  },
                  {
                    title: "Meetings",
                    value: chartData.clientStatus.meetings_this_month,
                    label: "This Month",
                    icon: Calendar,
                    colorClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                  },
                  {
                    title: "Documents",
                    value: chartData.clientStatus.documents_pending,
                    label: "Pending Review",
                    icon: ClipboardList,
                    colorClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                  }
                ].map((item, i) => (
                  <Card key={i} className="card-elevated border-none shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                          <p className="text-2xl font-bold mt-2">{item.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${item.colorClass}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Button className="w-full justify-start h-12 text-left" variant="outline" onClick={() => router.push('/admin/onboarding/invite')}>
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>Create Client</span>
                    </Button>
                    <Button className="w-full justify-start h-12 text-left" variant="outline" onClick={() => toast.info('Meeting scheduling coming soon')}>
                      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mr-3">
                        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>Schedule Meeting</span>
                    </Button>
                    <Button className="w-full justify-start h-12 text-left" variant="outline" onClick={() => toast.info('Document upload coming soon')}>
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span>Upload Document</span>
                    </Button>
                    <Button className="w-full justify-start h-12 text-left" variant="outline" onClick={() => router.push('/admin/planning')}>
                      <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mr-3">
                        <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span>B2A Wealth Planner</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="onboarding" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ChecklistMaster onCreateNew={() => { }} />
            </TabsContent>

            <TabsContent value="meetings" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="text-center py-16">
                    <div className="flex items-center justify-center mb-6">
                      <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Calendar className="w-10 h-10 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Meetings Management</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      View and manage all client meetings from a single dashboard.
                    </p>
                    <Button onClick={() => toast.info('Meetings management coming soon')}>View All Meetings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="text-center py-16">
                    <div className="flex items-center justify-center mb-6">
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <MessageSquare className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Messaging Trail</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      View and manage all client communications with role-based visibility.
                    </p>
                    <Button onClick={() => window.location.href = '/communications'}>
                      Open Messages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="text-center py-16">
                    <div className="flex items-center justify-center mb-6">
                      <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Communication Timeline</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Track all client interactions and communications in a unified timeline.
                    </p>
                    <Button onClick={() => toast.info('Timeline view coming soon')}>View Timeline</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <UserFlowSection
            pageName="Admin Dashboard"
            description="System-wide overview of wealth metrics, onboarding, and operations."
            userFlow={[
              { step: "View Metrics", description: "Top StatCards show: Total System AUM, Active RMs, Compliance pending, and System Revenue." },
              { step: "Navigate Tabs", description: "Switch between Overview, Onboarding, Meetings, Messages, and Timeline." },
              { step: "Quick Actions", description: "Create clients, schedule meetings, upload documents." }
            ]}
            bestPractices={[
              "Check dashboard daily",
              "Monitor overdue reviews",
              "Keep AUM metrics updated monthly"
            ]}
            roleSpecific={{
              role: "Admin",
              notes: ["Access to ALL families", "Compliance monitoring"]
            }}
          />
        </motion.div>
      </div>
    </ConsoleLayout>
  );
}
