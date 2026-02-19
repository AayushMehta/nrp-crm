"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    calculateNaturalTimeline,
    calculateAcceleratedRequirements,
    calculateProjections,
    calculateWeightedReturn,
    calculateTimelineWithReturn,
    calculateNaturalGrowthProjection,
    formatIndianCurrency,
    formatIndianCurrencyShort,
} from "@/lib/services/b2a-calculations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
    PieChart, Pie, Cell
} from "recharts";
import {
    ArrowRight, Plus, Trash2, TrendingUp, TrendingDown,
    Target, Clock, Zap, DollarSign, CalendarDays, Percent
} from "lucide-react";
import type { RiskProfile, AllocationEntry, CashFlow, CashFlowType } from "@/types/b2a";
import { RISK_PROFILE_RETURNS, RISK_PROFILE_LABELS } from "@/types/b2a";

// ─── Constants ──────────────────────────────────────────────────
const DEFAULT_ASSET_CLASSES = [
    { id: "eq_in", name: "Indian Equity", defaultReturn: 12, color: "#3b82f6" },
    { id: "eq_intl", name: "Intl Equity", defaultReturn: 13, color: "#8b5cf6" },
    { id: "debt", name: "Debt / Fixed Income", defaultReturn: 7, color: "#10b981" },
    { id: "gold", name: "Gold / Commodities", defaultReturn: 6, color: "#f59e0b" },
    { id: "re", name: "Real Estate", defaultReturn: 9, color: "#ec4899" },
    { id: "cash", name: "Cash / Liquid", defaultReturn: 4, color: "#6b7280" },
];

const DEFAULT_ALLOCATIONS: Record<RiskProfile, Record<string, number>> = {
    conservative: { debt: 50, cash: 20, gold: 15, eq_in: 10, re: 5 },
    moderate: { eq_in: 35, debt: 30, gold: 10, cash: 10, re: 10, eq_intl: 5 },
    aggressive: { eq_in: 50, eq_intl: 15, debt: 15, gold: 10, re: 10 },
    veryAggressive: { eq_in: 55, eq_intl: 25, debt: 10, gold: 5, re: 5 },
};

const PIE_COLORS = DEFAULT_ASSET_CLASSES.map(a => a.color);

// ─── Types ──────────────────────────────────────────────────────
interface B2APlannerProps {
    initialData?: {
        currentWealth?: number;
        targetWealth?: number;
        currentAge?: number;
        riskProfile?: RiskProfile;
    };
}

// ─── Component ──────────────────────────────────────────────────
export function B2APlanner({ initialData }: B2APlannerProps) {
    // ── Core Inputs (from GoalPlanningDto) ──
    const [currentWealth, setCurrentWealth] = useState(initialData?.currentWealth || 5_000_000);
    const [targetWealth, setTargetWealth] = useState(initialData?.targetWealth || 20_000_000);
    const [currentAge, setCurrentAge] = useState(initialData?.currentAge || 35);
    const [riskProfile, setRiskProfile] = useState<RiskProfile>(initialData?.riskProfile || "moderate");
    const [desiredTimeline, setDesiredTimeline] = useState(15);
    const [inflationRate, setInflationRate] = useState(6);
    const [taxRate, setTaxRate] = useState(0);

    // ── Advanced Inputs ──
    const [allocations, setAllocations] = useState<AllocationEntry[]>([]);
    const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);

    // ── Initialise allocations from risk profile ──
    useEffect(() => {
        const defaults = DEFAULT_ALLOCATIONS[riskProfile];
        setAllocations(
            DEFAULT_ASSET_CLASSES.map((cls) => ({
                id: cls.id,
                assetClassId: 0,
                assetClassName: cls.name,
                allocationPercentage: defaults[cls.id] || 0,
                returnRate: cls.defaultReturn,
                color: cls.color,
            }))
        );
    }, [riskProfile]);

    // ── All calculations (spec steps 1-6) ──
    const results = useMemo(() => {
        // Step 2 – Natural Timeline (risk-profile return, no additional investments)
        const natural = calculateNaturalTimeline({ currentWealth, targetWealth, riskProfile });

        // Step 3 – Weighted Return from allocations
        const weightedReturn = calculateWeightedReturn(allocations);

        // Step 4 – Accelerated Timeline (allocation return, no additional investments)
        const acceleratedYears = calculateTimelineWithReturn(currentWealth, targetWealth, weightedReturn);

        // Step 5 – Required Investments (gap analysis with desired timeline + existing cash flows)
        const requirements = calculateAcceleratedRequirements({
            currentWealth,
            targetWealth,
            desiredTimeline,
            annualReturn: weightedReturn,
            existingCashFlows: cashFlows,
        });

        // Step 6 – Multi-scenario projections
        const projTimeline = Math.max(desiredTimeline, 10);
        const projections = calculateProjections({
            startingValue: currentWealth,
            timeline: projTimeline,
            expectedAnnualReturn: weightedReturn,
            cashFlows,
        });

        // Natural growth projection (for chart overlay)
        const naturalGrowth = calculateNaturalGrowthProjection(currentWealth, projTimeline, natural.annualReturn);

        // Derived
        const yearsSaved = natural.years - acceleratedYears;
        const targetAge = currentAge + desiredTimeline;
        const progressPercent = Math.min(100, Math.max(0,
            ((currentWealth) / (targetWealth)) * 100
        ));

        return {
            natural, weightedReturn, acceleratedYears, requirements,
            projections, naturalGrowth, yearsSaved, targetAge, progressPercent,
        };
    }, [currentWealth, targetWealth, riskProfile, allocations, cashFlows, desiredTimeline, currentAge]);

    // ── Handlers ──
    const handleAllocChange = useCallback((id: string, field: "allocationPercentage" | "returnRate", val: number) => {
        setAllocations((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
    }, []);

    const addCashFlow = useCallback(() => {
        setCashFlows((prev) => [
            ...prev,
            { id: crypto.randomUUID(), type: "SIP" as CashFlowType, amount: 10000, startYear: 1, endYear: desiredTimeline },
        ]);
    }, [desiredTimeline]);

    const removeCashFlow = useCallback((id: string) => {
        setCashFlows((prev) => prev.filter((cf) => cf.id !== id));
    }, []);

    const updateCashFlow = useCallback((id: string, field: keyof CashFlow, val: string | number) => {
        setCashFlows((prev) => prev.map((cf) => (cf.id === id ? { ...cf, [field]: val } : cf)));
    }, []);

    const totalAlloc = allocations.reduce((s, a) => s + a.allocationPercentage, 0);

    // ── Chart data (3-scenario + natural + target) ──
    const chartData = useMemo(() => {
        const { projections, naturalGrowth } = results;
        const base = projections.baseCase.projections;
        const opt = projections.optimistic.projections;
        const pess = projections.pessimistic.projections;
        const nat = naturalGrowth;

        return base.map((b, i) => ({
            year: `Yr ${b.year}`,
            baseCase: b.value,
            optimistic: opt[i]?.value ?? b.value,
            pessimistic: pess[i]?.value ?? b.value,
            natural: nat[i]?.value ?? b.value,
            target: targetWealth,
        }));
    }, [results, targetWealth]);

    // ── Pie data ──
    const pieData = allocations.filter((a) => a.allocationPercentage > 0).map((a) => ({
        name: a.assetClassName,
        value: a.allocationPercentage,
        fill: a.color,
    }));

    // ── Currency formatter for chart tooltip ──
    const fmtTooltip = (v: number) => formatIndianCurrency(v);

    // ═══════════════════ RENDER ═══════════════════
    return (
        <div className="space-y-6">

            {/* ─── Section 1: Goal Summary Strip ─── */}
            <Card className="card-elevated overflow-hidden">
                <CardContent className="p-5">
                    <div className="grid gap-6 md:grid-cols-12 items-end">
                        {/* B (Before) = Current Net Worth */}
                        <div className="md:col-span-3 space-y-1.5">
                            <Label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-blue-500" /> B (Before) — Current Net Worth
                            </Label>
                            <Input type="number" value={currentWealth}
                                onChange={(e) => setCurrentWealth(Number(e.target.value))}
                                className="text-lg font-bold h-11"
                            />
                            <p className="text-xs text-muted-foreground">{formatIndianCurrency(currentWealth)}</p>
                        </div>

                        {/* Arrow + Progress */}
                        <div className="md:col-span-3 space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{results.progressPercent.toFixed(1)}% of goal</span>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                            <Progress value={results.progressPercent} className="h-2.5" />
                        </div>

                        {/* A (After) = Target Net Worth */}
                        <div className="md:col-span-3 space-y-1.5">
                            <Label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-green-500" /> A (After) — Target Net Worth
                            </Label>
                            <Input type="number" value={targetWealth}
                                onChange={(e) => setTargetWealth(Number(e.target.value))}
                                className="text-lg font-bold h-11"
                            />
                            <p className="text-xs text-muted-foreground">{formatIndianCurrency(targetWealth)}</p>
                        </div>

                        {/* Age & Profile */}
                        <div className="md:col-span-3 space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase">Age</Label>
                                    <Input type="number" value={currentAge}
                                        onChange={(e) => setCurrentAge(Number(e.target.value))}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase">Risk Profile</Label>
                                    <Select value={riskProfile} onValueChange={(v) => setRiskProfile(v as RiskProfile)}>
                                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {(Object.keys(RISK_PROFILE_RETURNS) as RiskProfile[]).map((rp) => (
                                                <SelectItem key={rp} value={rp}>{RISK_PROFILE_LABELS[rp]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Section 2 & 3: Strategy + Results ─── */}
            <div className="grid gap-6 lg:grid-cols-12">

                {/* ── Left: Strategy Panel (7 cols) ── */}
                <div className="lg:col-span-7 space-y-4">
                    <Tabs defaultValue="allocation">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
                            <TabsTrigger value="cashflows">Cash Flows</TabsTrigger>
                            <TabsTrigger value="rates">Rates</TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Asset Allocation */}
                        <TabsContent value="allocation" className="pt-4 space-y-4">
                            <div className="grid gap-4 lg:grid-cols-5">
                                {/* Allocation Table */}
                                <Card className="lg:col-span-3">
                                    <CardHeader className="pb-2 flex flex-row justify-between items-center">
                                        <CardTitle className="text-sm">Allocation Mix</CardTitle>
                                        <span className={`text-xs font-bold ${totalAlloc === 100 ? "text-green-600" : "text-red-500"}`}>
                                            Total: {totalAlloc}%
                                        </span>
                                    </CardHeader>
                                    <CardContent className="space-y-1.5">
                                        {allocations.map((a) => (
                                            <div key={a.id} className="grid grid-cols-12 gap-1.5 items-center text-xs">
                                                <div className="col-span-5 flex items-center gap-1.5 truncate">
                                                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                                                    {a.assetClassName}
                                                </div>
                                                <div className="col-span-3 flex items-center gap-0.5">
                                                    <Input type="number" value={a.allocationPercentage}
                                                        onChange={(e) => handleAllocChange(a.id!, "allocationPercentage", Number(e.target.value))}
                                                        className="h-7 text-right text-xs"
                                                    />
                                                    <span className="text-muted-foreground">%</span>
                                                </div>
                                                <div className="col-span-4 flex items-center gap-0.5 justify-end">
                                                    <span className="text-muted-foreground">@</span>
                                                    <Input type="number" value={a.returnRate}
                                                        onChange={(e) => handleAllocChange(a.id!, "returnRate", Number(e.target.value))}
                                                        className="h-7 w-14 text-right text-xs"
                                                    />
                                                    <span className="text-muted-foreground">%</span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-3 mt-3 border-t flex justify-between items-center">
                                            <span className="text-sm font-medium">Weighted Return</span>
                                            <span className="text-base font-bold text-primary">{results.weightedReturn.toFixed(2)}%</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Pie Chart */}
                                <Card className="lg:col-span-2">
                                    <CardHeader className="pb-0">
                                        <CardTitle className="text-sm">Allocation Split</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-center pb-2">
                                        <ResponsiveContainer width="100%" height={180}>
                                            <PieChart>
                                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%"
                                                    innerRadius={40} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                                                    {pieData.map((entry, i) => (
                                                        <Cell key={i} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v: number) => `${v}%`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                    <div className="px-4 pb-3 space-y-1">
                                        {pieData.map((d) => (
                                            <div key={d.name} className="flex items-center justify-between text-[10px]">
                                                <div className="flex items-center gap-1">
                                                    <div className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                                                    <span className="text-muted-foreground truncate">{d.name}</span>
                                                </div>
                                                <span className="font-semibold">{d.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Cash Flows */}
                        <TabsContent value="cashflows" className="pt-4">
                            <Card>
                                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm">Existing Cash Flows</CardTitle>
                                        <CardDescription className="text-xs">SIP, Lumpsum, SWP, Withdrawal</CardDescription>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={addCashFlow}>
                                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="max-h-[300px] w-full pr-2">
                                        {cashFlows.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground text-sm">
                                                No existing SIPs, Lumpsums, SWPs, or Withdrawals added.<br />
                                                <span className="text-xs">Add them to see how they affect required investments.</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {cashFlows.map((cf) => (
                                                    <div key={cf.id} className="flex flex-wrap gap-2 items-center p-2.5 border rounded-lg bg-muted/30 text-xs">
                                                        <Select value={cf.type} onValueChange={(v) => updateCashFlow(cf.id, "type", v)}>
                                                            <SelectTrigger className="h-7 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="SIP">SIP</SelectItem>
                                                                <SelectItem value="Lumpsum">Lumpsum</SelectItem>
                                                                <SelectItem value="SWP">SWP</SelectItem>
                                                                <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-muted-foreground">₹</span>
                                                            <Input type="number" value={cf.amount}
                                                                onChange={(e) => updateCashFlow(cf.id, "amount", Number(e.target.value))}
                                                                className="h-7 w-24 text-xs"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-muted-foreground">Yr</span>
                                                            <Input type="number" value={cf.startYear}
                                                                onChange={(e) => updateCashFlow(cf.id, "startYear", Number(e.target.value))}
                                                                className="h-7 w-14 text-xs"
                                                            />
                                                        </div>
                                                        {(cf.type === "SIP" || cf.type === "SWP") && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-muted-foreground">→</span>
                                                                <Input type="number" value={cf.endYear ?? ""}
                                                                    onChange={(e) => updateCashFlow(cf.id, "endYear", Number(e.target.value))}
                                                                    className="h-7 w-14 text-xs"
                                                                />
                                                            </div>
                                                        )}
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-destructive"
                                                            onClick={() => removeCashFlow(cf.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 3: Rates */}
                        <TabsContent value="rates" className="pt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Expected Rates</CardTitle>
                                    <CardDescription className="text-xs">These affect real-return calculations</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs flex items-center gap-1">
                                            <Percent className="h-3 w-3" /> Expected Inflation Rate (%)
                                        </Label>
                                        <Input type="number" value={inflationRate}
                                            onChange={(e) => setInflationRate(Number(e.target.value))}
                                            className="h-9"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Real return ≈ {(results.weightedReturn - inflationRate).toFixed(1)}% (nominal − inflation)
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs flex items-center gap-1">
                                            <Percent className="h-3 w-3" /> Expected Tax Rate (%)
                                        </Label>
                                        <Input type="number" value={taxRate}
                                            onChange={(e) => setTaxRate(Number(e.target.value))}
                                            className="h-9"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Post-tax return ≈ {(results.weightedReturn * (1 - taxRate / 100)).toFixed(1)}%
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* ── Right: Timeline & Requirements (5 cols) ── */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Timeline Goal */}
                    <Card className="card-elevated">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-1.5">
                                    <CalendarDays className="h-4 w-4" /> Desired Timeline
                                </CardTitle>
                                <span className="text-2xl font-bold">{desiredTimeline}<span className="text-sm font-normal text-muted-foreground ml-1">years</span></span>
                            </div>
                            <p className="text-xs text-muted-foreground">Target age: {results.targetAge}</p>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <Slider value={[desiredTimeline]} min={1} max={40} step={1}
                                onValueChange={(v) => setDesiredTimeline(v[0])}
                            />
                        </CardContent>
                    </Card>

                    {/* Timeline Comparison */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 rounded-xl bg-muted/60 text-center space-y-1">
                            <Clock className="h-4 w-4 mx-auto text-muted-foreground" />
                            <p className="text-lg font-bold">{results.natural.years}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">Natural<br />@{results.natural.annualReturn}%</p>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-center space-y-1 border border-indigo-200 dark:border-indigo-800">
                            <Zap className="h-4 w-4 mx-auto text-indigo-500" />
                            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{results.acceleratedYears}</p>
                            <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 leading-tight">Accelerated<br />@{results.weightedReturn.toFixed(1)}%</p>
                        </div>
                        <div className={`p-3 rounded-xl text-center space-y-1 ${results.yearsSaved > 0 ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800' : 'bg-muted/60'}`}>
                            {results.yearsSaved > 0 ? <TrendingUp className="h-4 w-4 mx-auto text-green-600" /> : <TrendingDown className="h-4 w-4 mx-auto text-muted-foreground" />}
                            <p className={`text-lg font-bold ${results.yearsSaved > 0 ? 'text-green-700 dark:text-green-400' : ''}`}>{results.yearsSaved > 0 ? results.yearsSaved : 0}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">Years<br />Saved</p>
                        </div>
                    </div>

                    {/* Required Investments */}
                    <Card className="card-elevated border-t-4 border-t-primary">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4" /> Required Additional Investment
                            </CardTitle>
                            <CardDescription className="text-xs">
                                To reach {formatIndianCurrency(targetWealth)} in {desiredTimeline} years
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Three options */}
                            <div className="grid gap-2">
                                <div className="flex justify-between items-center p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                                    <div>
                                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Monthly SIP</p>
                                        <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">per month</p>
                                    </div>
                                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatIndianCurrency(results.requirements.requiredMonthlySIP)}</p>
                                </div>

                                <div className="text-center text-[10px] text-muted-foreground">— OR —</div>

                                <div className="flex justify-between items-center p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900">
                                    <div>
                                        <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Yearly SIP</p>
                                        <p className="text-[10px] text-violet-600/70 dark:text-violet-400/70">per year</p>
                                    </div>
                                    <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{formatIndianCurrency(results.requirements.requiredYearlySIP)}</p>
                                </div>

                                <div className="text-center text-[10px] text-muted-foreground">— OR —</div>

                                <div className="flex justify-between items-center p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                                    <div>
                                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Lumpsum Today</p>
                                        <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">one-time</p>
                                    </div>
                                    <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{formatIndianCurrency(results.requirements.requiredLumpsum)}</p>
                                </div>
                            </div>

                            {/* Gap Analysis */}
                            <div className="pt-2 border-t space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Projected value (with flows)</span>
                                    <span className="font-semibold">{formatIndianCurrency(results.requirements.projectedValueWithCashFlows)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Remaining gap</span>
                                    <span className="font-semibold text-red-600">{formatIndianCurrency(results.requirements.remainingTarget)}</span>
                                </div>
                                {results.requirements.isAchievableWithCashFlows && (
                                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mt-1">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        <span className="font-medium">Goal achievable with existing cash flows alone!</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ─── Section 4: Multi-Scenario Projection Chart ─── */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="text-base">Wealth Projection — Multi-Scenario</CardTitle>
                    <CardDescription className="text-xs">
                        Optimistic (+2%), Base Case, Pessimistic (−2%), and Natural Growth (risk-profile only)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={380}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradOpt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradPess" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="year" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis fontSize={11} tickLine={false} axisLine={false}
                                tickFormatter={(v: number) => formatIndianCurrencyShort(v)} width={50}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))" }}
                                formatter={(v: number, name: string) => [formatIndianCurrency(v), name]}
                            />
                            {/* Target reference line */}
                            <ReferenceLine y={targetWealth} stroke="#ef4444" strokeDasharray="6 4" strokeWidth={1.5}
                                label={{ value: `Target: ${formatIndianCurrencyShort(targetWealth)}`, position: "right", fontSize: 10, fill: "#ef4444" }}
                            />
                            {/* Pessimistic */}
                            <Area type="monotone" dataKey="pessimistic" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2"
                                fill="url(#gradPess)" name="Pessimistic" />
                            {/* Natural */}
                            <Area type="monotone" dataKey="natural" stroke="#6b7280" strokeWidth={1} strokeDasharray="6 3"
                                fill="none" name="Natural Growth" />
                            {/* Base Case */}
                            <Area type="monotone" dataKey="baseCase" stroke="#3b82f6" strokeWidth={2}
                                fill="url(#gradBase)" name="Base Case" />
                            {/* Optimistic */}
                            <Area type="monotone" dataKey="optimistic" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 2"
                                fill="url(#gradOpt)" name="Optimistic" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* ─── Section 5: Scenario Summary Table ─── */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: "Pessimistic", data: results.projections.pessimistic, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
                    { label: "Base Case", data: results.projections.baseCase, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
                    { label: "Optimistic", data: results.projections.optimistic, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
                ].map((s) => (
                    <Card key={s.label} className={`${s.bg} border-0`}>
                        <CardContent className="p-4 text-center space-y-1">
                            <p className={`text-xs font-semibold uppercase tracking-wider ${s.color}`}>{s.label}</p>
                            <p className="text-xl font-bold">{formatIndianCurrency(s.data.finalValue)}</p>
                            <p className="text-xs text-muted-foreground">
                                @{s.data.expectedReturn.toFixed(1)}% • {s.data.growth.toFixed(0)}% growth
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
