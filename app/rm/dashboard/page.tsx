"use client";

import { useState, useEffect, useMemo } from "react";
import { formatIndianCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout"; // New Layout
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  ArrowRight,
  MoreHorizontal,
  ArrowUpRight,
  Clock,
  Briefcase,
  AlertCircle,
  Users,
  Target
} from "lucide-react";
import { WealthMetricsService } from "@/lib/services/wealth-metrics-service";
import { BaseAreaChart } from "@/components/charts/BaseAreaChart";
import { BaseBarChart } from "@/components/charts/BaseBarChart";
import { CHART_COLORS } from "@/lib/chart-colors";
import { motion } from "framer-motion";
import { pageVariants } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

export default function RMDashboard() {
  const { user } = useAuth();

  // Mock Logic (Preserved)
  const wealthStats = useMemo(() => {
    const familyIds = ["fam-001", "fam-002"];
    const aumMetrics = WealthMetricsService.calculateRMAUM(user?.id || '', familyIds);
    return {
      total_aum: aumMetrics.total_aum,
      aum_change_percent: aumMetrics.month_over_month_percent,
      active_families: 12,
      pending_tasks: 5
    };
  }, [user]);

  const chartData = useMemo(() => {
    const familyIds = ["fam-001", "fam-002"];
    return {
      historicalAUM: WealthMetricsService.getHistoricalAUM(6, familyIds),
    };
  }, []);

  return (
    <ConsoleLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6 pb-20 p-6 md:p-8 max-w-6xl mx-auto"
      >
        {/* 1. Morning Briefing Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between border-b border-border/40 pb-6">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Morning Briefing</h5>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
              Good morning, <span className="font-medium">{user?.name?.split(' ')[0] || 'Partner'}</span>.
            </h1>
            <p className="text-lg text-muted-foreground/80 max-w-2xl leading-relaxed">
              Your portfolio is up <span className="text-green-600 dark:text-green-400 font-medium">+{wealthStats.aum_change_percent.toFixed(2)}%</span> today.
              You have <span className="text-orange-600 dark:text-orange-400 font-medium">{wealthStats.pending_tasks} urgent tasks</span> requiring attention.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outline" className="border-border/60">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              History
            </Button>
            <Button variant="outline" className="border-border/60" onClick={() => window.location.href = '/rm/planning'}>
              <Target className="mr-2 h-4 w-4 text-primary" />
              New Wealth Plan
            </Button>
            <Button>
              View Report <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 2. Focus Area & Key Metrics Strip */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Main Chart (Focus) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Portfolio Performance</h3>
              <Tabs defaultValue="1m" className="w-[200px]">
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="1m" className="text-xs">1M</TabsTrigger>
                  <TabsTrigger value="6m" className="text-xs">6M</TabsTrigger>
                  <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <BaseAreaChart
              data={chartData.historicalAUM.map(item => ({ name: item.month, value: item.value }))}
              title=""
              description=""
              dataKey="value"
              color={CHART_COLORS.tiers.tier_2}
              gradientId="consoleAUM"
              formatType="currency"
              height={320}
              className="card-elevated border-none shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50"
              showGrid={false}
            />
          </div>

          {/* Right: Key Metrics Strip (Vertical) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Key Indicators</h3>
            <div className="grid gap-3">
              {[
                { label: "Total AUM", value: formatIndianCurrency(wealthStats.total_aum), change: "+2.4%", icon: Briefcase },
                { label: "Active Families", value: wealthStats.active_families, change: "Stable", icon: Users },
                { label: "YTD Revenue", value: "₹ 4.2L", change: "+12%", icon: TrendingUp },
              ].map((stat, i) => (
                <Card key={i} className="card-elevated border-l-4 border-l-indigo-500 overflow-hidden group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">{stat.label}</p>
                      <p className="text-xl font-bold mt-1 text-foreground">{stat.value}</p>
                    </div>
                    <div className="text-right">
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <stat.icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-green-600 font-medium mt-1">{stat.change}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="card-elevated border-l-4 border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-200">Compliance Alert</p>
                    <p className="text-xs text-orange-700/80 dark:text-orange-300/80">2 KYCs expiring this week.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 3. Client Stream (Feed) */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-light text-foreground">Client Stream</h3>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4">
            {[
              { client: "Sharma Family", action: "Large Inflow Alert", desc: "Received ₹50L inflow into Liquid Fund.", time: "2 hours ago", type: "alert" },
              { client: "Patel Family", action: "Portfolio Review", desc: "Quarterly review meeting scheduled.", time: "4 hours ago", type: "calendar" },
              { client: "Mehrotra Trust", action: "Document Uploaded", desc: "Trust deed amended and uploaded.", time: "Yesterday", type: "doc" },
              { client: "Singh Family", action: "Goal Reached", desc: "Education Corpus target achieved.", time: "Yesterday", type: "milestone" },
            ].map((item, i) => (
              <div key={i} className="group flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-card hover:border-primary/20 hover:shadow-md transition-all">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border",
                  item.type === 'alert' ? "bg-blue-50 border-blue-100 text-blue-600" :
                    item.type === 'calendar' ? "bg-purple-50 border-purple-100 text-purple-600" :
                      item.type === 'doc' ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
                        "bg-green-50 border-green-100 text-green-600"
                )}>
                  {item.type === 'alert' ? <TrendingUp className="h-5 w-5" /> :
                    item.type === 'calendar' ? <Clock className="h-5 w-5" /> :
                      item.type === 'doc' ? <Briefcase className="h-5 w-5" /> :
                        <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{item.action}</h4>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-0.5">{item.desc}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-2 uppercase tracking-wide">{item.client}</p>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </ConsoleLayout>
  );
}
