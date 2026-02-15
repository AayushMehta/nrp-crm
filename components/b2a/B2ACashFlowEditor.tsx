// components/b2a/B2ACashFlowEditor.tsx
// Manage SIP, Lumpsum, SWP, and Withdrawal entries

"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Trash2,
    ArrowUpCircle,
    ArrowDownCircle,
    Repeat,
    Banknote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CashFlow, CashFlowType } from "@/types/b2a";
import { formatIndianCurrency } from "@/lib/services/b2a-calculations";

interface B2ACashFlowEditorProps {
    cashFlows: CashFlow[];
    isEditable: boolean;
    onCashFlowsChange: (cashFlows: CashFlow[]) => void;
}

const CASH_FLOW_CONFIG: Record<
    CashFlowType,
    { label: string; icon: React.ElementType; color: string; isRecurring: boolean }
> = {
    SIP: {
        label: "Monthly SIP",
        icon: Repeat,
        color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
        isRecurring: true,
    },
    Lumpsum: {
        label: "Lumpsum",
        icon: ArrowUpCircle,
        color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
        isRecurring: false,
    },
    SWP: {
        label: "Monthly SWP",
        icon: ArrowDownCircle,
        color: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
        isRecurring: true,
    },
    Withdrawal: {
        label: "Withdrawal",
        icon: Banknote,
        color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
        isRecurring: false,
    },
};

export function B2ACashFlowEditor({
    cashFlows,
    isEditable,
    onCashFlowsChange,
}: B2ACashFlowEditorProps) {
    const [newType, setNewType] = useState<CashFlowType>("SIP");
    const [newAmount, setNewAmount] = useState<number>(10000);
    const [newStartYear, setNewStartYear] = useState<number>(1);
    const [newEndYear, setNewEndYear] = useState<number>(10);

    const handleAdd = () => {
        if (newAmount <= 0) return;

        const config = CASH_FLOW_CONFIG[newType];
        const newFlow: CashFlow = {
            id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type: newType,
            amount: newAmount,
            startYear: newStartYear,
            ...(config.isRecurring && { endYear: newEndYear }),
        };

        onCashFlowsChange([...cashFlows, newFlow]);
    };

    const handleRemove = (id: string) => {
        onCashFlowsChange(cashFlows.filter((f) => f.id !== id));
    };

    return (
        <Card variant="elevated">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-emerald-600" />
                    <CardTitle>Cash Flows</CardTitle>
                </div>
                <CardDescription>
                    Add SIPs, Lumpsums, SWPs, and Withdrawals to model your plan
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Add New Form */}
                {isEditable && (
                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4 space-y-3">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Add Cash Flow
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Type */}
                            <div>
                                <Label className="text-xs">Type</Label>
                                <Select
                                    value={newType}
                                    onValueChange={(v) => setNewType(v as CashFlowType)}
                                >
                                    <SelectTrigger className="h-9 mt-1 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(CASH_FLOW_CONFIG) as CashFlowType[]).map(
                                            (type) => (
                                                <SelectItem key={type} value={type}>
                                                    {CASH_FLOW_CONFIG[type].label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Amount */}
                            <div>
                                <Label className="text-xs">Amount (₹)</Label>
                                <Input
                                    type="number"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(Number(e.target.value))}
                                    className="h-9 mt-1 text-xs"
                                    min={0}
                                />
                            </div>

                            {/* Start Year */}
                            <div>
                                <Label className="text-xs">Start Year</Label>
                                <Input
                                    type="number"
                                    value={newStartYear}
                                    onChange={(e) => setNewStartYear(Number(e.target.value))}
                                    className="h-9 mt-1 text-xs"
                                    min={1}
                                />
                            </div>

                            {/* End Year (only for recurring) */}
                            {CASH_FLOW_CONFIG[newType].isRecurring ? (
                                <div>
                                    <Label className="text-xs">End Year</Label>
                                    <Input
                                        type="number"
                                        value={newEndYear}
                                        onChange={(e) => setNewEndYear(Number(e.target.value))}
                                        className="h-9 mt-1 text-xs"
                                        min={newStartYear}
                                    />
                                </div>
                            ) : (
                                <div /> // placeholder to maintain grid
                            )}
                        </div>

                        <Button size="sm" onClick={handleAdd} className="gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Add
                        </Button>
                    </div>
                )}

                {/* Cash Flow List */}
                {cashFlows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <Banknote className="h-8 w-8 mb-2 opacity-40" />
                        <p className="text-sm">No cash flows added yet</p>
                        <p className="text-xs mt-1">
                            Add SIPs and investments to see their impact
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {cashFlows.map((flow) => {
                                const config = CASH_FLOW_CONFIG[flow.type];
                                const Icon = config.icon;

                                return (
                                    <motion.div
                                        key={flow.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                                    >
                                        <div
                                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.color}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {config.label}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    Year {flow.startYear}
                                                    {flow.endYear ? `–${flow.endYear}` : ""}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {formatIndianCurrency(flow.amount)}
                                                {config.isRecurring ? "/month" : " one-time"}
                                            </p>
                                        </div>

                                        {isEditable && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(flow.id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
