// types/meeting-notes.ts
// Type definitions for meeting notes and action items

export type MeetingType =
  | "onboarding"
  | "review"
  | "planning"
  | "adhoc"
  | "follow_up"
  | "complaint"
  | "annual_review"
  | "quarterly_review";

export type MeetingStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export type ParticipantType =
  | "primary_client"
  | "family_member"
  | "rm"
  | "admin"
  | "other_rm"
  | "external_advisor";

export type ActionItemPriority = "low" | "medium" | "high";

export type ActionItemStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface MeetingParticipant {
  id: string;
  user_id?: string; // If they have a user account
  name: string;
  participant_type: ParticipantType;
  email?: string;
  attended: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  assigned_to_id?: string;
  assigned_to_name: string;
  due_date?: string;
  priority: ActionItemPriority;
  status: ActionItemStatus;
  completed_at?: string;
  completed_by?: string;

  // Link to auto-generated reminder
  reminder_id?: string;

  // Notes
  notes?: string;
}

export interface MeetingNote {
  id: string;

  // Basic info
  title: string;
  meeting_type: MeetingType;
  meeting_date: string;
  meeting_duration_minutes?: number;
  location?: string; // 'office' | 'zoom' | 'phone' | client location

  // Association
  family_id: string;
  family_name: string;

  // Participants
  participants: MeetingParticipant[];

  // Content
  discussion_points: string[]; // Array of bullet points
  decisions_made: string[]; // Key decisions
  action_items: ActionItem[];
  internal_notes?: string; // HIDDEN from clients
  client_visible_summary: string; // VISIBLE to clients

  // Attachments
  attachment_ids?: string[];

  // Privacy control (CRITICAL)
  is_internal: boolean; // If true, entire note hidden from clients
  client_can_view: boolean; // Override: even if internal, client can see summary

  // Status
  status: MeetingStatus;

  // Follow-up
  next_meeting_date?: string;
  next_meeting_reminder_id?: string;

  // Metadata
  created_by_id: string;
  created_by_name: string;
  created_by_role: "admin" | "rm";
  created_at: string;
  updated_at: string;
  last_modified_by_id?: string;

  // Tags for filtering
  tags?: string[];
}

export interface MeetingNoteFilter {
  family_id?: string;
  meeting_type?: MeetingType;
  status?: MeetingStatus;
  date_from?: string;
  date_to?: string;
  created_by_id?: string;
  include_internal?: boolean; // For RM/admin views
  has_pending_actions?: boolean;
}

export interface MeetingNoteSummary {
  total_meetings: number;
  by_type: Record<MeetingType, number>;
  pending_actions: number;
  upcoming_meetings: number;
}

export interface ActionItemUpdate {
  status?: ActionItemStatus;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
}
