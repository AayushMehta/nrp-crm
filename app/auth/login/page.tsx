"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, LogIn, Shield, Users, BarChart3, Briefcase,
  ArrowRight, Sparkles, ChevronRight, Lock,
} from "lucide-react";
import Link from "next/link";

// Demo personas — credentials MUST match data/mock/sample-users.ts
const DEMO_ACCOUNTS = [
  {
    username: "admin",
    password: "admin123",
    label: "Admin",
    icon: Shield,
    description: "Full system access & oversight",
    gradient: "from-rose-500 to-orange-500",
    lightBg: "bg-rose-50",
    lightBorder: "border-rose-200",
    lightText: "text-rose-700",
  },
  {
    username: "rm",
    password: "rm123",
    label: "Relationship Manager",
    icon: Users,
    description: "Client management & onboarding",
    gradient: "from-violet-500 to-purple-500",
    lightBg: "bg-violet-50",
    lightBorder: "border-violet-200",
    lightText: "text-violet-700",
  },
  {
    username: "sharma",
    password: "demo123",
    label: "Client (Sharma)",
    icon: BarChart3,
    description: "Portfolio, documents & family",
    gradient: "from-blue-500 to-cyan-500",
    lightBg: "bg-blue-50",
    lightBorder: "border-blue-200",
    lightText: "text-blue-700",
  },
  {
    username: "backoffice",
    password: "bo123",
    label: "Back Office",
    icon: Briefcase,
    description: "Tasks, verification & ops",
    gradient: "from-teal-500 to-emerald-500",
    lightBg: "bg-teal-50",
    lightBorder: "border-teal-200",
    lightText: "text-teal-700",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);

  const handleLogin = async (u: string, p: string, persona?: string) => {
    setError("");
    setLoggingIn(true);
    if (persona) setLoadingPersona(persona);

    const success = await login(u, p);

    if (success) {
      setTimeout(() => { router.push("/"); }, 300);
    } else {
      setError("Invalid credentials. Try one of the demo accounts below.");
      setLoggingIn(false);
      setLoadingPersona(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100/60 to-violet-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-rose-100/40 to-orange-100/30 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-50/30 blur-3xl" />
        {/* Fine grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-7">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white mb-3.5 shadow-lg shadow-blue-200"
          >
            <span className="text-lg font-black tracking-tight">NRP</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome to NRP CRM</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Wealth Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xl shadow-gray-200/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-sm focus:bg-white"
                disabled={loggingIn}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-sm pr-11 focus:bg-white"
                  disabled={loggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2"
              >
                <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loggingIn || !username.trim() || !password.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200/50 active:scale-[0.99]"
            >
              {loggingIn && !loadingPersona ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Quick Access</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Demo Persona Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const isThisLoading = loadingPersona === account.username;
              return (
                <motion.button
                  key={account.username}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLogin(account.username, account.password, account.username)}
                  disabled={loggingIn}
                  className={`relative p-3 rounded-xl border ${account.lightBorder} ${account.lightBg} hover:shadow-md transition-all text-left group disabled:opacity-50 overflow-hidden`}
                >
                  <div className="relative">
                    <div className={`inline-flex p-1.5 rounded-lg bg-gradient-to-br ${account.gradient} mb-2 shadow-sm`}>
                      {isThisLoading ? (
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <p className={`font-semibold text-sm ${account.lightText}`}>{account.label}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5 leading-tight">{account.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Onboarding Preview CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-5"
        >
          <Link
            href="/client/onboarding/demo-preview"
            className="group flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-50 hover:border-blue-400 transition-all"
          >
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Preview Client Onboarding Journey</span>
            <ArrowRight className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 mt-5">
          NRP Wealth Management &bull; Secure Platform
        </p>
      </motion.div>
    </div>
  );
}
