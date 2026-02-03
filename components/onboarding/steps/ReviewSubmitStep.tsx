"use client";

import React, { useState } from "react";
import { Edit, CheckCircle2, FileText, Users, MapPin, CreditCard } from "lucide-react";

interface ReviewSubmitStepProps {
  formData: {
    family_name: string;
    primary_contact_name: string;
    primary_contact_phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    selected_service: "nrp_light" | "nrp_360" | "";
    kyc_already_done: boolean;
    family_members: Array<{
      id: string;
      name: string;
      relationship: string;
      contact_phone: string;
    }>;
    uploaded_documents: Array<{
      id: string;
      type: string;
      file_name: string;
    }>;
  };
  onEdit: (step: number) => void;
  errors?: Record<string, string>;
}

export function ReviewSubmitStep({
  formData,
  onEdit,
  errors = {},
}: ReviewSubmitStepProps) {
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600 mb-6">
          Please review all the information you&apos;ve provided before submitting.
          You can click &quot;Edit&quot; to go back and make changes to any section.
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Basic Information
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Family Name</p>
            <p className="text-sm font-medium text-slate-900">
              {formData.family_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Your Full Name</p>
            <p className="text-sm font-medium text-slate-900">
              {formData.primary_contact_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Phone Number</p>
            <p className="text-sm font-medium text-slate-900">
              {formData.primary_contact_phone}
            </p>
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Address Details
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEdit(3)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-900">{formData.address}</p>
          <p className="text-sm text-slate-900">
            {formData.city}, {formData.state} - {formData.pincode}
          </p>
        </div>
      </div>

      {/* Service Selection */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Service Selection
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEdit(4)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Selected Plan</p>
            <p className="text-sm font-medium text-slate-900">
              {formData.selected_service === "nrp_light"
                ? "NRP Light"
                : formData.selected_service === "nrp_360"
                ? "NRP 360"
                : "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">KYC Status</p>
            <p className="text-sm font-medium text-slate-900">
              {formData.kyc_already_done
                ? "Already completed"
                : "To be completed"}
            </p>
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Family Members
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEdit(5)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
        {formData.family_members.length > 0 ? (
          <div className="space-y-3">
            {formData.family_members.map((member, index) => (
              <div key={member.id} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {member.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {member.relationship.charAt(0).toUpperCase() +
                        member.relationship.slice(1)}
                      {member.contact_phone && ` • ${member.contact_phone}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">
            No family members added
          </p>
        )}
      </div>

      {/* Uploaded Documents */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Uploaded Documents
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEdit(6)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
        {formData.uploaded_documents.length > 0 ? (
          <div className="space-y-2">
            {formData.uploaded_documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {doc.type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-slate-600">{doc.file_name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No documents uploaded</p>
        )}
      </div>

      {/* Confirmation Checkbox */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={confirmAccuracy}
            onChange={(e) => setConfirmAccuracy(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <div>
            <p className="text-sm text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">
              I confirm that all the information provided is accurate
            </p>
            <p className="text-xs text-slate-600 mt-1">
              By checking this box, I declare that all the information and
              documents I have provided are true and correct to the best of my
              knowledge. I understand that providing false information may
              result in rejection of my application.
            </p>
          </div>
        </label>
      </div>

      {!confirmAccuracy && (
        <div className="text-center">
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Please confirm the accuracy of your information before submitting
          </p>
        </div>
      )}

      {errors.confirmation && (
        <div className="text-center">
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {errors.confirmation}
          </p>
        </div>
      )}
    </div>
  );
}
