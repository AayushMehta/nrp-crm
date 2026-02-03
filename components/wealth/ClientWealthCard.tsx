// components/wealth/ClientWealthCard.tsx
// Client wealth summary card for RM dashboard

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Shield } from "lucide-react";
import type { ClientWealthSummary } from "@/types/wealth-metrics";
import { cn } from "@/lib/utils";

interface ClientWealthCardProps {
  client: ClientWealthSummary;
  onViewDetails?: (clientId: string) => void;
}

const TIER_CONFIG = {
  tier_1: { label: 'Tier 1', color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400' },
  tier_2: { label: 'Tier 2', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400' },
  tier_3: { label: 'Tier 3', color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400' },
  prospect: { label: 'Prospect', color: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-400' },
};

const RISK_PROFILE_CONFIG = {
  conservative: { label: 'Conservative', icon: Shield, color: 'text-green-600 dark:text-green-400' },
  moderate: { label: 'Moderate', icon: Shield, color: 'text-blue-600 dark:text-blue-400' },
  balanced: { label: 'Balanced', icon: Shield, color: 'text-purple-600 dark:text-purple-400' },
  aggressive: { label: 'Aggressive', icon: Shield, color: 'text-orange-600 dark:text-orange-400' },
  very_aggressive: { label: 'Very Aggressive', icon: Shield, color: 'text-red-600 dark:text-red-400' },
};

const REVIEW_STATUS_CONFIG = {
  current: { label: 'Current', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  due_soon: { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  overdue: { label: 'OVERDUE', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
};

export function ClientWealthCard({ client, onViewDetails }: ClientWealthCardProps) {
  const tierConfig = TIER_CONFIG[client.tier];
  const riskConfig = RISK_PROFILE_CONFIG[client.risk_profile];
  const reviewConfig = REVIEW_STATUS_CONFIG[client.review_status];
  const RiskIcon = riskConfig.icon;

  // Get initials from family name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 relative overflow-hidden">
      {/* Overdue indicator */}
      {client.review_status === 'overdue' && (
        <div className="absolute top-3 right-3">
          <div className="bg-red-500 rounded-full p-1">
            <AlertCircle className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      <CardContent className="pt-6">
        {/* Avatar and Family Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg flex-shrink-0">
            {getInitials(client.family_name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {client.family_name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={cn("text-xs font-medium border", tierConfig.color)}>
                {tierConfig.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {client.service_type === 'nrp_360' ? 'NRP 360' : 'NRP Light'}
              </Badge>
            </div>
          </div>
        </div>

        {/* AUM (Primary Metric) */}
        <div className="mb-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Assets Under Management</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ₹{formatAUM(client.aum)}
          </p>
        </div>

        {/* Returns and Risk */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Returns */}
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">1Y Returns</p>
            <div className="flex items-center gap-1">
              {client.returns_1y >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span className={cn(
                "text-lg font-semibold",
                client.returns_1y >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {client.returns_1y >= 0 ? '+' : ''}{client.returns_1y.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Risk Profile */}
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Risk Profile</p>
            <div className="flex items-center gap-1">
              <RiskIcon className={cn("h-4 w-4", riskConfig.color)} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {riskConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Review Status */}
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-400">Next Review</p>
            <Badge className={cn("text-xs font-medium", reviewConfig.color)}>
              {reviewConfig.label}
            </Badge>
          </div>
          {client.next_review_date && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {formatReviewDate(client.next_review_date)}
            </p>
          )}
        </div>

        {/* View Details Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onViewDetails?.(client.family_id)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Format AUM value in Lakhs/Crores
 */
function formatAUM(aum: number): string {
  if (aum >= 10000000) {
    return `${(aum / 10000000).toFixed(2)}Cr`;
  } else if (aum >= 100000) {
    return `${(aum / 100000).toFixed(2)}L`;
  } else {
    return aum.toLocaleString('en-IN');
  }
}

/**
 * Format review date in readable format
 */
function formatReviewDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} days`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays <= 30) {
    return `Due in ${diffDays} days`;
  } else {
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
