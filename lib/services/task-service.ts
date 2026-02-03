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
    taskData: TaskCreateData,
    currentUserId: string,
    currentUserName: string
  ): Task {
    const allTasks = this.getAllTasks();
    const now = new Date().toISOString();

    // Find assigned user name (would come from user service in real app)
    const assignedToName = taskData.assigned_to === currentUserId
      ? currentUserName
      : this.getUserNameById(taskData.assigned_to);

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title,
      description: taskData.description,
      context_type: taskData.context_type,
      family_id: taskData.family_id,
      family_name: this.getFamilyNameById(taskData.family_id),
      created_by: currentUserId,
      created_by_name: currentUserName,
      assigned_to: taskData.assigned_to,
      assigned_to_name: assignedToName,
      status: 'todo', // Always start as todo
      priority: taskData.priority,
      due_date: taskData.due_date,
      due_time: taskData.due_time,
      tags: taskData.tags || [],
      notes: taskData.notes,
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
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get all tasks from localStorage
   */
  private static getAllTasks(): Task[] {
    return LocalStorageService.get<Task[]>(STORAGE_KEY, []);
  }

  /**
   * Save tasks to localStorage
   */
  private static saveTasks(tasks: Task[]): void {
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
