import React from "react";
import { CheckCircle2, Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Onboarding Submitted Successfully!
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Thank you for completing your onboarding with NRP Wealth Management.
          Your information has been received and is being reviewed by our team.
        </p>

        {/* What Happens Next */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            What happens next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Document Verification
                </h3>
                <p className="text-sm text-slate-600">
                  Our team will verify all the documents you&apos;ve uploaded. This
                  typically takes 1-2 business days.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Account Activation
                </h3>
                <p className="text-sm text-slate-600">
                  Once verified, we&apos;ll activate your account and send you login
                  credentials via email.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Welcome Call
                </h3>
                <p className="text-sm text-slate-600">
                  Your dedicated Relationship Manager will reach out to schedule
                  an introductory call and discuss your financial goals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Expected Timeline</h3>
          </div>
          <p className="text-sm text-blue-800">
            You should receive a welcome email with your account details within{" "}
            <strong>2-3 business days</strong>. If you don&apos;t hear from us,
            please contact our support team.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4">
            Need Help or Have Questions?
          </h3>
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

        {/* Reference Number (Optional - could be dynamic) */}
        <div className="text-sm text-slate-600 mb-6">
          <p>
            Your reference number:{" "}
            <span className="font-mono font-semibold text-slate-900">
              {typeof window !== "undefined"
                ? window.location.pathname.split("/").pop() || "ONB-XXXXX"
                : "ONB-XXXXX"}
            </span>
          </p>
          <p className="text-xs mt-1">
            Please keep this for your records and reference in any future
            communications
          </p>
        </div>

        {/* Home Button */}
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
