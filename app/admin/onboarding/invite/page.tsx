"use client";

// app/admin/onboarding/invite/page.tsx
// Admin version of the invitation creation wizard — reuses the RM onboarding page logic

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    UserPlus, Send, Copy, Check, Loader2, ExternalLink,
    ArrowRight, ArrowLeft, ClipboardList, FileCheck, BookOpen,
    Target, Shield, TrendingUp, Receipt, Leaf, Umbrella,
    CreditCard, MapPin, Building2, FileText, Banknote, BarChart3,
    Camera, Scale, UserCheck, AlertTriangle, Fingerprint,
    Sparkles, CheckCircle2, ChevronRight, Clock, Mail, Phone,
    Settings2, Eye, Zap,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    QUESTIONNAIRE_POOL, DOCUMENT_POOL, SERVICE_TYPE_CONFIG,
    getDefaultQuestionnaires, getDefaultDocuments,
    type ServiceType, type InvitationConfig,
} from "@/lib/config/onboarding-config";
import {
    createInvitation, getAllInvitations,
} from "@/lib/services/onboarding-service";

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

const WIZARD_STEPS = [
    { id: 1, label: "Client Details", icon: <UserPlus className="h-4 w-4" /> },
    { id: 2, label: "Questionnaires", icon: <ClipboardList className="h-4 w-4" /> },
    { id: 3, label: "Documents", icon: <FileCheck className="h-4 w-4" /> },
    { id: 4, label: "Review & Send", icon: <Send className="h-4 w-4" /> },
];

export default function AdminOnboardingInvitePage() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [sending, setSending] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Step 1 state
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [serviceType, setServiceType] = useState<ServiceType>("nrp_360");

    // Step 2 state
    const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<string[]>(
        () => getDefaultQuestionnaires("nrp_360")
    );

    // Step 3 state
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>(
        () => getDefaultDocuments("nrp_360")
    );

    // Handlers
    const handleServiceTypeChange = (type: ServiceType) => {
        setServiceType(type);
        setSelectedQuestionnaires(getDefaultQuestionnaires(type));
        setSelectedDocuments(getDefaultDocuments(type));
    };

    const toggleQuestionnaire = (id: string) => {
        setSelectedQuestionnaires(prev =>
            prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
        );
    };

    const toggleDocument = (id: string) => {
        const doc = DOCUMENT_POOL.find(d => d.id === id);
        if (doc?.isMandatory) return;
        setSelectedDocuments(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const canProceed = useMemo(() => {
        switch (step) {
            case 1: return clientName.trim() && clientEmail.trim();
            case 2: return selectedQuestionnaires.length > 0;
            case 3: return selectedDocuments.length > 0;
            default: return true;
        }
    }, [step, clientName, clientEmail, selectedQuestionnaires, selectedDocuments]);

    const handleSend = async () => {
        setSending(true);
        try {
            const config = createInvitation({
                clientName, clientEmail, clientPhone, serviceType,
                selectedQuestionnaires, selectedDocuments,
                includeFamilyMembers: true,
                createdBy: user?.id || "admin",
            });
            const link = `${window.location.origin}/client/onboarding/${config.token}`;
            setGeneratedLink(link);
            toast.success("Invitation created successfully!");
        } catch {
            toast.error("Failed to create invitation");
        } finally {
            setSending(false);
        }
    };

    const copyLink = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ConsoleLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Create Client Invitation</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">Admin Mode</Badge>
                                <p className="text-muted-foreground text-lg">
                                    Configure onboarding steps and send invitation link to new client
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {WIZARD_STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2 min-w-fit">
                            <button
                                onClick={() => s.id < step && setStep(s.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm",
                                    step === s.id
                                        ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                                        : s.id < step
                                            ? "bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80"
                                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                                )}
                            >
                                {s.id < step ? <CheckCircle2 className="h-4 w-4" /> : s.icon}
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < WIZARD_STEPS.length - 1 && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Step 1: Client Details */}
                        {step === 1 && (
                            <Card className="rounded-xl shadow-sm border bg-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-primary" /> Client Details
                                    </CardTitle>
                                    <CardDescription>Enter the client&apos;s information and select service type</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">Full Name *</Label>
                                            <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Rajesh Sharma" className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">Email *</Label>
                                            <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@email.com" className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">Phone</Label>
                                            <Input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+91 98765 43210" className="h-11" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">Service Type</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(Object.entries(SERVICE_TYPE_CONFIG) as [ServiceType, typeof SERVICE_TYPE_CONFIG[ServiceType]][]).map(([key, config]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => handleServiceTypeChange(key)}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 text-left transition-all",
                                                        serviceType === key
                                                            ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/10"
                                                            : "border-input hover:border-accent hover:bg-accent/50"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-semibold">{config.name}</p>
                                                        {serviceType === key && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Questionnaires */}
                        {step === 2 && (
                            <Card className="rounded-xl shadow-sm border bg-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-primary" /> Select Questionnaires
                                    </CardTitle>
                                    <CardDescription>Choose which questionnaires the client will complete</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {QUESTIONNAIRE_POOL.map(q => (
                                            <button
                                                key={q.id}
                                                onClick={() => toggleQuestionnaire(q.id)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all",
                                                    selectedQuestionnaires.includes(q.id)
                                                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/10"
                                                        : "border-input hover:border-accent hover:bg-accent/50"
                                                )}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn("p-2 rounded-lg", selectedQuestionnaires.includes(q.id) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                                        {ICON_MAP[q.icon] || <ClipboardList className="h-5 w-5" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm">{q.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{q.description}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge variant="secondary" className="text-xs font-normal">{q.questionCount} questions</Badge>
                                                            <Badge variant="secondary" className="text-xs font-normal">~{q.estimatedMinutes} min</Badge>
                                                        </div>
                                                    </div>
                                                    {selectedQuestionnaires.includes(q.id) && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Documents */}
                        {step === 3 && (
                            <Card className="rounded-xl shadow-sm border bg-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileCheck className="h-5 w-5 text-primary" /> Required Documents
                                    </CardTitle>
                                    <CardDescription>Select which documents the client must upload</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {DOCUMENT_POOL.map(doc => (
                                            <button
                                                key={doc.id}
                                                onClick={() => toggleDocument(doc.id)}
                                                disabled={doc.isMandatory}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 text-left transition-all relative",
                                                    selectedDocuments.includes(doc.id)
                                                        ? "border-primary bg-primary/5 shadow-sm"
                                                        : "border-input hover:border-accent hover:bg-accent/50",
                                                    doc.isMandatory && "opacity-90 cursor-not-allowed bg-muted/20"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-1.5 rounded-lg", selectedDocuments.includes(doc.id) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                                        {ICON_MAP[doc.icon] || <FileText className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{doc.name}</p>
                                                        {doc.isMandatory && <Badge className="text-[10px] bg-red-500/10 text-red-600 border-red-500/20 mt-1 hover:bg-red-500/20">Mandatory</Badge>}
                                                    </div>
                                                    {selectedDocuments.includes(doc.id) && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Review & Send */}
                        {step === 4 && (
                            <Card className="rounded-xl shadow-sm border bg-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-primary" /> Review & Send
                                    </CardTitle>
                                    <CardDescription>Review the invitation details before sending</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Client</h4>
                                            <div className="p-4 rounded-xl bg-muted/30 border space-y-2">
                                                <p className="font-semibold">{clientName || "—"}</p>
                                                <p className="text-sm text-muted-foreground">{clientEmail || "—"}</p>
                                                {clientPhone && <p className="text-sm text-muted-foreground">{clientPhone}</p>}
                                                <Badge variant="outline" className="bg-background">{SERVICE_TYPE_CONFIG[serviceType].name}</Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Questionnaires ({selectedQuestionnaires.length})</h4>
                                            <div className="space-y-2">
                                                {selectedQuestionnaires.map(id => {
                                                    const q = QUESTIONNAIRE_POOL.find(x => x.id === id);
                                                    return q ? <div key={id} className="flex items-center gap-2 text-sm bg-muted/20 p-2 rounded-lg border border-muted/50"><CheckCircle2 className="h-4 w-4 text-green-500" />{q.name}</div> : null;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Documents ({selectedDocuments.length})</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDocuments.map(id => {
                                                const d = DOCUMENT_POOL.find(x => x.id === id);
                                                return d ? <Badge key={id} variant="secondary" className="text-xs py-1 px-2">{d.name}</Badge> : null;
                                            })}
                                        </div>
                                    </div>

                                    {generatedLink ? (
                                        <div className="p-4 rounded-xl bg-green-50/50 border border-green-200 dark:bg-green-900/10 dark:border-green-800 space-y-3">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                                                <CheckCircle2 className="h-5 w-5" /> Invitation Created!
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input value={generatedLink} readOnly className="flex-1 text-xs h-10 bg-background" />
                                                <Button variant="outline" size="sm" onClick={copyLink} className="h-10">
                                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <Link href={generatedLink} target="_blank" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                                Open preview <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <Button onClick={handleSend} disabled={sending} className="w-full h-12 text-lg shadow-md">
                                            {sending ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Creating...</> : <><Send className="h-5 w-5 mr-2" />Create & Send Invitation</>}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                {!generatedLink && (
                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1} className="w-24">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        {step < 4 && (
                            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed} className="w-24 shadow-sm">
                                Next <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </ConsoleLayout>
    );
}
