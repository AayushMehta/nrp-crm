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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const QUESTION_ICONS = [Clock, TrendingDown, Target, DollarSign, BarChart3, Droplets, Shield];

const CATEGORY_COLORS = {
    Conservative: { badge: 'bg-blue-100 text-blue-800', bar: 'bg-blue-500' },
    Moderate: { badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
    Aggressive: { badge: 'bg-red-100 text-red-800', bar: 'bg-red-500' },
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
        <div className="space-y-6 py-4">
            {/* Score Card — sticky at top */}
            <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white sticky top-0 z-10 shadow-sm">
                <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-slate-600" />
                            <span className="text-sm font-bold text-gray-900">Risk Score</span>
                        </div>
                        {result && (
                            <span
                                className={cn(
                                    'px-3 py-1 rounded-full text-xs font-bold',
                                    CATEGORY_COLORS[result.category].badge
                                )}
                            >
                                {result.category}
                            </span>
                        )}
                    </div>

                    {/* Score bar */}
                    <div className="mb-3">
                        <div className="flex items-baseline justify-between mb-1">
                            <span className="text-2xl font-bold text-gray-900">
                                {result?.totalScore || 0}
                            </span>
                            <span className="text-xs text-gray-400">/ 35</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-300',
                                    result ? CATEGORY_COLORS[result.category].bar : 'bg-gray-300'
                                )}
                                style={{ width: `${((result?.totalScore || 0) / 35) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Allocation preview */}
                    {result && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                                Suggested: <span className="font-semibold text-emerald-700">Equity {result.suggestedAllocation.equity}%</span>
                                {' : '}
                                <span className="font-semibold text-blue-700">Debt {result.suggestedAllocation.debt}%</span>
                            </span>
                        </div>
                    )}

                    {/* Completion progress */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${completion}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{completion}%</span>
                    </div>
                </CardContent>
            </Card>

            {/* Questions */}
            {sortedQuestions.map((question, qIdx) => {
                const Icon = QUESTION_ICONS[qIdx % QUESTION_ICONS.length];
                const sortedOptions = [...question.options].sort((a, b) => a.order - b.order);
                const isAnswered = data[question.id] !== undefined;

                return (
                    <Card
                        key={question.id}
                        className={cn(
                            'transition-all duration-200',
                            showValidation && !isAnswered && 'border-red-300 shadow-red-50'
                        )}
                    >
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 flex-shrink-0 mt-0.5">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-0.5">
                                        Question {qIdx + 1} of {questions.length}
                                    </p>
                                    <h3 className="text-sm font-semibold text-gray-900">{question.text}</h3>
                                </div>
                            </div>

                            <div className="space-y-2 ml-11">
                                {sortedOptions.map((option) => {
                                    const isSelected = data[question.id] === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleSelect(question.id, option.id)}
                                            className={cn(
                                                'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150',
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium ring-1 ring-blue-500'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option.text}</span>
                                                {isSelected && option.score != null && (
                                                    <span className="text-xs text-blue-600 font-bold">+{option.score}</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Result description */}
            {allAnswered && result && (
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardContent className="pt-5 pb-4">
                        <h3 className="text-sm font-bold text-emerald-900 mb-2">Your Risk Profile</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{result.categoryDescription}</p>
                    </CardContent>
                </Card>
            )}

            {/* Validation */}
            {showValidation && !allAnswered && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Please answer all {questions.length} questions to continue. All questions are mandatory.
                </div>
            )}
        </div>
    );
}
