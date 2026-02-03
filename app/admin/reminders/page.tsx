"use client";

// app/admin/reminders/page.tsx
// Admin reminders page with full reminder management

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReminderList } from "@/components/reminders/ReminderList";
import { ReminderDialog, ReminderFormData } from "@/components/reminders/ReminderDialog";
import { ReminderSnoozeDialog } from "@/components/reminders/ReminderSnoozeDialog";
import { Reminder } from "@/types/reminders";
import { ReminderService } from "@/lib/services/reminder-service";
import { ReminderAutomationService } from "@/lib/services/reminder-automation-service";
import { useAuth } from "@/context/AuthContext";
import { Plus, Bell, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { UserFlowSection } from "@/components/ui/user-flow-section";

export default function RemindersPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSnoozeDialogOpen, setIsSnoozeDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    // Initialize default triggers on first load
    ReminderAutomationService.initializeDefaultTriggers();
  }, []);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCreateReminder = (data: ReminderFormData) => {
    if (!user) return;

    const dueDateTime = `${data.due_date}T${data.reminder_time}:00`;

    ReminderService.createReminder({
      title: data.title,
      description: data.description || undefined,
      context_type: data.context_type,
      family_name: data.family_name || undefined,
      created_by: user.id,
      created_by_name: user.name,
      assigned_to: user.id, // For now, assign to self; in production, you'd select a user
      assigned_to_name: data.assigned_to_name,
      due_date: dueDateTime,
      reminder_time: data.reminder_time,
      priority: data.priority,
      is_recurring: data.is_recurring,
      recurrence_pattern: data.recurrence_pattern,
      recurrence_interval: data.recurrence_interval,
      recurrence_end_date: data.recurrence_end_date,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : undefined,
      notes: data.notes || undefined,
    });

    toast.success("Reminder Created", {
      description: `"${data.title}" has been created successfully`,
    });

    handleRefresh();
  };

  const handleCompleteReminder = (reminder: Reminder) => {
    if (!user) return;

    ReminderService.completeReminder(reminder.id, user.id);

    toast.success("Reminder Completed", {
      description: `"${reminder.title}" marked as completed`,
    });

    handleRefresh();
  };

  const handleSnoozeReminder = (snoozeUntil: Date, reason?: string) => {
    if (!selectedReminder || !user) return;

    ReminderService.snoozeReminder(
      selectedReminder.id,
      user.id,
      snoozeUntil,
      reason
    );

    toast.success("Reminder Snoozed", {
      description: `Will remind you again at ${snoozeUntil.toLocaleString()}`,
    });

    setSelectedReminder(null);
    handleRefresh();
  };

  const handleDeleteReminder = (reminder: Reminder) => {
    if (confirm(`Are you sure you want to delete "${reminder.title}"?`)) {
      ReminderService.deleteReminder(reminder.id);

      toast.success("Reminder Deleted", {
        description: `"${reminder.title}" has been deleted`,
      });

      handleRefresh();
    }
  };

  const handleOpenSnooze = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsSnoozeDialogOpen(true);
  };

  // Get stats
  const stats = user ? ReminderService.getStats(user.id) : null;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
            <p className="text-muted-foreground">
              Manage your tasks and automated reminders
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Reminder
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard
              title="Overdue"
              value={stats.overdue}
              description="Needs attention"
              icon={AlertTriangle}
              iconClassName="text-red-600"
            />

            <StatCard
              title="Due Today"
              value={stats.due_today}
              description="Today's tasks"
              icon={Clock}
              iconClassName="text-yellow-600"
            />

            <StatCard
              title="Due This Week"
              value={stats.due_this_week}
              description="Upcoming"
              icon={Bell}
              iconClassName="text-blue-600"
            />

            <StatCard
              title="Completed This Month"
              value={stats.completed_this_month}
              description="This month"
              icon={CheckCircle}
              iconClassName="text-green-600"
            />
          </div>
        )}

        {/* Reminders List */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle>My Reminders</CardTitle>
            <CardDescription>
              All your reminders organized by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReminderList
              key={refreshKey}
              userId={user?.id}
              onComplete={handleCompleteReminder}
              onSnooze={handleOpenSnooze}
              onDelete={handleDeleteReminder}
              showFilters={true}
            />
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <ReminderDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSave={handleCreateReminder}
        />

        {/* Snooze Dialog */}
        <ReminderSnoozeDialog
          open={isSnoozeDialogOpen}
          onOpenChange={setIsSnoozeDialogOpen}
          reminder={selectedReminder}
          onSnooze={handleSnoozeReminder}
        />

        {/* User Flow Section */}
        <UserFlowSection
          pageName="Admin Reminders"
          description="System-wide reminder management with recurring patterns"
          userFlow={[
            {
              step: "View Reminder Metrics",
              description: "Track overdue, due today, due this week, and completed reminders."
            },
            {
              step: "Review Reminder List",
              description: "Browse reminders grouped by status (Overdue, Today, This Week, Later, Completed, Snoozed) with priority badges."
            },
            {
              step: "Create New Reminder",
              description: "Set up manual or recurring reminders.",
              subSteps: [
                "Enter title and description",
                "Select family (optional) and priority",
                "Set due date and time",
                "Enable recurring if needed (Daily, Weekly, Monthly, Yearly)",
                "Set end condition (End by date, End after N occurrences, Never end)",
                "Assign to user"
              ]
            },
            {
              step: "Manage Reminders",
              description: "Complete, snooze, edit, or delete reminders as needed."
            },
            {
              step: "Filter and Search",
              description: "Filter by priority, status, family, or search by title/description."
            }
          ]}
          bestPractices={[
            "Check overdue reminders daily",
            "Set appropriate priority levels",
            "Use recurring reminders for regular tasks",
            "Snooze instead of ignoring",
            "Add completion notes",
            "Review 'Due Today' first thing each morning"
          ]}
          roleSpecific={{
            role: "Admin",
            notes: [
              "System automatically creates reminders for document uploads, rejections, checklist completions, and meetings",
              "All automated reminders appear in your list",
              "Recurring reminders continue until end condition met",
              "Can view and manage reminders for all families"
            ]
          }}
        />
      </div>
    </AppLayout>
  );
}
