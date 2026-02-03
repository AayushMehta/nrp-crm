// lib/services/meeting-note-service.ts
// Business logic for meeting notes with privacy controls

import {
  MeetingNote,
  MeetingType,
  MeetingStatus,
  ActionItem,
  MeetingParticipant,
  MeetingNoteFilter,
  ActionItemUpdate,
  ActionItemStatus,
} from "@/types/meeting-notes";
import { meetingStorage } from "@/lib/storage/meeting-storage";
import { ReminderAutomationService } from "./reminder-automation-service";
import { generateId } from "@/lib/utils";
import { UserRole } from "@/types/auth";

/**
 * Service for managing meeting notes with privacy controls
 */
export class MeetingNoteService {
  /**
   * Create a new meeting note
   */
  static createMeetingNote(data: {
    title: string;
    meeting_type: MeetingType;
    meeting_date: string;
    family_id: string;
    family_name: string;
    participants: MeetingParticipant[];
    discussion_points: string[];
    decisions_made: string[];
    action_items: Omit<ActionItem, "id">[];
    internal_notes?: string;
    client_visible_summary: string;
    is_internal: boolean;
    client_can_view: boolean;
    created_by_id: string;
    created_by_name: string;
    created_by_role: "admin" | "rm";
    location?: string;
    meeting_duration_minutes?: number;
    tags?: string[];
  }): MeetingNote {
    const now = new Date().toISOString();

    const meeting: MeetingNote = {
      id: generateId("meeting"),
      title: data.title,
      meeting_type: data.meeting_type,
      meeting_date: data.meeting_date,
      meeting_duration_minutes: data.meeting_duration_minutes,
      location: data.location,
      family_id: data.family_id,
      family_name: data.family_name,
      participants: data.participants,
      discussion_points: data.discussion_points,
      decisions_made: data.decisions_made,
      action_items: data.action_items.map((item) => ({
        ...item,
        id: generateId("action"),
      })),
      internal_notes: data.internal_notes,
      client_visible_summary: data.client_visible_summary,
      is_internal: data.is_internal,
      client_can_view: data.client_can_view,
      status: "completed",
      created_by_id: data.created_by_id,
      created_by_name: data.created_by_name,
      created_by_role: data.created_by_role,
      created_at: now,
      updated_at: now,
      tags: data.tags,
    };

    return meetingStorage.create(meeting);
  }

  /**
   * Apply privacy filter based on user role
   * CRITICAL: This enforces privacy rules for client access
   */
  static applyPrivacyFilter(
    meeting: MeetingNote,
    userRole: UserRole,
    userId: string
  ): MeetingNote | null {
    // Admins and RMs see everything
    if (userRole === "admin" || userRole === "rm") {
      return meeting;
    }

    // Rule 1: If entire note is internal and client can't view, hide it
    if (meeting.is_internal && !meeting.client_can_view) {
      return null;
    }

    // Rule 2: If internal but client can view summary, show limited version
    if (meeting.is_internal && meeting.client_can_view) {
      return {
        ...meeting,
        discussion_points: [], // Hide detailed discussion
        decisions_made: [], // Hide decisions
        internal_notes: undefined, // Always hide internal notes
        action_items: meeting.action_items.filter(
          (item) => item.assigned_to_id === userId
        ), // Only show items assigned to this user
      };
    }

    // Rule 3: For non-internal meetings, hide internal notes and filter actions
    return {
      ...meeting,
      internal_notes: undefined, // Always hide from clients
      action_items: meeting.action_items.filter(
        (item) => item.assigned_to_id === userId
      ), // Only show items assigned to this user
    };
  }

  /**
   * Get meeting note by ID with privacy filter
   */
  static getById(
    meetingId: string,
    userRole: UserRole,
    userId: string
  ): MeetingNote | null {
    const meeting = meetingStorage.getById(meetingId);
    if (!meeting) {
      return null;
    }

    return this.applyPrivacyFilter(meeting, userRole, userId);
  }

  /**
   * Get all meeting notes with privacy filter
   */
  static getAll(
    filter: MeetingNoteFilter,
    userRole: UserRole,
    userId: string
  ): MeetingNote[] {
    let meetings = meetingStorage.query(filter);

    // Apply privacy filter to each meeting
    const filtered = meetings
      .map((m) => this.applyPrivacyFilter(m, userRole, userId))
      .filter((m): m is MeetingNote => m !== null);

    // Sort by meeting date descending
    return filtered.sort(
      (a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime()
    );
  }

  /**
   * Update meeting note
   */
  static updateMeetingNote(
    meetingId: string,
    updates: Partial<MeetingNote>
  ): MeetingNote | null {
    return meetingStorage.update(meetingId, updates);
  }

  /**
   * Add action item to meeting
   */
  static addActionItem(
    meetingId: string,
    actionItem: Omit<ActionItem, "id">
  ): MeetingNote | null {
    const meeting = meetingStorage.getById(meetingId);
    if (!meeting) {
      return null;
    }

    const newActionItem: ActionItem = {
      ...actionItem,
      id: generateId("action"),
    };

    const updatedActionItems = [...meeting.action_items, newActionItem];

    const updated = meetingStorage.update(meetingId, {
      action_items: updatedActionItems,
    });

    // Trigger automated reminder for action item
    if (updated && newActionItem.due_date) {
      try {
        const reminder = ReminderAutomationService.onActionItemCreated({
          meetingId,
          meetingTitle: meeting.title,
          actionItem: newActionItem,
          familyId: meeting.family_id,
          familyName: meeting.family_name,
          createdBy: meeting.created_by_id,
          createdByName: meeting.created_by_name,
        });

        // Link reminder back to action item
        if (reminder) {
          newActionItem.reminder_id = reminder.id;
          meetingStorage.update(meetingId, {
            action_items: updatedActionItems,
          });
        }
      } catch (error) {
        console.error("Failed to create action item reminder:", error);
        // Don't fail the action item creation if reminder fails
      }
    }

    return updated;
  }

  /**
   * Update action item status
   */
  static updateActionItem(
    meetingId: string,
    actionItemId: string,
    update: ActionItemUpdate
  ): MeetingNote | null {
    const meeting = meetingStorage.getById(meetingId);
    if (!meeting) {
      return null;
    }

    const updatedActionItems = meeting.action_items.map((item) => {
      if (item.id === actionItemId) {
        return {
          ...item,
          ...update,
        };
      }
      return item;
    });

    return meetingStorage.update(meetingId, {
      action_items: updatedActionItems,
    });
  }

  /**
   * Complete action item
   */
  static completeActionItem(
    meetingId: string,
    actionItemId: string,
    completedBy: string,
    notes?: string
  ): MeetingNote | null {
    return this.updateActionItem(meetingId, actionItemId, {
      status: "completed",
      completed_at: new Date().toISOString(),
      completed_by: completedBy,
      notes,
    });
  }

  /**
   * Get meetings by family with privacy filter
   */
  static getByFamilyId(
    familyId: string,
    userRole: UserRole,
    userId: string
  ): MeetingNote[] {
    return this.getAll({ family_id: familyId }, userRole, userId);
  }

  /**
   * Get pending action items across all meetings
   */
  static getPendingActionItems(userId?: string): Array<{
    meeting: MeetingNote;
    action: ActionItem;
  }> {
    const meetings = meetingStorage.getAll();
    const pendingItems: Array<{ meeting: MeetingNote; action: ActionItem }> = [];

    meetings.forEach((meeting) => {
      meeting.action_items.forEach((action) => {
        if (
          (action.status === "pending" || action.status === "in_progress") &&
          (!userId || action.assigned_to_id === userId)
        ) {
          pendingItems.push({ meeting, action });
        }
      });
    });

    return pendingItems;
  }

  /**
   * Get meeting statistics
   */
  static getStats() {
    const meetings = meetingStorage.getAll();

    const stats = {
      total: meetings.length,
      by_type: meetings.reduce((acc, m) => {
        acc[m.meeting_type] = (acc[m.meeting_type] || 0) + 1;
        return acc;
      }, {} as Record<MeetingType, number>),
      by_status: meetings.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {} as Record<MeetingStatus, number>),
      pending_actions: 0,
      completed_this_month: 0,
    };

    // Count pending actions
    meetings.forEach((m) => {
      m.action_items.forEach((a) => {
        if (a.status === "pending" || a.status === "in_progress") {
          stats.pending_actions++;
        }
      });
    });

    // Count completed this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    stats.completed_this_month = meetings.filter((m) => {
      const meetingDate = new Date(m.meeting_date);
      return meetingDate >= thisMonth && m.status === "completed";
    }).length;

    return stats;
  }

  /**
   * Delete meeting note
   */
  static deleteMeetingNote(meetingId: string): boolean {
    return meetingStorage.delete(meetingId);
  }
}
