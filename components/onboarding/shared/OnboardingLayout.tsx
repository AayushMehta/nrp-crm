'use client';

// components/onboarding/shared/OnboardingLayout.tsx
// Split-screen layout: branded left panel + form right panel
// Now supports dynamic step labels from invitation config

import { ReactNode } from 'react';
import { Building2, CheckCircle2, Sparkles, Shield, Users, Target, Upload, FileText, TrendingUp, Receipt, Leaf, Umbrella } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepDef {
    label: string;
    subtitle: string;
    leftHeading: string;
    leftDescription: string;
}

// Default fallback for steps
const DEFAULT_STEP_DEF: StepDef = {
    label: 'Onboarding',
    subtitle: 'Complete your profile',
    leftHeading: 'Welcome to NRP',
    leftDescription: 'Follow the steps to complete your onboarding.',
};

// Icon mapping for left panel highlights
const STEP_HIGHLIGHTS: Record<string, { icon: ReactNode; text: string }[]> = {
    basic_info: [
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Quick & secure setup' },
        { icon: <Shield className="h-4 w-4" />, text: 'Your data is encrypted' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Personalized experience' },
    ],
    pre_profiler: [
        { icon: <Target className="h-4 w-4" />, text: 'Life stage analysis' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Income profiling' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Personalized investor tag' },
    ],
    risk_profile: [
        { icon: <Shield className="h-4 w-4" />, text: 'Scientifically scored' },
        { icon: <Target className="h-4 w-4" />, text: 'Asset allocation guidance' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Tailored recommendations' },
    ],
    document_upload: [
        { icon: <Upload className="h-4 w-4" />, text: 'Drag & drop upload' },
        { icon: <Shield className="h-4 w-4" />, text: 'Secure file storage' },
        { icon: <FileText className="h-4 w-4" />, text: 'Accepted: PDF, JPG, PNG' },
    ],
    family_members: [
        { icon: <Users className="h-4 w-4" />, text: 'Unified family view' },
        { icon: <Shield className="h-4 w-4" />, text: 'Individual accounts' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Optional — can skip' },
    ],
    financial_goals: [
        { icon: <TrendingUp className="h-4 w-4" />, text: 'Set clear objectives' },
        { icon: <Target className="h-4 w-4" />, text: 'Prioritize goals' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Actionable roadmap' },
    ],
    tax_planning: [
        { icon: <Receipt className="h-4 w-4" />, text: 'Tax-efficient strategies' },
        { icon: <Shield className="h-4 w-4" />, text: 'Compliance focused' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Maximize deductions' },
    ],
    esg_preferences: [
        { icon: <Leaf className="h-4 w-4" />, text: 'Sustainable investing' },
        { icon: <Target className="h-4 w-4" />, text: 'Impact measurement' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Values-aligned portfolio' },
    ],
    insurance_review: [
        { icon: <Umbrella className="h-4 w-4" />, text: 'Coverage analysis' },
        { icon: <Shield className="h-4 w-4" />, text: 'Gap identification' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Recommendations' },
    ],
};

interface OnboardingLayoutProps {
    currentStep: number;
    totalSteps: number;
    children: ReactNode;
    navigation: ReactNode;
    userName?: string;
    stepLabels?: string[];
    stepDef?: StepDef & { type?: string };
}

export function OnboardingLayout({
    currentStep,
    totalSteps,
    children,
    navigation,
    userName,
    stepLabels,
    stepDef,
}: OnboardingLayoutProps) {
    const step = stepDef || DEFAULT_STEP_DEF;
    const progress = (currentStep / totalSteps) * 100;
    const highlights = STEP_HIGHLIGHTS[(stepDef as StepDef & { type?: string })?.type || 'basic_info'] || STEP_HIGHLIGHTS.basic_info;

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Panel — desktop only */}
            <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-10 relative overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

                {/* Top: Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">NRP</span>
                    </div>

                    {/* Greeting */}
                    {userName && (
                        <p className="text-blue-200 text-sm mb-2">Hello, {userName}!</p>
                    )}
                    <h2 className="text-3xl font-bold mb-3 leading-tight">{step.leftHeading}</h2>
                    <p className="text-slate-300 text-sm leading-relaxed mb-8">{step.leftDescription}</p>

                    {/* Highlights */}
                    <div className="space-y-3">
                        {highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-200">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                                    {h.icon}
                                </div>
                                <span className="text-sm">{h.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom: Steps indicator */}
                <div className="relative z-10">
                    {/* Dynamic step labels if available */}
                    {stepLabels && stepLabels.length > 0 && (
                        <div className="mb-6 space-y-1.5">
                            {stepLabels.map((label, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'flex items-center gap-2 text-xs transition-all',
                                        i + 1 === currentStep
                                            ? 'text-white font-semibold'
                                            : i + 1 < currentStep
                                                ? 'text-blue-300'
                                                : 'text-slate-500'
                                    )}
                                >
                                    <div className={cn(
                                        'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                                        i + 1 === currentStep
                                            ? 'bg-blue-500 text-white'
                                            : i + 1 < currentStep
                                                ? 'bg-blue-400/30 text-blue-300'
                                                : 'bg-white/10 text-slate-500'
                                    )}>
                                        {i + 1 < currentStep ? '✓' : i + 1}
                                    </div>
                                    {label}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'h-2 rounded-full transition-all duration-300',
                                    i + 1 === currentStep
                                        ? 'w-8 bg-blue-400'
                                        : i + 1 < currentStep
                                            ? 'w-4 bg-blue-400/60'
                                            : 'w-4 bg-white/20'
                                )}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-slate-400">Step {currentStep} of {totalSteps}</p>
                </div>
            </div>

            {/* Right Panel — form content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Progress bar */}
                <div className="h-1 bg-slate-200">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Header */}
                <div className="px-6 sm:px-10 pt-8 pb-4">
                    <p className="text-sm text-blue-600 font-medium mb-1">
                        Step {currentStep} of {totalSteps}
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900">{step.label}</h1>
                    <p className="text-gray-500 text-sm mt-1">{step.subtitle}</p>
                </div>

                {/* Form content */}
                <div className="flex-1 px-6 sm:px-10 overflow-y-auto">
                    {children}
                </div>

                {/* Navigation */}
                <div className="px-6 sm:px-10 py-4 border-t bg-white/80 backdrop-blur sticky bottom-0">
                    {navigation}
                </div>
            </div>
        </div>
    );
}
