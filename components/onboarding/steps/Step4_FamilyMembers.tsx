'use client';

// Step 4: Family Members (Optional)
// Dynamic add/remove family members

import { OnboardingFamilyMember, FamilyRelationship } from '@/types/onboarding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    UserPlus,
    Trash2,
    Users,
    AlertCircle,
    Info,
    User,
    Mail,
    Phone,
    Calendar,
    CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RELATIONSHIPS: { value: FamilyRelationship; label: string }[] = [
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' },
    { value: 'other', label: 'Other' },
];

interface Step4Props {
    data: OnboardingFamilyMember[];
    onChange: (data: OnboardingFamilyMember[]) => void;
    showValidation: boolean;
}

export function Step4_FamilyMembers({ data, onChange, showValidation }: Step4Props) {
    const addMember = () => {
        const newMember: OnboardingFamilyMember = {
            id: `member-${Date.now()}`,
            name: '',
            email: '',
            dateOfBirth: '',
            relationship: '',
            phone: '',
            pancard: '',
        };
        onChange([...data, newMember]);
    };

    const removeMember = (id: string) => {
        onChange(data.filter((m) => m.id !== id));
    };

    const updateMember = (id: string, field: keyof OnboardingFamilyMember, value: string) => {
        onChange(
            data.map((m) =>
                m.id === id ? { ...m, [field]: value } : m
            )
        );
    };

    const isMemberInvalid = (member: OnboardingFamilyMember) =>
        showValidation && (member.name.trim() === '' || member.relationship === '');

    return (
        <div className="space-y-6">
            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-indigo-600" />
                <div>
                    <h3 className="text-sm font-semibold">Include your family</h3>
                    <p className="text-sm text-indigo-700/80 mt-1 leading-relaxed">
                        Adding family members allows us to create a unified financial plan.
                        This step is optional — you can always add them later from your dashboard.
                    </p>
                </div>
            </div>

            {/* Empty state */}
            {data.length === 0 && (
                <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 mb-4">
                        <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2">No family members added</h3>
                    <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
                        Track family goals together by adding members.
                    </p>
                    <Button
                        onClick={addMember}
                        className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First Member
                    </Button>
                </div>
            )}

            {/* Member cards */}
            <div className="space-y-6">
                {data.map((member, index) => (
                    <Card
                        key={member.id}
                        className={cn(
                            'border-slate-200 shadow-sm bg-white transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in',
                            isMemberInvalid(member) && 'border-red-300 ring-4 ring-red-50'
                        )}
                    >
                        <CardContent className="p-0">
                            {/* Card header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">Family Member</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMember(member.id)}
                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                </Button>
                            </div>

                            {/* Card body */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="e.g. Aditi Sharma"
                                            value={member.name}
                                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                            className={cn(
                                                'pl-9 bg-slate-50/50 focus:bg-white',
                                                showValidation &&
                                                member.name.trim() === '' &&
                                                'border-red-300 focus-visible:ring-red-200'
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Relationship */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Relationship <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        value={member.relationship}
                                        onChange={(e) => updateMember(member.id, 'relationship', e.target.value)}
                                        className={cn(
                                            'flex h-10 w-full rounded-md border border-input bg-slate-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white',
                                            showValidation &&
                                            member.relationship === '' &&
                                            'border-red-300 focus:ring-red-200'
                                        )}
                                    >
                                        <option value="">Select relationship</option>
                                        {RELATIONSHIPS.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Email (Optional)
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={member.email || ''}
                                            onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                                            className="pl-9 bg-slate-50/50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Phone (Optional)
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            value={member.phone || ''}
                                            onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                                            className="pl-9 bg-slate-50/50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Date of Birth
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="date"
                                            value={member.dateOfBirth}
                                            onChange={(e) => updateMember(member.id, 'dateOfBirth', e.target.value)}
                                            className="pl-9 bg-slate-50/50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* PAN Card */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        PAN Card
                                    </Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="ABCDE1234F"
                                            value={member.pancard || ''}
                                            onChange={(e) =>
                                                updateMember(member.id, 'pancard', e.target.value.toUpperCase())
                                            }
                                            maxLength={10}
                                            className="pl-9 bg-slate-50/50 focus:bg-white uppercase font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add more button */}
            {data.length > 0 && (
                <Button
                    onClick={addMember}
                    variant="outline"
                    className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Another Family Member
                </Button>
            )}

            {/* Validation message */}
            {showValidation &&
                data.length > 0 &&
                data.some((m) => m.name.trim() === '' || m.relationship === '') && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100 text-red-700 text-sm animate-in fade-in">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <span>Please ensure all members have a Name and Relationship entered.</span>
                    </div>
                )}
        </div>
    );
}
