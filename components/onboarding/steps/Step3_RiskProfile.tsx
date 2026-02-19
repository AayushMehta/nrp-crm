'use client';

// Step 3: Risk Profile Assessment
// 7 scored questions → score 7–35 → Conservative/Moderate/Aggressive

import { useMemo } from 'react';
import {
    RiskProfileAnswers,
    OnboardingQuestion,
} from '@/types/onboarding';
import { calculateRiskScore, getCompletionPercentage } from '@/lib/utils/riskScoring';
import { Card, CardContent } from '@/components/ui/card';
import {
    Clock,
    TrendingDown,
    Target,
    DollarSign,
    BarChart3,
    Droplets,
    Shield,
    AlertCircle,
    PieChart,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const QUESTION_ICONS = [Clock, TrendingDown, Target, DollarSign, BarChart3, Droplets, Shield];

const CATEGORY_COLORS = {
    Conservative: { badge: 'bg-blue-100 text-blue-800 border-blue-200', bar: 'bg-blue-500' },
    Moderate: { badge: 'bg-amber-100 text-amber-800 border-amber-200', bar: 'bg-amber-500' },
    Aggressive: { badge: 'bg-red-100 text-red-800 border-red-200', bar: 'bg-red-500' },
};

interface Step3Props {
    data: RiskProfileAnswers;
    onChange: (data: RiskProfileAnswers) => void;
    questions: OnboardingQuestion[];
    showValidation: boolean;
}

export function Step3_RiskProfile({
    data,
    onChange,
    questions,
    showValidation,
}: Step3Props) {
    const sortedQuestions = useMemo(
        () => [...questions].sort((a, b) => a.order - b.order),
        [questions]
    );

    const result = useMemo(
        () => calculateRiskScore(data, questions),
        [data, questions]
    );

    const completion = useMemo(
        () => getCompletionPercentage(data, questions),
        [data, questions]
    );

    const allAnswered = completion === 100;

    const handleSelect = (questionId: number, optionId: number) => {
        onChange({ ...data, [questionId]: optionId });
    };

    return (
        <div className="space-y-8 relative">
            {/* Sticky Score Card */}
            <div className="sticky top-0 z-20 pb-4 -mt-2 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
                <Card className="border-slate-200 shadow-md bg-white">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Score & Category */}
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                                <PieChart className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Risk Score</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-slate-900">{result?.totalScore || 0}</span>
                                    <span className="text-sm text-slate-400 font-medium">/ 35</span>
                                    {result && (
                                        <span
                                            className={cn(
                                                'ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold border',
                                                CATEGORY_COLORS[result.category].badge
                                            )}
                                        >
                                            {result.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="flex-1 max-w-sm w-full space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Progress</span>
                                <span className="text-blue-600 font-bold">{completion}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                                    style={{ width: `${completion}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100 flex-shrink-0">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-slate-400 mb-1 block">
                                            Question {qIdx + 1}
                                        </span>
                                        <h3 className="text-base font-semibold text-slate-900 leading-snug">
                                            {question.text}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-3 pl-0 md:pl-14">
                                    {sortedOptions.map((option) => {
                                        const isSelected = data[question.id] === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleSelect(question.id, option.id)}
                                                className={cn(
                                                    'relative flex items-center justify-between w-full px-5 py-4 rounded-xl border text-left text-sm transition-all duration-200 group',
                                                    isSelected
                                                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-medium shadow-[0_0_0_1px_rgba(99,102,241,1)]'
                                                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-600'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            'w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0',
                                                            isSelected
                                                                ? 'border-indigo-500 bg-indigo-500'
                                                                : 'border-slate-300 group-hover:border-indigo-400'
                                                        )}
                                                    >
                                                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                    <span>{option.text}</span>
                                                </div>
                                                {isSelected && option.score != null && (
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                                        +{option.score}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Result interpretation */}
            {allAnswered && result && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 pb-8">
                    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white shadow-lg overflow-hidden">
                        <div className="h-1 w-full bg-emerald-500" />
                        <CardContent className="p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-emerald-100 rounded-xl">
                                    <Target className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Recommended Allocation</h3>
                                    <p className="text-sm text-gray-500">
                                        Based on your {result.category.toLowerCase()} risk profile
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-emerald-800">Equity (Growth)</span>
                                            <span className="text-emerald-700">{result.suggestedAllocation.equity}%</span>
                                        </div>
                                        <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${result.suggestedAllocation.equity}%` }}
                                                className="h-full bg-emerald-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-blue-800">Debt (Stability)</span>
                                            <span className="text-blue-700">{result.suggestedAllocation.debt}%</span>
                                        </div>
                                        <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${result.suggestedAllocation.debt}%` }}
                                                className="h-full bg-blue-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/60 p-5 rounded-xl border border-emerald-100 flex items-center">
                                    <p className="text-slate-700 text-sm leading-relaxed italic">
                                        &ldquo;{result.categoryDescription}&rdquo;
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Validation */}
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
