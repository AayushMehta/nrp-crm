// lib/services/reminder-automation-service.ts
// Automated reminder generation based on triggers

import { Reminder, ReminderTrigger, TriggerType } from "@/types/reminders";
import { ReminderService } from "./reminder-service";
import { triggerStorage } from "@/lib/storage/reminder-storage";
import { ActionItem } from "@/types/meeting-notes";
import { generateId } from "@/lib/utils";
import { addHours, addDays } from "date-fns";

/**
 * Service for automated reminder creation based on triggers
 * Integrates with onboarding, documents, and meeting notes
 */
export class ReminderAutomationService {
  /**
   * Initialize default triggers
   * Call this once on app initialization
   */
  static initializeDefaultTriggers(): void {
    const existingTriggers = triggerStorage.getAll();
    if (existingTriggers.length > 0) {
      return; // Already initialized
    }

    const now = new Date().toISOString();
    const systemUserId = "system";

    const defaultTriggers: Omit<ReminderTrigger, "id" | "created_at" | "updated_at">[] = [
      {
        trigger_type: "document_uploaded",
        trigger_event: "document.uploaded",
        title_template: "Verify document: {{document_name}}",
        description_template:
          "{{family_name}} uploaded {{document_name}}. Please review and verify.",
        assign_to: "admin",
        delay_hours: 0, // Immediate
        due_date_offset_hours: 24, // 24 hours to verify
        priority: "high",
        is_active: true,
        created_by_id: systemUserId,
      },
      {
        trigger_type: "checklist_completed",
        trigger_event: "checklist.100_percent",
        title_template: "Complete onboarding for {{family_name}}",
        description_template:
          "All documents verified. Complete final onboarding steps and grant full access.",
        assign_to: "family_rm",
        delay_hours: 0,
        due_date_offset_hours: 48, // 2 days to complete
        priority: "high",
        is_active: true,
        created_by_id: systemUserId,
      },
      {
        trigger_type: "meeting_action_item",
        trigger_event: "meeting.action_created",
        title_template: "{{action_description}}",
        description_template: "Action item from meeting: {{meeting_title}}",
        assign_to: "specific_user",
        delay_hours: 0,
        due_date_offset_hours: 168, // 7 days default
        priority: "medium",
        is_active: true,
        created_by_id: systemUserId,
      },
      {
        trigger_type: "onboarding_milestone",
        trigger_event: "onboarding.request_accepted",
        title_template: "Setup client access for {{family_name}}",
        description_template:
          "New onboarding request accepted. Set up client portal and send welcome email.",
        assign_to: "admin",
        delay_hours: 0,
        due_date_offset_hours: 24,
        priority: "high",
        is_active: true,
        created_by_id: systemUserId,
      },
      {
        trigger_type: "document_expiring",
        trigger_event: "document.expiry_warning",
        title_template: "Document expiring: {{document_name}}",
        description_template:
          "{{document_name}} for {{family_name}} will expire in 30 days. Request renewal.",
        assign_to: "family_rm",
        delay_hours: 0,
        due_date_offset_hours: 24,
        priority: "medium",
        is_active: true,
        created_by_id: systemUserId,
      },
    ];

    defaultTriggers.forEach((trigger) => {
      triggerStorage.create({
        ...trigger,
        id: generateId("trigger"),
        created_at: now,
        updated_at: now,
      });
    });
  }

  /**
   * Trigger: Document Uploaded
   * Called when a client uploads a document for verification
   */
  static onDocumentUploaded(data: {
    checklistId: string;
    documentName: string;
    familyId: string;
    familyName: string;
    uploadedBy: string;
    assignToUserId?: string;
  }): Reminder | null {
    const triggers = triggerStorage.getActiveByType("document_uploaded");
    if (triggers.length === 0) {
      return null;
    }

    const trigger = triggers[0]; // Use first active trigger

    const title = this.replaceTemplate(trigger.title_template, {
      document_name: data.documentName,
      family_name: data.familyName,
    });

    const description = trigger.description_template
      ? this.replaceTemplate(trigger.description_template, {
          document_name: data.documentName,
          family_name: data.familyName,
        })
      : undefined;

    const now = new Date();
    const dueDate = addHours(now, trigger.due_date_offset_hours);

    return ReminderService.createReminder({
      title,
      description,
      context_type: "document",
      context_id: data.checklistId,
      family_id: data.familyId,
      family_name: data.familyName,
      created_by: "system",
      created_by_name: "System",
      assigned_to: data.assignToUserId || "admin",
      assigned_to_name: data.assignToUserId ? "Admin" : "Admin Team",
      due_date: dueDate.toISOString(),
      priority: trigger.priority,
      auto_generated: true,
      trigger_type: "document_uploaded",
      trigger_context_id: data.checklistId,
    });
  }

  /**
   * Trigger: Checklist Completed (100%)
   * Called when all checklist items are verified
   */
  static onChecklistCompleted(data: {
    checklistId: string;
    familyId: string;
    familyName: string;
    rmUserId?: string;
  }): Reminder | null {
    const triggers = triggerStorage.getActiveByType("checklist_completed");
    if (triggers.length === 0) {
      return null;
    }

    const trigger = triggers[0];

    const title = this.replaceTemplate(trigger.title_template, {
      family_name: data.familyName,
    });

    const description = trigger.description_template
      ? this.replaceTemplate(trigger.description_template, {
          family_name: data.familyName,
        })
      : undefined;

    const now = new Date();
    const dueDate = addHours(now, trigger.due_date_offset_hours);

    return ReminderService.createReminder({
      title,
      description,
      context_type: "family",
      context_id: data.checklistId,
      family_id: data.familyId,
      family_name: data.familyName,
      created_by: "system",
      created_by_name: "System",
      assigned_to: data.rmUserId || "rm",
      assigned_to_name: data.rmUserId ? "RM" : "Relationship Manager",
      due_date: dueDate.toISOString(),
      priority: trigger.priority,
      auto_generated: true,
      trigger_type: "checklist_completed",
      trigger_context_id: data.checklistId,
    });
  }

  /**
   * Trigger: Meeting Action Item Created
   * Called when an action item is added to a meeting note
   */
  static onActionItemCreated(data: {
    meetingId: string;
    meetingTitle: string;
    actionItem: ActionItem;
    familyId: string;
    familyName: string;
    createdBy: string;
    createdByName: string;
  }): Reminder | null {
    const triggers = triggerStorage.getActiveByType("meeting_action_item");
    if (triggers.length === 0) {
      return null;
    }

    const trigger = triggers[0];

    const title = this.replaceTemplate(trigger.title_template, {
      action_description: data.actionItem.description,
      meeting_title: data.meetingTitle,
    });

    const description = trigger.description_template
      ? this.replaceTemplate(trigger.description_template, {
          action_description: data.actionItem.description,
          meeting_title: data.meetingTitle,
        })
      : undefined;

    // Use action item due date if provided, otherwise use trigger offset
    const dueDate = data.actionItem.due_date
      ? new Date(data.actionItem.due_date)
      : addHours(new Date(), trigger.due_date_offset_hours);

    return ReminderService.createReminder({
      title,
      description,
      context_type: "task",
      context_id: data.meetingId,
      family_id: data.familyId,
      family_name: data.familyName,
      created_by: data.createdBy,
      created_by_name: data.createdByName,
      assigned_to: data.actionItem.assigned_to_id || data.createdBy,
      assigned_to_name: data.actionItem.assigned_to_name || data.createdByName,
      due_date: dueDate.toISOString(),
      priority: data.actionItem.priority || trigger.priority,
      auto_generated: true,
      trigger_type: "meeting_action_item",
      trigger_context_id: data.meetingId,
    });
  }

  /**
   * Trigger: Onboarding Request Accepted
   * Called when admin accepts a new onboarding request
   */
  static onOnboardingRequestAccepted(data: {
    familyId: string;
    familyName: string;
    checklistId: string;
    assignedAdminId?: string;
  }): Reminder | null {
    const triggers = triggerStorage.getActiveByType("onboarding_milestone");
    if (triggers.length === 0) {
      return null;
    }

    const trigger = triggers[0];

    const title = this.replaceTemplate(trigger.title_template, {
      family_name: data.familyName,
    });

    const description = trigger.description_template
      ? this.replaceTemplate(trigger.description_template, {
          family_name: data.familyName,
        })
      : undefined;

    const now = new Date();
    const dueDate = addHours(now, trigger.due_date_offset_hours);

    return ReminderService.createReminder({
      title,
      description,
      context_type: "family",
      context_id: data.checklistId,
      family_id: data.familyId,
      family_name: data.familyName,
      created_by: "system",
      created_by_name: "System",
      assigned_to: data.assignedAdminId || "admin",
      assigned_to_name: "Admin",
      due_date: dueDate.toISOString(),
      priority: trigger.priority,
      auto_generated: true,
      trigger_type: "onboarding_milestone",
      trigger_context_id: data.checklistId,
    });
  }

  /**
   * Trigger: Document Expiring Soon
   * Called by scheduled job to check for expiring documents
   */
  static onDocumentExpiring(data: {
    documentId: string;
    documentName: string;
    familyId: string;
    familyName: string;
    expiryDate: string;
    rmUserId?: string;
  }): Reminder | null {
    const triggers = triggerStorage.getActiveByType("document_expiring");
    if (triggers.length === 0) {
      return null;
    }

    const trigger = triggers[0];

    const title = this.replaceTemplate(trigger.title_template, {
      document_name: data.documentName,
      family_name: data.familyName,
    });

    const description = trigger.description_template
      ? this.replaceTemplate(trigger.description_template, {
          document_name: data.documentName,
          family_name: data.familyName,
        })
      : undefined;

    const now = new Date();
    const dueDate = addHours(now, trigger.due_date_offset_hours);

    return ReminderService.createReminder({
      title,
      description,
      context_type: "document",
      context_id: data.documentId,
      family_id: data.familyId,
      family_name: data.familyName,
      created_by: "system",
      created_by_name: "System",
      assigned_to: data.rmUserId || "rm",
      assigned_to_name: "RM",
      due_date: dueDate.toISOString(),
      priority: trigger.priority,
      auto_generated: true,
      trigger_type: "document_expiring",
      trigger_context_id: data.documentId,
    });
  }

  /**
   * Create follow-up reminder after X days of no activity
   */
  static createFollowUpReminder(data: {
    familyId: string;
    familyName: string;
    lastActivityDate: string;
    rmUserId?: string;
    daysSinceActivity: number;
  }): Reminder {
    const now = new Date();
    const dueDate = addDays(now, 1);

    return ReminderService.createReminder({
      title: `Follow up with ${data.familyName}`,
      description: `No activity for ${data.daysSinceActivity} days. Check in with client.`,
      context_type: "family",
      family_id: data.familyId,
      family_name: data.familyName,
      created_by: "system",
      created_by_name: "System",
      assigned_to: data.rmUserId || "rm",
      assigned_to_name: "RM",
      due_date: dueDate.toISOString(),
      priority: "medium",
      auto_generated: true,
      trigger_type: "manual",
    });
  }

  /**
   * Replace template variables with actual values
   */
  private static replaceTemplate(
    template: string,
    values: Record<string, string>
  ): string {
    let result = template;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    return result;
  }

  /**
   * Get all active triggers
   */
  static getActiveTriggers(): ReminderTrigger[] {
    return triggerStorage.getAll().filter((t) => t.is_active);
  }

  /**
   * Update trigger
   */
  static updateTrigger(
    triggerId: string,
    updates: Partial<ReminderTrigger>
  ): ReminderTrigger | null {
    return triggerStorage.update(triggerId, updates);
  }

  /**
   * Enable/disable trigger
   */
  static toggleTrigger(triggerId: string, isActive: boolean): ReminderTrigger | null {
    return triggerStorage.update(triggerId, { is_active: isActive });
  }
}
