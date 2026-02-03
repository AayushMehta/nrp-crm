// Task Management Page
// Main page with Kanban board, stats, and filters

"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskDetailDialog } from "@/components/tasks/TaskDetailDialog";
import { TaskCreateDialog } from "@/components/tasks/TaskCreateDialog";
import { TaskService } from "@/lib/services/task-service";
import { SampleDataService } from "@/lib/services/sample-data-service";
import { useAuth } from "@/context/AuthContext";
import { Plus, LayoutGrid, Calendar as CalendarIcon, Filter, Circle, Loader2, Eye, FileQuestion, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Task, TaskCreateData, TaskUpdateData, TaskStatus } from "@/types/tasks";
import { UserFlowSection } from "@/components/ui/user-flow-section";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<"kanban" | "calendar">("kanban");

  // Load tasks on mount
  useEffect(() => {
    if (!user) return;

    // Initialize sample data if needed
    SampleDataService.initializeSampleTasks();

    // Load tasks based on user role
    const userRole = user.role as "admin" | "rm" | "family";
    const familyIds = userRole === "rm" ? ["family-001", "family-002", "family-003"] : undefined; // Mock family IDs

    const loadedTasks = TaskService.getTasks(userRole, user.id, familyIds);
    setTasks(loadedTasks);
  }, [user]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!user) return null;

    const userRole = user.role as "admin" | "rm" | "family";
    const familyIds = userRole === "rm" ? ["family-001", "family-002", "family-003"] : undefined;

    return TaskService.getStats(userRole, user.id, familyIds);
  }, [tasks, user]);

  // Handlers
  const handleCreateTask = (taskData: TaskCreateData) => {
    if (!user) return;

    const newTask = TaskService.createTask(taskData, user.id, user.name);
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (taskId: string, updates: TaskUpdateData) => {
    if (!user) return;

    const updatedTask = TaskService.updateTask(taskId, updates, user.id, user.name);
    if (updatedTask) {
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      setSelectedTask(updatedTask);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const success = TaskService.deleteTask(taskId);
    if (success) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      setSelectedTask(null);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    if (!user) return;

    const completedTask = TaskService.completeTask(taskId, user.id, user.name);
    if (completedTask) {
      setTasks(tasks.map((t) => (t.id === taskId ? completedTask : t)));
    }
  };

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    if (!user) return;

    const movedTask = TaskService.moveTaskToStatus(taskId, newStatus, user.id, user.name);
    if (movedTask) {
      setTasks(tasks.map((t) => (t.id === taskId ? movedTask : t)));
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailDialogOpen(true);
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Please log in to view tasks</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Task Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage tasks across all families
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="default">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="default">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Stats Cards - All 7 Task Statuses */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6 px-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    To Do
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stats.by_status.todo}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Circle className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {stats.by_status.in_progress}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Loader2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    In Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                    {stats.by_status.in_review}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <Eye className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending Doc
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {stats.by_status.pending_document_from_client}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <FileQuestion className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Waiting
                  </p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {stats.by_status.waiting_on_client}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Blocked
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {stats.by_status.blocked}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Done
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.by_status.done}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content - Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "kanban" | "calendar")} className="flex-1">
          <TabsList className="mb-4">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban Board
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="flex-1 mt-0">
            <KanbanBoard
              tasks={tasks}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
            />
          </TabsContent>

          <TabsContent value="calendar" className="flex-1 mt-0">
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-center">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Calendar View Coming Soon
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This feature will be implemented in Phase 4
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <TaskCreateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreate={handleCreateTask}
          defaultAssignedTo={user.id}
        />

        {selectedTask && (
          <TaskDetailDialog
            task={selectedTask}
            open={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onComplete={handleCompleteTask}
          />
        )}

        {/* User Flow Section */}
        <UserFlowSection
          pageName="Task Management (Admin & RM)"
          description="7-state Kanban board for operational task management"
          userFlow={[
            {
              step: "View Kanban Board",
              description: "7 columns shown: To Do, In Progress, In Review, Pending Document from Client, Waiting on Client, Blocked, Done. Tasks shown as cards with counts in column headers."
            },
            {
              step: "View Task Details",
              description: "Each card shows task title, family name, priority badge, due date, and assigned user name."
            },
            {
              step: "Create New Task",
              description: "Add tasks to the board.",
              subSteps: [
                "Click 'New Task'",
                "Enter task title and description",
                "Select family",
                "Choose context type (Onboarding, Compliance, Document, Meeting, General)",
                "Assign to user or team",
                "Set priority (Low, Medium, High, Urgent)",
                "Set due date (optional)",
                "Task starts in 'To Do' column"
              ]
            },
            {
              step: "Move Tasks (Drag & Drop)",
              description: "Click and hold task card, drag to target column, release to drop. Status updates automatically. For Blocked, Waiting on Client, or Pending Document, system prompts for reason/type."
            },
            {
              step: "Edit or Complete Task",
              description: "Click task card to open detail view. Edit any fields or drag to 'Done' column to complete. System records completion time and archives after 30 days."
            }
          ]}
          bestPractices={[
            "Update task status regularly",
            "Use appropriate context types",
            "Set realistic due dates",
            "Provide clear blocking reasons",
            "Move to 'In Progress' when starting work",
            "Use 'In Review' for tasks awaiting approval",
            "Keep 'Done' column clean (auto-archives after 30 days)"
          ]}
          roleSpecific={{
            role: "Access Control",
            notes: [
              "Admin: All tasks across all families",
              "RM: Tasks for assigned families only",
              "Family: No access (internal tool)",
              "7-state workflow covers all operational scenarios",
              "Drag-and-drop makes status updates quick and visual"
            ]
          }}
        />
      </div>
    </AppLayout>
  );
}
