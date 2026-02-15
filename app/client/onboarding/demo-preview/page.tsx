'use client';

// app/client/onboarding/demo-preview/page.tsx
// Demo preview of the client onboarding wizard — accessible from login page without auth

import { useState, useEffect } from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import {
    QUESTIONNAIRE_POOL, DOCUMENT_POOL,
    type InvitationConfig,
} from '@/lib/config/onboarding-config';
import { createInvitation, getInvitationConfig } from '@/lib/services/onboarding-service';
import { getPreProfilerQuestions, getRiskProfileQuestions } from '@/lib/services/onboarding-service';
import { ArrowLeft, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const DEMO_TOKEN_PREFIX = 'demo-preview';

export default function DemoPreviewPage() {
    const [config, setConfig] = useState<InvitationConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Find existing demo invitation or create one
        let existing: InvitationConfig | null = null;

        if (typeof window !== 'undefined') {
            const key = 'nrp_onboarding_invitations';
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    const invitations: InvitationConfig[] = JSON.parse(stored);
                    existing = invitations.find(i => i.token.startsWith(DEMO_TOKEN_PREFIX)) || null;
                } catch { /* ignore */ }
            }
        }

        if (!existing) {
            existing = createInvitation({
                clientName: 'Demo Client',
                clientEmail: 'demo@example.com',
                clientPhone: '+91 98765 43210',
                serviceType: 'nrp_360',
                selectedQuestionnaires: QUESTIONNAIRE_POOL.filter(q => q.isDefault).map(q => q.id),
                selectedDocuments: DOCUMENT_POOL.filter(d => d.isDefault).map(d => d.id),
                includeFamilyMembers: true,
                createdBy: 'system',
            });
        }

        setConfig(existing);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Demo Banner */}
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg"
            >
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Eye className="h-4 w-4" />
                    <span>Demo Preview — This is what your client will see during onboarding</span>
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                </div>
                <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Login
                </Link>
            </motion.div>

            {/* Add top padding so wizard sits below banner */}
            <div className="pt-10">
                <OnboardingWizard
                    familyId="demo-family"
                    isFamilyHead={true}
                    preProfilerQuestions={getPreProfilerQuestions()}
                    riskProfileQuestions={getRiskProfileQuestions()}
                    invitationConfig={config || undefined}
                />
            </div>
        </div>
    );
}
