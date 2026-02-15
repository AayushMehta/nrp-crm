// lib/services/b2a-service.ts
// Service layer providing default data and persistence for B2A planning

import type {
    B2APlanState,
    B2APlanMode,
    RiskProfile,
    AllocationEntry,
    CashFlow,
} from '@/types/b2a';

// ─── Default Allocation Templates ───────────────────────────────

const ASSET_CLASSES = [
    { id: 1, name: 'Equity', color: '#3b82f6' },
    { id: 2, name: 'Debt', color: '#10b981' },
    { id: 3, name: 'Gold', color: '#f59e0b' },
    { id: 4, name: 'Real Estate', color: '#f97316' },
    { id: 5, name: 'Alternative', color: '#8b5cf6' },
];

const ALLOCATION_TEMPLATES: Record<RiskProfile, { percentages: number[]; returns: number[] }> = {
    conservative: {
        percentages: [30, 40, 15, 10, 5],
        returns: [12, 7, 8, 9, 10],
    },
    moderate: {
        percentages: [50, 25, 10, 10, 5],
        returns: [12, 8, 8, 9, 11],
    },
    aggressive: {
        percentages: [65, 15, 5, 10, 5],
        returns: [14, 8, 8, 10, 12],
    },
    veryAggressive: {
        percentages: [75, 10, 5, 5, 5],
        returns: [15, 8, 8, 10, 14],
    },
};

export class B2AService {
    private static STORAGE_KEY = 'nrp_b2a_vision_plan';

    // ─── Get Allocations for Risk Profile ─────────────────────────

    static getAllocationsForProfile(riskProfile: RiskProfile): AllocationEntry[] {
        const template = ALLOCATION_TEMPLATES[riskProfile];
        return ASSET_CLASSES.map((ac, i) => ({
            id: `alloc-${ac.id}`,
            assetClassId: ac.id,
            assetClassName: ac.name,
            allocationPercentage: template.percentages[i],
            returnRate: template.returns[i],
            color: ac.color,
        }));
    }

    // ─── Default Plan ─────────────────────────────────────────────

    static getDefaultPlan(mode: B2APlanMode = 'play'): B2APlanState {
        const riskProfile: RiskProfile = 'moderate';
        const allocations = this.getAllocationsForProfile(riskProfile);

        return {
            mode,
            currentWealth: 1500000,   // ₹15 Lakhs
            targetWealth: 50000000,   // ₹5 Crores
            currentAge: 30,
            riskProfile,
            allocations,
            cashFlows: [],
            desiredTimeline: null,
            naturalTimeline: null,
            acceleratedTimeline: null,
            weightedReturn: 0,
            requirements: null,
            projections: null,
            isSaved: false,
            lastSavedAt: null,
        };
    }

    // ─── Persistence (localStorage) ───────────────────────────────

    static savePlan(plan: B2APlanState): void {
        if (typeof window === 'undefined') return;
        const toSave = {
            ...plan,
            // Clear calculated outputs before saving
            naturalTimeline: null,
            acceleratedTimeline: null,
            weightedReturn: 0,
            requirements: null,
            projections: null,
            isSaved: true,
            lastSavedAt: new Date().toISOString(),
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toSave));
    }

    static loadPlan(): B2APlanState | null {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as B2APlanState;
        } catch {
            return null;
        }
    }

    static hasSavedPlan(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem(this.STORAGE_KEY);
    }

    static clearPlan(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
