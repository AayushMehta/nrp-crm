// lib/utils/preProfilerLogic.ts
// Pre-Profiler analysis: determines investor type from life stage & income type

import {
    PreProfilerAnswers,
    PreProfilerResults,
    OnboardingQuestion,
} from '@/types/onboarding';

// ─── Hybrid Tag Map (25 combinations) ────────────────────────
const HYBRID_TAG_MAP: Record<string, Record<string, string>> = {
    'Early Accumulation': {
        Salaried: 'Young Professional',
        Business: 'Young Entrepreneur',
        HNI: 'Young HNI',
        Retired: 'Early Retiree',
        Starter: 'Career Starter',
    },
    'Peak Accumulation': {
        Salaried: 'Corporate Professional',
        Business: 'Established Entrepreneur',
        HNI: 'Prime HNI',
        Retired: 'Mid-Career Retiree',
        Starter: 'Late Bloomer',
    },
    'Late Accumulation': {
        Salaried: 'Senior Professional',
        Business: 'Mature Business Owner',
        HNI: 'Seasoned HNI',
        Retired: 'Early Retiree',
        Starter: 'Career Transition',
    },
    'Pre-Retirement': {
        Salaried: 'Pre-Retirement Professional',
        Business: 'Pre-Exit Entrepreneur',
        HNI: 'Legacy Planning HNI',
        Retired: 'Voluntary Retiree',
        Starter: 'Late Starter',
    },
    Retirement: {
        Salaried: 'Retired Professional',
        Business: 'Retired Entrepreneur',
        HNI: 'Retired HNI',
        Retired: 'Full Retiree',
        Starter: 'Active Retiree',
    },
};

// ─── Profile Descriptions ────────────────────────────────────
const PROFILE_DESCRIPTIONS: Record<string, string> = {
    'Young Professional':
        'An early-career salaried individual focused on building a strong financial foundation through disciplined saving and investing.',
    'Young Entrepreneur':
        'A young business owner looking to balance business reinvestment with personal wealth creation.',
    'Young HNI':
        'A young high-net-worth individual with significant assets, seeking sophisticated wealth management strategies.',
    'Early Retiree':
        'Someone who has retired early and needs to ensure their wealth sustains through a longer retirement period.',
    'Career Starter':
        'Just beginning their career journey, with a focus on learning about investing and building initial savings.',
    'Corporate Professional':
        'A mid-career corporate professional at peak earning capacity, focused on aggressive wealth accumulation.',
    'Established Entrepreneur':
        'A successful business owner looking to diversify wealth beyond their business.',
    'Prime HNI':
        'A high-net-worth individual in their prime earning years, requiring comprehensive wealth management.',
    'Mid-Career Retiree':
        'Someone who retired mid-career and needs careful planning to maintain their lifestyle.',
    'Late Bloomer':
        'Starting their investment journey later in life, with a need to catch up on wealth building.',
    'Senior Professional':
        'A senior professional approaching retirement, shifting focus towards wealth preservation.',
    'Mature Business Owner':
        'An experienced business owner preparing for potential exit or succession planning.',
    'Seasoned HNI':
        'A well-established HNI focused on legacy planning and intergenerational wealth transfer.',
    'Career Transition':
        'Making a significant career change later in life, requiring financial planning flexibility.',
    'Pre-Retirement Professional':
        'A professional in the final years before retirement, focused on securing post-retirement income.',
    'Pre-Exit Entrepreneur':
        'A business owner preparing for a business exit or sale, needing exit-strategy financial planning.',
    'Legacy Planning HNI':
        'A high-net-worth individual focused on legacy creation, estate planning, and philanthropic giving.',
    'Voluntary Retiree':
        'Someone who chose early retirement and needs to optimize their financial plan for longevity.',
    'Late Starter':
        'Starting serious financial planning late in life, needing an accelerated savings strategy.',
    'Retired Professional':
        'A retired salaried professional managing their retirement corpus and pension income.',
    'Retired Entrepreneur':
        'A retired business person managing post-business wealth and passive income streams.',
    'Retired HNI':
        'A retired high-net-worth individual focused on wealth preservation and estate planning.',
    'Full Retiree':
        'Fully retired with a focus on capital preservation and generating stable income.',
    'Active Retiree':
        'A retiree actively managing investments and exploring new income opportunities.',
};

/**
 * Analyze pre-profiler answers to determine investor profile
 */
export function analyzePreProfiler(
    answers: PreProfilerAnswers,
    questions: OnboardingQuestion[]
): PreProfilerResults | null {
    if (!questions || questions.length === 0) return null;

    let lifeStage: string | null = null;
    let incomeType: string | null = null;
    let hniFlag = false;

    // Extract metadata from selected answers
    for (const question of questions) {
        const selectedOptionId = answers[question.id];
        if (selectedOptionId === undefined) continue;

        const selectedOption = question.options.find((o) => o.id === selectedOptionId);
        if (!selectedOption?.metadata) continue;

        if (selectedOption.metadata.lifeStage) {
            lifeStage = selectedOption.metadata.lifeStage;
        }
        if (selectedOption.metadata.incomeType) {
            incomeType = selectedOption.metadata.incomeType;
        }
        if (selectedOption.metadata.isHNI) {
            hniFlag = true;
        }
    }

    // Override income type to HNI if flagged
    const effectiveIncomeType = hniFlag ? 'HNI' : incomeType;

    if (!lifeStage || !effectiveIncomeType) {
        return null;
    }

    const hybridTag =
        HYBRID_TAG_MAP[lifeStage]?.[effectiveIncomeType] || 'Unknown Profile';
    const description =
        PROFILE_DESCRIPTIONS[hybridTag] || 'Profile description not available.';

    return {
        lifeStage,
        incomeType: effectiveIncomeType,
        hybridTag,
        description,
        hniFlag,
        investorType: hybridTag,
    };
}
