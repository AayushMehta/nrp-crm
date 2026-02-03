// lib/storage/reminder-storage.ts
// Storage layer for reminders using localStorage

import { Reminder, ReminderFilter, ReminderTrigger } from "@/types/reminders";
import { getFromStorage, setToStorage } from "./localStorage";

const STORAGE_KEYS = {
  REMINDERS: "nrp_crm_reminders",
  TRIGGERS: "nrp_crm_reminder_triggers",
};

/**
 * Reminder Storage Service
 * Handles CRUD operations for reminders in localStorage
 */
class ReminderStorage {
  /**
   * Get all reminders
   */
  getAll(): Reminder[] {
    return getFromStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
  }

  /**
   * Get reminder by ID
   */
  getById(id: string): Reminder | null {
    const reminders = this.getAll();
    return reminders.find((r) => r.id === id) || null;
  }

  /**
   * Query reminders with filters
   */
  query(filter: ReminderFilter): Reminder[] {
    let reminders = this.getAll();

    // Filter by status
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      reminders = reminders.filter((r) => statuses.includes(r.status));
    }

    // Filter by assigned user
    if (filter.assigned_to) {
      reminders = reminders.filter((r) => r.assigned_to === filter.assigned_to);
    }

    // Filter by family
    if (filter.family_id) {
      reminders = reminders.filter((r) => r.family_id === filter.family_id);
    }

    // Filter by context type
    if (filter.context_type) {
      reminders = reminders.filter((r) => r.context_type === filter.context_type);
    }

    // Filter by priority
    if (filter.priority) {
      reminders = reminders.filter((r) => r.priority === filter.priority);
    }

    // Filter by date range
    if (filter.due_date_from) {
      reminders = reminders.filter(
        (r) => new Date(r.due_date) >= new Date(filter.due_date_from!)
      );
    }
    if (filter.due_date_to) {
      reminders = reminders.filter(
        (r) => new Date(r.due_date) <= new Date(filter.due_date_to!)
      );
    }

    // Filter overdue
    if (filter.overdue_only) {
      const now = new Date();
      reminders = reminders.filter(
        (r) =>
          r.status !== "completed" &&
          r.status !== "cancelled" &&
          new Date(r.due_date) < now
      );
    }

    // Filter due today
    if (filter.due_today_only) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      reminders = reminders.filter((r) => {
        const dueDate = new Date(r.due_date);
        return dueDate >= today && dueDate < tomorrow;
      });
    }

    // Filter auto-generated
    if (filter.auto_generated !== undefined) {
      reminders = reminders.filter((r) => r.auto_generated === filter.auto_generated);
    }

    return reminders;
  }

  /**
   * Create new reminder
   */
  create(reminder: Reminder): Reminder {
    const reminders = this.getAll();
    reminders.push(reminder);
    setToStorage(STORAGE_KEYS.REMINDERS, reminders);
    return reminder;
  }

  /**
   * Update reminder
   */
  update(id: string, updates: Partial<Reminder>): Reminder | null {
    const reminders = this.getAll();
    const index = reminders.findIndex((r) => r.id === id);

    if (index === -1) {
      return null;
    }

    reminders[index] = {
      ...reminders[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setToStorage(STORAGE_KEYS.REMINDERS, reminders);
    return reminders[index];
  }

  /**
   * Delete reminder
   */
  delete(id: string): boolean {
    const reminders = this.getAll();
    const filtered = reminders.filter((r) => r.id !== id);

    if (filtered.length === reminders.length) {
      return false; // No reminder found
    }

    setToStorage(STORAGE_KEYS.REMINDERS, filtered);
    return true;
  }

  /**
   * Get reminders by family ID
   */
  getByFamilyId(familyId: string): Reminder[] {
    return this.query({ family_id: familyId });
  }

  /**
   * Get overdue reminders
   */
  getOverdue(): Reminder[] {
    return this.query({ overdue_only: true });
  }

  /**
   * Get reminders due today
   */
  getDueToday(): Reminder[] {
    return this.query({ due_today_only: true });
  }

  /**
   * Clear all reminders (for testing)
   */
  clear(): void {
    setToStorage(STORAGE_KEYS.REMINDERS, []);
  }
}

/**
 * Trigger Storage Service
 * Handles CRUD operations for reminder triggers
 */
class TriggerStorage {
  /**
   * Get all triggers
   */
  getAll(): ReminderTrigger[] {
    return getFromStorage<ReminderTrigger[]>(STORAGE_KEYS.TRIGGERS, []);
  }

  /**
   * Get trigger by ID
   */
  getById(id: string): ReminderTrigger | null {
    const triggers = this.getAll();
    return triggers.find((t) => t.id === id) || null;
  }

  /**
   * Get active triggers by type
   */
  getActiveByType(triggerType: string): ReminderTrigger[] {
    return this.getAll().filter(
      (t) => t.trigger_type === triggerType && t.is_active
    );
  }

  /**
   * Create trigger
   */
  create(trigger: ReminderTrigger): ReminderTrigger {
    const triggers = this.getAll();
    triggers.push(trigger);
    setToStorage(STORAGE_KEYS.TRIGGERS, triggers);
    return trigger;
  }

  /**
   * Update trigger
   */
  update(id: string, updates: Partial<ReminderTrigger>): ReminderTrigger | null {
    const triggers = this.getAll();
    const index = triggers.findIndex((t) => t.id === id);

    if (index === -1) {
      return null;
    }

    triggers[index] = {
      ...triggers[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setToStorage(STORAGE_KEYS.TRIGGERS, triggers);
    return triggers[index];
  }

  /**
   * Delete trigger
   */
  delete(id: string): boolean {
    const triggers = this.getAll();
    const filtered = triggers.filter((t) => t.id !== id);

    if (filtered.length === triggers.length) {
      return false;
    }

    setToStorage(STORAGE_KEYS.TRIGGERS, filtered);
    return true;
  }

  /**
   * Clear all triggers (for testing)
   */
  clear(): void {
    setToStorage(STORAGE_KEYS.TRIGGERS, []);
  }
}

// Export singleton instances
export const reminderStorage = new ReminderStorage();
export const triggerStorage = new TriggerStorage();
