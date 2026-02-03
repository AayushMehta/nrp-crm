"use client";

import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
}: OnboardingProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
      {/* Progress Percentage */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Your Progress
          </h3>
          <p className="text-xs text-slate-500">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-start justify-between gap-2">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 min-w-0"
            >
              {/* Step Circle */}
              <div className="relative mb-2">
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                ) : isCurrent ? (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold animate-pulse">
                    {stepNumber}
                  </div>
                ) : (
                  <Circle className="w-8 h-8 text-slate-300" />
                )}
              </div>

              {/* Step Label */}
              <p
                className={`text-xs text-center leading-tight ${
                  isCurrent
                    ? "text-blue-600 font-semibold"
                    : isCompleted
                    ? "text-green-600"
                    : "text-slate-400"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
