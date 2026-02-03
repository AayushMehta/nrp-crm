"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Client } from "@/types/clients";
import {
  ClientWarningService,
  WarningSeverity,
  ClientWarning,
} from "@/lib/services/client-warning-service";

interface ClientWarningBadgesProps {
  client: Client;
  onChecklistClick?: (checklistId: string) => void;
  compact?: boolean; // Show only count badge
  maxDisplay?: number; // Max warnings to display inline (default: 3)
}

export function ClientWarningBadges({
  client,
  onChecklistClick,
  compact = false,
  maxDisplay = 3,
}: ClientWarningBadgesProps) {
  const [showDetails, setShowDetails] = useState(false);
  const warningResult = ClientWarningService.getWarningsForClient(client);

  if (warningResult.warningCount === 0) {
    return null;
  }

  // Compact mode - just show count badge
  if (compact) {
    return (
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`relative inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
          warningResult.highestSeverity
            ? ClientWarningService.getSeverityColorClass(
                warningResult.highestSeverity
              )
            : "bg-slate-100 text-slate-700"
        } border hover:shadow-md`}
      >
        <AlertCircle className="w-3 h-3" />
        {warningResult.warningCount}
        {warningResult.hasBlockers && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full" />
        )}
      </button>
    );
  }

  const visibleWarnings = warningResult.warnings.slice(0, maxDisplay);
  const hiddenCount = warningResult.warningCount - maxDisplay;

  return (
    <div className="relative inline-block">
      {/* Warning Badges */}
      <div className="flex items-center gap-1 flex-wrap">
        {visibleWarnings.map((warning) => (
          <WarningBadge
            key={warning.id}
            warning={warning}
            onClick={() => {
              if (warning.checklistId && onChecklistClick) {
                onChecklistClick(warning.checklistId);
              }
            }}
          />
        ))}

        {/* More Warnings Indicator */}
        {hiddenCount > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold hover:bg-slate-200 transition-colors border border-slate-300"
          >
            +{hiddenCount} more
          </button>
        )}
      </div>

      {/* Details Popover */}
      {showDetails && (
        <div className="absolute z-50 top-full left-0 mt-2 w-80 bg-white border border-slate-300 rounded-lg shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-900">
                Client Warnings ({warningResult.warningCount})
              </h4>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {warningResult.warnings.map((warning) => (
                <div
                  key={warning.id}
                  className={`p-3 rounded-lg border ${ClientWarningService.getSeverityColorClass(
                    warning.severity
                  )}`}
                >
                  <div className="flex items-start gap-2">
                    {getWarningIcon(warning.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">
                        {warning.message}
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        {warning.description}
                      </p>
                      {warning.actionable && warning.checklistId && (
                        <button
                          onClick={() => {
                            if (onChecklistClick) {
                              onChecklistClick(warning.checklistId!);
                              setShowDetails(false);
                            }
                          }}
                          className="text-xs font-semibold mt-2 underline hover:no-underline"
                        >
                          View Checklist →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WarningBadge({
  warning,
  onClick,
}: {
  warning: ClientWarning;
  onClick?: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onClick}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all border ${
          ClientWarningService.getSeverityColorClass(warning.severity)
        } ${onClick ? "hover:shadow-md cursor-pointer" : "cursor-default"}`}
      >
        {getWarningIcon(warning.severity, "w-3 h-3")}
        {warning.message}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg pointer-events-none">
          <p className="font-semibold mb-1">{warning.message}</p>
          <p className="opacity-90">{warning.description}</p>
          {onClick && (
            <p className="mt-2 text-blue-300 text-xs">
              Click to view checklist
            </p>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

function getWarningIcon(severity: WarningSeverity, className: string = "w-4 h-4") {
  const iconColor = ClientWarningService.getSeverityIconColor(severity);

  switch (severity) {
    case "critical":
      return <AlertCircle className={`${className} ${iconColor}`} />;
    case "high":
      return <AlertTriangle className={`${className} ${iconColor}`} />;
    case "medium":
      return <AlertTriangle className={`${className} ${iconColor}`} />;
    case "low":
      return <Info className={`${className} ${iconColor}`} />;
    default:
      return <Info className={`${className} ${iconColor}`} />;
  }
}

// Summary component for dashboard widgets
export function ClientWarningSummary({ clients }: { clients: Client[] }) {
  const summary = ClientWarningService.getWarningSummary(clients);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-3xl font-bold text-red-700">
          {summary.criticalWarnings}
        </div>
        <div className="text-sm text-red-600">Critical</div>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="text-3xl font-bold text-orange-700">
          {summary.highWarnings}
        </div>
        <div className="text-sm text-orange-600">High</div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="text-3xl font-bold text-amber-700">
          {summary.mediumWarnings}
        </div>
        <div className="text-sm text-amber-600">Medium</div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-3xl font-bold text-yellow-700">
          {summary.lowWarnings}
        </div>
        <div className="text-sm text-yellow-600">Low</div>
      </div>
    </div>
  );
}
