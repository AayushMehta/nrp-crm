// lib/utils/riskScoring.ts
// Risk profile scoring logic

import {
    RiskProfileAnswers,
    RiskScoreResult,
    OnboardingQuestion,
} from '@/types/onboarding';

// ─── Risk Categories ─────────────────────────────────────────
const RISK_CATEGORIES = {
    Conservative: {
        minScore: 7,
        maxScore: 15,
        description:
            'You prefer stability and capital preservation. Your portfolio is designed to minimize risk while generating steady returns through fixed-income instruments.',
        allocation: {
            equity: 20,
            debt: 80,
            description: 'Conservative allocation with emphasis on debt instruments',
        },
    },
    Moderate: {
        minScore: 16,
        maxScore: 25,
        description:
            'You seek a balance between growth and stability. Your portfolio blends equity for growth with debt for stability, suitable for medium-term wealth building.',
        allocation: {
            equity: 50,
            debt: 50,
            description: 'Balanced allocation between equity and debt',
        },
    },
    Aggressive: {
        minScore: 26,
        maxScore: 35,
        description:
            'You are comfortable with market volatility and pursue maximum growth. Your portfolio is equity-heavy, designed for long-term wealth accumulation.',
        allocation: {
            equity: 75,
            debt: 25,
            description: 'Growth-focused allocation with equity dominance',
        },
    },
};

/**
 * Calculate risk score and determine category
 */
export function calculateRiskScore(
    answers: RiskProfileAnswers,
    questions: OnboardingQuestion[]
): RiskScoreResult | null {
    if (!questions || questions.length === 0) return null;

    let totalScore = 0;

    for (const question of questions) {
        const selectedOptionId = answers[question.id];
        if (selectedOptionId === undefined) continue;

        const selectedOption = question.options.find((o) => o.id === selectedOptionId);
        if (selectedOption?.score != null) {
            totalScore += selectedOption.score;
        }
    }

    // Determine category
    let category: 'Conservative' | 'Moderate' | 'Aggressive';
    if (totalScore <= 15) {
        category = 'Conservative';
    } else if (totalScore <= 25) {
        category = 'Moderate';
    } else {
        category = 'Aggressive';
    }

    const categoryInfo = RISK_CATEGORIES[category];

    return {
        totalScore,
        category,
        categoryDescription: categoryInfo.description,
        suggestedAllocation: categoryInfo.allocation,
    };
}

/**
 * Calculate completion percentage for risk profile
 */
export function getCompletionPercentage(
    answers: RiskProfileAnswers,
    questions: OnboardingQuestion[]
): number {
    if (!questions || questions.length === 0) return 0;
    const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
    return Math.round((answeredCount / questions.length) * 100);
}
