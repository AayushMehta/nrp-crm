import React from "react";
import { AlertCircle, Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function OnboardingExpiredPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-16 h-16 text-amber-600" />
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Invitation Link Expired or Invalid
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          This onboarding link is no longer valid. It may have expired, already
          been used, or been revoked.
        </p>

        {/* Common Reasons */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Why am I seeing this?
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Link Expired
                </h3>
                <p className="text-sm text-slate-600">
                  Onboarding invitations are typically valid for 14 days. Your
                  link may have passed its expiration date.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Already Completed
                </h3>
                <p className="text-sm text-slate-600">
                  You may have already completed the onboarding process using
                  this link.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Invalid or Revoked
                </h3>
                <p className="text-sm text-slate-600">
                  The invitation may have been cancelled or revoked by an
                  administrator.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What to Do */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            What should I do?
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-bold text-xs">1</span>
              </div>
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Contact our support team</strong> to request a new
                  invitation link.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-bold text-xs">2</span>
              </div>
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Check your email</strong> for any recent messages from
                  NRP Wealth Management with a newer invitation link.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-bold text-xs">3</span>
              </div>
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Verify the URL</strong> to ensure you&apos;re using the
                  correct and complete link.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4">
            Need a New Invitation?
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Contact our team and we&apos;ll send you a fresh invitation link right
            away.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900">Email</p>
                <a
                  href="mailto:support@nrpwealth.com"
                  className="text-sm text-blue-600 hover:underline"
                >
                  support@nrpwealth.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900">Phone</p>
                <a
                  href="tel:+911234567890"
                  className="text-sm text-blue-600 hover:underline"
                >
                  +91 123 456 7890
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Home Button */}
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
