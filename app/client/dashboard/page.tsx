"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  BarChart3,
  Activity,
  FileText,
} from "lucide-react";
import { PortfolioService } from "@/lib/services/portfolio-service";
import { TransactionService } from "@/lib/services/transaction-service";
import { MeetingService } from "@/lib/services/meeting-service";
import { DocumentService } from "@/lib/services/document-service";
import { HoldingsTable } from "@/components/wealth/HoldingsTable";
import { TransactionTable } from "@/components/wealth/TransactionTable";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { UpcomingMeetingsWidget } from "@/components/dashboard/UpcomingMeetingsWidget";
import { RecentDocumentsWidget } from "@/components/dashboard/RecentDocumentsWidget";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { UserFlowSection } from "@/components/ui/user-flow-section";
import { BaseAreaChart } from "@/components/charts/BaseAreaChart";
import { BasePieChart } from "@/components/charts/BasePieChart";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import { BaseComposedChart } from "@/components/charts/BaseComposedChart";
import { CHART_COLORS } from "@/lib/chart-colors";
import { motion } from "framer-motion";
import { cardStaggerVariants, pageVariants } from "@/lib/animation-utils";

export default function ClientDashboard() {
  const { user, family } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Load portfolio data
  const portfolioData = useMemo(() => {
    if (!family?.id) return null;

    const portfolio = PortfolioService.getPortfolioByFamily(family.id);
    const recentTxns = TransactionService.getRecentTransactions(family.id, 30);
    const completedTxns = recentTxns.filter(t => t.status === 'completed');

    return {
      portfolio,
      recentTransactions: completedTxns,
    };
  }, [family]);

  // Chart data for client dashboard
  const chartData = useMemo(() => {
    if (!family?.id || !portfolioData?.portfolio) return null;

    return {
      historicalValues: PortfolioService.getHistoricalValues(family.id, 12),
      topHoldings: PortfolioService.getTopHoldings(family.id, 5),
      cashflowAnalysis: TransactionService.getCashflowAnalysis(family.id, 6),
      assetAllocation: portfolioData.portfolio.asset_allocation.map(a => ({
        name: a.asset_class.charAt(0).toUpperCase() + a.asset_class.slice(1).replace('_', ' '),
        value: a.value,
      })),
    };
  }, [family, portfolioData]);

  // Load upcoming meetings
  const upcomingMeetings = useMemo(() => {
    if (!family?.id || !user?.id) return [];
    return MeetingService.getUpcoming(family.id, 3);
  }, [family, user]);

  // Load recent documents
  const recentDocuments = useMemo(() => {
    if (!family?.id) return [];
    return DocumentService.getRecentDocuments(family.id, 3);
  }, [family]);

  const stats = useMemo(() => {
    if (!portfolioData?.portfolio) {
      return {
        portfolio_value: 0,
        holdings_count: 0,
        total_gain: 0,
        total_gain_percent: 0,
        recent_transactions: 0,
      };
    }

    return {
      portfolio_value: portfolioData.portfolio.total_value,
      holdings_count: portfolioData.portfolio.holdings.length,
      total_gain: portfolioData.portfolio.total_gain,
      total_gain_percent: portfolioData.portfolio.total_gain_percent,
      recent_transactions: portfolioData.recentTransactions.length,
    };
  }, [portfolioData]);

  // Check if onboarding is complete (mock check)
  const onboardingComplete = true; // In real app, check family.onboarding_completed_date

  // Handle quick actions
  const handleMessageRM = () => {
    router.push("/communications");
  };

  const handleScheduleMeeting = () => {
    toast({
      title: "Coming Soon",
      description: "Meeting scheduling feature will be available soon",
    });
  };

  const handleUploadDocument = () => {
    setIsUploadDialogOpen(true);
  };

  const handleMeetingClick = (meeting: any) => {
    router.push("/client/meetings");
  };

  const handleJoinMeeting = (meeting: any) => {
    if (meeting.meeting_url) {
      window.open(meeting.meeting_url, "_blank");
    }
  };

  const handleDownloadDocument = (document: any) => {
    try {
      DocumentService.downloadDocument(document.id);
      toast({
        title: "Download started",
        description: `Downloading ${document.file_name}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "An error occurred while downloading the document",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="p-6 space-y-6"
      >
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            {family?.name || "Client Portal"} - Your portfolio overview
          </p>
        </motion.div>

        {/* Portfolio Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Portfolio Value"
            value={`₹${(stats.portfolio_value / 100000).toFixed(2)}L`}
            description={`${stats.holdings_count} holdings`}
            icon={Wallet}
            iconClassName="text-blue-600"
          />
          <StatCard
            title="Total Returns"
            value={`₹${(stats.total_gain / 100000).toFixed(2)}L`}
            description={`${stats.total_gain_percent >= 0 ? '+' : ''}${stats.total_gain_percent.toFixed(1)}%`}
            icon={TrendingUp}
            iconClassName={stats.total_gain >= 0 ? "text-green-600" : "text-red-600"}
            trend={{ value: stats.total_gain_percent, isPositive: stats.total_gain >= 0 }}
          />
          <StatCard
            title="XIRR"
            value={`${stats.total_gain_percent.toFixed(1)}%`}
            description="Annualized returns"
            icon={BarChart3}
            iconClassName="text-purple-600"
          />
          <StatCard
            title="Recent Activity"
            value={stats.recent_transactions}
            description="Last 30 days"
            icon={Activity}
            iconClassName="text-orange-600"
          />
        </div>

        {/* Quick Actions Widget */}
        <QuickActionsWidget
          onMessageRM={handleMessageRM}
          onScheduleMeeting={handleScheduleMeeting}
          onUploadDocument={handleUploadDocument}
        />

        {/* Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            {!onboardingComplete && (
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            )}
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {portfolioData?.portfolio && chartData ? (
              <>
                {/* First Row: Portfolio Trend and Asset Allocation */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Portfolio Value Trend - 2 columns */}
                  <div className="lg:col-span-2">
                    <BaseAreaChart
                      data={chartData.historicalValues.map(item => ({
                        name: item.month,
                        value: item.current,
                        secondaryValue: item.invested,
                      }))}
                      title="Portfolio Value Trend"
                      description="12-month growth: invested vs current value"
                      dataKey="value"
                      secondaryDataKey="secondaryValue"
                      xAxisKey="name"
                      color={CHART_COLORS.performance.positive}
                      secondaryColor={CHART_COLORS.performance.neutral}
                      gradientId="portfolioValueGradient"
                      secondaryGradientId="portfolioInvestedGradient"
                      formatType="currency"
                      height={350}
                    />
                  </div>

                  {/* Asset Allocation Pie - 1 column */}
                  <BasePieChart
                    data={chartData.assetAllocation}
                    title="Asset Allocation"
                    description="Portfolio distribution"
                    colors={[
                      CHART_COLORS.assets.equity,
                      CHART_COLORS.assets.debt,
                      CHART_COLORS.assets.mutual_fund,
                      CHART_COLORS.assets.gold,
                      CHART_COLORS.assets.real_estate,
                      CHART_COLORS.assets.cash,
                      CHART_COLORS.assets.alternative,
                    ]}
                    formatType="currency"
                    showLegend={true}
                    height={350}
                  />
                </div>

                {/* Second Row: Top Holdings Performance */}
                <div className="grid gap-6 md:grid-cols-1">
                  <BaseBarChart
                    data={chartData.topHoldings.map(h => ({
                      name: h.name,
                      value: h.gainPercent,
                      color: h.gainPercent > 0 ? CHART_COLORS.performance.positive : CHART_COLORS.performance.negative,
                    }))}
                    title="Top Holdings Performance"
                    description="Best performing securities (1-year returns)"
                    dataKey="value"
                    xAxisKey="name"
                    formatType="number"
                    layout="horizontal"
                    height={280}
                    showValues
                  />
                </div>

                {/* Third Row: Holdings Table */}
                <HoldingsTable
                  holdings={portfolioData.portfolio.holdings}
                  title="Your Holdings"
                  description="All securities in your portfolio"
                />
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">No portfolio data</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Your portfolio will appear here once investments are made
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            {portfolioData?.recentTransactions && portfolioData.recentTransactions.length > 0 && chartData ? (
              <>
                {/* Cashflow Analysis Chart */}
                <BaseComposedChart
                  data={chartData.cashflowAnalysis.map(item => ({
                    name: item.month,
                    barValue1: item.invested,
                    barValue2: item.withdrawn,
                    lineValue: item.net,
                  }))}
                  title="Cashflow Analysis"
                  description="6-month investment activity"
                  barDataKey1="barValue1"
                  barDataKey2="barValue2"
                  lineDataKey="lineValue"
                  xAxisKey="name"
                  barColor1={CHART_COLORS.performance.positive}
                  barColor2={CHART_COLORS.performance.negative}
                  lineColor={CHART_COLORS.performance.benchmark}
                  formatType="currency"
                  height={350}
                />

                {/* Transaction Table */}
                <TransactionTable
                  transactions={portfolioData.recentTransactions}
                  title="Transaction History"
                  description="Your recent portfolio transactions"
                  showFilter={true}
                />
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">No transactions yet</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Your transaction history will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Onboarding Tab (conditional) */}
          {!onboardingComplete && (
            <TabsContent value="onboarding">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Onboarding</CardTitle>
                  <CardDescription>
                    Finish these steps to access your full portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Upload KYC Documents</p>
                        <p className="text-xs text-muted-foreground">Required for account activation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Complete Risk Profile</p>
                        <p className="text-xs text-muted-foreground">Help us understand your investment goals</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Bottom Widgets: Upcoming Meetings & Recent Documents */}
        <div className="grid gap-6 md:grid-cols-2">
          <UpcomingMeetingsWidget
            meetings={upcomingMeetings}
            onViewAll={() => router.push("/client/meetings")}
            onMeetingClick={handleMeetingClick}
            onJoinClick={handleJoinMeeting}
          />
          <RecentDocumentsWidget
            documents={recentDocuments}
            onViewAll={() => router.push("/client/documents")}
            onDownload={handleDownloadDocument}
          />
        </div>

        {/* Upload Document Dialog */}
        {user && family && (
          <DocumentUploadDialog
            isOpen={isUploadDialogOpen}
            onClose={() => setIsUploadDialogOpen(false)}
            familyId={family.id}
            familyName={family.name}
            userId={user.id}
            userName={user.name}
            onUploadComplete={() => {
              setIsUploadDialogOpen(false);
              // Optionally refresh recent documents
            }}
            allowedCategories={["kyc", "financial", "tax", "other"]}
          />
        )}

        {/* User Flow Section */}
        <UserFlowSection
          pageName="Client Dashboard"
          description="Client-facing portfolio overview and onboarding status"
          userFlow={[
            {
              step: "View Portfolio Metrics",
              description: "See Portfolio Value, Total Returns, XIRR, and Recent Activity at a glance."
            },
            {
              step: "Navigate Tabs",
              description: "Switch between different views.",
              subSteps: [
                "Portfolio Tab: Holdings table with current values, Asset Allocation Chart, Portfolio Summary",
                "Transactions Tab: Transaction history with dates, types, amounts, and status",
                "Onboarding Tab (if still onboarding): Checklist progress, document upload status, required documents list"
              ]
            },
            {
              step: "Review Holdings",
              description: "Click on holdings for details, see gains/losses, and track performance."
            },
            {
              step: "Review Transactions",
              description: "Filter by type and date range, search by security name."
            }
          ]}
          bestPractices={[
            "Check portfolio regularly",
            "Monitor performance metrics",
            "Review transaction history monthly",
            "Upload documents promptly when onboarding",
            "Contact RM with questions"
          ]}
          roleSpecific={{
            role: "Client",
            notes: [
              "Sees only own family data",
              "Internal notes and messages hidden",
              "Meeting notes filtered (only client-visible)",
              "Action items shown only if assigned to you",
              "Portfolio updates in real-time as transactions occur"
            ]
          }}
        />
      </motion.div>
    </AppLayout>
  );
}
