'use client';

// app/rm/onboarding/page.tsx
// RM page with multi-step invitation creation: Client Details → Questionnaires → Documents → Review & Send

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ConsoleLayout } from '@/components/layout/ConsoleLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    UserPlus, Send, Copy, Check, Loader2, ExternalLink, Users,
    ArrowRight, ArrowLeft, ClipboardList, FileCheck, BookOpen,
    Target, Shield, TrendingUp, Receipt, Leaf, Umbrella,
    CreditCard, MapPin, Building2, FileText, Banknote, BarChart3,
    Camera, Scale, UserCheck, AlertTriangle, Fingerprint, BookOpenIcon,
    Sparkles, CheckCircle2, ChevronRight, Clock, Mail, Phone,
    Settings2, Eye, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QUESTIONNAIRE_POOL, DOCUMENT_POOL, SERVICE_TYPE_CONFIG,
    getDefaultQuestionnaires, getDefaultDocuments,
    type ServiceType, type InvitationConfig,
} from '@/lib/config/onboarding-config';
import {
    createInvitation, getAllInvitations,
} from '@/lib/services/onboarding-service';

// ─── Icon Map ────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
    Target: <Target className="h-5 w-5" />,
    Shield: <Shield className="h-5 w-5" />,
    TrendingUp: <TrendingUp className="h-5 w-5" />,
    Receipt: <Receipt className="h-5 w-5" />,
    Leaf: <Leaf className="h-5 w-5" />,
    Umbrella: <Umbrella className="h-5 w-5" />,
    CreditCard: <CreditCard className="h-5 w-5" />,
    Fingerprint: <Fingerprint className="h-5 w-5" />,
    MapPin: <MapPin className="h-5 w-5" />,
    Building2: <Building2 className="h-5 w-5" />,
    FileText: <FileText className="h-5 w-5" />,
    Banknote: <Banknote className="h-5 w-5" />,
    BookOpen: <BookOpen className="h-5 w-5" />,
    BarChart3: <BarChart3 className="h-5 w-5" />,
    Camera: <Camera className="h-5 w-5" />,
    Scale: <Scale className="h-5 w-5" />,
    UserCheck: <UserCheck className="h-5 w-5" />,
    AlertTriangle: <AlertTriangle className="h-5 w-5" />,
};

// ─── Steps ───────────────────────────────────────────────────
const WIZARD_STEPS = [
    { id: 1, label: 'Client Details', icon: <UserPlus className="h-4 w-4" /> },
    { id: 2, label: 'Questionnaires', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 3, label: 'Documents', icon: <FileCheck className="h-4 w-4" /> },
    { id: 4, label: 'Review & Send', icon: <Send className="h-4 w-4" /> },
];

export default function RMOnboardingPage() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);

    // Step 1 state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [serviceType, setServiceType] = useState<ServiceType>('nrp_light');
    const [includeFamilyMembers, setIncludeFamilyMembers] = useState(true);

    // Step 2 state
    const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<string[]>([]);

    // Step 3 state
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

    // General state
    const [isCreating, setIsCreating] = useState(false);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [recentInvitations, setRecentInvitations] = useState<InvitationConfig[]>([]);

    // Load recent invitations and set defaults
    useEffect(() => {
        setRecentInvitations(getAllInvitations());
    }, []);

    // When service type changes, update defaults
    useEffect(() => {
        setSelectedQuestionnaires(getDefaultQuestionnaires(serviceType));
        setSelectedDocuments(getDefaultDocuments(serviceType));
    }, [serviceType]);

    const totalEstimatedMinutes = useMemo(() => {
        return QUESTIONNAIRE_POOL
            .filter(q => selectedQuestionnaires.includes(q.id))
            .reduce((sum, q) => sum + q.estimatedMinutes, 0) + 3; // +3 for basic info
    }, [selectedQuestionnaires]);

    const totalSteps = useMemo(() => {
        let count = 1; // Basic Info always
        count += selectedQuestionnaires.length;
        if (selectedDocuments.length > 0) count += 1; // Document upload step
        if (includeFamilyMembers) count += 1;
        return count;
    }, [selectedQuestionnaires, selectedDocuments, includeFamilyMembers]);

    // ─── Navigation ──────────────────────────────────────────
    const canProceed = () => {
        switch (step) {
            case 1:
                return name.trim() !== '' && email.trim() !== '';
            case 2:
                return selectedQuestionnaires.length > 0;
            case 3:
                return true; // Documents are optional
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (!canProceed()) {
            toast.error('Please complete the required fields.');
            return;
        }
        setStep(prev => Math.min(prev + 1, 4));
    };

    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    // ─── Toggle Helpers ──────────────────────────────────────
    const toggleQuestionnaire = (id: string) => {
        setSelectedQuestionnaires(prev =>
            prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
        );
    };

    const toggleDocument = (id: string) => {
        const doc = DOCUMENT_POOL.find(d => d.id === id);
        if (doc?.isMandatory) return; // Can't deselect mandatory
        setSelectedDocuments(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    // ─── Create Invitation ───────────────────────────────────
    const handleCreateInvitation = async () => {
        setIsCreating(true);
        try {
            await new Promise(r => setTimeout(r, 800));

            const config = createInvitation({
                clientName: name.trim(),
                clientEmail: email.trim(),
                clientPhone: phone.trim(),
                serviceType,
                selectedQuestionnaires,
                selectedDocuments,
                includeFamilyMembers,
                createdBy: user?.id || 'rm-1',
            });

            setRecentInvitations(prev => [config, ...prev]);

            toast.success(`Invitation created for ${config.clientName}! 🎉`);

            // Reset form
            setName('');
            setEmail('');
            setPhone('');
            setStep(1);
            setServiceType('nrp_light');
        } catch {
            toast.error('Failed to create invitation.');
        } finally {
            setIsCreating(false);
        }
    };

    const copyLink = (token: string) => {
        const link = `${window.location.origin}/client/onboarding/${token}`;
        navigator.clipboard.writeText(link);
        setCopiedToken(token);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopiedToken(null), 2000);
    };

    // ─── Render ──────────────────────────────────────────────
    return (
        <ConsoleLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Client Invitation</h1>
                            <p className="text-sm text-gray-500">Configure onboarding steps, questionnaires, and documents for the client</p>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="mb-8">
                    <div className="flex items-center gap-1">
                        {WIZARD_STEPS.map((s, idx) => (
                            <div key={s.id} className="flex items-center flex-1">
                                <button
                                    onClick={() => { if (s.id < step) setStep(s.id); }}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex-1',
                                        step === s.id
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                                            : s.id < step
                                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                                                : 'bg-white/60 text-gray-400 cursor-default'
                                    )}
                                >
                                    <span className={cn(
                                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                                        step === s.id ? 'bg-white/20' : s.id < step ? 'bg-blue-200' : 'bg-gray-100',
                                    )}>
                                        {s.id < step ? <Check className="h-3.5 w-3.5" /> : s.id}
                                    </span>
                                    <span className="hidden sm:inline">{s.label}</span>
                                </button>
                                {idx < WIZARD_STEPS.length - 1 && (
                                    <ChevronRight className={cn(
                                        'h-4 w-4 mx-1 flex-shrink-0',
                                        s.id < step ? 'text-blue-400' : 'text-gray-300'
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 1}
                        className={step === 1 ? 'invisible' : ''}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    {step < 4 ? (
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-[160px] shadow-lg shadow-blue-500/25"
                        >
                            Continue <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleCreateInvitation}
                            disabled={isCreating}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white min-w-[200px] shadow-lg shadow-emerald-500/25"
                        >
                            {isCreating ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                            ) : (
                                <><Send className="h-4 w-4 mr-2" /> Create & Send Invitation</>
                            )}
                        </Button>
                    )}
                </div>

                {/* Recent Invitations */}
                {recentInvitations.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-emerald-600" />
                            Recent Invitations ({recentInvitations.length})
                        </h2>
                        <div className="space-y-3">
                            {recentInvitations.slice(0, 5).map(inv => (
                                <Card key={inv.token} className="border-0 shadow-sm bg-white/80 backdrop-blur hover:shadow-md transition-shadow">
                                    <CardContent className="py-4 px-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 font-bold text-sm">
                                                    {inv.clientName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{inv.clientName}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                        {inv.clientEmail}
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                            {SERVICE_TYPE_CONFIG[inv.serviceType].name}
                                                        </Badge>
                                                        <Badge variant={inv.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                                            {inv.status}
                                                        </Badge>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline" size="sm"
                                                    onClick={() => copyLink(inv.token)}
                                                    className="text-xs"
                                                >
                                                    {copiedToken === inv.token
                                                        ? <><Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Copied!</>
                                                        : <><Copy className="h-3.5 w-3.5 mr-1" /> Copy Link</>
                                                    }
                                                </Button>
                                                <Link href={`/client/onboarding/${inv.token}`} target="_blank">
                                                    <Button variant="outline" size="sm" className="text-xs">
                                                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ConsoleLayout>
    );

    // ─── Step Renderers ──────────────────────────────────────

    function renderStep1() {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Details Card */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                            Client Information
                        </CardTitle>
                        <CardDescription>Enter the client&apos;s basic details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="n" className="text-sm font-medium flex items-center gap-2">
                                <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="n"
                                placeholder="Enter client's full name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="e" className="text-sm font-medium flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-blue-500" />
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="e"
                                type="email"
                                placeholder="client@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="p" className="text-sm font-medium flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-blue-500" />
                                Phone Number
                            </Label>
                            <Input
                                id="p"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Service Type Card */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Settings2 className="h-5 w-5 text-purple-600" />
                            Service Type
                        </CardTitle>
                        <CardDescription>This pre-selects recommended questionnaires & documents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(['nrp_light', 'nrp_360'] as ServiceType[]).map(st => {
                            const config = SERVICE_TYPE_CONFIG[st];
                            const isSelected = serviceType === st;
                            return (
                                <button
                                    key={st}
                                    onClick={() => setServiceType(st)}
                                    className={cn(
                                        'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50/80 shadow-md shadow-blue-500/10'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{config.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
                                        </div>
                                        <div className={cn(
                                            'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                        )}>
                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {config.features.map(f => (
                                            <Badge key={f} variant="secondary" className="text-[10px] bg-white/80">
                                                {f}
                                            </Badge>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}

                        {/* Include Family Members toggle */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-600" />
                                <span className="text-sm font-medium text-gray-700">Include Family Members Step</span>
                            </div>
                            <button
                                onClick={() => setIncludeFamilyMembers(!includeFamilyMembers)}
                                className={cn(
                                    'relative h-6 w-11 rounded-full transition-colors',
                                    includeFamilyMembers ? 'bg-blue-500' : 'bg-gray-300'
                                )}
                            >
                                <span className={cn(
                                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                                    includeFamilyMembers ? 'translate-x-5' : 'translate-x-0.5'
                                )} />
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    function renderStep2() {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Select Questionnaires</h3>
                        <p className="text-sm text-gray-500">Choose which questionnaires the client should complete</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-0 px-3 py-1">
                        <Clock className="h-3 w-3 mr-1" />
                        ~{totalEstimatedMinutes} min total
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {QUESTIONNAIRE_POOL.map(q => {
                        const isSelected = selectedQuestionnaires.includes(q.id);
                        return (
                            <button
                                key={q.id}
                                onClick={() => toggleQuestionnaire(q.id)}
                                className={cn(
                                    'text-left p-5 rounded-xl border-2 transition-all duration-200 bg-white/90 backdrop-blur',
                                    isSelected
                                        ? 'border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-xl',
                                        isSelected
                                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                    )}>
                                        {ICON_MAP[q.icon] || <ClipboardList className="h-5 w-5" />}
                                    </div>
                                    <div className={cn(
                                        'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all',
                                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                    )}>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">{q.name}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{q.description}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <Badge variant="outline" className="text-[10px]">
                                        {q.questionCount} questions
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                        <Clock className="h-2.5 w-2.5 mr-0.5" /> ~{q.estimatedMinutes} min
                                    </Badge>
                                    <Badge variant="secondary" className="text-[10px] capitalize">
                                        {q.category}
                                    </Badge>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    function renderStep3() {
        const categories = ['identity', 'financial', 'address', 'compliance', 'other'] as const;
        const getCategoryDocs = (cat: string) => DOCUMENT_POOL.filter(d => d.category === cat);

        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Required Documents</h3>
                        <p className="text-sm text-gray-500">Select which documents the client must upload</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 border-0 px-3 py-1">
                        <FileCheck className="h-3 w-3 mr-1" />
                        {selectedDocuments.length} selected
                    </Badge>
                </div>

                <div className="space-y-6">
                    {categories.map(cat => {
                        const docs = getCategoryDocs(cat);
                        if (docs.length === 0) return null;
                        return (
                            <div key={cat}>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 capitalize flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                    {cat === 'identity' ? 'Identity Documents' :
                                        cat === 'financial' ? 'Financial Documents' :
                                            cat === 'address' ? 'Address Verification' :
                                                cat === 'compliance' ? 'Compliance & Legal' : 'Other'}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {docs.map(doc => {
                                        const isSelected = selectedDocuments.includes(doc.id);
                                        return (
                                            <button
                                                key={doc.id}
                                                onClick={() => toggleDocument(doc.id)}
                                                disabled={doc.isMandatory}
                                                className={cn(
                                                    'text-left p-4 rounded-xl border-2 transition-all duration-200 bg-white/90',
                                                    isSelected
                                                        ? 'border-purple-500 shadow-sm ring-1 ring-purple-500/20'
                                                        : 'border-gray-200 hover:border-gray-300',
                                                    doc.isMandatory && 'cursor-not-allowed'
                                                )}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className={cn(
                                                        'flex h-8 w-8 items-center justify-center rounded-lg',
                                                        isSelected
                                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                                            : 'bg-slate-100 text-slate-500'
                                                    )}>
                                                        {ICON_MAP[doc.icon] || <FileText className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {doc.isMandatory && (
                                                            <Badge className="text-[9px] bg-red-100 text-red-700 border-0 px-1.5">
                                                                Required
                                                            </Badge>
                                                        )}
                                                        <div className={cn(
                                                            'flex h-5 w-5 items-center justify-center rounded border-2 transition-all',
                                                            isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                                                        )}>
                                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">{doc.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    function renderStep4() {
        const selectedQs = QUESTIONNAIRE_POOL.filter(q => selectedQuestionnaires.includes(q.id));
        const selectedDs = DOCUMENT_POOL.filter(d => selectedDocuments.includes(d.id));

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client info summary */}
                    <Card className="border-0 shadow-lg bg-white/90">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-blue-600" /> Client Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs">Full Name</p>
                                    <p className="font-semibold">{name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Email</p>
                                    <p className="font-semibold">{email}</p>
                                </div>
                                {phone && (
                                    <div>
                                        <p className="text-gray-500 text-xs">Phone</p>
                                        <p className="font-semibold">{phone}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500 text-xs">Service Type</p>
                                    <Badge className="mt-0.5">{SERVICE_TYPE_CONFIG[serviceType].name}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questionnaires summary */}
                    <Card className="border-0 shadow-lg bg-white/90">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-blue-600" />
                                Questionnaires ({selectedQs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {selectedQs.map(q => (
                                    <div key={q.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                                        <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white">
                                            {ICON_MAP[q.icon] || <ClipboardList className="h-3.5 w-3.5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{q.name}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">{q.questionCount} Q&apos;s</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents summary */}
                    <Card className="border-0 shadow-lg bg-white/90">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileCheck className="h-4 w-4 text-purple-600" />
                                Documents ({selectedDs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {selectedDs.map(d => (
                                    <Badge
                                        key={d.id}
                                        variant="secondary"
                                        className={cn(
                                            'text-xs px-2.5 py-1',
                                            d.isMandatory ? 'bg-red-50 text-red-700 border border-red-200' : ''
                                        )}
                                    >
                                        {d.name}
                                        {d.isMandatory && <span className="ml-1 text-[9px]">(required)</span>}
                                    </Badge>
                                ))}
                                {selectedDs.length === 0 && (
                                    <p className="text-sm text-gray-400 italic">No documents selected</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Preview Card */}
                <div>
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 text-white sticky top-8">
                        <CardContent className="py-6">
                            <div className="text-center mb-6">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur mx-auto mb-3">
                                    <Eye className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-lg">Client Preview</h3>
                                <p className="text-slate-300 text-xs mt-1">What the client will experience</p>
                            </div>

                            <div className="space-y-2">
                                {/* Basic Info step */}
                                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/30 text-xs font-bold">1</span>
                                    <span className="text-sm">Basic Information</span>
                                </div>

                                {/* Questionnaire steps */}
                                {selectedQs.map((q, i) => (
                                    <div key={q.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/30 text-xs font-bold">{i + 2}</span>
                                        <span className="text-sm">{q.name}</span>
                                    </div>
                                ))}

                                {/* Document step */}
                                {selectedDs.length > 0 && (
                                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/30 text-xs font-bold">{selectedQs.length + 2}</span>
                                        <span className="text-sm">Document Upload</span>
                                    </div>
                                )}

                                {/* Family Members */}
                                {includeFamilyMembers && (
                                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/30 text-xs font-bold">{totalSteps}</span>
                                        <span className="text-sm">Family Members</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-slate-300">Total Steps</span>
                                    <span className="font-bold">{totalSteps}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300">Est. Time</span>
                                    <span className="font-bold">~{totalEstimatedMinutes} min</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
}
