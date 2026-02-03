"use client";

import React from "react";
import { CheckCircle2, Clock, FileText, Shield } from "lucide-react";

interface WelcomeStepProps {
  email: string;
  onStart: () => void;
}

export function WelcomeStep({ email, onStart }: WelcomeStepProps) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {/* Welcome Icon */}
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
          N
        </div>
      </div>

      {/* Welcome Message */}
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Welcome to NRP Wealth Management!
      </h1>
      <p className="text-lg text-slate-600 mb-2">
        We&apos;re excited to have you join our family.
      </p>
      <p className="text-sm text-slate-500 mb-8">
        Invitation sent to: <span className="font-semibold">{email}</span>
      </p>

      {/* What to Expect */}
      <div className="bg-slate-50 rounded-lg p-6 mb-8 text-left">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          What to expect:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                10-15 minutes
              </h4>
              <p className="text-xs text-slate-600">
                Complete the onboarding process at your own pace
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                7 simple steps
              </h4>
              <p className="text-xs text-slate-600">
                Basic info, address, service selection, and documents
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                Auto-save enabled
              </h4>
              <p className="text-xs text-slate-600">
                Your progress is saved automatically every 2 seconds
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                Secure & private
              </h4>
              <p className="text-xs text-slate-600">
                Your information is encrypted and protected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Needed */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Documents you&apos;ll need:
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            PAN Card (if KYC not completed)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Aadhaar Card (if KYC not completed)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Cancelled Cheque or Bank Statement
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Income Proof (optional, for better service recommendations)
          </li>
        </ul>
      </div>

      {/* CTA Button */}
      <button
        onClick={onStart}
        className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl"
      >
        Get Started
      </button>

      <p className="text-xs text-slate-500 mt-6">
        By continuing, you agree to our{" "}
        <a href="#" className="text-blue-600 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
