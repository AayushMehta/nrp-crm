'use client';

// components/onboarding/OnboardingWizard.tsx
// Dynamic orchestrator: reads invitation config → computes steps → renders them dynamically

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    BasicInfo,
    PreProfilerAnswers,
    RiskProfileAnswers,
    OnboardingFamilyMember,
    OnboardingQuestion,
} from '@/types/onboarding';
import {
    saveBasicInfo,
    savePreProfilerAnswers,
    saveRiskProfileAnswers,
    saveFamilyMembers,
    updateInvitationStatus,
    getDocumentUploads,
} from '@/lib/services/onboarding-service';
import { analyzePreProfiler } from '@/lib/utils/preProfilerLogic';
import { calculateRiskScore } from '@/lib/utils/riskScoring';
import { OnboardingLayout } from './shared/OnboardingLayout';
import { WizardNavigation } from './shared/WizardNavigation';
import { Step1_BasicInfo } from './steps/Step1_BasicInfo';
import { Step2_PreProfiler } from './steps/Step2_PreProfiler';
import { Step3_RiskProfile } from './steps/Step3_RiskProfile';
import { Step4_FamilyMembers } from './steps/Step4_FamilyMembers';
import { Step_DocumentUpload } from './steps/Step_DocumentUpload';
import type { InvitationConfig, DocumentRequirement } from '@/lib/config/onboarding-config';
import { DOCUMENT_POOL, QUESTIONNAIRE_POOL } from '@/lib/config/onboarding-config';

// ─── Step Definition ─────────────────────────────────────────
export type StepType = 'basic_info' | 'pre_profiler' | 'risk_profile' | 'financial_goals' | 'tax_planning' | 'esg_preferences' | 'insurance_review' | 'document_upload' | 'family_members';

interface DynamicStep {
    type: StepType;
    label: string;
    subtitle: string;
    leftHeading: string;
    leftDescription: string;
}

// ─── Step Definitions ────────────────────────────────────────
const STEP_DEFINITIONS: Record<string, DynamicStep> = {
    basic_info: {
        type: 'basic_info',
        label: 'Basic Information',
        subtitle: 'Tell us about yourself',
        leftHeading: 'Welcome to NRP',
        leftDescription: "Let's start with your essential details to set up your profile.",
    },
    pre_profiler: {
        type: 'pre_profiler',
        label: 'Investor Profile',
        subtitle: 'Understanding your financial background',
        leftHeading: 'Know Your Profile',
        leftDescription: 'Answer a few questions so we can understand your investment personality.',
    },
    risk_profile: {
        type: 'risk_profile',
        label: 'Risk Assessment',
        subtitle: 'Determining your risk tolerance',
        leftHeading: 'Risk Profiling',
        leftDescription: 'Help us understand your comfort level with market volatility.',
    },
    financial_goals: {
        type: 'financial_goals',
        label: 'Financial Goals',
        subtitle: 'Share your financial objectives',
        leftHeading: 'Your Goals',
        leftDescription: 'Help us understand what you want to achieve with your wealth.',
    },
    tax_planning: {
        type: 'tax_planning',
        label: 'Tax Planning',
        subtitle: 'Tax status and preferences',
        leftHeading: 'Tax Optimization',
        leftDescription: 'Share your tax planning preferences for optimized recommendations.',
    },
    esg_preferences: {
        type: 'esg_preferences',
        label: 'ESG Preferences',
        subtitle: 'Sustainable investing choices',
        leftHeading: 'Responsible Investing',
        leftDescription: 'Tell us about your Environmental, Social, and Governance preferences.',
    },
    insurance_review: {
        type: 'insurance_review',
        label: 'Insurance Review',
        subtitle: 'Coverage assessment',
        leftHeading: 'Insurance Check',
        leftDescription: 'Review your existing insurance coverage and identify potential gaps.',
    },
    document_upload: {
        type: 'document_upload',
        label: 'Document Upload',
        subtitle: 'Upload required documents',
        leftHeading: 'Verification',
        leftDescription: 'Upload the necessary documents for identity and financial verification.',
    },
    family_members: {
        type: 'family_members',
        label: 'Family Members',
        subtitle: 'Add your family to the plan',
        leftHeading: 'Family Planning',
        leftDescription: 'Add family members to create a comprehensive financial plan.',
    },
};

// ─── Props ───────────────────────────────────────────────────
interface OnboardingWizardProps {
    familyId: string;
    initialStep?: number;
    initialBasicInfo?: BasicInfo;
    initialPreProfiler?: PreProfilerAnswers;
    initialRiskProfile?: RiskProfileAnswers;
    initialFamilyMembers?: OnboardingFamilyMember[];
    preProfilerQuestions: OnboardingQuestion[];
    riskProfileQuestions: OnboardingQuestion[];
    isFamilyHead?: boolean;
    invitationConfig?: InvitationConfig | null;
}

export function OnboardingWizard({
    familyId,
    initialStep = 1,
    initialBasicInfo,
    initialPreProfiler,
    initialRiskProfile,
    initialFamilyMembers,
    preProfilerQuestions,
    riskProfileQuestions,
    isFamilyHead = true,
    invitationConfig,
}: OnboardingWizardProps) {
    const router = useRouter();

    // ─── Compute Dynamic Steps ───────────────────────────────
    const dynamicSteps = useMemo<DynamicStep[]>(() => {
        // If no config, use legacy 4-step flow
        if (!invitationConfig) {
            const steps: DynamicStep[] = [STEP_DEFINITIONS.basic_info];
            if (isFamilyHead) {
                steps.push(STEP_DEFINITIONS.pre_profiler);
                steps.push(STEP_DEFINITIONS.risk_profile);
                steps.push(STEP_DEFINITIONS.family_members);
            }
            return steps;
        }

        // Build steps from invitation config
        const steps: DynamicStep[] = [STEP_DEFINITIONS.basic_info];
        for (const qId of invitationConfig.selectedQuestionnaires) {
            if (STEP_DEFINITIONS[qId]) {
                steps.push(STEP_DEFINITIONS[qId]);
            }
        }
        if (invitationConfig.selectedDocuments.length > 0) {
            steps.push(STEP_DEFINITIONS.document_upload);
        }
        if (invitationConfig.includeFamilyMembers) {
            steps.push(STEP_DEFINITIONS.family_members);
        }
        return steps;
    }, [invitationConfig, isFamilyHead]);

    const totalSteps = dynamicSteps.length;

    // ─── Required Documents ──────────────────────────────────
    const requiredDocuments = useMemo<DocumentRequirement[]>(() => {
        if (!invitationConfig) return [];
        return DOCUMENT_POOL.filter(d => invitationConfig.selectedDocuments.includes(d.id));
    }, [invitationConfig]);

    // ─── State ───────────────────────────────────────────────
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [showValidation, setShowValidation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [basicInfo, setBasicInfo] = useState<BasicInfo>(
        initialBasicInfo || { fullName: '', email: '', mobile: '', dateOfBirth: '' }
    );
    const [preProfiler, setPreProfiler] = useState<PreProfilerAnswers>(initialPreProfiler || {});
    const [riskProfile, setRiskProfile] = useState<RiskProfileAnswers>(initialRiskProfile || {});
    const [familyMembers, setFamilyMembers] = useState<OnboardingFamilyMember[]>(initialFamilyMembers || []);

    // ─── Derived ─────────────────────────────────────────────
    const preProfilerResults = useMemo(
        () => analyzePreProfiler(preProfiler, preProfilerQuestions),
        [preProfiler, preProfilerQuestions]
    );

    const riskScoreResult = useMemo(
        () => calculateRiskScore(riskProfile, riskProfileQuestions),
        [riskProfile, riskProfileQuestions]
    );

    // ─── Current Step Info ───────────────────────────────────
    const currentStepDef = dynamicSteps[currentStep - 1];
    const currentStepType = currentStepDef?.type;

    // ─── Validation ──────────────────────────────────────────
    const validateCurrentStep = useCallback((): boolean => {
        switch (currentStepType) {
            case 'basic_info':
                return (
                    basicInfo.fullName.trim() !== '' &&
                    basicInfo.email.trim() !== '' &&
                    basicInfo.mobile.trim() !== '' &&
                    basicInfo.dateOfBirth !== ''
                );
            case 'pre_profiler':
                return preProfilerQuestions.every(q => preProfiler[q.id] !== undefined);
            case 'risk_profile':
                return riskProfileQuestions.every(q => riskProfile[q.id] !== undefined);
            case 'document_upload': {
                // Only mandatory docs must be uploaded
                const mandatoryDocs = requiredDocuments.filter(d => d.isMandatory);
                if (mandatoryDocs.length === 0) return true;
                const uploads = getDocumentUploads(familyId);
                return mandatoryDocs.every(d => uploads.some(u => u.documentId === d.id));
            }
            case 'family_members':
                if (familyMembers.length === 0) return true;
                return familyMembers.every(
                    m => m.name.trim() !== '' && m.relationship !== ''
                );
            // Future questionnaire types - always valid for now
            case 'financial_goals':
            case 'tax_planning':
            case 'esg_preferences':
            case 'insurance_review':
                return true;
            default:
                return true;
        }
    }, [currentStepType, basicInfo, preProfiler, riskProfile, familyMembers, preProfilerQuestions, riskProfileQuestions, requiredDocuments, familyId]);

    // ─── Save Current Step ───────────────────────────────────
    const saveCurrentStep = useCallback(() => {
        switch (currentStepType) {
            case 'basic_info':
                saveBasicInfo(familyId, basicInfo);
                break;
            case 'pre_profiler':
                savePreProfilerAnswers(familyId, preProfiler);
                break;
            case 'risk_profile':
                saveRiskProfileAnswers(familyId, riskProfile);
                break;
            // document_upload saves automatically via Step_DocumentUpload
        }
    }, [currentStepType, familyId, basicInfo, preProfiler, riskProfile]);

    // ─── Navigation ──────────────────────────────────────────
    const handleNext = useCallback(async () => {
        setShowValidation(true);
        if (!validateCurrentStep()) {
            toast.error('Please complete all required fields.');
            return;
        }
        setIsSubmitting(true);
        setShowValidation(false);
        try {
            saveCurrentStep();
            await new Promise(r => setTimeout(r, 400));
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            toast.success('Progress saved!');
        } catch {
            toast.error('Failed to save. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [validateCurrentStep, saveCurrentStep, totalSteps]);

    const handlePrevious = useCallback(() => {
        setShowValidation(false);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }, []);

    const handleComplete = useCallback(async () => {
        setShowValidation(true);
        if (!validateCurrentStep()) {
            toast.error('Please complete all required fields.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Save current step
            saveCurrentStep();
            if (currentStepType === 'family_members') {
                saveFamilyMembers(familyId, familyMembers);
            }

            // Mark invitation as completed
            if (invitationConfig) {
                updateInvitationStatus(invitationConfig.token, 'completed');
            }

            await new Promise(r => setTimeout(r, 600));
            toast.success('Onboarding completed successfully! 🎉');
            setTimeout(() => router.push('/client/dashboard'), 800);
        } catch {
            toast.error('Failed to complete onboarding. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [validateCurrentStep, saveCurrentStep, currentStepType, familyId, familyMembers, invitationConfig, router]);

    // ─── Step Content ────────────────────────────────────────
    const renderStep = () => {
        switch (currentStepType) {
            case 'basic_info':
                return (
                    <Step1_BasicInfo
                        data={basicInfo}
                        onChange={setBasicInfo}
                        showValidation={showValidation}
                    />
                );
            case 'pre_profiler':
                return (
                    <Step2_PreProfiler
                        data={preProfiler}
                        onChange={setPreProfiler}
                        questions={preProfilerQuestions}
                        showValidation={showValidation}
                    />
                );
            case 'risk_profile':
                return (
                    <Step3_RiskProfile
                        data={riskProfile}
                        onChange={setRiskProfile}
                        questions={riskProfileQuestions}
                        showValidation={showValidation}
                    />
                );
            case 'document_upload':
                return (
                    <Step_DocumentUpload
                        documents={requiredDocuments}
                        token={familyId}
                        showValidation={showValidation}
                    />
                );
            case 'family_members':
                return (
                    <Step4_FamilyMembers
                        data={familyMembers}
                        onChange={setFamilyMembers}
                        showValidation={showValidation}
                    />
                );
            // Future questionnaire types - show placeholder
            case 'financial_goals':
            case 'tax_planning':
            case 'esg_preferences':
            case 'insurance_review':
                return (
                    <div className="py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mx-auto mb-4">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{currentStepDef.label}</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            This questionnaire will be available once configured by your relationship manager.
                            You may proceed to the next step.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    // ─── Step Labels for Layout ──────────────────────────────
    const stepLabels = dynamicSteps.map(s => s.label);

    return (
        <OnboardingLayout
            currentStep={currentStep}
            totalSteps={totalSteps}
            userName={basicInfo.fullName || undefined}
            navigation={
                <WizardNavigation
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onComplete={handleComplete}
                    isSubmitting={isSubmitting}
                    isFamilyHead={isFamilyHead}
                />
            }
            stepLabels={stepLabels}
            stepDef={currentStepDef}
        >
            {renderStep()}
        </OnboardingLayout>
    );
}
