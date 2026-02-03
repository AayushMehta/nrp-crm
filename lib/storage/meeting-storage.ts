// lib/storage/meeting-storage.ts
// Storage layer for meeting notes

import { MeetingNote, MeetingNoteFilter } from "@/types/meeting-notes";
import { getFromStorage, setToStorage } from "./localStorage";

export const MEETING_STORAGE_KEY = "nrp_crm_meeting_notes";

export const meetingStorage = {
  /**
   * Get all meeting notes
   */
  getAll(): MeetingNote[] {
    return getFromStorage<MeetingNote[]>(MEETING_STORAGE_KEY, []);
  },

  /**
   * Get meeting note by ID
   */
  getById(meetingId: string): MeetingNote | null {
    const meetings = this.getAll();
    return meetings.find((m) => m.id === meetingId) || null;
  },

  /**
   * Create new meeting note
   */
  create(meeting: MeetingNote): MeetingNote {
    const meetings = this.getAll();
    meetings.push(meeting);
    setToStorage(MEETING_STORAGE_KEY, meetings);
    return meeting;
  },

  /**
   * Update existing meeting note
   */
  update(meetingId: string, updates: Partial<MeetingNote>): MeetingNote | null {
    const meetings = this.getAll();
    const index = meetings.findIndex((m) => m.id === meetingId);

    if (index === -1) {
      return null;
    }

    meetings[index] = {
      ...meetings[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setToStorage(MEETING_STORAGE_KEY, meetings);
    return meetings[index];
  },

  /**
   * Delete meeting note
   */
  delete(meetingId: string): boolean {
    const meetings = this.getAll();
    const filtered = meetings.filter((m) => m.id !== meetingId);

    if (filtered.length === meetings.length) {
      return false;
    }

    setToStorage(MEETING_STORAGE_KEY, filtered);
    return true;
  },

  /**
   * Get meetings by family ID
   */
  getByFamilyId(familyId: string): MeetingNote[] {
    const meetings = this.getAll();
    return meetings.filter((m) => m.family_id === familyId);
  },

  /**
   * Query meetings with filters
   */
  query(filter: MeetingNoteFilter): MeetingNote[] {
    let meetings = this.getAll();

    if (filter.family_id) {
      meetings = meetings.filter((m) => m.family_id === filter.family_id);
    }

    if (filter.meeting_type) {
      meetings = meetings.filter((m) => m.meeting_type === filter.meeting_type);
    }

    if (filter.status) {
      meetings = meetings.filter((m) => m.status === filter.status);
    }

    if (filter.date_from) {
      meetings = meetings.filter((m) => m.meeting_date >= filter.date_from!);
    }

    if (filter.date_to) {
      meetings = meetings.filter((m) => m.meeting_date <= filter.date_to!);
    }

    if (filter.created_by_id) {
      meetings = meetings.filter((m) => m.created_by_id === filter.created_by_id);
    }

    if (filter.has_pending_actions) {
      meetings = meetings.filter((m) =>
        m.action_items.some((item) => item.status === "pending" || item.status === "in_progress")
      );
    }

    return meetings;
  },

  /**
   * Save all meetings (bulk update)
   */
  saveAll(meetings: MeetingNote[]): void {
    setToStorage(MEETING_STORAGE_KEY, meetings);
  },
};
