'use client';

// components/onboarding/shared/OnboardingLayout.tsx
// Split-screen layout: branded left panel + form right panel
// Premium design with blue-indigo gradients, glassmorphism, and refined stepper

import { ReactNode } from 'react';
import {
    Building2,
    CheckCircle2,
    Sparkles,
    Shield,
    Users,
    Target,
    Upload,
    FileText,
    TrendingUp,
    Receipt,
    Leaf,
    Umbrella,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepDef {
    label: string;
    subtitle: string;
    leftHeading: string;
    leftDescription: string;
}

const DEFAULT_STEP_DEF: StepDef = {
    label: 'Onboarding',
    subtitle: 'Complete your profile',
    leftHeading: 'Welcome to NRP',
    leftDescription: 'Follow the steps to complete your onboarding.',
};

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
    const highlights =
        STEP_HIGHLIGHTS[(stepDef as StepDef & { type?: string })?.type || 'basic_info'] ||
        STEP_HIGHLIGHTS.basic_info;

    return (
        <div className="flex min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* ───── Left Panel (desktop) ───── */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-shrink-0 flex-col justify-between relative overflow-hidden">
                {/* Gradient BG */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 z-0" />

                {/* Glow orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-12">
                    {/* Logo */}
                    <div>
                        <div className="flex items-center gap-3 mb-16">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white/90">NRP CRM</span>
                        </div>

                        {/* Greeting */}
                        <div className="space-y-4 mb-8">
                            {userName && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-blue-100 text-xs font-medium">
                                    Hello, {userName}
                                </div>
                            )}
                            <h2 className="text-4xl font-extrabold leading-tight text-white tracking-tight">
                                {step.leftHeading}
                            </h2>
                            <p className="text-blue-100/80 text-lg leading-relaxed max-w-sm">
                                {step.leftDescription}
                            </p>
                        </div>

                        {/* Highlights */}
                        <div className="space-y-4 mt-8">
                            {highlights.map((h, i) => (
                                <div key={i} className="flex items-center gap-4 text-blue-50 group">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                                        {h.icon}
                                    </div>
                                    <span className="text-sm font-medium tracking-wide">{h.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vertical stepper */}
                    <div className="mt-auto">
                        {stepLabels && stepLabels.length > 0 && (
                            <div className="space-y-0 relative">
                                {/* Connecting line */}
                                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10" />

                                {stepLabels.map((label, i) => {
                                    const isActive = i + 1 === currentStep;
                                    const isCompleted = i + 1 < currentStep;

                                    return (
                                        <div key={i} className="relative flex items-center gap-4 py-3 group">
                                            <div
                                                className={cn(
                                                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                                                    isActive
                                                        ? 'bg-white border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                                        : isCompleted
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : 'bg-transparent border-white/20'
                                                )}
                                            >
                                                {isActive && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                                            </div>
                                            <span
                                                className={cn(
                                                    'text-sm font-medium transition-colors duration-300',
                                                    isActive
                                                        ? 'text-white translate-x-1'
                                                        : isCompleted
                                                            ? 'text-blue-200'
                                                            : 'text-blue-300/60'
                                                )}
                                            >
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-8 flex items-center justify-between text-xs text-blue-200/60 border-t border-white/10 pt-6">
                            <span>Step {currentStep} of {totalSteps}</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───── Right Panel ───── */}
            <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50">
                {/* Mobile header */}
                <div className="lg:hidden px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Building2 className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-slate-900">NRP</span>
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                            Step {currentStep}/{totalSteps}
                        </span>
                    </div>
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Desktop progress bar */}
                <div className="hidden lg:block h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto w-full px-6 py-8 lg:py-12">
                        {/* Form header */}
                        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <p className="text-sm text-blue-600 font-semibold mb-1.5 tracking-wide">
                                Step {currentStep} of {totalSteps}
                            </p>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                                {step.label}
                            </h1>
                            <p className="text-slate-500 text-lg">{step.subtitle}</p>
                        </div>

                        {/* Form content */}
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Sticky navigation footer */}
                <div className="border-t border-slate-200 bg-white/80 backdrop-blur-md sticky bottom-0 z-20">
                    <div className="max-w-3xl mx-auto w-full px-6 py-4">
                        {navigation}
                    </div>
                </div>
            </div>
        </div>
    );
}
