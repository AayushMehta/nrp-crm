"use client";

import React from "react";

interface AddressStepProps {
  formData: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export function AddressStep({
  formData,
  onChange,
  errors = {},
}: AddressStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600 mb-6">
          Please provide your current residential address for our records.
        </p>
      </div>

      {/* Street Address */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-semibold text-slate-900 mb-2"
        >
          Street Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="House/Flat No., Building Name, Street Name"
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none ${
            errors.address ? "border-red-300 bg-red-50" : "border-slate-300"
          }`}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      {/* City and State Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-semibold text-slate-900 mb-2"
          >
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="e.g., Mumbai"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
              errors.city ? "border-red-300 bg-red-50" : "border-slate-300"
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-semibold text-slate-900 mb-2"
          >
            State <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => onChange("state", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
              errors.state ? "border-red-300 bg-red-50" : "border-slate-300"
            }`}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
          )}
        </div>
      </div>

      {/* Pincode */}
      <div>
        <label
          htmlFor="pincode"
          className="block text-sm font-semibold text-slate-900 mb-2"
        >
          Pincode <span className="text-red-500">*</span>
        </label>
        <input
          id="pincode"
          type="text"
          value={formData.pincode}
          onChange={(e) => onChange("pincode", e.target.value)}
          placeholder="e.g., 400001"
          maxLength={6}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
            errors.pincode ? "border-red-300 bg-red-50" : "border-slate-300"
          }`}
        />
        {errors.pincode && (
          <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">6-digit postal code</p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Please ensure your address matches the one on
          your official documents. This helps us verify your identity faster.
        </p>
      </div>
    </div>
  );
}
