// components/charts/AssetAllocationChart.tsx
// Simple progress bar chart showing asset allocation

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AssetAllocation, AssetClass } from "@/types/portfolio";
import { cn } from "@/lib/utils";

interface AssetAllocationChartProps {
  allocations: AssetAllocation[];
  title?: string;
  description?: string;
}

const ASSET_CLASS_CONFIG: Record<AssetClass, { label: string; color: string; bgColor: string }> = {
  equity: { label: 'Equity', color: 'bg-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
  debt: { label: 'Debt', color: 'bg-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' },
  mutual_fund: { label: 'Mutual Funds', color: 'bg-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
  gold: { label: 'Gold', color: 'bg-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' },
  real_estate: { label: 'Real Estate', color: 'bg-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
  cash: { label: 'Cash', color: 'bg-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-700' },
  alternative: { label: 'Alternative', color: 'bg-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/20' },
};

export function AssetAllocationChart({
  allocations,
  title = "Asset Allocation",
  description = "Distribution across asset classes"
}: AssetAllocationChartProps) {

  if (!allocations || allocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            No allocation data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by value (largest first)
  const sortedAllocations = [...allocations].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAllocations.map((allocation) => {
            const config = ASSET_CLASS_CONFIG[allocation.asset_class];

            return (
              <div key={allocation.asset_class}>
                {/* Header: Label, Percentage, Value */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", config.color)} />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({allocation.count} {allocation.count === 1 ? 'holding' : 'holdings'})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {allocation.percentage.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[80px] text-right">
                      ₹{formatValue(allocation.value)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={cn("w-full h-2 rounded-full overflow-hidden", config.bgColor)}>
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", config.color)}
                    style={{ width: `${allocation.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Total Portfolio Value
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ₹{formatValue(sortedAllocations.reduce((sum, a) => sum + a.value, 0))}
            </span>
          </div>
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
  } else {
    return value.toLocaleString('en-IN');
  }
}
