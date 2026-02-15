// lib/services/onboarding-service.ts
// Mock onboarding service with localStorage persistence

import {
    OnboardingQuestion,
    OnboardingState,
    OnboardingStatus,
    BasicInfo,
    PreProfilerAnswers,
    RiskProfileAnswers,
    OnboardingFamilyMember,
} from '@/types/onboarding';
import { InvitationConfig } from '@/lib/config/onboarding-config';

// ─── Storage Keys ─────────────────────────────────────────────
const ONBOARDING_STORAGE_KEY = 'nrp_onboarding_state';
const INVITATION_STORAGE_KEY = 'nrp_onboarding_invitations';
const DOCUMENT_UPLOAD_KEY = 'nrp_document_uploads';

// ─── Pre-Profiler Questions (4) ──────────────────────────────
const PRE_PROFILER_QUESTIONS: OnboardingQuestion[] = [
    {
        id: 1,
        type: 'pre_profiler',
        text: 'What is your age group?',
        order: 1,
        options: [
            { id: 101, questionId: 1, text: '18–30 years', order: 1, score: null, metadata: { lifeStage: 'Early Accumulation' } },
            { id: 102, questionId: 1, text: '31–45 years', order: 2, score: null, metadata: { lifeStage: 'Peak Accumulation' } },
            { id: 103, questionId: 1, text: '46–55 years', order: 3, score: null, metadata: { lifeStage: 'Late Accumulation' } },
            { id: 104, questionId: 1, text: '56–65 years', order: 4, score: null, metadata: { lifeStage: 'Pre-Retirement' } },
            { id: 105, questionId: 1, text: '65+ years', order: 5, score: null, metadata: { lifeStage: 'Retirement' } },
        ],
    },
    {
        id: 2,
        type: 'pre_profiler',
        text: 'What is your primary source of income?',
        order: 2,
        options: [
            { id: 201, questionId: 2, text: 'Salaried (Corporate Job)', order: 1, score: null, metadata: { incomeType: 'Salaried' } },
            { id: 202, questionId: 2, text: 'Self-Employed / Business Owner', order: 2, score: null, metadata: { incomeType: 'Business' } },
            { id: 203, questionId: 2, text: 'Professional (Doctor/Lawyer/CA)', order: 3, score: null, metadata: { incomeType: 'Salaried' } },
            { id: 204, questionId: 2, text: 'Retired / Pension', order: 4, score: null, metadata: { incomeType: 'Retired' } },
            { id: 205, questionId: 2, text: 'Student / Just Starting Career', order: 5, score: null, metadata: { incomeType: 'Starter' } },
        ],
    },
    {
        id: 3,
        type: 'pre_profiler',
        text: 'What is your approximate annual income?',
        order: 3,
        options: [
            { id: 301, questionId: 3, text: 'Below ₹5 Lakhs', order: 1, score: null, metadata: null },
            { id: 302, questionId: 3, text: '₹5–15 Lakhs', order: 2, score: null, metadata: null },
            { id: 303, questionId: 3, text: '₹15–50 Lakhs', order: 3, score: null, metadata: null },
            { id: 304, questionId: 3, text: '₹50 Lakhs – ₹1 Crore', order: 4, score: null, metadata: null },
            { id: 305, questionId: 3, text: 'Above ₹1 Crore', order: 5, score: null, metadata: { isHNI: true } },
        ],
    },
    {
        id: 4,
        type: 'pre_profiler',
        text: 'What is your approximate net worth (assets minus liabilities)?',
        order: 4,
        options: [
            { id: 401, questionId: 4, text: 'Below ₹25 Lakhs', order: 1, score: null, metadata: null },
            { id: 402, questionId: 4, text: '₹25 Lakhs – ₹1 Crore', order: 2, score: null, metadata: null },
            { id: 403, questionId: 4, text: '₹1–5 Crore', order: 3, score: null, metadata: null },
            { id: 404, questionId: 4, text: '₹5–25 Crore', order: 4, score: null, metadata: { isHNI: true } },
            { id: 405, questionId: 4, text: 'Above ₹25 Crore', order: 5, score: null, metadata: { isHNI: true } },
        ],
    },
];

// ─── Risk Profile Questions (7) ──────────────────────────────
const RISK_PROFILE_QUESTIONS: OnboardingQuestion[] = [
    {
        id: 5,
        type: 'risk_profile',
        text: 'What is your investment time horizon?',
        order: 1,
        options: [
            { id: 501, questionId: 5, text: 'Less than 1 year', order: 1, score: 1, metadata: null },
            { id: 502, questionId: 5, text: '1–3 years', order: 2, score: 2, metadata: null },
            { id: 503, questionId: 5, text: '3–5 years', order: 3, score: 3, metadata: null },
            { id: 504, questionId: 5, text: '5–10 years', order: 4, score: 4, metadata: null },
            { id: 505, questionId: 5, text: 'More than 10 years', order: 5, score: 5, metadata: null },
        ],
    },
    {
        id: 6,
        type: 'risk_profile',
        text: 'How would you react if your portfolio dropped 20% in one month?',
        order: 2,
        options: [
            { id: 601, questionId: 6, text: 'Sell everything immediately', order: 1, score: 1, metadata: null },
            { id: 602, questionId: 6, text: 'Sell some investments', order: 2, score: 2, metadata: null },
            { id: 603, questionId: 6, text: 'Do nothing and wait', order: 3, score: 3, metadata: null },
            { id: 604, questionId: 6, text: 'Buy more at lower prices', order: 4, score: 4, metadata: null },
            { id: 605, questionId: 6, text: 'Aggressively buy more', order: 5, score: 5, metadata: null },
        ],
    },
    {
        id: 7,
        type: 'risk_profile',
        text: 'What is your primary investment goal?',
        order: 3,
        options: [
            { id: 701, questionId: 7, text: 'Preserve capital, minimize losses', order: 1, score: 1, metadata: null },
            { id: 702, questionId: 7, text: 'Generate regular income', order: 2, score: 2, metadata: null },
            { id: 703, questionId: 7, text: 'Balance growth and stability', order: 3, score: 3, metadata: null },
            { id: 704, questionId: 7, text: 'Long-term wealth accumulation', order: 4, score: 4, metadata: null },
            { id: 705, questionId: 7, text: 'Maximum growth, accept high volatility', order: 5, score: 5, metadata: null },
        ],
    },
    {
        id: 8,
        type: 'risk_profile',
        text: 'How much of your monthly income can you invest?',
        order: 4,
        options: [
            { id: 801, questionId: 8, text: 'Less than 10%', order: 1, score: 1, metadata: null },
            { id: 802, questionId: 8, text: '10–20%', order: 2, score: 2, metadata: null },
            { id: 803, questionId: 8, text: '20–30%', order: 3, score: 3, metadata: null },
            { id: 804, questionId: 8, text: '30–50%', order: 4, score: 4, metadata: null },
            { id: 805, questionId: 8, text: 'More than 50%', order: 5, score: 5, metadata: null },
        ],
    },
    {
        id: 9,
        type: 'risk_profile',
        text: 'What is your experience with investing?',
        order: 5,
        options: [
            { id: 901, questionId: 9, text: 'No experience', order: 1, score: 1, metadata: null },
            { id: 902, questionId: 9, text: 'Savings accounts and FDs only', order: 2, score: 2, metadata: null },
            { id: 903, questionId: 9, text: 'Mutual funds and bonds', order: 3, score: 3, metadata: null },
            { id: 904, questionId: 9, text: 'Stocks, MFs, and derivatives', order: 4, score: 4, metadata: null },
            { id: 905, questionId: 9, text: 'Extensive (stocks, derivatives, crypto, alternatives)', order: 5, score: 5, metadata: null },
        ],
    },
    {
        id: 10,
        type: 'risk_profile',
        text: 'How important is liquidity (easy access to your money)?',
        order: 6,
        options: [
            { id: 1001, questionId: 10, text: 'Extremely important — need it anytime', order: 1, score: 1, metadata: null },
            { id: 1002, questionId: 10, text: 'Very important — within a few weeks', order: 2, score: 2, metadata: null },
            { id: 1003, questionId: 10, text: 'Moderately important — can lock for 1–2 years', order: 3, score: 3, metadata: null },
            { id: 1004, questionId: 10, text: 'Not very important — can lock for 3–5 years', order: 4, score: 4, metadata: null },
            { id: 1005, questionId: 10, text: 'Not important — can lock for 5+ years', order: 5, score: 5, metadata: null },
        ],
    },
    {
        id: 11,
        type: 'risk_profile',
        text: 'Which statement best describes your risk attitude?',
        order: 7,
        options: [
            { id: 1101, questionId: 11, text: "I can't tolerate any loss of capital", order: 1, score: 1, metadata: null },
            { id: 1102, questionId: 11, text: 'I can accept small losses for slightly higher returns', order: 2, score: 2, metadata: null },
            { id: 1103, questionId: 11, text: "I'm comfortable with moderate ups and downs", order: 3, score: 3, metadata: null },
            { id: 1104, questionId: 11, text: 'I can handle significant volatility for higher returns', order: 4, score: 4, metadata: null },
            { id: 1105, questionId: 11, text: 'I seek maximum returns regardless of volatility', order: 5, score: 5, metadata: null },
        ],
    },
];

// ─── Service Functions ───────────────────────────────────────

export function getPreProfilerQuestions(): OnboardingQuestion[] {
    return PRE_PROFILER_QUESTIONS;
}

export function getRiskProfileQuestions(): OnboardingQuestion[] {
    return RISK_PROFILE_QUESTIONS;
}

/**
 * Get or create onboarding state for a family
 */
export function getOnboardingState(familyId: string): OnboardingState {
    if (typeof window === 'undefined') {
        return createDefaultState(familyId);
    }

    const stored = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}_${familyId}`);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            // corrupted data, reset
        }
    }

    return createDefaultState(familyId);
}

/**
 * Save onboarding state
 */
export function saveOnboardingState(state: OnboardingState): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
        `${ONBOARDING_STORAGE_KEY}_${state.familyId}`,
        JSON.stringify(state)
    );
}

/**
 * Update onboarding status
 */
export function updateOnboardingStatus(
    familyId: string,
    status: OnboardingStatus
): void {
    const state = getOnboardingState(familyId);
    state.status = status;
    if (status === 'completed') {
        state.completedAt = new Date().toISOString();
    }
    saveOnboardingState(state);
}

/**
 * Save basic info
 */
export function saveBasicInfo(familyId: string, basicInfo: BasicInfo): void {
    const state = getOnboardingState(familyId);
    state.basicInfo = basicInfo;
    saveOnboardingState(state);
}

/**
 * Save pre-profiler answers
 */
export function savePreProfilerAnswers(
    familyId: string,
    answers: PreProfilerAnswers
): void {
    const state = getOnboardingState(familyId);
    state.preProfilerAnswers = answers;
    state.status = 'risk_profile';
    saveOnboardingState(state);
}

/**
 * Save risk profile answers
 */
export function saveRiskProfileAnswers(
    familyId: string,
    answers: RiskProfileAnswers
): void {
    const state = getOnboardingState(familyId);
    state.riskProfileAnswers = answers;
    state.status = 'family_members';
    saveOnboardingState(state);
}

/**
 * Save family members and complete onboarding
 */
export function saveFamilyMembers(
    familyId: string,
    members: OnboardingFamilyMember[]
): void {
    const state = getOnboardingState(familyId);
    state.familyMembers = members;
    state.status = 'completed';
    state.completedAt = new Date().toISOString();
    saveOnboardingState(state);
}

/**
 * Create a default clean state
 */
function createDefaultState(familyId: string): OnboardingState {
    return {
        familyId,
        status: 'pre_profiler',
        basicInfo: {
            fullName: '',
            email: '',
            mobile: '',
            dateOfBirth: '',
        },
        preProfilerAnswers: {},
        riskProfileAnswers: {},
        familyMembers: [],
    };
}

/**
 * Get initial step based on onboarding status
 */
export function getInitialStep(status: OnboardingStatus): number {
    switch (status) {
        case 'pre_profiler':
            return 2;
        case 'risk_profile':
            return 3;
        case 'family_members':
            return 4;
        case 'completed':
            return 4;
        default:
            return 1;
    }
}

// ─── Invitation Config Management ────────────────────────────

/**
 * Get all stored invitations
 */
export function getAllInvitations(): InvitationConfig[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(INVITATION_STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    return [];
}

/**
 * Save an invitation config. Auto-generates token, createdAt, and status.
 */
export function createInvitation(
    input: Omit<InvitationConfig, 'token' | 'createdAt' | 'status'>
): InvitationConfig {
    const config: InvitationConfig = {
        ...input,
        token: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
    };
    if (typeof window !== 'undefined') {
        const invitations = getAllInvitations();
        invitations.unshift(config);
        localStorage.setItem(INVITATION_STORAGE_KEY, JSON.stringify(invitations));
    }
    return config;
}

/**
 * Get a specific invitation by token
 */
export function getInvitationConfig(token: string): InvitationConfig | null {
    const invitations = getAllInvitations();
    return invitations.find(i => i.token === token) || null;
}

/**
 * Update invitation status
 */
export function updateInvitationStatus(
    token: string,
    status: InvitationConfig['status']
): void {
    if (typeof window === 'undefined') return;
    const invitations = getAllInvitations();
    const idx = invitations.findIndex(i => i.token === token);
    if (idx !== -1) {
        invitations[idx].status = status;
        localStorage.setItem(INVITATION_STORAGE_KEY, JSON.stringify(invitations));
    }
}

// ─── Document Upload Management ──────────────────────────────

export interface DocumentUpload {
    id: string;
    token: string; // invitation token
    documentId: string; // from DOCUMENT_POOL
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    status: 'uploaded' | 'verified' | 'rejected';
}

/**
 * Get all document uploads for a token
 */
export function getDocumentUploads(token: string): DocumentUpload[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${DOCUMENT_UPLOAD_KEY}_${token}`);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    return [];
}

/**
 * Save a document upload
 */
export function saveDocumentUpload(upload: DocumentUpload): void {
    if (typeof window === 'undefined') return;
    const uploads = getDocumentUploads(upload.token);
    // Replace if same documentId exists, else push
    const idx = uploads.findIndex(u => u.documentId === upload.documentId);
    if (idx !== -1) {
        uploads[idx] = upload;
    } else {
        uploads.push(upload);
    }
    localStorage.setItem(
        `${DOCUMENT_UPLOAD_KEY}_${upload.token}`,
        JSON.stringify(uploads)
    );
}

/**
 * Remove a document upload
 */
export function removeDocumentUpload(token: string, documentId: string): void {
    if (typeof window === 'undefined') return;
    const uploads = getDocumentUploads(token).filter(u => u.documentId !== documentId);
    localStorage.setItem(
        `${DOCUMENT_UPLOAD_KEY}_${token}`,
        JSON.stringify(uploads)
    );
}

