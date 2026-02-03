// types/communication-timeline.ts
// Type definitions for unified communication timeline

export type TimelineItemType =
  | "meeting_note"
  | "message"
  | "reminder"
  | "document_upload"
  | "document_verification"
  | "onboarding_milestone"
  | "action_item_completed"
  | "system_event";

export type TimelineVisibility = "all" | "client" | "internal";

export interface TimelineItem {
  id: string;
  item_type: TimelineItemType;
  item_id: string; // Reference to original item (meeting_note_id, message_id, etc.)

  // Common fields
  family_id: string;
  family_name: string;
  title: string;
  summary: string;
  description?: string;

  // Privacy controls
  is_internal: boolean;
  client_can_view: boolean;
  visibility: TimelineVisibility;

  // Context
  created_by_id: string;
  created_by_name: string;
  created_by_role: "admin" | "rm" | "family" | "system";
  created_at: string;

  // Priority/importance
  priority?: "low" | "medium" | "high";
  is_important?: boolean;

  // Type-specific metadata
  metadata?: TimelineMetadata;

  // Icons and styling
  icon?: string;
  color?: string;
}

export interface TimelineMetadata {
  // Meeting-specific
  meeting_type?: string;
  participants_count?: number;
  action_items_count?: number;

  // Document-specific
  document_type?: string;
  document_name?: string;
  document_status?: string;

  // Reminder-specific
  reminder_status?: string;
  reminder_due_date?: string;

  // Message-specific
  message_priority?: string;
  message_read?: boolean;

  // General
  [key: string]: any;
}

export interface TimelineFilter {
  family_id?: string;
  item_types?: TimelineItemType[];
  visibility?: TimelineVisibility;
  date_from?: string;
  date_to?: string;
  created_by_id?: string;
  created_by_role?: "admin" | "rm" | "family";
  priority?: "low" | "medium" | "high";
  search_query?: string;
}

export interface TimelineGroup {
  date: string; // YYYY-MM-DD
  display_date: string; // "Today", "Yesterday", "Jan 15, 2026"
  items: TimelineItem[];
}

export interface TimelineStats {
  total_items: number;
  by_type: Record<TimelineItemType, number>;
  internal_count: number;
  client_visible_count: number;
  recent_activity_count: number; // Last 7 days
}

// Helper types for converting items to timeline format
export interface TimelineConversion {
  convertMeetingNote: (meeting: any) => TimelineItem;
  convertMessage: (message: any) => TimelineItem;
  convertReminder: (reminder: any) => TimelineItem;
  convertDocument: (document: any) => TimelineItem;
}
