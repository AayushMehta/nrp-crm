'use client';

// components/onboarding/shared/WizardNavigation.tsx
// Previous / Next / Complete buttons

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';

interface WizardNavigationProps {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    onComplete: () => void;
    isSubmitting: boolean;
    isFamilyHead?: boolean;
}

export function WizardNavigation({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    onComplete,
    isSubmitting,
    isFamilyHead = true,
}: WizardNavigationProps) {
    const isLastStep = currentStep === totalSteps;
    const isFirstStep = currentStep === 1;

    // Family members only do step 1, so button text changes
    const isSingleStepFlow = !isFamilyHead;

    return (
        <div className="flex items-center justify-between">
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={isFirstStep || isSubmitting}
                className={isFirstStep ? 'invisible' : ''}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            {isLastStep || isSingleStepFlow ? (
                <Button
                    onClick={onComplete}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-[180px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Completing...
                        </>
                    ) : (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            {isSingleStepFlow ? 'Save & Complete' : 'Complete Onboarding'}
                        </>
                    )}
                </Button>
            ) : (
                <Button
                    onClick={onNext}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-[140px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            Continue
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
