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
  family_id: string;
  assigned_to: string;
  priority: TaskPriority;
  due_date: string;
  due_time?: string;
  tags?: string[];
  notes?: string;
}

// Task Update Data - for updating existing tasks
export interface TaskUpdateData {
  title?: string;
  description?: string;
  context_type?: TaskContextType;
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
  action_type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'completed' | 'deleted';
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
