export type EventType = 'meeting' | 'call' | 'deadline' | 'review';
export type EventPriority = 'high' | 'medium' | 'low';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM AM/PM format
  type: EventType;
  title: string;
  familyId?: string;
  familyName?: string;
  duration?: string; // e.g., "1h", "30m", "1.5h"
  priority: EventPriority;
  description?: string;
  location?: string;
  reminderSet?: boolean;
}
