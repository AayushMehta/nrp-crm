'use client';

// Step 1: Basic Information
// Collects: Full Name, Email, Mobile, Date of Birth

import { BasicInfo } from '@/types/onboarding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';

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
        <div className="space-y-6 max-w-xl py-4">
            {/* Full Name */}
            <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-blue-600" />
                    Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={data.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    className={isEmpty(data.fullName) ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={data.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={isEmpty(data.email) ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
            </div>

            {/* Mobile */}
            <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="mobile"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={data.mobile}
                    onChange={(e) => update('mobile', e.target.value)}
                    className={isEmpty(data.mobile) ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
                <Label htmlFor="dob" className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="dob"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => update('dateOfBirth', e.target.value)}
                    className={isEmpty(data.dateOfBirth) ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
            </div>

            {/* Validation message */}
            {showValidation && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Please fill in all required fields to continue.
                </div>
            )}
        </div>
    );
}
