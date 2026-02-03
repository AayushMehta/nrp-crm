"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface OnboardingStepWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  showBack?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
}

export function OnboardingStepWrapper({
  title,
  description,
  children,
  onBack,
  onNext,
  showBack = true,
  showNext = true,
  nextLabel = "Continue",
  nextDisabled = false,
  isLoading = false,
}: OnboardingStepWrapperProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        {showBack ? (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {showNext && (
          <button
            onClick={onNext}
            disabled={nextDisabled || isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {nextLabel}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Auto-save Indicator */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Your progress is automatically saved
        </p>
      </div>
    </div>
  );
}
