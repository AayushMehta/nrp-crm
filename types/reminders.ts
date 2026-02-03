// types/reminders.ts
// Type definitions for reminder system with automation

export type ReminderContextType =
  | "family"
  | "task"
  | "compliance"
  | "document"
  | "goal"
  | "meeting"
  | "general";

export type ReminderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "snoozed";

export type ReminderPriority = "low" | "medium" | "high" | "urgent";

export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export type TriggerType =
  | "document_uploaded"
  | "checklist_completed"
  | "meeting_action_item"
  | "onboarding_milestone"
  | "document_expiring"
  | "compliance_due"
  | "manual";

export interface Reminder {
  id: string;

  // Content
  title: string;
  description?: string;

  // Context (what this reminder is about)
  context_type: ReminderContextType;
  context_id?: string; // ID of related item
  family_id?: string;
  family_name?: string;

  // Assignment
  created_by: string;
  created_by_name: string;
  assigned_to: string;
  assigned_to_name: string;
  assigned_by?: string;
  assigned_by_name?: string;

  // Scheduling
  due_date: string; // ISO 8601
  reminder_time?: string; // HH:MM format

  // Recurrence
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number; // e.g., every 2 weeks
  recurrence_end_date?: string;
  recurrence_count?: number; // Stop after N occurrences
  parent_reminder_id?: string; // If this is part of a recurring series

  // Snooze
  snoozed_until?: string;
  snooze_count: number;
  snooze_history?: SnoozeRecord[];

  // Status
  status: ReminderStatus;
  completed_at?: string;
  completed_by?: string;
  completed_notes?: string;

  // Priority
  priority: ReminderPriority;

  // Auto-generation tracking
  auto_generated: boolean;
  trigger_id?: string;
  trigger_type?: TriggerType;
  trigger_context_id?: string;

  // Email notification
  email_sent: boolean;
  email_sent_at?: string;
  email_recipient?: string;

  // Metadata
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SnoozeRecord {
  snoozed_at: string;
  snoozed_by: string;
  snoozed_until: string;
  reason?: string;
}

export interface ReminderTrigger {
  id: string;
  trigger_type: TriggerType;
  trigger_event: string; // Specific event name
  title_template: string; // e.g., "Verify document: {{document_name}}"
  description_template?: string;

  // Assignment rules
  assign_to: "rm" | "admin" | "specific_user" | "family_rm";
  specific_user_id?: string;

  // Timing
  delay_hours: number; // Create reminder X hours after trigger
  due_date_offset_hours: number; // Due date is X hours after creation

  // Priority
  priority: ReminderPriority;

  // Recurrence
  make_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number;

  // Status
  is_active: boolean;

  // Metadata
  created_at: string;
  created_by_id: string;
  updated_at: string;
}

export interface ReminderFilter {
  status?: ReminderStatus | ReminderStatus[];
  assigned_to?: string;
  family_id?: string;
  context_type?: ReminderContextType;
  priority?: ReminderPriority;
  due_date_from?: string;
  due_date_to?: string;
  overdue_only?: boolean;
  due_today_only?: boolean;
  auto_generated?: boolean;
}

export interface ReminderStats {
  total: number;
  by_status: Record<ReminderStatus, number>;
  by_priority: Record<ReminderPriority, number>;
  overdue: number;
  due_today: number;
  due_this_week: number;
  completed_this_week: number;
  completed_this_month: number;
}

export interface ReminderNotification {
  reminder_id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  sent_at?: string;
  delivery_status?: "pending" | "sent" | "failed";
  error_message?: string;
}

export interface SnoozeOptions {
  label: string;
  hours: number | "tomorrow" | "nextWeek" | "custom";
  description?: string;
}

export const SNOOZE_OPTIONS: SnoozeOptions[] = [
  { label: "1 hour", hours: 1 },
  { label: "4 hours", hours: 4 },
  { label: "Tomorrow 9 AM", hours: "tomorrow" },
  { label: "Next week", hours: "nextWeek" },
  { label: "Custom date", hours: "custom" },
];
