'use client';

// Step 1: Basic Information
// Collects: Full Name, Email, Mobile, Date of Birth

import { BasicInfo } from '@/types/onboarding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step1Props {
    data: BasicInfo;
    onChange: (data: BasicInfo) => void;
    showValidation: boolean;
}

export function Step1_BasicInfo({ data, onChange, showValidation }: Step1Props) {
    const update = (field: keyof BasicInfo, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const isEmpty = (val: string) => showValidation && val.trim() === '';

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="fullName" className="text-slate-700 font-medium">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={data.fullName}
                                    onChange={(e) => update('fullName', e.target.value)}
                                    className={cn(
                                        'pl-9 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all',
                                        isEmpty(data.fullName)
                                            ? 'border-red-300 focus-visible:ring-red-200'
                                            : 'focus-visible:ring-blue-100 focus-visible:border-blue-400'
                                    )}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={data.email}
                                    onChange={(e) => update('email', e.target.value)}
                                    className={cn(
                                        'pl-9 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all',
                                        isEmpty(data.email)
                                            ? 'border-red-300 focus-visible:ring-red-200'
                                            : 'focus-visible:ring-blue-100 focus-visible:border-blue-400'
                                    )}
                                />
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-2">
                            <Label htmlFor="mobile" className="text-slate-700 font-medium">
                                Mobile Number <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="mobile"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={data.mobile}
                                    onChange={(e) => update('mobile', e.target.value)}
                                    className={cn(
                                        'pl-9 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all',
                                        isEmpty(data.mobile)
                                            ? 'border-red-300 focus-visible:ring-red-200'
                                            : 'focus-visible:ring-blue-100 focus-visible:border-blue-400'
                                    )}
                                />
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="dob" className="text-slate-700 font-medium">
                                Date of Birth <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="dob"
                                    type="date"
                                    value={data.dateOfBirth}
                                    onChange={(e) => update('dateOfBirth', e.target.value)}
                                    className={cn(
                                        'pl-9 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all w-full',
                                        isEmpty(data.dateOfBirth)
                                            ? 'border-red-300 focus-visible:ring-red-200'
                                            : 'focus-visible:ring-blue-100 focus-visible:border-blue-400'
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Validation message */}
            {showValidation && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                        <p className="font-semibold">Missing Information</p>
                        <p className="text-red-600/80">Please fill in all required fields marked with * to continue.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
