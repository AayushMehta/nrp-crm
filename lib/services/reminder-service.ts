// lib/services/reminder-service.ts
// Business logic for reminder CRUD operations

import {
  Reminder,
  ReminderFilter,
  ReminderStatus,
  ReminderPriority,
  ReminderStats,
  SnoozeRecord,
  RecurrencePattern,
} from "@/types/reminders";
import { reminderStorage } from "@/lib/storage/reminder-storage";
import { generateId } from "@/lib/utils";
import { addHours, addDays, addWeeks, addMonths, addYears } from "date-fns";

/**
 * Service for managing reminders
 * Handles CRUD operations, snoozing, recurring reminders
 */
export class ReminderService {
  /**
   * Create a new reminder
   */
  static createReminder(data: {
    title: string;
    description?: string;
    context_type: Reminder["context_type"];
    context_id?: string;
    family_id?: string;
    family_name?: string;
    created_by: string;
    created_by_name: string;
    assigned_to: string;
    assigned_to_name: string;
    due_date: string;
    reminder_time?: string;
    priority: ReminderPriority;
    is_recurring?: boolean;
    recurrence_pattern?: RecurrencePattern;
    recurrence_interval?: number;
    recurrence_end_date?: string;
    recurrence_count?: number;
    auto_generated?: boolean;
    trigger_type?: Reminder["trigger_type"];
    trigger_context_id?: string;
    tags?: string[];
    notes?: string;
  }): Reminder {
    const now = new Date().toISOString();

    const reminder: Reminder = {
      id: generateId("rem"),
      title: data.title,
      description: data.description,
      context_type: data.context_type,
      context_id: data.context_id,
      family_id: data.family_id,
      family_name: data.family_name,
      created_by: data.created_by,
      created_by_name: data.created_by_name,
      assigned_to: data.assigned_to,
      assigned_to_name: data.assigned_to_name,
      due_date: data.due_date,
      reminder_time: data.reminder_time,
      is_recurring: data.is_recurring || false,
      recurrence_pattern: data.recurrence_pattern,
      recurrence_interval: data.recurrence_interval,
      recurrence_end_date: data.recurrence_end_date,
      recurrence_count: data.recurrence_count,
      snooze_count: 0,
      status: "pending",
      priority: data.priority,
      auto_generated: data.auto_generated || false,
      trigger_type: data.trigger_type,
      trigger_context_id: data.trigger_context_id,
      email_sent: false,
      tags: data.tags,
      notes: data.notes,
      created_at: now,
      updated_at: now,
    };

    return reminderStorage.create(reminder);
  }

  /**
   * Get reminder by ID
   */
  static getById(id: string): Reminder | null {
    return reminderStorage.getById(id);
  }

  /**
   * Get all reminders with optional filter
   */
  static getAll(filter?: ReminderFilter): Reminder[] {
    if (!filter) {
      return reminderStorage.getAll();
    }
    return reminderStorage.query(filter);
  }

  /**
   * Get reminders assigned to a user
   */
  static getByUser(userId: string, filter?: ReminderFilter): Reminder[] {
    return reminderStorage.query({
      ...filter,
      assigned_to: userId,
    });
  }

  /**
   * Get reminders by family
   */
  static getByFamily(familyId: string): Reminder[] {
    return reminderStorage.getByFamilyId(familyId);
  }

  /**
   * Update reminder
   */
  static updateReminder(id: string, updates: Partial<Reminder>): Reminder | null {
    return reminderStorage.update(id, updates);
  }

  /**
   * Complete reminder
   */
  static completeReminder(
    id: string,
    completedBy: string,
    notes?: string
  ): Reminder | null {
    const reminder = reminderStorage.getById(id);
    if (!reminder) {
      return null;
    }

    const updated = reminderStorage.update(id, {
      status: "completed",
      completed_at: new Date().toISOString(),
      completed_by: completedBy,
      completed_notes: notes,
    });

    // If recurring, create next occurrence
    if (updated && reminder.is_recurring && !this.shouldStopRecurrence(reminder)) {
      this.createNextOccurrence(reminder);
    }

    return updated;
  }

  /**
   * Cancel reminder
   */
  static cancelReminder(id: string): Reminder | null {
    return reminderStorage.update(id, {
      status: "cancelled",
    });
  }

  /**
   * Snooze reminder
   */
  static snoozeReminder(
    id: string,
    snoozedBy: string,
    snoozeUntil: Date,
    reason?: string
  ): Reminder | null {
    const reminder = reminderStorage.getById(id);
    if (!reminder) {
      return null;
    }

    const snoozeRecord: SnoozeRecord = {
      snoozed_at: new Date().toISOString(),
      snoozed_by: snoozedBy,
      snoozed_until: snoozeUntil.toISOString(),
      reason,
    };

    const snoozeHistory = reminder.snooze_history || [];
    snoozeHistory.push(snoozeRecord);

    return reminderStorage.update(id, {
      status: "snoozed",
      snoozed_until: snoozeUntil.toISOString(),
      snooze_count: reminder.snooze_count + 1,
      snooze_history: snoozeHistory,
    });
  }

  /**
   * Reactivate snoozed reminder (automatically when time comes)
   */
  static reactivateSnoozedReminders(): number {
    const snoozedReminders = reminderStorage.query({ status: "snoozed" });
    const now = new Date();
    let count = 0;

    snoozedReminders.forEach((reminder) => {
      if (reminder.snoozed_until && new Date(reminder.snoozed_until) <= now) {
        reminderStorage.update(reminder.id, {
          status: "pending",
          snoozed_until: undefined,
        });
        count++;
      }
    });

    return count;
  }

  /**
   * Delete reminder
   */
  static deleteReminder(id: string): boolean {
    return reminderStorage.delete(id);
  }

  /**
   * Get overdue reminders
   */
  static getOverdue(userId?: string): Reminder[] {
    const overdue = reminderStorage.getOverdue();
    if (userId) {
      return overdue.filter((r) => r.assigned_to === userId);
    }
    return overdue;
  }

  /**
   * Get reminders due today
   */
  static getDueToday(userId?: string): Reminder[] {
    const dueToday = reminderStorage.getDueToday();
    if (userId) {
      return dueToday.filter((r) => r.assigned_to === userId);
    }
    return dueToday;
  }

  /**
   * Get reminders due this week
   */
  static getDueThisWeek(userId?: string): Reminder[] {
    const now = new Date();
    const endOfWeek = addDays(now, 7);

    const allReminders = userId
      ? this.getByUser(userId)
      : reminderStorage.getAll();

    return allReminders.filter((r) => {
      if (r.status === "completed" || r.status === "cancelled") {
        return false;
      }
      const dueDate = new Date(r.due_date);
      return dueDate >= now && dueDate <= endOfWeek;
    });
  }

  /**
   * Get reminder statistics
   */
  static getStats(userId?: string): ReminderStats {
    const reminders = userId ? this.getByUser(userId) : reminderStorage.getAll();

    const stats: ReminderStats = {
      total: reminders.length,
      by_status: {
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        snoozed: 0,
      },
      by_priority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      },
      overdue: 0,
      due_today: 0,
      due_this_week: 0,
      completed_this_week: 0,
      completed_this_month: 0,
    };

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    reminders.forEach((r) => {
      // Count by status
      stats.by_status[r.status]++;

      // Count by priority
      stats.by_priority[r.priority]++;

      // Count overdue
      if (
        r.status !== "completed" &&
        r.status !== "cancelled" &&
        new Date(r.due_date) < now
      ) {
        stats.overdue++;
      }

      // Count due today
      const dueDate = new Date(r.due_date);
      if (dueDate >= startOfDay && dueDate < endOfDay) {
        stats.due_today++;
      }

      // Count due this week
      if (
        r.status !== "completed" &&
        r.status !== "cancelled" &&
        dueDate >= now &&
        dueDate <= addDays(now, 7)
      ) {
        stats.due_this_week++;
      }

      // Count completed this week
      if (r.completed_at && new Date(r.completed_at) >= startOfWeek) {
        stats.completed_this_week++;
      }

      // Count completed this month
      if (r.completed_at && new Date(r.completed_at) >= startOfMonth) {
        stats.completed_this_month++;
      }
    });

    return stats;
  }

  /**
   * Create next occurrence for recurring reminder
   */
  private static createNextOccurrence(parentReminder: Reminder): Reminder | null {
    if (!parentReminder.is_recurring || !parentReminder.recurrence_pattern) {
      return null;
    }

    const currentDueDate = new Date(parentReminder.due_date);
    let nextDueDate: Date;

    switch (parentReminder.recurrence_pattern) {
      case "daily":
        nextDueDate = addDays(
          currentDueDate,
          parentReminder.recurrence_interval || 1
        );
        break;
      case "weekly":
        nextDueDate = addWeeks(
          currentDueDate,
          parentReminder.recurrence_interval || 1
        );
        break;
      case "monthly":
        nextDueDate = addMonths(
          currentDueDate,
          parentReminder.recurrence_interval || 1
        );
        break;
      case "yearly":
        nextDueDate = addYears(
          currentDueDate,
          parentReminder.recurrence_interval || 1
        );
        break;
      default:
        return null;
    }

    // Check if we should create next occurrence
    if (
      parentReminder.recurrence_end_date &&
      nextDueDate > new Date(parentReminder.recurrence_end_date)
    ) {
      return null;
    }

    // Create next occurrence
    return this.createReminder({
      title: parentReminder.title,
      description: parentReminder.description,
      context_type: parentReminder.context_type,
      context_id: parentReminder.context_id,
      family_id: parentReminder.family_id,
      family_name: parentReminder.family_name,
      created_by: parentReminder.created_by,
      created_by_name: parentReminder.created_by_name,
      assigned_to: parentReminder.assigned_to,
      assigned_to_name: parentReminder.assigned_to_name,
      due_date: nextDueDate.toISOString(),
      reminder_time: parentReminder.reminder_time,
      priority: parentReminder.priority,
      is_recurring: true,
      recurrence_pattern: parentReminder.recurrence_pattern,
      recurrence_interval: parentReminder.recurrence_interval,
      recurrence_end_date: parentReminder.recurrence_end_date,
      recurrence_count: parentReminder.recurrence_count,
      tags: parentReminder.tags,
      notes: parentReminder.notes,
    });
  }

  /**
   * Check if recurring reminder should stop
   */
  private static shouldStopRecurrence(reminder: Reminder): boolean {
    if (!reminder.is_recurring) {
      return true;
    }

    // Check end date
    if (
      reminder.recurrence_end_date &&
      new Date() > new Date(reminder.recurrence_end_date)
    ) {
      return true;
    }

    // Check count
    if (reminder.recurrence_count) {
      const occurrences = reminderStorage
        .getAll()
        .filter((r) => r.parent_reminder_id === reminder.id);
      if (occurrences.length >= reminder.recurrence_count) {
        return true;
      }
    }

    return false;
  }

  /**
   * Bulk update status
   */
  static bulkUpdateStatus(ids: string[], status: ReminderStatus): number {
    let count = 0;
    ids.forEach((id) => {
      if (reminderStorage.update(id, { status })) {
        count++;
      }
    });
    return count;
  }

  /**
   * Clear all reminders (for testing)
   */
  static clearAll(): void {
    reminderStorage.clear();
  }
}
