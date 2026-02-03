"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";

interface ServiceSelectionStepProps {
  formData: {
    selected_service: "nrp_light" | "nrp_360" | "";
    kyc_already_done: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
  errors?: Record<string, string>;
}

export function ServiceSelectionStep({
  formData,
  onChange,
  errors = {},
}: ServiceSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600 mb-6">
          Choose the service plan that best fits your needs. You can always
          upgrade later.
        </p>
      </div>

      {/* Service Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NRP Light */}
        <button
          type="button"
          onClick={() => onChange("selected_service", "nrp_light")}
          className={`relative p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
            formData.selected_service === "nrp_light"
              ? "border-blue-600 bg-blue-50 shadow-md"
              : "border-slate-300 bg-white hover:border-blue-300"
          }`}
        >
          {/* Selected Indicator */}
          {formData.selected_service === "nrp_light" && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              NRP Light
            </h3>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              ₹5,000<span className="text-sm font-normal text-slate-600">/year</span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                Basic wealth management services
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                Quarterly portfolio review
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                Access to financial reports
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">Email support</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600">Perfect for beginners</p>
          </div>
        </button>

        {/* NRP 360 */}
        <button
          type="button"
          onClick={() => onChange("selected_service", "nrp_360")}
          className={`relative p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
            formData.selected_service === "nrp_360"
              ? "border-blue-600 bg-blue-50 shadow-md"
              : "border-slate-300 bg-white hover:border-blue-300"
          }`}
        >
          {/* Popular Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" />
            RECOMMENDED
          </div>

          {/* Selected Indicator */}
          {formData.selected_service === "nrp_360" && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-2">NRP 360</h3>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              ₹15,000<span className="text-sm font-normal text-slate-600">/year</span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                <strong>All NRP Light features</strong>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                Dedicated Relationship Manager
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                Monthly portfolio rebalancing
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                Tax planning & filing support
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                24/7 priority phone support
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                Personalized investment strategies
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              Best for comprehensive wealth management
            </p>
          </div>
        </button>
      </div>

      {errors.selected_service && (
        <p className="text-sm text-red-600 text-center">
          {errors.selected_service}
        </p>
      )}

      {/* KYC Checkbox */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">
          KYC Information
        </h4>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.kyc_already_done}
            onChange={(e) => onChange("kyc_already_done", e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <div>
            <p className="text-sm text-slate-900 font-medium group-hover:text-blue-600 transition-colors">
              I have already completed my KYC
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {formData.kyc_already_done
                ? "Great! You won't need to upload PAN or Aadhaar documents."
                : "If you haven't completed KYC, you'll need to upload PAN Card and Aadhaar Card in the next steps."}
            </p>
          </div>
        </label>
      </div>

      {/* Comparison Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Not sure which to choose?</strong> Start with NRP Light and
          upgrade to NRP 360 anytime. Our team will help you decide what works
          best for your financial goals.
        </p>
      </div>
    </div>
  );
}
