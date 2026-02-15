// types/onboarding.ts
// Onboarding system types for NRP CRM

// ─── Step 1: Basic Info ───────────────────────────────────────
export interface BasicInfo {
    fullName: string;
    email: string;
    mobile: string;
    dateOfBirth: string; // YYYY-MM-DD
}

// ─── Step 2: Pre-Profiler ─────────────────────────────────────
export type PreProfilerAnswers = Record<number, number>; // questionId → optionId

export interface PreProfilerResults {
    lifeStage: string;
    incomeType: string;
    hybridTag: string;
    description: string;
    hniFlag: boolean;
    investorType: string; // alias for hybridTag
}

// ─── Step 3: Risk Profile ─────────────────────────────────────
export type RiskProfileAnswers = Record<number, number>; // questionId → optionId

export interface RiskScoreResult {
    totalScore: number; // 7–35
    category: 'Conservative' | 'Moderate' | 'Aggressive';
    categoryDescription: string;
    suggestedAllocation: {
        equity: number;
        debt: number;
        description: string;
    };
}

// ─── Step 4: Family Members ───────────────────────────────────
export type FamilyRelationship =
    | 'father' | 'mother' | 'spouse'
    | 'son' | 'daughter'
    | 'brother' | 'sister' | 'other' | '';

export interface OnboardingFamilyMember {
    id: string;
    name: string;
    email?: string;
    dateOfBirth: string;
    relationship: FamilyRelationship;
    phone?: string;
    pancard?: string;
}

// ─── Question Types ───────────────────────────────────────────
export interface OnboardingAnswerOption {
    id: number;
    questionId: number;
    text: string;
    order: number;
    score: number | null; // For risk profile questions
    metadata: {
        lifeStage?: string;
        incomeType?: string;
        isHNI?: boolean;
        hybridTag?: string;
        description?: string;
    } | null;
}

export interface OnboardingQuestion {
    id: number;
    type: 'pre_profiler' | 'risk_profile';
    text: string;
    order: number;
    options: OnboardingAnswerOption[];
}

// ─── Onboarding Status ───────────────────────────────────────
export type OnboardingStatus =
    | 'pre_profiler'
    | 'risk_profile'
    | 'family_members'
    | 'completed';

export interface OnboardingState {
    familyId: string;
    status: OnboardingStatus;
    basicInfo: BasicInfo;
    preProfilerAnswers: PreProfilerAnswers;
    riskProfileAnswers: RiskProfileAnswers;
    familyMembers: OnboardingFamilyMember[];
    completedAt?: string;
}

// ─── Step Config ──────────────────────────────────────────────
export interface StepConfig {
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    highlights: { icon: string; text: string }[];
}
