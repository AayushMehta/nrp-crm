"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { OnboardingProgressBar } from "@/components/onboarding/OnboardingProgressBar";
import { OnboardingStepWrapper } from "@/components/onboarding/OnboardingStepWrapper";
import { WelcomeStep } from "@/components/onboarding/steps/WelcomeStep";
import { BasicInfoStep } from "@/components/onboarding/steps/BasicInfoStep";
import { AddressStep } from "@/components/onboarding/steps/AddressStep";
import { ServiceSelectionStep } from "@/components/onboarding/steps/ServiceSelectionStep";
import { FamilyMembersStep } from "@/components/onboarding/steps/FamilyMembersStep";
import { DocumentUploadStep } from "@/components/onboarding/steps/DocumentUploadStep";
import { ReviewSubmitStep } from "@/components/onboarding/steps/ReviewSubmitStep";
import { ClientInvitationService } from "@/lib/services/client-invitation-service";
import { OnboardingFormService } from "@/lib/services/onboarding-form-service";
import { OnboardingFormData } from "@/types/client-invitation";
import { Loader2 } from "lucide-react";

const STEP_LABELS = [
  "Welcome",
  "Basic Info",
  "Address",
  "Service",
  "Family",
  "Documents",
  "Review",
];

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  contact_phone: string;
}

interface UploadedDocument {
  id: string;
  type: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export default function OnboardingWizardPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<OnboardingFormData>>({
    family_name: "",
    primary_contact_name: "",
    primary_contact_phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    selected_service: "",
    kyc_already_done: false,
    family_members: [],
    uploaded_documents: [],
  });

  // Validate token on mount
  useEffect(() => {
    const validateInvitation = async () => {
      setLoading(true);
      try {
        const validation = ClientInvitationService.validateToken(token);

        if (!validation.valid) {
          // Token invalid - redirect to expired page
          router.push("/client/onboarding/expired");
          return;
        }

        // Token valid - set email and load saved progress
        if (validation.invitation) {
          setEmail(validation.invitation.email);

          // Mark as accepted if not already
          if (validation.invitation.status === "pending") {
            ClientInvitationService.acceptInvitation(token);
          }

          // Load saved progress if exists
          const savedProgress = OnboardingFormService.getProgress(token);
          if (savedProgress) {
            setFormData(savedProgress.form_data || {});
            setCurrentStep(savedProgress.current_step);
            setCompletedSteps(savedProgress.completed_steps || []);
            toast.info("Progress restored from last session");
          }

          // Load uploaded documents
          const docs = OnboardingFormService.getUploadedDocuments(token);
          setFormData((prev) => ({
            ...prev,
            uploaded_documents: docs.map((doc) => ({
              id: doc.id,
              type: doc.document_type,
              file_name: doc.file_name,
              file_size: doc.file_size,
              uploaded_at: doc.uploaded_at,
            })),
          }));
        }
      } catch (err) {
        console.error("Token validation error:", err);
        router.push("/client/onboarding/expired");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      validateInvitation();
    }
  }, [token, router]);

  // Auto-save functionality (debounced)
  useEffect(() => {
    if (currentStep === 1 || loading) return; // Don't auto-save on welcome step

    const timeoutId = setTimeout(() => {
      OnboardingFormService.saveProgress(
        token,
        currentStep,
        formData,
        completedSteps
      );
      toast.success("Progress saved", { duration: 1000 });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, completedSteps, token, loading]);

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleNext = async () => {
    // Validate current step
    const validation = OnboardingFormService.validateStep(currentStep, formData);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      toast.error("Please fix the errors before continuing");
      return;
    }

    setValidationErrors({});

    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Move to next step
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUploadDocument = async (documentType: string, file: File) => {
    try {
      const doc = await OnboardingFormService.uploadDocument(
        token,
        documentType,
        file
      );

      setFormData((prev) => ({
        ...prev,
        uploaded_documents: [
          ...(prev.uploaded_documents || []),
          {
            id: doc.id,
            type: doc.document_type,
            file_name: doc.file_name,
            file_size: doc.file_size,
            uploaded_at: doc.uploaded_at,
          },
        ],
      }));

      toast.success(`${file.name} uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
      throw error;
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    OnboardingFormService.deleteDocument(documentId);
    setFormData((prev) => ({
      ...prev,
      uploaded_documents: (prev.uploaded_documents || []).filter(
        (doc) => doc.id !== documentId
      ),
    }));
    toast.success("Document removed");
  };

  const handleSubmit = async () => {
    // Final validation
    const validation = OnboardingFormService.validateStep(7, formData);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      toast.error("Please fix all errors before submitting");
      return;
    }

    // Check if all required documents are uploaded (if KYC not done)
    if (!formData.kyc_already_done) {
      const requiredDocs = ["pan_card", "aadhaar_card", "cancelled_cheque", "bank_statement"];
      const uploadedTypes = (formData.uploaded_documents || []).map((doc) => doc.type);
      const missingDocs = requiredDocs.filter((type) => !uploadedTypes.includes(type));

      if (missingDocs.length > 0) {
        toast.error("Please upload all required documents");
        setCurrentStep(6);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Complete onboarding
      const result = ClientInvitationService.completeInvitation(token, formData as OnboardingFormData);

      if (result) {
        toast.success("Onboarding submitted successfully!");
        // Clear progress
        OnboardingFormService.clearProgress(token);
        // Redirect to success page
        router.push("/client/onboarding/success");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/client/onboarding/expired")}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Progress Bar */}
      {currentStep > 1 && (
        <OnboardingProgressBar
          currentStep={currentStep}
          totalSteps={7}
          stepLabels={STEP_LABELS}
        />
      )}

      {/* Step Content */}
      {currentStep === 1 && (
        <div className="w-full max-w-3xl mx-auto">
          <WelcomeStep email={email} onStart={() => setCurrentStep(2)} />
        </div>
      )}

      {currentStep === 2 && (
        <OnboardingStepWrapper
          title="Basic Information"
          description="Tell us about yourself and your family"
          onBack={handleBack}
          onNext={handleNext}
          showBack={false}
        >
          <BasicInfoStep
            formData={{
              family_name: formData.family_name || "",
              primary_contact_name: formData.primary_contact_name || "",
              primary_contact_phone: formData.primary_contact_phone || "",
            }}
            onChange={updateFormData}
            errors={validationErrors}
          />
        </OnboardingStepWrapper>
      )}

      {currentStep === 3 && (
        <OnboardingStepWrapper
          title="Address Details"
          description="Where can we reach you?"
          onBack={handleBack}
          onNext={handleNext}
        >
          <AddressStep
            formData={{
              address: formData.address || "",
              city: formData.city || "",
              state: formData.state || "",
              pincode: formData.pincode || "",
            }}
            onChange={updateFormData}
            errors={validationErrors}
          />
        </OnboardingStepWrapper>
      )}

      {currentStep === 4 && (
        <OnboardingStepWrapper
          title="Service Selection"
          description="Choose the plan that fits your needs"
          onBack={handleBack}
          onNext={handleNext}
        >
          <ServiceSelectionStep
            formData={{
              selected_service: formData.selected_service as "nrp_light" | "nrp_360" | "",
              kyc_already_done: formData.kyc_already_done || false,
            }}
            onChange={updateFormData}
            errors={validationErrors}
          />
        </OnboardingStepWrapper>
      )}

      {currentStep === 5 && (
        <OnboardingStepWrapper
          title="Family Members"
          description="Add family members (optional)"
          onBack={handleBack}
          onNext={handleNext}
        >
          <FamilyMembersStep
            formData={{
              family_members: (formData.family_members || []) as FamilyMember[],
            }}
            onChange={updateFormData}
            errors={validationErrors}
          />
        </OnboardingStepWrapper>
      )}

      {currentStep === 6 && (
        <OnboardingStepWrapper
          title="Document Upload"
          description="Upload required documents for verification"
          onBack={handleBack}
          onNext={handleNext}
        >
          <DocumentUploadStep
            formData={{
              kyc_already_done: formData.kyc_already_done || false,
              uploaded_documents: (formData.uploaded_documents || []) as UploadedDocument[],
            }}
            onUpload={handleUploadDocument}
            onRemove={handleRemoveDocument}
            errors={validationErrors}
          />
        </OnboardingStepWrapper>
      )}

      {currentStep === 7 && (
        <OnboardingStepWrapper
          title="Review & Submit"
          description="Please review your information before submitting"
          onBack={handleBack}
          onNext={handleSubmit}
          showNext={true}
          nextLabel="Submit Onboarding"
          isLoading={submitting}
        >
          <ReviewSubmitStep
            formData={{
              family_name: formData.family_name || "",
              primary_contact_name: formData.primary_contact_name || "",
              primary_contact_phone: formData.primary_contact_phone || "",
              address: formData.address || "",
              city: formData.city || "",
              state: formData.state || "",
              pincode: formData.pincode || "",
              selected_service: formData.selected_service as "nrp_light" | "nrp_360" | "",
              kyc_already_done: formData.kyc_already_done || false,
              family_members: (formData.family_members || []) as FamilyMember[],
              uploaded_documents: (formData.uploaded_documents || []) as UploadedDocument[],
            }}
            onEdit={handleEdit}
            errors={validationErrors}
          />
        </OnboardingStepWrapper>
      )}
    </div>
  );
}
