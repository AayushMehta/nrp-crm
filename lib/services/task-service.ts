// Task Service - Business logic for task management
// Following reference proto service patterns with RBAC filtering

import type {
  Task,
  TaskCreateData,
  TaskUpdateData,
  TaskFilter,
  TaskStats,
  TaskStatus,
  TaskPriority,
  TaskBoardColumn,
  TaskManagerStats,
  TaskActivityLogEntry,
} from '@/types/tasks';
import { LocalStorageService } from '@/lib/storage/localStorage';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isAfter, isBefore, isToday, parseISO } from 'date-fns';

const STORAGE_KEY = 'nrp_crm_tasks';

export class TaskService {
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all tasks with RBAC filtering
   * @param userRole - Role of current user (admin, rm, family)
   * @param userId - ID of current user
   * @param familyIds - Array of family IDs the user has access to (for RMs)
   * @param filters - Optional filters to apply
   */
  static getTasks(
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[],
    filters?: TaskFilter
  ): Task[] {
    const allTasks = this.getAllTasks();

    // RBAC Filtering
    let accessibleTasks: Task[] = [];

    if (userRole === 'admin') {
      // Admin sees all tasks
      accessibleTasks = allTasks;
    } else if (userRole === 'rm') {
      // RM sees tasks for assigned families only
      if (!familyIds || familyIds.length === 0) {
        return []; // No access if no families assigned
      }
      accessibleTasks = allTasks.filter((task) =>
        familyIds.includes(task.family_id)
      );
    } else {
      // Family/clients never see tasks
      return [];
    }

    // Apply filters
    return this.applyFilters(accessibleTasks, filters);
  }

  /**
   * Get a single task by ID
   */
  static getTaskById(taskId: string): Task | null {
    const allTasks = this.getAllTasks();
    return allTasks.find((task) => task.id === taskId) || null;
  }

  /**
   * Create a new task
   */
  static createTask(
    taskData: TaskCreateData & { created_by?: string; created_by_name?: string },
    currentUserId?: string,
    currentUserName?: string
  ): Task {
    const allTasks = this.getAllTasks();
    const now = new Date().toISOString();

    const userId = taskData.created_by || currentUserId || 'system';
    const userName = taskData.created_by_name || currentUserName || 'System';

    // Find assigned user name (would come from user service in real app)
    const assignedToName = taskData.assigned_to === userId
      ? userName
      : this.getUserNameById(taskData.assigned_to);

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title,
      description: taskData.description,
      context_type: taskData.context_type,
      family_id: taskData.family_id,
      family_name: this.getFamilyNameById(taskData.family_id),
      created_by: userId,
      created_by_name: userName,
      assigned_to: taskData.assigned_to,
      assigned_to_name: assignedToName,
      status: 'todo', // Always start as todo
      priority: taskData.priority,
      due_date: taskData.due_date,
      due_time: taskData.due_time,
      tags: taskData.tags || [],
      notes: taskData.notes,
      operation_type: taskData.operation_type,
      custom_type_label: taskData.custom_type_label,
      // Follow-up fields
      needs_follow_up: taskData.needs_follow_up,
      follow_up_date: taskData.follow_up_date,
      follow_up_reason: taskData.follow_up_reason,
      created_at: now,
      updated_at: now,
    };

    allTasks.push(newTask);
    this.saveTasks(allTasks);

    return newTask;
  }

  /**
   * Update an existing task
   */
  static updateTask(
    taskId: string,
    updates: TaskUpdateData,
    currentUserId: string,
    currentUserName: string
  ): Task | null {
    const allTasks = this.getAllTasks();
    const taskIndex = allTasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return null;
    }

    const task = allTasks[taskIndex];
    const now = new Date().toISOString();

    // Track reassignment
    if (updates.assigned_to && updates.assigned_to !== task.assigned_to) {
      task.assigned_by = currentUserId;
      task.assigned_by_name = currentUserName;
      task.assigned_at = now;
      task.assigned_to_name = this.getUserNameById(updates.assigned_to);
    }

    // Apply updates
    const updatedTask: Task = {
      ...task,
      ...updates,
      updated_at: now,
    };

    allTasks[taskIndex] = updatedTask;
    this.saveTasks(allTasks);

    return updatedTask;
  }

  /**
   * Delete a task
   */
  static deleteTask(taskId: string): boolean {
    const allTasks = this.getAllTasks();
    const filteredTasks = allTasks.filter((t) => t.id !== taskId);

    if (filteredTasks.length === allTasks.length) {
      return false; // Task not found
    }

    this.saveTasks(filteredTasks);
    return true;
  }

  // ============================================================================
  // STATUS MANAGEMENT
  // ============================================================================

  /**
   * Move task to a new status (for Kanban drag-drop)
   */
  static moveTaskToStatus(
    taskId: string,
    newStatus: TaskStatus,
    currentUserId: string,
    currentUserName: string
  ): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    // If moving to done, also set completion fields
    if (newStatus === 'done') {
      return this.updateTask(
        taskId,
        {
          status: newStatus,
        },
        currentUserId,
        currentUserName
      );
    }

    return this.updateTask(
      taskId,
      { status: newStatus },
      currentUserId,
      currentUserName
    );
  }

  /**
   * Complete a task (mark as done with completion metadata)
   */
  static completeTask(
    taskId: string,
    currentUserId: string,
    currentUserName: string,
    completionNotes?: string
  ): Task | null {
    const allTasks = this.getAllTasks();
    const taskIndex = allTasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return null;
    }

    const task = allTasks[taskIndex];
    const now = new Date().toISOString();

    const completedTask: Task = {
      ...task,
      status: 'done',
      completed_at: now,
      completed_by: currentUserId,
      completed_by_name: currentUserName,
      completion_notes: completionNotes,
      updated_at: now,
    };

    allTasks[taskIndex] = completedTask;
    this.saveTasks(allTasks);

    return completedTask;
  }

  // ============================================================================
  // ASSIGNMENT MANAGEMENT
  // ============================================================================

  /**
   * Reassign a task to another user
   */
  static reassignTask(
    taskId: string,
    newAssigneeId: string,
    currentUserId: string,
    currentUserName: string
  ): Task | null {
    return this.updateTask(
      taskId,
      { assigned_to: newAssigneeId },
      currentUserId,
      currentUserName
    );
  }

  // ============================================================================
  // ANALYTICS & STATISTICS
  // ============================================================================

  /**
   * Get task statistics
   */
  static getStats(
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[]
  ): TaskStats {
    const tasks = this.getTasks(userRole, userId, familyIds);

    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const stats: TaskStats = {
      total: tasks.length,
      by_status: {
        todo: 0,
        in_progress: 0,
        in_review: 0,
        pending_document_from_client: 0,
        waiting_on_client: 0,
        blocked: 0,
        done: 0,
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

    tasks.forEach((task) => {
      // Count by status
      stats.by_status[task.status]++;

      // Count by priority
      stats.by_priority[task.priority]++;

      // Overdue tasks (past due date and not done)
      if (task.status !== 'done' && isAfter(now, parseISO(task.due_date))) {
        stats.overdue++;
      }

      // Due today
      if (task.status !== 'done' && isToday(parseISO(task.due_date))) {
        stats.due_today++;
      }

      // Due this week
      if (
        task.status !== 'done' &&
        isAfter(parseISO(task.due_date), weekStart) &&
        isBefore(parseISO(task.due_date), weekEnd)
      ) {
        stats.due_this_week++;
      }

      // Completed this week
      if (
        task.completed_at &&
        isAfter(parseISO(task.completed_at), weekStart) &&
        isBefore(parseISO(task.completed_at), weekEnd)
      ) {
        stats.completed_this_week++;
      }

      // Completed this month
      if (
        task.completed_at &&
        isAfter(parseISO(task.completed_at), monthStart) &&
        isBefore(parseISO(task.completed_at), monthEnd)
      ) {
        stats.completed_this_month++;
      }
    });

    return stats;
  }

  /**
   * Get tasks by family ID
   */
  static getTasksByFamily(familyId: string): Task[] {
    const allTasks = this.getAllTasks();
    return allTasks.filter((task) => task.family_id === familyId);
  }

  /**
   * Get tasks by status
   */
  static getTasksByStatus(
    status: TaskStatus,
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[]
  ): Task[] {
    const tasks = this.getTasks(userRole, userId, familyIds);
    return tasks.filter((task) => task.status === status);
  }

  /**
   * Get overdue tasks
   */
  static getOverdueTasks(
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[]
  ): Task[] {
    const tasks = this.getTasks(userRole, userId, familyIds);
    const now = new Date();

    return tasks.filter(
      (task) =>
        task.status !== 'done' &&
        isAfter(now, parseISO(task.due_date))
    );
  }

  // ============================================================================
  // CALENDAR INTEGRATION
  // ============================================================================

  /**
   * Get tasks for a date range (for calendar view)
   */
  static getTasksForDateRange(
    startDate: string,
    endDate: string,
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[]
  ): Task[] {
    const tasks = this.getTasks(userRole, userId, familyIds);

    return tasks.filter((task) => {
      const dueDate = parseISO(task.due_date);
      return (
        isAfter(dueDate, parseISO(startDate)) &&
        isBefore(dueDate, parseISO(endDate))
      );
    });
  }

  /**
   * Get tasks for a specific date
   */
  static getTasksForDate(
    date: string,
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[]
  ): Task[] {
    const tasks = this.getTasks(userRole, userId, familyIds);

    return tasks.filter((task) => task.due_date === date);
  }

  // ============================================================================
  // KANBAN BOARD
  // ============================================================================

  /**
   * Get tasks organized by status for Kanban board
   */
  static getTaskBoard(
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[],
    filters?: TaskFilter
  ): TaskBoardColumn[] {
    const tasks = this.getTasks(userRole, userId, familyIds, filters);

    const columns: TaskBoardColumn[] = [
      {
        status: 'todo',
        title: 'To Do',
        tasks: tasks.filter((t) => t.status === 'todo'),
        count: 0,
      },
      {
        status: 'in_progress',
        title: 'In Progress',
        tasks: tasks.filter((t) => t.status === 'in_progress'),
        count: 0,
      },
      {
        status: 'in_review',
        title: 'In Review',
        tasks: tasks.filter((t) => t.status === 'in_review'),
        count: 0,
      },
      {
        status: 'done',
        title: 'Done',
        tasks: tasks.filter((t) => t.status === 'done'),
        count: 0,
      },
    ];

    columns.forEach((col) => {
      col.count = col.tasks.length;
    });

    return columns;
  }

  // ============================================================================
  // TASK MANAGER — SNOOZE / FOLLOW-UP ENGINE
  // ============================================================================

  /**
   * Snooze a task — sets it to 'waiting_on_client' and records the follow-up date.
   * The task will disappear from the Active Desk until the snooze_date arrives.
   */
  static snoozeTask(
    taskId: string,
    snoozeDate: string,
    snoozeReason: string,
    currentUserId: string,
    currentUserName: string
  ): Task | null {
    const allTasks = this.getAllTasks();
    const taskIndex = allTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return null;

    const task = allTasks[taskIndex];
    const now = new Date().toISOString();

    const snoozedTask: Task = {
      ...task,
      status: 'waiting_on_client',
      snooze_date: snoozeDate,
      snooze_reason: snoozeReason,
      snooze_count: (task.snooze_count || 0) + 1,
      snoozed_at: now,
      is_follow_up_due: false,
      waitingOnWhat: snoozeReason,
      updated_at: now,
    };

    allTasks[taskIndex] = snoozedTask;
    this.saveTasks(allTasks);
    return snoozedTask;
  }

  /**
   * Resurface snoozed tasks — checks all snoozed tasks and flips any whose
   * snooze_date has arrived back to 'todo' with the is_follow_up_due flag.
   * Call this on dashboard load.
   */
  static resurfaceSnoozedTasks(
    currentUserId: string,
    currentUserName: string
  ): Task[] {
    const allTasks = this.getAllTasks();
    const now = new Date();
    const resurfaced: Task[] = [];

    allTasks.forEach((task, index) => {
      if (
        task.status === 'waiting_on_client' &&
        task.snooze_date &&
        !isBefore(now, startOfDay(parseISO(task.snooze_date)))
      ) {
        const updated: Task = {
          ...task,
          status: 'todo',
          is_follow_up_due: true,
          updated_at: now.toISOString(),
        };
        allTasks[index] = updated;
        resurfaced.push(updated);
      }
    });

    if (resurfaced.length > 0) {
      this.saveTasks(allTasks);
    }

    return resurfaced;
  }

  /**
   * Get stats for the Task Manager "Clean Desk" dashboard metrics row.
   */
  static getTaskManagerStats(
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[]
  ): TaskManagerStats {
    const tasks = this.getTasks(userRole, userId, familyIds);
    const now = new Date();
    const weekStart = startOfWeek(now);

    return {
      urgent_followups: tasks.filter(
        (t) => t.is_follow_up_due && t.status !== 'done'
      ).length,
      pending_client_action: tasks.filter(
        (t) =>
          t.status === 'waiting_on_client' ||
          t.status === 'pending_document_from_client' ||
          t.status === 'blocked'
      ).length,
      in_progress: tasks.filter(
        (t) => t.status === 'in_progress' || t.status === 'in_review'
      ).length,
      completed_this_week: tasks.filter(
        (t) =>
          t.status === 'done' &&
          t.completed_at &&
          isAfter(parseISO(t.completed_at), weekStart)
      ).length,
    };
  }

  /**
   * Get "Active Desk" tasks — only tasks the RM can act on right now.
   * Excludes snoozed/waiting tasks unless their follow-up date has arrived.
   */
  static getActiveDesk(
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[]
  ): Task[] {
    const tasks = this.getTasks(userRole, userId, familyIds);
    return tasks.filter(
      (t) =>
        t.status === 'todo' ||
        t.status === 'in_progress' ||
        t.status === 'in_review'
    );
  }

  /**
   * Get snoozed tasks that are still incubating (not yet resurfaced).
   */
  static getSnoozedTasks(
    userRole: 'admin' | 'rm' | 'family',
    userId: string,
    familyIds?: string[]
  ): Task[] {
    const tasks = this.getTasks(userRole, userId, familyIds);
    return tasks.filter(
      (t) =>
        (t.status === 'waiting_on_client' ||
          t.status === 'pending_document_from_client' ||
          t.status === 'blocked') &&
        !t.is_follow_up_due
    );
  }

  // ============================================================================
  // ACTIVITY LOG (SYNTHETIC)
  // ============================================================================

  /**
   * Generate a synthetic activity log from existing task fields.
   * No separate storage — derives entries from created_at, snoozed_at, completed_at, etc.
   */
  static getTaskActivityLog(taskId: string): TaskActivityLogEntry[] {
    const task = this.getTaskById(taskId);
    if (!task) return [];

    const entries: TaskActivityLogEntry[] = [];
    let entryIndex = 0;

    // 1. Created
    entries.push({
      id: `${taskId}-log-${entryIndex++}`,
      task_id: taskId,
      action_type: 'created',
      action_by: task.created_by,
      action_by_name: task.created_by_name,
      action_at: task.created_at,
      details: `Task created: "${task.title}"`,
      metadata: { operation_type: task.operation_type, priority: task.priority },
    });

    // 2. Assignment (if different from creator)
    if (task.assigned_at && task.assigned_by && task.assigned_by !== task.created_by) {
      entries.push({
        id: `${taskId}-log-${entryIndex++}`,
        task_id: taskId,
        action_type: 'assigned',
        action_by: task.assigned_by,
        action_by_name: task.assigned_by_name || 'System',
        action_at: task.assigned_at,
        details: `Assigned to ${task.assigned_to_name}`,
      });
    }

    // 3. Snooze events (we can infer snooze_count worth of snoozes, but only have the latest timestamp)
    if (task.snoozed_at && task.snooze_count && task.snooze_count > 0) {
      // If snoozed multiple times, show a summary for earlier snoozes
      if (task.snooze_count > 1) {
        entries.push({
          id: `${taskId}-log-${entryIndex++}`,
          task_id: taskId,
          action_type: 'snoozed',
          action_by: task.assigned_to,
          action_by_name: task.assigned_to_name,
          action_at: task.created_at, // Approximate — we only track the latest snooze
          details: `Previously snoozed ${task.snooze_count - 1} time${task.snooze_count > 2 ? 's' : ''}`,
        });
      }

      // Latest snooze
      entries.push({
        id: `${taskId}-log-${entryIndex++}`,
        task_id: taskId,
        action_type: 'snoozed',
        action_by: task.assigned_to,
        action_by_name: task.assigned_to_name,
        action_at: task.snoozed_at,
        details: `Snoozed — ${task.snooze_reason || 'No reason specified'}. Follow-up: ${task.snooze_date || 'not set'}`,
        metadata: { snooze_date: task.snooze_date, snooze_reason: task.snooze_reason },
      });
    }

    // 4. Resurfaced
    if (task.is_follow_up_due) {
      entries.push({
        id: `${taskId}-log-${entryIndex++}`,
        task_id: taskId,
        action_type: 'resurfaced',
        action_by: 'system',
        action_by_name: 'System',
        action_at: task.updated_at,
        details: 'Follow-up date arrived — task resurfaced to Active Desk',
      });
    }

    // 5. Status change to in_progress
    if (task.status === 'in_progress' || task.status === 'in_review' || task.status === 'done') {
      entries.push({
        id: `${taskId}-log-${entryIndex++}`,
        task_id: taskId,
        action_type: 'status_changed',
        action_by: task.assigned_to,
        action_by_name: task.assigned_to_name,
        action_at: task.updated_at,
        details: task.status === 'done' ? 'Marked as in progress' : `Status changed to "${task.status}"`,
      });
    }

    // 6. Completed
    if (task.status === 'done' && task.completed_at) {
      entries.push({
        id: `${taskId}-log-${entryIndex++}`,
        task_id: taskId,
        action_type: 'completed',
        action_by: task.completed_by || task.assigned_to,
        action_by_name: task.completed_by_name || task.assigned_to_name,
        action_at: task.completed_at,
        details: task.completion_notes ? `Completed — ${task.completion_notes}` : 'Task completed',
      });
    }

    // Sort chronologically
    entries.sort((a, b) => new Date(a.action_at).getTime() - new Date(b.action_at).getTime());

    return entries;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get all tasks from localStorage
   */
  static getAllTasks(): Task[] {
    return LocalStorageService.get<Task[]>(STORAGE_KEY, []);
  }

  /**
   * Save tasks to localStorage
   */
  static saveTasks(tasks: Task[]): void {
    LocalStorageService.set(STORAGE_KEY, tasks);
  }

  /**
   * Apply filters to task list
   */
  private static applyFilters(tasks: Task[], filters?: TaskFilter): Task[] {
    if (!filters) return tasks;

    let filtered = [...tasks];

    // Filter by status
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filtered = filtered.filter((task) =>
          (filters.status as TaskStatus[]).includes(task.status)
        );
      } else {
        filtered = filtered.filter((task) => task.status === filters.status);
      }
    }

    // Filter by assigned user
    if (filters.assigned_to) {
      filtered = filtered.filter(
        (task) => task.assigned_to === filters.assigned_to
      );
    }

    // Filter by family
    if (filters.family_id) {
      filtered = filtered.filter((task) => task.family_id === filters.family_id);
    }

    // Filter by context type
    if (filters.context_type) {
      filtered = filtered.filter(
        (task) => task.context_type === filters.context_type
      );
    }

    // Filter by priority
    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        filtered = filtered.filter((task) =>
          (filters.priority as TaskPriority[]).includes(task.priority)
        );
      } else {
        filtered = filtered.filter((task) => task.priority === filters.priority);
      }
    }

    // Filter by date range
    if (filters.due_date_from) {
      filtered = filtered.filter((task) =>
        isAfter(parseISO(task.due_date), parseISO(filters.due_date_from!))
      );
    }

    if (filters.due_date_to) {
      filtered = filtered.filter((task) =>
        isBefore(parseISO(task.due_date), parseISO(filters.due_date_to!))
      );
    }

    // Filter overdue only
    if (filters.overdue_only) {
      const now = new Date();
      filtered = filtered.filter(
        (task) =>
          task.status !== 'done' &&
          isAfter(now, parseISO(task.due_date))
      );
    }

    // Filter due today only
    if (filters.due_today_only) {
      filtered = filtered.filter(
        (task) =>
          task.status !== 'done' && isToday(parseISO(task.due_date))
      );
    }

    // Filter due this week only
    if (filters.due_this_week_only) {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      filtered = filtered.filter(
        (task) =>
          task.status !== 'done' &&
          isAfter(parseISO(task.due_date), weekStart) &&
          isBefore(parseISO(task.due_date), weekEnd)
      );
    }

    // Search by query
    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.family_name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  /**
   * Get family name by ID (would come from family service in real app)
   * For now, using mock data
   */
  private static getFamilyNameById(familyId: string): string {
    // This would normally call a FamilyService
    // For now, return a placeholder
    return `Family ${familyId.split('-')[1] || familyId.substring(0, 6)}`;
  }

  /**
   * Get user name by ID (would come from user service in real app)
   */
  private static getUserNameById(userId: string): string {
    // This would normally call a UserService
    // For now, return a placeholder
    return `User ${userId.split('-')[1] || userId.substring(0, 6)}`;
  }
}
