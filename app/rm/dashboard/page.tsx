"use client";

import { useState, useEffect, useMemo } from "react";
import { formatIndianCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColoredBadge } from "@/components/ui/colored-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  FileCheck,
  MessageSquare,
  Bell,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Phone,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  IndianRupee,
} from "lucide-react";
import { WealthMetricsService } from "@/lib/services/wealth-metrics-service";
import { PortfolioService } from "@/lib/services/portfolio-service";
import { ClientWealthCard } from "@/components/wealth/ClientWealthCard";
import { CalendarEvent, EventType } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { UserFlowSection } from "@/components/ui/user-flow-section";
import { BaseAreaChart } from "@/components/charts/BaseAreaChart";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import { BaseRadialBarChart } from "@/components/charts/BaseRadialBarChart";
import { CHART_COLORS } from "@/lib/chart-colors";
import { motion } from "framer-motion";
import { cardStaggerVariants, pageVariants } from "@/lib/animation-utils";

const STORAGE_KEY = 'nrp_crm_calendar_events';

export default function RMDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<"all" | EventType>("all");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setEvents(JSON.parse(stored));
    } else {
      // Initialize with sample events
      const today = new Date();
      const sampleEvents: CalendarEvent[] = [
        {
          id: "evt-1",
          date: today.toISOString().split('T')[0],
          time: "10:00 AM",
          type: "meeting",
          title: "Review meeting with Sharma Family",
          familyName: "Sharma Family",
          duration: "1h",
          priority: "high",
        },
        {
          id: "evt-2",
          date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: "2:00 PM",
          type: "call",
          title: "Follow-up Call - Patel Family",
          familyName: "Patel Family",
          duration: "30m",
          priority: "medium",
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEvents));
      setEvents(sampleEvents);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => {
      if (eventFilter !== "all" && event.type !== eventFilter) {
        return false;
      }
      return event.date === dateStr;
    });
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return events
      .filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= sevenDaysLater;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "meeting":
        return <Users className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
      case "deadline":
        return <Clock className="h-4 w-4" />;
      case "review":
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate wealth metrics
  const wealthStats = useMemo(() => {
    const familyIds = ["fam-001", "fam-002"]; // Mock assigned families (matches seed data)
    const aumMetrics = WealthMetricsService.calculateRMAUM(user?.id || '', familyIds);
    const clientSummaries = WealthMetricsService.getClientSummaries(familyIds);

    const avgReturns = clientSummaries.length > 0
      ? clientSummaries.reduce((sum, c) => sum + c.returns_1y, 0) / clientSummaries.length
      : 0;

    const reviewsDue = clientSummaries.filter(c =>
      c.review_status === 'due_soon' || c.review_status === 'overdue'
    ).length;

    const revenueMetrics = WealthMetricsService.calculateRevenueMetrics(familyIds);

    return {
      total_aum: aumMetrics.total_aum,
      aum_change_percent: aumMetrics.month_over_month_percent,
      avg_returns_1y: avgReturns,
      reviews_due: reviewsDue,
      revenue_this_month: revenueMetrics.total_fees,
      client_summaries: clientSummaries,
      familyIds,
    };
  }, [user]);

  // Chart data for RM dashboard
  const chartData = useMemo(() => {
    const familyIds = wealthStats.familyIds;
    const portfolios = PortfolioService.getAllPortfolios().filter(p => familyIds.includes(p.family_id));
    const riskAssessments = WealthMetricsService.getAllRiskAssessments().filter(r => familyIds.includes(r.family_id));

    // Client performance comparison
    const clientPerformance = portfolios.map(p => ({
      name: p.family_name.split(' ')[0], // Use first name only for compact display
      value: p.total_gain_percent,
    }));

    // Asset allocation aggregate
    const assetAllocation: Record<string, number> = {};
    portfolios.forEach(p => {
      p.asset_allocation.forEach(asset => {
        assetAllocation[asset.asset_class] = (assetAllocation[asset.asset_class] || 0) + asset.value;
      });
    });

    const assetAllocationData = Object.entries(assetAllocation).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
    }));

    // Risk profile distribution
    const riskDistribution: Record<string, number> = {};
    riskAssessments.forEach(r => {
      riskDistribution[r.risk_profile] = (riskDistribution[r.risk_profile] || 0) + 1;
    });

    const riskDistributionData = Object.entries(riskDistribution).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value: count,
      percentage: (count / riskAssessments.length) * 100,
    }));

    return {
      historicalAUM: WealthMetricsService.getHistoricalAUM(6, familyIds),
      clientPerformance,
      assetAllocation: assetAllocationData,
      riskDistribution: riskDistributionData,
    };
  }, [wealthStats]);

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
            Your wealth management dashboard
          </p>
        </motion.div>

        {/* Wealth Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Total AUM"
            value={formatIndianCurrency(wealthStats.total_aum)}
            description={`${wealthStats.aum_change_percent > 0 ? '+' : ''}${wealthStats.aum_change_percent.toFixed(1)}% this month`}
            icon={TrendingUp}
            iconClassName="text-blue-600"
            trend={{ value: wealthStats.aum_change_percent, isPositive: wealthStats.aum_change_percent > 0 }}
          />
          <StatCard
            title="Portfolio Performance"
            value={`${wealthStats.avg_returns_1y.toFixed(1)}%`}
            description="Average 1Y returns"
            icon={BarChart3}
            iconClassName="text-green-600"
            trend={{ value: wealthStats.avg_returns_1y, isPositive: wealthStats.avg_returns_1y > 0 }}
          />
          <StatCard
            title="Risk Reviews Due"
            value={wealthStats.reviews_due}
            description="Pending this month"
            icon={AlertCircle}
            iconClassName={wealthStats.reviews_due > 0 ? "text-orange-600" : "text-green-600"}
          />
          <StatCard
            title="Revenue"
            value={formatIndianCurrency(wealthStats.revenue_this_month)}
            description="Collected this month"
            icon={IndianRupee}
            iconClassName="text-purple-600"
          />
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">My Clients</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="tasks">Tasks & Reminders</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Alert Banner for Overdue Reviews */}
            {wealthStats.reviews_due > 0 && (
              <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      {wealthStats.reviews_due} Client Review{wealthStats.reviews_due > 1 ? 's' : ''} Due
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Risk assessments require your attention
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30" onClick={() => router.push('/rm/clients')}>
                    Review Clients
                  </Button>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* My AUM Trend */}
              <BaseAreaChart
                data={chartData.historicalAUM.map(item => ({
                  name: item.month,
                  value: item.value,
                }))}
                title="My AUM Trend"
                description="6-month portfolio value history"
                dataKey="value"
                xAxisKey="name"
                color={CHART_COLORS.tiers.tier_3}
                gradientId="rmAUMGradient"
                formatType="currency"
                height={350}
              />

              {/* Risk Profile Distribution */}
              <BaseRadialBarChart
                data={chartData.riskDistribution.map(item => ({
                  name: item.name,
                  value: item.percentage,
                }))}
                title="Risk Profile Distribution"
                description="Client risk appetite breakdown"
                colors={[
                  CHART_COLORS.risk.conservative,
                  CHART_COLORS.risk.moderate,
                  CHART_COLORS.risk.balanced,
                  CHART_COLORS.risk.growth,
                  CHART_COLORS.risk.aggressive,
                ]}
                formatType="percentage"
                height={350}
              />
            </div>

            {/* Second Row */}
            <div className="grid gap-6 md:grid-cols-1">
              {/* Client Performance Comparison */}
              <BaseBarChart
                data={chartData.clientPerformance.map(c => ({
                  ...c,
                  color: c.value > 0 ? CHART_COLORS.performance.positive : CHART_COLORS.performance.negative,
                }))}
                title="Client Performance Comparison"
                description="1-year returns by client"
                dataKey="value"
                xAxisKey="name"
                formatType="number"
                layout="horizontal"
                height={280}
                showValues
              />
            </div>

            {/* Asset Allocation Aggregate */}
            <div className="grid gap-6 md:grid-cols-1">
              <BaseBarChart
                data={chartData.assetAllocation.map((item, index) => ({
                  ...item,
                  color: [
                    CHART_COLORS.assets.equity,
                    CHART_COLORS.assets.debt,
                    CHART_COLORS.assets.mutual_fund,
                    CHART_COLORS.assets.gold,
                    CHART_COLORS.assets.real_estate,
                    CHART_COLORS.assets.cash,
                    CHART_COLORS.assets.alternative,
                  ][index % 7],
                }))}
                title="Aggregate Asset Allocation"
                description="Combined portfolio composition across all clients"
                dataKey="value"
                xAxisKey="name"
                formatType="currency"
                layout="horizontal"
                height={280}
              />
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                        RS
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sharma Family</p>
                        <p className="text-xs text-muted-foreground">
                          Onboarding in progress
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/rm/clients')}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                        AP
                      </div>
                      <div>
                        <p className="text-sm font-medium">Patel Family</p>
                        <p className="text-xs text-muted-foreground">
                          Active account
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/rm/clients')}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Calendar Grid */}
              <div className="lg:col-span-2">
                <Card className="rounded-xl border shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={previousMonth}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentDate(new Date())}
                        >
                          Today
                        </Button>
                        <Button variant="outline" size="sm" onClick={nextMonth}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {/* Day Names */}
                      {dayNames.map((day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-muted-foreground py-2"
                        >
                          {day}
                        </div>
                      ))}

                      {/* Empty cells */}
                      {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                        <div key={`empty-${index}`} className="min-h-[100px] p-2" />
                      ))}

                      {/* Days */}
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const dayEvents = getEventsForDay(day);
                        const today = isToday(day);

                        return (
                          <div
                            key={day}
                            className={cn(
                              "min-h-[100px] p-2 border rounded-lg transition-colors cursor-pointer hover:border-blue-300",
                              today && "border-blue-500 bg-blue-50/50"
                            )}
                          >
                            <div
                              className={cn(
                                "text-sm font-medium mb-1",
                                today ? "text-blue-600 font-semibold" : "text-gray-700"
                              )}
                            >
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={cn(
                                    "text-xs p-1 rounded truncate flex items-center gap-1",
                                    event.priority === "high" && "bg-red-100 text-red-800",
                                    event.priority === "medium" && "bg-yellow-100 text-yellow-800",
                                    event.priority === "low" && "bg-gray-100 text-gray-800"
                                  )}
                                  title={`${event.time} - ${event.title}`}
                                >
                                  {getEventIcon(event.type)}
                                  <span className="truncate">{event.time}</span>
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-muted-foreground font-medium">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event Controls */}
              <div className="space-y-6">
                <Card className="rounded-xl border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={eventFilter} onValueChange={(v) => setEventFilter(v as typeof eventFilter)}>
                      <SelectTrigger>
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="meeting">Meetings</SelectItem>
                        <SelectItem value="call">Calls</SelectItem>
                        <SelectItem value="deadline">Deadlines</SelectItem>
                        <SelectItem value="review">Reviews</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full" onClick={() => { const { toast } = require('sonner'); toast.info('Event creation coming soon'); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Event
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Event Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm">Meetings</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {events.filter(e => e.type === 'meeting').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 rounded">
                            <Phone className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-sm">Calls</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {events.filter(e => e.type === 'call').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="rounded-xl border shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Tasks & Reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    Your tasks and reminders will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Flow Section */}
        <UserFlowSection
          pageName="RM Dashboard"
          description="RM-specific metrics for assigned families"
          userFlow={[
            {
              step: "View RM Metrics",
              description: "Track Total AUM (assigned families), My Clients count, Average Returns, and Overdue Reviews."
            },
            {
              step: "Navigate Tabs",
              description: "Switch between different views.",
              subSteps: [
                "Overview Tab: Wealth metrics for assigned families, AUM by tier, performance analytics",
                "My Clients Tab: List of assigned families with tier badges, portfolio values, and review status",
                "Calendar Tab: View integrated calendar with upcoming meetings and events",
                "Tasks & Reminders Tab: Personal tasks and due reminders with quick status updates"
              ]
            },
            {
              step: "Take Quick Actions",
              description: "Click client cards to navigate, click calendar events to view/edit, update task status, or complete/snooze reminders."
            }
          ]}
          bestPractices={[
            "Start day by reviewing dashboard",
            "Check 'Overdue Reviews' stat regularly",
            "Review 'My Clients' tab for status updates",
            "Use Calendar tab for daily schedule",
            "Monitor Tasks & Reminders for action items"
          ]}
          roleSpecific={{
            role: "RM",
            notes: [
              "Dashboard shows only assigned families",
              "AUM and performance metrics filtered to your portfolio",
              "Review status helps prioritize client touchpoints",
              "Calendar integration keeps you organized"
            ]
          }}
        />
      </motion.div>
    </AppLayout>
  );
}
