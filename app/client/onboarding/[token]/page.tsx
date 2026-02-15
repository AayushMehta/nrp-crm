'use client';

// app/client/onboarding/[token]/page.tsx
// Client-facing onboarding wizard (accessed via invite link)
// Now loads invitation config to determine dynamic steps

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import {
  getPreProfilerQuestions,
  getRiskProfileQuestions,
  getOnboardingState,
  getInitialStep,
  getInvitationConfig,
  updateInvitationStatus,
} from '@/lib/services/onboarding-service';
import type { InvitationConfig } from '@/lib/config/onboarding-config';
import { Loader2, Building2 } from 'lucide-react';

export default function ClientOnboardingPage() {
  const params = useParams();
  const token = params?.token as string;
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<InvitationConfig | null>(null);

  // Use token as familyId for mock purposes
  const familyId = token || 'default-family';

  useEffect(() => {
    // Load invitation config
    const invConfig = getInvitationConfig(token);
    if (invConfig) {
      setConfig(invConfig);
      // Mark as in progress
      if (invConfig.status === 'pending') {
        updateInvitationStatus(token, 'in_progress');
      }
    }
    // Simulate brief loading
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, [token]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Preparing your onboarding...</p>
          {config && (
            <p className="text-xs text-gray-400 mt-1">Welcome, {config.clientName}</p>
          )}
        </div>
      </div>
    );
  }

  const state = getOnboardingState(familyId);
  const preProfilerQuestions = getPreProfilerQuestions();
  const riskProfileQuestions = getRiskProfileQuestions();
  const initialStep = state.basicInfo.fullName ? getInitialStep(state.status) : 1;

  return (
    <OnboardingWizard
      familyId={familyId}
      initialStep={initialStep}
      initialBasicInfo={state.basicInfo}
      initialPreProfiler={state.preProfilerAnswers}
      initialRiskProfile={state.riskProfileAnswers}
      initialFamilyMembers={state.familyMembers}
      preProfilerQuestions={preProfilerQuestions}
      riskProfileQuestions={riskProfileQuestions}
      isFamilyHead={true}
      invitationConfig={config}
    />
  );
}
