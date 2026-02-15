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
        <div className="space-y-6 py-4">
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
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5">
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
                                            {option.text}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Results Card */}
            {allAnswered && results && (
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-emerald-600" />
                            <h3 className="text-sm font-bold text-emerald-900">Your Investor Profile</h3>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                                <TrendingUp className="h-3 w-3" />
                                {results.lifeStage}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                                <Briefcase className="h-3 w-3" />
                                {results.incomeType}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                                <BadgeCheck className="h-3 w-3" />
                                {results.hybridTag}
                            </span>
                            {results.hniFlag && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                                    ⭐ HNI
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">{results.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Validation message */}
            {showValidation && !allAnswered && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Please answer all {questions.length} questions to continue.
                </div>
            )}
        </div>
    );
}
