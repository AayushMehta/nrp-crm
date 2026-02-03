// lib/services/onboarding-form-service.ts
// Service for managing onboarding form progress and auto-save

import {
  OnboardingFormData,
  OnboardingProgress,
  OnboardingDocument,
} from "@/types/client-invitation";
import { onboardingProgressStorage, onboardingDocumentStorage } from "@/lib/storage/invitation-storage";
import { generateId } from "@/lib/utils";

export const TOTAL_ONBOARDING_STEPS = 7;

/**
 * Service for managing onboarding form state and progress
 */
export class OnboardingFormService {
  /**
   * Save progress for a specific token
   */
  static saveProgress(
    token: string,
    currentStep: number,
    formData: Partial<OnboardingFormData>,
    completedSteps: number[] = []
  ): void {
    const progress: OnboardingProgress = {
      token,
      current_step: currentStep,
      total_steps: TOTAL_ONBOARDING_STEPS,
      form_data: formData,
      last_saved_at: new Date().toISOString(),
      completed_steps: completedSteps,
    };

    onboardingProgressStorage.save(progress);
  }

  /**
   * Get saved progress for a token
   */
  static getProgress(token: string): OnboardingProgress | null {
    return onboardingProgressStorage.getByToken(token);
  }

  /**
   * Clear progress for a token (after successful completion or abandonment)
   */
  static clearProgress(token: string): void {
    onboardingProgressStorage.delete(token);
  }

  /**
   * Validate step data
   */
  static validateStep(
    step: number,
    data: Partial<OnboardingFormData>
  ): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // Welcome - no validation needed
        break;

      case 2: // Basic Information
        if (!data.family_name || data.family_name.trim() === '') {
          errors.family_name = 'Family name is required';
        }
        if (!data.primary_contact_name || data.primary_contact_name.trim() === '') {
          errors.primary_contact_name = 'Primary contact name is required';
        }
        if (!data.primary_contact_phone || data.primary_contact_phone.trim() === '') {
          errors.primary_contact_phone = 'Phone number is required';
        } else if (!/^[\d\s+()-]+$/.test(data.primary_contact_phone)) {
          errors.primary_contact_phone = 'Invalid phone number format';
        }
        break;

      case 3: // Address Details
        if (!data.address || data.address.trim() === '') {
          errors.address = 'Address is required';
        }
        if (!data.city || data.city.trim() === '') {
          errors.city = 'City is required';
        }
        if (!data.state || data.state.trim() === '') {
          errors.state = 'State is required';
        }
        if (!data.pincode || data.pincode.trim() === '') {
          errors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(data.pincode)) {
          errors.pincode = 'Pincode must be 6 digits';
        }
        break;

      case 4: // Service Selection
        if (!data.selected_service) {
          errors.selected_service = 'Please select a service type';
        }
        if (data.kyc_already_done === undefined) {
          errors.kyc_already_done = 'Please indicate KYC status';
        }
        break;

      case 5: // Family Members - optional, but validate if provided
        if (data.family_members && data.family_members.length > 0) {
          data.family_members.forEach((member, index) => {
            if (!member.name || member.name.trim() === '') {
              errors[`family_member_${index}_name`] = 'Member name is required';
            }
            if (!member.relationship || member.relationship.trim() === '') {
              errors[`family_member_${index}_relationship`] = 'Relationship is required';
            }
            if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
              errors[`family_member_${index}_email`] = 'Invalid email format';
            }
          });
        }
        break;

      case 6: // Document Upload - handled separately
        break;

      case 7: // Review & Submit - final validation
        // Run all previous validations
        const basicValidation = this.validateStep(2, data);
        const addressValidation = this.validateStep(3, data);
        const serviceValidation = this.validateStep(4, data);

        Object.assign(errors, basicValidation.errors);
        Object.assign(errors, addressValidation.errors);
        Object.assign(errors, serviceValidation.errors);
        break;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Check if all required steps are completed
   */
  static isOnboardingComplete(formData: Partial<OnboardingFormData>): boolean {
    // Check all required fields
    const requiredFields = [
      'family_name',
      'primary_contact_name',
      'primary_contact_phone',
      'address',
      'city',
      'state',
      'pincode',
      'selected_service',
    ];

    return requiredFields.every((field) => {
      const value = formData[field as keyof OnboardingFormData];
      return value !== undefined && value !== null && value !== '';
    }) && formData.kyc_already_done !== undefined;
  }

  /**
   * Upload document during onboarding
   */
  static async uploadDocument(
    token: string,
    documentType: string,
    file: File
  ): Promise<OnboardingDocument> {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type (allow common document formats)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX');
    }

    // Convert file to base64
    const fileData = await this.fileToBase64(file);

    const document: OnboardingDocument = {
      id: generateId("doc"),
      token,
      document_type: documentType,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_data: fileData,
      uploaded_at: new Date().toISOString(),
    };

    onboardingDocumentStorage.save(document);
    return document;
  }

  /**
   * Get uploaded documents for a token
   */
  static getUploadedDocuments(token: string): OnboardingDocument[] {
    return onboardingDocumentStorage.getByToken(token);
  }

  /**
   * Delete uploaded document
   */
  static deleteDocument(documentId: string): void {
    onboardingDocumentStorage.delete(documentId);
  }

  /**
   * Convert file to base64 string
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Get completion percentage
   */
  static getCompletionPercentage(formData: Partial<OnboardingFormData>): number {
    const requiredFields = [
      'family_name',
      'primary_contact_name',
      'primary_contact_phone',
      'address',
      'city',
      'state',
      'pincode',
      'selected_service',
    ];

    const kycFieldCompleted = formData.kyc_already_done !== undefined ? 1 : 0;
    const completedCount = requiredFields.filter((field) => {
      const value = formData[field as keyof OnboardingFormData];
      return value !== undefined && value !== null && value !== '';
    }).length;

    const total = requiredFields.length + 1; // +1 for KYC field
    return Math.round(((completedCount + kycFieldCompleted) / total) * 100);
  }
}
