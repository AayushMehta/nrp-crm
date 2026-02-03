"use client";

import React from "react";
import { Plus, Trash2, Users } from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  contact_phone: string;
}

interface FamilyMembersStepProps {
  formData: {
    family_members: FamilyMember[];
  };
  onChange: (field: string, value: FamilyMember[]) => void;
  errors?: Record<string, string>;
}

const RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Grandparent",
  "Grandchild",
  "Other",
];

export function FamilyMembersStep({
  formData,
  onChange,
  errors = {},
}: FamilyMembersStepProps) {
  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name: "",
      relationship: "",
      contact_phone: "",
    };
    onChange("family_members", [...formData.family_members, newMember]);
  };

  const removeFamilyMember = (id: string) => {
    onChange(
      "family_members",
      formData.family_members.filter((member) => member.id !== id)
    );
  };

  const updateFamilyMember = (
    id: string,
    field: keyof FamilyMember,
    value: string
  ) => {
    onChange(
      "family_members",
      formData.family_members.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600 mb-4">
          Add your family members who will be part of your wealth management
          plan. This step is optional but helps us provide better service.
        </p>
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Users className="w-4 h-4 flex-shrink-0" />
          <p>
            You can skip this step if not applicable or add family members
            later from your dashboard.
          </p>
        </div>
      </div>

      {/* Family Members List */}
      {formData.family_members.length > 0 ? (
        <div className="space-y-4">
          {formData.family_members.map((member, index) => (
            <div
              key={member.id}
              className="bg-slate-50 border border-slate-200 rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-900">
                  Family Member {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeFamilyMember(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove family member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor={`name-${member.id}`}
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id={`name-${member.id}`}
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      updateFamilyMember(member.id, "name", e.target.value)
                    }
                    placeholder="e.g., Priya Sharma"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Relationship and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`relationship-${member.id}`}
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Relationship
                    </label>
                    <select
                      id={`relationship-${member.id}`}
                      value={member.relationship}
                      onChange={(e) =>
                        updateFamilyMember(
                          member.id,
                          "relationship",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="">Select</option>
                      {RELATIONSHIPS.map((rel) => (
                        <option key={rel} value={rel.toLowerCase()}>
                          {rel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`phone-${member.id}`}
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Phone Number (Optional)
                    </label>
                    <input
                      id={`phone-${member.id}`}
                      type="tel"
                      value={member.contact_phone}
                      onChange={(e) =>
                        updateFamilyMember(
                          member.id,
                          "contact_phone",
                          e.target.value
                        )
                      }
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600 mb-1">No family members added</p>
          <p className="text-xs text-slate-500">
            Click the button below to add your first family member
          </p>
        </div>
      )}

      {errors.family_members && (
        <p className="text-sm text-red-600 text-center">
          {errors.family_members}
        </p>
      )}

      {/* Add Button */}
      <button
        type="button"
        onClick={addFamilyMember}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Family Member
      </button>

      {/* Info Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-700">
          <strong>Why add family members?</strong> This helps us understand your
          family's financial goals better and provide more comprehensive wealth
          planning services, including estate planning and insurance
          recommendations.
        </p>
      </div>
    </div>
  );
}
