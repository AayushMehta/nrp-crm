// types/meetings.ts
// Type definitions for meeting management

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export type MeetingType =
  | 'initial_consultation'
  | 'portfolio_review'
  | 'quarterly_review'
  | 'annual_review'
  | 'ad_hoc'
  | 'virtual'
  | 'in_person';

export interface MeetingAttendee {
  user_id: string;
  user_name: string;
  user_role: 'admin' | 'rm' | 'family';
  email?: string;
  attendance_status: 'confirmed' | 'tentative' | 'declined' | 'no_response';
}

export interface ActionItem {
  id: string;
  description: string;
  assigned_to: string;
  assigned_to_name: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at?: string;
}

export interface Meeting {
  id: string;
  family_id: string;
  family_name: string;

  // Meeting details
  title: string;
  description?: string;
  type: MeetingType;
  status: MeetingStatus;

  // Scheduling
  scheduled_date: string; // ISO datetime
  duration_minutes: number;
  location?: string; // Physical address or "Virtual"
  meeting_url?: string; // For virtual meetings (Zoom/Teams link)

  // Participants
  assigned_rm_id: string;
  assigned_rm_name: string;
  attendees: MeetingAttendee[];

  // Agenda and outcomes
  agenda_items: string[];
  meeting_notes?: string; // Link to meeting note ID or inline notes
  meeting_note_id?: string; // Reference to meeting-notes entity
  action_items?: ActionItem[];

  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  cancelled_reason?: string;
  rescheduled_from?: string; // Original meeting ID if rescheduled
}

export interface MeetingFilter {
  family_id?: string;
  status?: MeetingStatus | MeetingStatus[];
  date_from?: string;
  date_to?: string;
  assigned_rm_id?: string;
  type?: MeetingType;
}

export interface MeetingStats {
  total: number;
  by_status: Record<MeetingStatus, number>;
  by_type: Record<MeetingType, number>;
  upcoming_count: number; // Next 30 days
  this_month: number;
  this_quarter: number;
}
