import React from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                N
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  NRP Wealth Management
                </h1>
                <p className="text-xs text-slate-500">Client Onboarding</p>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              Need help?{" "}
              <a
                href="mailto:support@nrpwealth.com"
                className="text-blue-600 hover:underline"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
            <p>&copy; 2026 NRP Wealth Management. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Help Center
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
