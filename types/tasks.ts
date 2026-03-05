// Task Management Type Definitions
// Following reference proto patterns from /Users/aayush-mac/techpix/NRP/nrp-cfo-ptoto

// Task Status - 7-state workflow
export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'pending_document_from_client'
  | 'waiting_on_client'
  | 'blocked'
  | 'done';

// Task Priority
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Task Context Types - categorizes what the task is related to
export type TaskContextType =
  | 'onboarding'
  | 'compliance'
  | 'document'
  | 'meeting'
  | 'general';

// Financial Operation Types — 11 predefined + Other
export type TaskOperationType =
  | 'sip_setup'
  | 'sip_cancellation'
  | 'swp_setup'
  | 'stp_setup'
  | 'switch_plans'
  | 'lumpsum_investment'
  | 'redemption'
  | 'client_onboarding'
  | 'kyc_update'
  | 'bank_mandate'
  | 'nomination_update'
  | 'other';

// Main Task Interface
export interface Task {
  id: string;
  title: string;
  description?: string;

  // Context
  context_type: TaskContextType;
  family_id: string;
  family_name: string; // Denormalized for performance

  // Assignment & Ownership
  created_by: string;
  created_by_name: string; // Denormalized
  assigned_to: string;
  assigned_to_name: string; // Denormalized
  assigned_by?: string;
  assigned_by_name?: string;
  assigned_at?: string;

  // Status & Priority
  status: TaskStatus;
  priority: TaskPriority;

  // Scheduling
  due_date: string; // ISO 8601 format (YYYY-MM-DD)
  due_time?: string; // HH:MM format (24-hour)

  // Completion
  completed_at?: string;
  completed_by?: string;
  completed_by_name?: string;
  completion_notes?: string;

  // Metadata
  tags?: string[];
  notes?: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601

  // Conditional fields based on status
  blockedReason?: string; // Required if status = 'blocked'
  waitingOnWhat?: string; // Required if status = 'waiting_on_client'
  documentRequested?: string; // Required if status = 'pending_document_from_client'
  clientNotifiedAt?: string; // Timestamp when client was notified

  // Financial Operation Type (for the Task Manager module)
  operation_type?: TaskOperationType;
  custom_type_label?: string; // Free-text label when operation_type === 'other'

  // Follow-up Engine
  needs_follow_up?: boolean;  // Whether this task needs a follow-up
  follow_up_date?: string;    // ISO 8601 — when to follow up
  follow_up_reason?: string;  // Why follow-up is needed

  // Snooze / Follow-up Engine
  snooze_date?: string;   // ISO 8601 — when this task should resurface
  snooze_reason?: string; // Why this task was snoozed
  snooze_count?: number;  // How many times this task has been snoozed
  snoozed_at?: string;    // When the snooze was last activated
  is_follow_up_due?: boolean; // Computed flag set by resurfacing logic
}

// Task Filter Interface - for filtering task lists
export interface TaskFilter {
  status?: TaskStatus | TaskStatus[];
  assigned_to?: string;
  family_id?: string;
  context_type?: TaskContextType;
  priority?: TaskPriority | TaskPriority[];
  due_date_from?: string;
  due_date_to?: string;
  overdue_only?: boolean;
  due_today_only?: boolean;
  due_this_week_only?: boolean;
  search_query?: string; // Search in title/description
}

// Task Statistics Interface - for dashboard stats
export interface TaskStats {
  total: number;
  by_status: Record<TaskStatus, number>;
  by_priority: Record<TaskPriority, number>;
  overdue: number;
  due_today: number;
  due_this_week: number;
  completed_this_week: number;
  completed_this_month: number;
  avg_completion_days?: number;
}

// Task Board Column Interface - for Kanban board
export interface TaskBoardColumn {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  count: number;
}

// Task Creation Data - for creating new tasks
export interface TaskCreateData {
  title: string;
  description?: string;
  context_type: TaskContextType;
  operation_type?: TaskOperationType;
  custom_type_label?: string; // When operation_type === 'other'
  family_id: string;
  assigned_to: string;
  priority: TaskPriority;
  due_date: string;
  due_time?: string;
  tags?: string[];
  notes?: string;
  // Follow-up
  needs_follow_up?: boolean;
  follow_up_date?: string;
  follow_up_reason?: string;
}

// Task Update Data - for updating existing tasks
export interface TaskUpdateData {
  title?: string;
  description?: string;
  context_type?: TaskContextType;
  operation_type?: TaskOperationType;
  assigned_to?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string;
  due_time?: string;
  tags?: string[];
  notes?: string;
  blockedReason?: string;
  waitingOnWhat?: string;
  documentRequested?: string;
  clientNotifiedAt?: string;
  snooze_date?: string;
  snooze_reason?: string;
}

// Task Assignment Change - for tracking reassignments
export interface TaskAssignmentChange {
  task_id: string;
  previous_assignee: string;
  previous_assignee_name: string;
  new_assignee: string;
  new_assignee_name: string;
  assigned_by: string;
  assigned_by_name: string;
  assigned_at: string;
  reason?: string;
}

// Task Status Change - for tracking status transitions
export interface TaskStatusChange {
  task_id: string;
  previous_status: TaskStatus;
  new_status: TaskStatus;
  changed_by: string;
  changed_by_name: string;
  changed_at: string;
  notes?: string;
}

// Task Activity Log Entry - for audit trail
export interface TaskActivityLogEntry {
  id: string;
  task_id: string;
  action_type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'completed' | 'deleted' | 'snoozed' | 'resurfaced';
  action_by: string;
  action_by_name: string;
  action_at: string;
  details: string;
  metadata?: Record<string, unknown>;
}

// Helper type for task status labels
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  pending_document_from_client: 'Pending Document',
  waiting_on_client: 'Waiting on Client',
  blocked: 'Blocked',
  done: 'Done',
};

// Helper type for task priority labels
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

// Helper type for task context labels
export const TASK_CONTEXT_LABELS: Record<TaskContextType, string> = {
  onboarding: 'Onboarding',
  compliance: 'Compliance',
  document: 'Document',
  meeting: 'Meeting',
  general: 'General',
};

// Helper type for priority colors (for badges)
export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

// Helper type for status colors (for badges)
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'gray',
  in_progress: 'blue',
  in_review: 'yellow',
  pending_document_from_client: 'orange',
  waiting_on_client: 'amber',
  blocked: 'red',
  done: 'green',
};

// ── Financial Operation Type Labels ──
export const OPERATION_TYPE_LABELS: Record<TaskOperationType, string> = {
  sip_setup: 'SIP Setup',
  sip_cancellation: 'SIP Cancellation',
  swp_setup: 'SWP Setup',
  stp_setup: 'STP Setup',
  switch_plans: 'Switch Plans',
  lumpsum_investment: 'Lumpsum Investment',
  redemption: 'Redemption',
  client_onboarding: 'Client Onboarding',
  kyc_update: 'KYC Update',
  bank_mandate: 'Bank Mandate (OTM)',
  nomination_update: 'Nomination Update',
  other: 'Other',
};

// ── Financial Operation Type Colors (for pills/badges) ──
export const OPERATION_TYPE_COLORS: Record<TaskOperationType, { bg: string; text: string }> = {
  sip_setup: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400' },
  sip_cancellation: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' },
  swp_setup: { bg: 'bg-violet-100 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-400' },
  stp_setup: { bg: 'bg-sky-100 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-400' },
  switch_plans: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400' },
  lumpsum_investment: { bg: 'bg-teal-100 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-400' },
  redemption: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400' },
  client_onboarding: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
  kyc_update: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
  bank_mandate: { bg: 'bg-cyan-100 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-400' },
  nomination_update: { bg: 'bg-pink-100 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-400' },
  other: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400' },
};

// ── Snooze Reason Presets ──
export const SNOOZE_REASONS = [
  'Aadhar/PAN Mismatch',
  'Awaiting Client Signature',
  'Insufficient Funds',
  'Client Unavailable',
  'Waiting for Bank Mandate',
  'Document Verification Pending',
  'Other',
] as const;

export type SnoozeReasonPreset = (typeof SNOOZE_REASONS)[number];

// ── Task Manager Stats (for "Clean Desk" dashboard metrics) ──
export interface TaskManagerStats {
  urgent_followups: number;       // Snoozed tasks resurfaced today
  pending_client_action: number;  // Tasks currently snoozed/waiting
  in_progress: number;            // Active work
  completed_this_week: number;    // Done in the last 7 days
}
