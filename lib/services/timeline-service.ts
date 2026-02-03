// lib/services/timeline-service.ts
// Service for aggregating communication timeline

import {
  TimelineItem,
  TimelineItemType,
  TimelineFilter,
  TimelineGroup,
  TimelineStats,
} from "@/types/communication-timeline";
import { meetingStorage } from "@/lib/storage/meeting-storage";
import { documentStorage } from "@/lib/storage/document-storage";
import { UserRole } from "@/types/auth";
import { MeetingNote } from "@/types/meeting-notes";
import { DocumentMetadata } from "@/types/documents";

/**
 * Service for creating unified communication timeline
 */
export class TimelineService {
  /**
   * Convert meeting note to timeline item
   */
  static meetingToTimelineItem(meeting: MeetingNote): TimelineItem {
    const actionItemCount = meeting.action_items.length;
    const pendingActionCount = meeting.action_items.filter(
      (a) => a.status === "pending" || a.status === "in_progress"
    ).length;

    return {
      id: `meeting-${meeting.id}`,
      item_type: "meeting_note",
      item_id: meeting.id,
      family_id: meeting.family_id,
      family_name: meeting.family_name,
      title: meeting.title,
      summary: meeting.client_visible_summary,
      description: meeting.internal_notes,
      is_internal: meeting.is_internal,
      client_can_view: meeting.client_can_view,
      visibility: meeting.is_internal && !meeting.client_can_view ? "internal" : "all",
      created_by_id: meeting.created_by_id,
      created_by_name: meeting.created_by_name,
      created_by_role: meeting.created_by_role,
      created_at: meeting.meeting_date,
      priority: pendingActionCount > 0 ? "high" : "medium",
      is_important: pendingActionCount > 0,
      metadata: {
        meeting_type: meeting.meeting_type,
        participants_count: meeting.participants.length,
        action_items_count: actionItemCount,
      },
      icon: "calendar",
      color: "blue",
    };
  }

  /**
   * Convert document to timeline item
   */
  static documentToTimelineItem(document: DocumentMetadata): TimelineItem {
    const isUpload = true; // Could differentiate upload vs verification
    const itemType: TimelineItemType = document.status === "verified"
      ? "document_verification"
      : "document_upload";

    return {
      id: `document-${document.id}`,
      item_type: itemType,
      item_id: document.id,
      family_id: document.entity_id, // Assuming entity is family
      family_name: "", // Would need to fetch from family data
      title: document.status === "verified"
        ? `Document Verified: ${document.file_name}`
        : `Document Uploaded: ${document.file_name}`,
      summary: `${document.file_name} (${(document.file_size / 1024).toFixed(1)} KB)`,
      is_internal: false,
      client_can_view: true,
      visibility: "all",
      created_by_id: document.uploaded_by_id,
      created_by_name: document.uploaded_by_name,
      created_by_role: document.uploaded_by_role === "admin" ? "admin" : document.uploaded_by_role === "rm" ? "rm" : "family",
      created_at: document.status === "verified" && document.verified_at
        ? document.verified_at
        : document.uploaded_at,
      metadata: {
        document_type: document.document_type,
        document_name: document.file_name,
        document_status: document.status,
      },
      icon: "file",
      color: document.status === "verified" ? "green" : "yellow",
    };
  }

  /**
   * Get timeline for a family with privacy filtering
   */
  static getTimeline(
    familyId: string,
    userRole: UserRole,
    userId: string,
    filter?: TimelineFilter
  ): TimelineItem[] {
    const items: TimelineItem[] = [];

    // Get meetings
    const meetings = meetingStorage.getByFamilyId(familyId);
    meetings.forEach((meeting) => {
      // Apply privacy filter
      if (userRole === "family") {
        if (meeting.is_internal && !meeting.client_can_view) {
          return; // Skip this meeting
        }
      }

      const timelineItem = this.meetingToTimelineItem(meeting);
      items.push(timelineItem);
    });

    // Get documents (if entity_type is family)
    const documents = documentStorage.getByEntity("family", familyId);
    documents.forEach((document) => {
      const timelineItem = this.documentToTimelineItem(document);
      items.push(timelineItem);
    });

    // Apply additional filters
    let filtered = items;

    if (filter?.item_types && filter.item_types.length > 0) {
      filtered = filtered.filter((item) => filter.item_types!.includes(item.item_type));
    }

    if (filter?.visibility) {
      filtered = filtered.filter((item) => {
        if (filter.visibility === "internal") {
          return item.visibility === "internal";
        }
        if (filter.visibility === "client") {
          return item.visibility === "all" || item.visibility === "client";
        }
        return true;
      });
    }

    if (filter?.date_from) {
      filtered = filtered.filter((item) => item.created_at >= filter.date_from!);
    }

    if (filter?.date_to) {
      filtered = filtered.filter((item) => item.created_at <= filter.date_to!);
    }

    if (filter?.created_by_id) {
      filtered = filtered.filter((item) => item.created_by_id === filter.created_by_id);
    }

    if (filter?.priority) {
      filtered = filtered.filter((item) => item.priority === filter.priority);
    }

    // Sort by created_at descending (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filtered;
  }

  /**
   * Group timeline items by date
   */
  static groupByDate(items: TimelineItem[]): TimelineGroup[] {
    const groups: Record<string, TimelineItem[]> = {};

    items.forEach((item) => {
      const date = new Date(item.created_at);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(item);
    });

    // Convert to array and sort
    const groupArray: TimelineGroup[] = Object.entries(groups).map(([date, items]) => {
      const displayDate = this.getDisplayDate(date);

      return {
        date,
        display_date: displayDate,
        items,
      };
    });

    // Sort by date descending
    groupArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return groupArray;
  }

  /**
   * Get display date string (Today, Yesterday, or formatted date)
   */
  private static getDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const itemDate = new Date(date);
    itemDate.setHours(0, 0, 0, 0);

    if (itemDate.getTime() === today.getTime()) {
      return "Today";
    }

    if (itemDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    }

    // Format as "Jan 15, 2026"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Get timeline statistics
   */
  static getStats(familyId: string, userRole: UserRole, userId: string): TimelineStats {
    const items = this.getTimeline(familyId, userRole, userId);

    const byType = items.reduce((acc, item) => {
      acc[item.item_type] = (acc[item.item_type] || 0) + 1;
      return acc;
    }, {} as Record<TimelineItemType, number>);

    const internalCount = items.filter((item) => item.visibility === "internal").length;
    const clientVisibleCount = items.filter(
      (item) => item.visibility === "all" || item.visibility === "client"
    ).length;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = items.filter(
      (item) => new Date(item.created_at) >= sevenDaysAgo
    ).length;

    return {
      total_items: items.length,
      by_type: byType,
      internal_count: internalCount,
      client_visible_count: clientVisibleCount,
      recent_activity_count: recentCount,
    };
  }
}
