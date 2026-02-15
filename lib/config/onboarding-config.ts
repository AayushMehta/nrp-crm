// lib/config/onboarding-config.ts
// Master pool of questionnaires and documents available for onboarding invitations

// ─── Types ────────────────────────────────────────────────────

export interface QuestionnaireModule {
    id: string;
    name: string;
    description: string;
    category: 'profiling' | 'risk' | 'compliance' | 'custom';
    questionCount: number;
    estimatedMinutes: number;
    isDefault: boolean;
    icon: string; // lucide icon name
}

export interface DocumentRequirement {
    id: string;
    name: string;
    description: string;
    category: 'identity' | 'financial' | 'address' | 'compliance' | 'other';
    isDefault: boolean;
    isMandatory: boolean; // whether RM can de-select this
    acceptedFormats: string[];
    maxSizeMB: number;
    icon: string;
}

export type ServiceType = 'nrp_light' | 'nrp_360';

export interface InvitationConfig {
    token: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    serviceType: ServiceType;
    selectedQuestionnaires: string[]; // IDs from QUESTIONNAIRE_POOL
    selectedDocuments: string[];      // IDs from DOCUMENT_POOL
    includeFamilyMembers: boolean;
    createdBy: string;  // RM's user id
    createdAt: string;
    status: 'pending' | 'in_progress' | 'completed';
}

// ─── Master Questionnaire Pool ───────────────────────────────

export const QUESTIONNAIRE_POOL: QuestionnaireModule[] = [
    {
        id: 'pre_profiler',
        name: 'Investor Pre-Profiler',
        description: 'Determines life stage, income type, and hybrid investor tag through 4 questions',
        category: 'profiling',
        questionCount: 4,
        estimatedMinutes: 3,
        isDefault: true,
        icon: 'Target',
    },
    {
        id: 'risk_profile',
        name: 'Risk Assessment',
        description: 'Evaluates risk tolerance with 7 scored questions (Conservative/Moderate/Aggressive)',
        category: 'risk',
        questionCount: 7,
        estimatedMinutes: 5,
        isDefault: true,
        icon: 'Shield',
    },
    {
        id: 'financial_goals',
        name: 'Financial Goals Questionnaire',
        description: 'Captures short-term and long-term financial objectives and priorities',
        category: 'custom',
        questionCount: 5,
        estimatedMinutes: 4,
        isDefault: false,
        icon: 'TrendingUp',
    },
    {
        id: 'tax_planning',
        name: 'Tax Planning Assessment',
        description: 'Collects information about tax status, deductions, and planning preferences',
        category: 'compliance',
        questionCount: 6,
        estimatedMinutes: 5,
        isDefault: false,
        icon: 'Receipt',
    },
    {
        id: 'esg_preferences',
        name: 'ESG Preferences',
        description: 'Understands client preferences for Environmental, Social, and Governance investing',
        category: 'custom',
        questionCount: 4,
        estimatedMinutes: 3,
        isDefault: false,
        icon: 'Leaf',
    },
    {
        id: 'insurance_review',
        name: 'Insurance Coverage Review',
        description: 'Reviews existing insurance coverage and identifies gaps',
        category: 'custom',
        questionCount: 5,
        estimatedMinutes: 4,
        isDefault: false,
        icon: 'Umbrella',
    },
];

// ─── Master Document Pool ────────────────────────────────────

export const DOCUMENT_POOL: DocumentRequirement[] = [
    {
        id: 'pan_card',
        name: 'PAN Card',
        description: 'Permanent Account Number card — mandatory for KYC',
        category: 'identity',
        isDefault: true,
        isMandatory: true,
        acceptedFormats: ['pdf', 'jpg', 'png'],
        maxSizeMB: 5,
        icon: 'CreditCard',
    },
    {
        id: 'aadhaar',
        name: 'Aadhaar Card',
        description: 'Aadhaar card (front & back) for identity verification',
        category: 'identity',
        isDefault: true,
        isMandatory: true,
        acceptedFormats: ['pdf', 'jpg', 'png'],
        maxSizeMB: 5,
        icon: 'Fingerprint',
    },
    {
        id: 'address_proof',
        name: 'Address Proof',
        description: 'Utility bill, passport, or voter ID for address verification',
        category: 'address',
        isDefault: true,
        isMandatory: false,
        acceptedFormats: ['pdf', 'jpg', 'png'],
        maxSizeMB: 5,
        icon: 'MapPin',
    },
    {
        id: 'bank_statement',
        name: 'Bank Statement (6 months)',
        description: 'Latest 6-month bank statement for financial assessment',
        category: 'financial',
        isDefault: false,
        isMandatory: false,
        acceptedFormats: ['pdf'],
        maxSizeMB: 10,
        icon: 'Building2',
    },
    {
        id: 'itr_returns',
        name: 'Income Tax Returns',
        description: 'Last 2 years ITR for income verification',
        category: 'financial',
        isDefault: false,
        isMandatory: false,
        acceptedFormats: ['pdf'],
        maxSizeMB: 10,
        icon: 'FileText',
    },
    {
        id: 'cancelled_cheque',
        name: 'Cancelled Cheque',
        description: 'Cancelled cheque for bank account verification',
        category: 'financial',
        isDefault: true,
        isMandatory: false,
        acceptedFormats: ['pdf', 'jpg', 'png'],
        maxSizeMB: 5,
        icon: 'Banknote',
    },
    {
        id: 'passport',
        name: 'Passport',
        description: 'Valid passport for NRI/international clients',
        category: 'identity',
        isDefault: false,
        isMandatory: false,
        acceptedFormats: ['pdf', 'jpg', 'png'],
        maxSizeMB: 5,
        icon: 'BookOpen',
    },
    {
        id: 'demat_statement',
        name: 'Demat Account Statement',
        description: 'Latest demat holding statement for portfolio review',
        category: 'financial',
        isDefault: false,
        isMandatory: false,
        acceptedFormats: ['pdf'],
        maxSizeMB: 10,
        icon: 'BarChart3',
    },
    {
        id: 'photograph',
        name: 'Passport-Size Photograph',
        description: 'Recent passport-size photograph for records',
        category: 'identity',
        isDefault: true,
        isMandatory: false,
        acceptedFormats: ['jpg', 'png'],
        maxSizeMB: 2,
        icon: 'Camera',
    },
    {
        id: 'power_of_attorney',
        name: 'Power of Attorney',
        description: 'POA for managing investments on behalf of client',
        category: 'compliance',
        isDefault: false,
        isMandatory: false,
        acceptedFormats: ['pdf'],
        maxSizeMB: 10,
        icon: 'Scale',
    },
    {
        id: 'nomination_form',
        name: 'Nomination Form',
        description: 'Nomination declaration form for all accounts',
        category: 'compliance',
        isDefault: false,
        isMandatory: false,
        acceptedFormats: ['pdf'],
        maxSizeMB: 5,
        icon: 'UserCheck',
    },
    {
        id: 'risk_disclosure',
        name: 'Risk Disclosure Agreement',
        description: 'Signed risk disclosure and consent form',
        category: 'compliance',
        isDefault: false,
        isMandatory: false,
        acceptedFormats: ['pdf'],
        maxSizeMB: 5,
        icon: 'AlertTriangle',
    },
];

// ─── Service Type Configs ────────────────────────────────────

export const SERVICE_TYPE_CONFIG: Record<ServiceType, {
    name: string;
    description: string;
    defaultQuestionnaires: string[];
    defaultDocuments: string[];
    features: string[];
}> = {
    nrp_light: {
        name: 'NRP Light',
        description: 'Essential wealth management with simplified onboarding',
        defaultQuestionnaires: ['pre_profiler', 'risk_profile'],
        defaultDocuments: ['pan_card', 'aadhaar', 'cancelled_cheque', 'photograph'],
        features: ['Basic portfolio tracking', 'Quarterly reviews', 'Standard reporting'],
    },
    nrp_360: {
        name: 'NRP 360',
        description: 'Comprehensive wealth management with full onboarding',
        defaultQuestionnaires: ['pre_profiler', 'risk_profile', 'financial_goals', 'tax_planning'],
        defaultDocuments: ['pan_card', 'aadhaar', 'address_proof', 'bank_statement', 'itr_returns', 'cancelled_cheque', 'photograph', 'demat_statement'],
        features: ['Full portfolio management', 'Monthly reviews', 'Tax optimization', 'Estate planning', 'Insurance review'],
    },
};

// ─── Helper Functions ────────────────────────────────────────

export function getDefaultQuestionnaires(serviceType: ServiceType): string[] {
    return SERVICE_TYPE_CONFIG[serviceType].defaultQuestionnaires;
}

export function getDefaultDocuments(serviceType: ServiceType): string[] {
    return SERVICE_TYPE_CONFIG[serviceType].defaultDocuments;
}

export function getQuestionnaireById(id: string): QuestionnaireModule | undefined {
    return QUESTIONNAIRE_POOL.find(q => q.id === id);
}

export function getDocumentById(id: string): DocumentRequirement | undefined {
    return DOCUMENT_POOL.find(d => d.id === id);
}
