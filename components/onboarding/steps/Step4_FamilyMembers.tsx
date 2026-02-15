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
        <div className="space-y-6 py-4">
            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium">Add family members to your plan</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                        This step is optional — you can skip it and add members later.
                    </p>
                </div>
            </div>

            {/* Empty state */}
            {data.length === 0 && (
                <div className="text-center py-12 px-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                        <Users className="h-7 w-7 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No family members yet</h3>
                    <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
                        Add family members to create a unified financial plan for the entire family.
                    </p>
                    <Button onClick={addMember} variant="outline">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First Family Member
                    </Button>
                </div>
            )}

            {/* Member cards */}
            {data.map((member, index) => (
                <Card
                    key={member.id}
                    className={cn(
                        'transition-all duration-200',
                        isMemberInvalid(member) && 'border-red-300'
                    )}
                >
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Member {index + 1}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMember(member.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Enter name"
                                    value={member.name}
                                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                    className={cn(
                                        'h-9 text-sm',
                                        showValidation && member.name.trim() === '' && 'border-red-400'
                                    )}
                                />
                            </div>

                            {/* Relationship */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700">
                                    Relationship <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    value={member.relationship}
                                    onChange={(e) =>
                                        updateMember(member.id, 'relationship', e.target.value)
                                    }
                                    className={cn(
                                        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                        showValidation && member.relationship === '' && 'border-red-400'
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
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700">Email</Label>
                                <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={member.email || ''}
                                    onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700">Date of Birth</Label>
                                <Input
                                    type="date"
                                    value={member.dateOfBirth}
                                    onChange={(e) => updateMember(member.id, 'dateOfBirth', e.target.value)}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700">Phone</Label>
                                <Input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={member.phone || ''}
                                    onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* PAN Card */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700">PAN Card</Label>
                                <Input
                                    placeholder="ABCDE1234F"
                                    value={member.pancard || ''}
                                    onChange={(e) => updateMember(member.id, 'pancard', e.target.value.toUpperCase())}
                                    maxLength={10}
                                    className="h-9 text-sm uppercase"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Add more button */}
            {data.length > 0 && (
                <Button onClick={addMember} variant="outline" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Another Family Member
                </Button>
            )}

            {/* Validation message */}
            {showValidation && data.length > 0 && data.some((m) => m.name.trim() === '' || m.relationship === '') && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Please fill in the required fields (Name and Relationship) for all added members.
                </div>
            )}
        </div>
    );
}
