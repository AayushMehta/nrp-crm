// lib/services/meeting-service.ts
// Business logic for meeting management

import {
  Meeting,
  MeetingFilter,
  MeetingStats,
  MeetingStatus,
} from "@/types/meetings";
import { LocalStorageService } from "@/lib/storage/localStorage";

const STORAGE_KEY = "nrp_crm_meetings";

export class MeetingService {
  /**
   * Get all meetings
   */
  static getAll(): Meeting[] {
    return LocalStorageService.get<Meeting[]>(STORAGE_KEY, []);
  }

  /**
   * Get meeting by ID
   */
  static getById(id: string): Meeting | null {
    const meetings = this.getAll();
    return meetings.find((m) => m.id === id) || null;
  }

  /**
   * Create a new meeting
   */
  static create(
    meeting: Omit<Meeting, "id" | "created_at" | "updated_at">
  ): Meeting {
    const newMeeting: Meeting = {
      ...meeting,
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const meetings = this.getAll();
    meetings.push(newMeeting);
    LocalStorageService.set(STORAGE_KEY, meetings);

    return newMeeting;
  }

  /**
   * Update a meeting
   */
  static update(id: string, updates: Partial<Meeting>): Meeting | null {
    const meetings = this.getAll();
    const index = meetings.findIndex((m) => m.id === id);

    if (index === -1) return null;

    meetings[index] = {
      ...meetings[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    LocalStorageService.set(STORAGE_KEY, meetings);
    return meetings[index];
  }

  /**
   * Delete a meeting
   */
  static delete(id: string): boolean {
    const meetings = this.getAll();
    const filtered = meetings.filter((m) => m.id !== id);

    if (filtered.length < meetings.length) {
      LocalStorageService.set(STORAGE_KEY, filtered);
      return true;
    }
    return false;
  }

  /**
   * Get meetings based on user role
   * - Admin: sees all meetings
   * - RM: sees meetings they're assigned to
   * - Family: sees their own family's meetings
   */
  static getMeetings(
    userId: string,
    userRole: "admin" | "rm" | "family",
    familyId?: string
  ): Meeting[] {
    const meetings = this.getAll();

    if (userRole === "admin") {
      return meetings; // Admin sees all
    }

    if (userRole === "rm") {
      return meetings.filter((m) => m.assigned_rm_id === userId);
    }

    if (userRole === "family" && familyId) {
      return meetings.filter((m) => m.family_id === familyId);
    }

    return [];
  }

  /**
   * Query meetings with filters
   */
  static query(filter: MeetingFilter): Meeting[] {
    let meetings = this.getAll();

    if (filter.family_id) {
      meetings = meetings.filter((m) => m.family_id === filter.family_id);
    }

    if (filter.status) {
      const statuses = Array.isArray(filter.status)
        ? filter.status
        : [filter.status];
      meetings = meetings.filter((m) => statuses.includes(m.status));
    }

    if (filter.date_from) {
      meetings = meetings.filter(
        (m) => m.scheduled_date >= filter.date_from!
      );
    }

    if (filter.date_to) {
      meetings = meetings.filter((m) => m.scheduled_date <= filter.date_to!);
    }

    if (filter.assigned_rm_id) {
      meetings = meetings.filter(
        (m) => m.assigned_rm_id === filter.assigned_rm_id
      );
    }

    if (filter.type) {
      meetings = meetings.filter((m) => m.type === filter.type);
    }

    // Sort by date (most recent first)
    return meetings.sort(
      (a, b) =>
        new Date(b.scheduled_date).getTime() -
        new Date(a.scheduled_date).getTime()
    );
  }

  /**
   * Get upcoming meetings for a family
   */
  static getUpcoming(familyId: string, limit: number = 5): Meeting[] {
    const now = new Date().toISOString();
    return this.query({
      family_id: familyId,
      status: "scheduled",
      date_from: now,
    }).slice(0, limit);
  }

  /**
   * Get past meetings for a family
   */
  static getPastMeetings(familyId: string, limit: number = 10): Meeting[] {
    const now = new Date().toISOString();
    return this.query({
      family_id: familyId,
      status: "completed",
      date_to: now,
    }).slice(0, limit);
  }

  /**
   * Get meeting statistics
   */
  static getStats(
    userId: string,
    userRole: "admin" | "rm" | "family",
    familyId?: string
  ): MeetingStats {
    const meetings = this.getMeetings(userId, userRole, familyId);
    const now = new Date();
    const thirtyDaysLater = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const by_status: Record<MeetingStatus, number> = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      rescheduled: 0,
    };

    const by_type: Record<string, number> = {};

    meetings.forEach((m) => {
      by_status[m.status]++;
      by_type[m.type] = (by_type[m.type] || 0) + 1;
    });

    const upcoming = meetings.filter(
      (m) =>
        m.status === "scheduled" &&
        new Date(m.scheduled_date) <= thirtyDaysLater &&
        new Date(m.scheduled_date) >= now
    );

    return {
      total: meetings.length,
      by_status,
      by_type: by_type as Record<any, number>,
      upcoming_count: upcoming.length,
      this_month: meetings.filter((m) => {
        const date = new Date(m.scheduled_date);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }).length,
      this_quarter: meetings.filter((m) => {
        const date = new Date(m.scheduled_date);
        const quarter = Math.floor(date.getMonth() / 3);
        const nowQuarter = Math.floor(now.getMonth() / 3);
        return quarter === nowQuarter && date.getFullYear() === now.getFullYear();
      }).length,
    };
  }

  /**
   * Cancel a meeting
   */
  static cancelMeeting(id: string, reason: string): Meeting | null {
    return this.update(id, {
      status: "cancelled",
      cancelled_reason: reason,
    });
  }

  /**
   * Reschedule a meeting
   */
  static rescheduleMeeting(
    id: string,
    newDate: string,
    newDuration?: number
  ): Meeting | null {
    const original = this.getById(id);
    if (!original) return null;

    // Update original to rescheduled status
    this.update(id, { status: "rescheduled" });

    // Create new meeting
    return this.create({
      ...original,
      scheduled_date: newDate,
      duration_minutes: newDuration || original.duration_minutes,
      status: "scheduled",
      rescheduled_from: id,
    });
  }

  /**
   * Mark meeting as completed
   */
  static completeMeeting(
    id: string,
    meetingNotes?: string,
    actionItems?: Meeting["action_items"]
  ): Meeting | null {
    return this.update(id, {
      status: "completed",
      meeting_notes: meetingNotes,
      action_items: actionItems,
    });
  }

  /**
   * Save all meetings (for bulk operations)
   */
  static saveAll(meetings: Meeting[]): void {
    LocalStorageService.set(STORAGE_KEY, meetings);
  }
}
