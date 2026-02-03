// components/wealth/HoldingsTable.tsx
// Portfolio holdings table with sortable columns

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import type { Holding, AssetClass } from "@/types/portfolio";
import { cn } from "@/lib/utils";

interface HoldingsTableProps {
  holdings: Holding[];
  title?: string;
  description?: string;
}

type SortField = 'security_name' | 'current_value' | 'unrealized_gain' | 'unrealized_gain_percent';
type SortDirection = 'asc' | 'desc';

const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  equity: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  debt: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  mutual_fund: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  real_estate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  cash: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  alternative: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
};

const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  equity: 'Equity',
  debt: 'Debt',
  mutual_fund: 'MF',
  gold: 'Gold',
  real_estate: 'RE',
  cash: 'Cash',
  alternative: 'Alt',
};

export function HoldingsTable({ holdings, title = "Portfolio Holdings", description = "All securities in your portfolio" }: HoldingsTableProps) {
  const [sortField, setSortField] = useState<SortField>('current_value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sort holdings
  const sortedHoldings = useMemo(() => {
    const sorted = [...holdings];
    sorted.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case 'security_name':
          aVal = a.security_name.toLowerCase();
          bVal = b.security_name.toLowerCase();
          break;
        case 'current_value':
          aVal = a.current_value;
          bVal = b.current_value;
          break;
        case 'unrealized_gain':
          aVal = a.unrealized_gain;
          bVal = b.unrealized_gain;
          break;
        case 'unrealized_gain_percent':
          aVal = a.unrealized_gain_percent;
          bVal = b.unrealized_gain_percent;
          break;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [holdings, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (!holdings || holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            No holdings found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested_value, 0);
  const totalGain = totalValue - totalInvested;
  const totalGainPercent = (totalGain / totalInvested) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <button
                    onClick={() => handleSort('security_name')}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Security
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-center">Asset Class</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Avg Cost</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort('current_value')}
                    className="flex items-center gap-1 ml-auto hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Value
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort('unrealized_gain')}
                    className="flex items-center gap-1 ml-auto hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    P&L
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort('unrealized_gain_percent')}
                    className="flex items-center gap-1 ml-auto hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    P&L %
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => (
                <TableRow key={holding.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="font-medium">
                    <div className="max-w-[240px] truncate" title={holding.security_name}>
                      {holding.security_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn("text-xs", ASSET_CLASS_COLORS[holding.asset_class])}>
                      {ASSET_CLASS_LABELS[holding.asset_class]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {holding.quantity.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    ₹{holding.avg_cost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    ₹{holding.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{formatValue(holding.current_value)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {holding.unrealized_gain >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        holding.unrealized_gain >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {holding.unrealized_gain >= 0 ? '+' : ''}₹{formatValue(Math.abs(holding.unrealized_gain))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "text-sm font-semibold",
                      holding.unrealized_gain_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {holding.unrealized_gain_percent >= 0 ? '+' : ''}{holding.unrealized_gain_percent.toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals Row */}
              <TableRow className="bg-gray-50 dark:bg-gray-800/50 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
                <TableCell colSpan={5} className="text-right">
                  Total Portfolio Value:
                </TableCell>
                <TableCell className="text-right font-bold">
                  ₹{formatValue(totalValue)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {totalGain >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className={cn(
                      "font-bold",
                      totalGain >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {totalGain >= 0 ? '+' : ''}₹{formatValue(Math.abs(totalGain))}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-bold",
                    totalGainPercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Format currency value in Indian format (Lakhs/Crores)
 */
function formatValue(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }
}
