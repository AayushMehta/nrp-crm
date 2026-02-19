'use client';

// Step 2: Pre-Profiler (Investor Type Identifier)
// 4 questions → determines Life Stage, Income Type, Hybrid Tag

import { useMemo } from 'react';
import {
    PreProfilerAnswers,
    OnboardingQuestion,
} from '@/types/onboarding';
import { analyzePreProfiler } from '@/lib/utils/preProfilerLogic';
import { Card, CardContent } from '@/components/ui/card';
import {
    Calendar,
    Briefcase,
    DollarSign,
    BarChart3,
    Sparkles,
    AlertCircle,
    BadgeCheck,
    TrendingUp,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const QUESTION_ICONS = [Calendar, Briefcase, DollarSign, BarChart3];

interface Step2Props {
    data: PreProfilerAnswers;
    onChange: (data: PreProfilerAnswers) => void;
    questions: OnboardingQuestion[];
    showValidation: boolean;
}

export function Step2_PreProfiler({
    data,
    onChange,
    questions,
    showValidation,
}: Step2Props) {
    const sortedQuestions = useMemo(
        () => [...questions].sort((a, b) => a.order - b.order),
        [questions]
    );

    const results = useMemo(
        () => analyzePreProfiler(data, questions),
        [data, questions]
    );

    const allAnswered = questions.every((q) => data[q.id] !== undefined);

    const handleSelect = (questionId: number, optionId: number) => {
        onChange({ ...data, [questionId]: optionId });
    };

    return (
        <div className="space-y-8">
            {/* Questions */}
            <div className="space-y-6">
                {sortedQuestions.map((question, qIdx) => {
                    const Icon = QUESTION_ICONS[qIdx % QUESTION_ICONS.length];
                    const sortedOptions = [...question.options].sort((a, b) => a.order - b.order);
                    const isAnswered = data[question.id] !== undefined;

                    return (
                        <Card
                            key={question.id}
                            className={cn(
                                'border-slate-200 shadow-sm bg-white overflow-hidden transition-all duration-300',
                                showValidation && !isAnswered && 'border-red-300 ring-4 ring-red-50'
                            )}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100 flex-shrink-0">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 mb-1">
                                            Question {qIdx + 1} of {questions.length}
                                        </span>
                                        <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                                            {question.text}
                                        </h3>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-16">
                                    {sortedOptions.map((option) => {
                                        const isSelected = data[question.id] === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleSelect(question.id, option.id)}
                                                className={cn(
                                                    'relative flex items-center w-full px-4 py-3.5 rounded-xl border text-left text-sm transition-all duration-200 group',
                                                    isSelected
                                                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-medium shadow-[0_0_0_1px_rgba(59,130,246,1)]'
                                                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-600'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'w-4 h-4 rounded-full border mr-3 flex items-center justify-center transition-colors',
                                                        isSelected
                                                            ? 'border-blue-500 bg-blue-500'
                                                            : 'border-slate-300 group-hover:border-blue-400'
                                                    )}
                                                >
                                                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                                </div>
                                                {option.text}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Results Card */}
            {allAnswered && results && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 shadow-lg shadow-emerald-100/50">
                        <CardContent className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-200">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your Investor Profile</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
                                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                                            {results.hybridTag}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-100 text-blue-800 text-xs font-medium shadow-sm">
                                            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                                            {results.lifeStage}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-purple-100 text-purple-800 text-xs font-medium shadow-sm">
                                            <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                                            {results.incomeType}
                                        </span>
                                        {results.hniFlag && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold shadow-sm">
                                                ⭐ HNI Client
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
                                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                    {results.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Validation message */}
            {showValidation && !allAnswered && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100 text-red-700 text-sm animate-in fade-in">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <span>Please answer all {questions.length} questions to continue.</span>
                </div>
            )}
        </div>
    );
}
