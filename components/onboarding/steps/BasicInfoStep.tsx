"use client";

import React from "react";

interface BasicInfoStepProps {
  formData: {
    family_name: string;
    primary_contact_name: string;
    primary_contact_phone: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

export function BasicInfoStep({
  formData,
  onChange,
  errors = {},
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600 mb-6">
          Let&apos;s start with some basic information about you and your
          family.
        </p>
      </div>

      {/* Family Name */}
      <div>
        <label
          htmlFor="family_name"
          className="block text-sm font-semibold text-slate-900 mb-2"
        >
          Family Name <span className="text-red-500">*</span>
        </label>
        <input
          id="family_name"
          type="text"
          value={formData.family_name}
          onChange={(e) => onChange("family_name", e.target.value)}
          placeholder="e.g., The Sharma Family"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
            errors.family_name
              ? "border-red-300 bg-red-50"
              : "border-slate-300"
          }`}
        />
        {errors.family_name && (
          <p className="mt-1 text-sm text-red-600">{errors.family_name}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          This is how we&apos;ll identify your account in our system
        </p>
      </div>

      {/* Primary Contact Name */}
      <div>
        <label
          htmlFor="primary_contact_name"
          className="block text-sm font-semibold text-slate-900 mb-2"
        >
          Your Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="primary_contact_name"
          type="text"
          value={formData.primary_contact_name}
          onChange={(e) => onChange("primary_contact_name", e.target.value)}
          placeholder="e.g., Rajesh Kumar Sharma"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
            errors.primary_contact_name
              ? "border-red-300 bg-red-50"
              : "border-slate-300"
          }`}
        />
        {errors.primary_contact_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.primary_contact_name}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Full name as it appears on your ID documents
        </p>
      </div>

      {/* Primary Contact Phone */}
      <div>
        <label
          htmlFor="primary_contact_phone"
          className="block text-sm font-semibold text-slate-900 mb-2"
        >
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          id="primary_contact_phone"
          type="tel"
          value={formData.primary_contact_phone}
          onChange={(e) => onChange("primary_contact_phone", e.target.value)}
          placeholder="+91 98765 43210"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
            errors.primary_contact_phone
              ? "border-red-300 bg-red-50"
              : "border-slate-300"
          }`}
        />
        {errors.primary_contact_phone && (
          <p className="mt-1 text-sm text-red-600">
            {errors.primary_contact_phone}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          We&apos;ll use this number for important account updates
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Privacy Notice:</strong> Your personal information is
          encrypted and stored securely. We will never share your data with
          third parties without your consent.
        </p>
      </div>
    </div>
  );
}
