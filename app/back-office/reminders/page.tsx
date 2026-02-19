'use client';

// app/back-office/reminders/page.tsx
// Back Office reminders page — reuses existing reminder components

import { useState, useEffect } from 'react';
import { ConsoleLayout } from '@/components/layout/ConsoleLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { ReminderList } from '@/components/reminders/ReminderList';
import { ReminderDialog, ReminderFormData } from '@/components/reminders/ReminderDialog';
import { ReminderSnoozeDialog } from '@/components/reminders/ReminderSnoozeDialog';
import { Reminder } from '@/types/reminders';
import { ReminderService } from '@/lib/services/reminder-service';
import { ReminderAutomationService } from '@/lib/services/reminder-automation-service';
import { useAuth } from '@/context/AuthContext';
import { Plus, Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function BackOfficeRemindersPage() {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSnoozeDialogOpen, setIsSnoozeDialogOpen] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

    useEffect(() => {
        ReminderAutomationService.initializeDefaultTriggers();
    }, []);

    const handleRefresh = () => setRefreshKey(prev => prev + 1);

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
            assigned_to: user.id,
            assigned_to_name: data.assigned_to_name,
            due_date: dueDateTime,
            reminder_time: data.reminder_time,
            priority: data.priority,
            is_recurring: data.is_recurring,
            recurrence_pattern: data.recurrence_pattern,
            recurrence_interval: data.recurrence_interval,
            recurrence_end_date: data.recurrence_end_date,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()) : undefined,
            notes: data.notes || undefined,
        });

        toast.success('Reminder Created', {
            description: `"${data.title}" has been created successfully`,
        });

        handleRefresh();
    };

    const handleCompleteReminder = (reminder: Reminder) => {
        if (!user) return;
        ReminderService.completeReminder(reminder.id, user.id);
        toast.success('Reminder Completed', {
            description: `"${reminder.title}" marked as completed`,
        });
        handleRefresh();
    };

    const handleSnoozeReminder = (snoozeUntil: Date, reason?: string) => {
        if (!selectedReminder || !user) return;
        ReminderService.snoozeReminder(selectedReminder.id, user.id, snoozeUntil, reason);
        toast.success('Reminder Snoozed', {
            description: `Will remind you again at ${snoozeUntil.toLocaleString()}`,
        });
        setSelectedReminder(null);
        handleRefresh();
    };

    const handleDeleteReminder = (reminder: Reminder) => {
        if (confirm(`Are you sure you want to delete "${reminder.title}"?`)) {
            ReminderService.deleteReminder(reminder.id);
            toast.success('Reminder Deleted', {
                description: `"${reminder.title}" has been deleted`,
            });
            handleRefresh();
        }
    };

    const handleOpenSnooze = (reminder: Reminder) => {
        setSelectedReminder(reminder);
        setIsSnoozeDialogOpen(true);
    };

    const stats = user ? ReminderService.getStats(user.id) : null;

    return (
        <ConsoleLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Reminders</h1>
                            <p className="text-muted-foreground mt-2 text-lg">Manage your task reminders and follow-ups</p>
                        </div>
                        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                            <Plus className="h-4 w-4 mr-2" />
                            New Reminder
                        </Button>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid gap-6 md:grid-cols-4">
                            <StatCard title="Overdue" value={stats.overdue} description="Needs attention" icon={AlertTriangle} iconClassName="text-red-600" />
                            <StatCard title="Due Today" value={stats.due_today} description="Today's tasks" icon={Clock} iconClassName="text-yellow-600" />
                            <StatCard title="Due This Week" value={stats.due_this_week} description="Upcoming" icon={Bell} iconClassName="text-blue-600" />
                            <StatCard title="Completed" value={stats.completed_this_month} description="This month" icon={CheckCircle} iconClassName="text-green-600" />
                        </div>
                    )}

                    {/* Reminder List */}
                    <Card className="rounded-xl border shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle>My Reminders</CardTitle>
                            <CardDescription>All reminders organized by status</CardDescription>
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

                    {/* Create Dialog */}
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
                </motion.div>
            </div>
        </ConsoleLayout>
    );
}
