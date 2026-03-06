'use client';

// app/rm/tasks/page.tsx
// RM Task Manager — Clean layout with task creation

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ConsoleLayout } from '@/components/layout/ConsoleLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animation-utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Search, Plus, ListFilter, LayoutGrid, List, Activity, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { TaskService } from '@/lib/services/task-service';
import { TaskGroupList } from '@/components/task-manager/TaskGroupList';
import { TaskManagerCard } from '@/components/task-manager/TaskManagerCard';
import { TaskDetailSheet } from '@/components/task-manager/TaskDetailSheet';
import { CreateTaskDialog } from '@/components/task-manager/CreateTaskDialog';
import { TaskMetricCard } from '@/components/task-manager/TaskMetricCard';
import { KanbanBoard, KanbanColumnDef } from '@/components/task-manager/KanbanBoard';
import type { Task, TaskManagerStats, TaskOperationType, TaskCreateData, TaskStatus } from '@/types/tasks';
import { OPERATION_TYPE_LABELS } from '@/types/tasks';

// ── Families for task creation (mock — would come from a service in production) ──
const AVAILABLE_FAMILIES = [
    { id: 'family-001', name: 'Sharma Family' },
    { id: 'family-002', name: 'Patel Family' },
    { id: 'family-003', name: 'Gupta Family' },
    { id: 'family-004', name: 'Singh Family' },
    { id: 'family-005', name: 'Kumar Family' },
    { id: 'family-006', name: 'Joshi Family' },
    { id: 'family-007', name: 'Reddy Family' },
    { id: 'family-008', name: 'Malhotra Family' },
];

export default function RMTaskManagerPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [snoozedTasks, setSnoozedTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<TaskManagerStats>({
        urgent_followups: 0,
        pending_client_action: 0,
        in_progress: 0,
        completed_this_week: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [operationFilter, setOperationFilter] = useState<TaskOperationType | ''>('');
    const [viewMode, setViewMode] = useState<'kanban' | 'grouped' | 'grid'>('kanban');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const router = useRouter();

    const familyIds = useMemo(() => AVAILABLE_FAMILIES.map(f => f.id), []);

    const loadTasks = useCallback(() => {
        if (!user) return;
        const role = user.role === 'back_office' ? 'admin' : (user.role as 'admin' | 'rm');
        TaskService.resurfaceSnoozedTasks(user.id, user.name);
        const activeTasks = TaskService.getActiveDesk(role, user.id, familyIds);
        const snoozed = TaskService.getSnoozedTasks(role, user.id, familyIds);
        const taskStats = TaskService.getTaskManagerStats(role, user.id, familyIds);
        setTasks(activeTasks);
        setSnoozedTasks(snoozed);
        setStats(taskStats);
    }, [user, familyIds]);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    // ── Filters ──
    const filteredTasks = useMemo(() => {
        let result = tasks;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.family_name.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q)
            );
        }
        if (operationFilter) {
            result = result.filter(t => t.operation_type === operationFilter);
        }
        return result;
    }, [tasks, searchQuery, operationFilter]);

    const filteredSnoozed = useMemo(() => snoozedTasks, [snoozedTasks]);

    // ── Actions ──
    const handleSnooze = (taskId: string, date: string, reason: string) => {
        if (!user) return;
        TaskService.snoozeTask(taskId, date, reason, user.id, user.name);
        toast.success('Task snoozed', { description: `Follow-up: ${format(new Date(date), 'MMM d, yyyy')}` });
        loadTasks();
    };

    const handleStart = (taskId: string) => {
        if (!user) return;
        TaskService.moveTaskToStatus(taskId, 'in_progress', user.id, user.name);
        toast.info('Task started');
        loadTasks();
    };

    const handleComplete = (taskId: string) => {
        if (!user) return;
        TaskService.completeTask(taskId, user.id, user.name);
        toast.success('Task completed');
        loadTasks();
    };

    const handleCreateTask = (data: TaskCreateData) => {
        if (!user) return;
        TaskService.createTask({
            ...data,
            created_by: user.id,
            created_by_name: user.name,
        } as any);
        toast.success('Task created', { description: data.title });
        loadTasks();
    };

    // Unique operation types for filter chips
    const availableOperations = useMemo(() => {
        const ops = new Set<TaskOperationType>();
        [...tasks, ...snoozedTasks].forEach(t => { if (t.operation_type) ops.add(t.operation_type); });
        return Array.from(ops);
    }, [tasks, snoozedTasks]);

    const totalActive = tasks.length;

    // Kanban Columns
    const kanbanColumns: KanbanColumnDef[] = [
        { id: 'todo', label: 'To Do', dotColor: 'bg-slate-300' },
        { id: 'in_progress', label: 'In Progress', dotColor: 'bg-blue-500' },
        { id: 'in_review', label: 'In Review', dotColor: 'bg-indigo-500' },
        { id: 'pending_document_from_client', label: 'Pending Client', dotColor: 'bg-amber-500' },
        { id: 'waiting_on_client', label: 'Waiting', dotColor: 'bg-orange-500' },
        { id: 'blocked', label: 'Blocked', dotColor: 'bg-red-500' },
        { id: 'done', label: 'Done', dotColor: 'bg-emerald-500' },
    ];

    const handleKanbanMove = (taskId: string, newStatus: TaskStatus) => {
        if (!user) return;
        TaskService.moveTaskToStatus(taskId, newStatus, user.id, user.name);
        loadTasks();
    };

    return (
        <ConsoleLayout>
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-5 pb-20 p-6 md:p-8"
            >
                {/* ── Compact Header ── */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Tasks
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manage and track your active workflows
                        </p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        New Task
                    </Button>
                </div>

                {/* ── Metric Cards Dashboard ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <TaskMetricCard
                        title="Total Active"
                        value={totalActive}
                        icon={List}
                        trendInfo={`${snoozedTasks.length} snoozed`}
                        trendType="neutral"
                        iconContainerClassName="bg-blue-50 dark:bg-blue-900/20"
                        iconClassName="text-blue-600 dark:text-blue-400"
                    />
                    <TaskMetricCard
                        title="In Progress"
                        value={stats.in_progress}
                        icon={Activity}
                        trendInfo="+12% from last week"
                        trendType="up"
                        iconContainerClassName="bg-indigo-50 dark:bg-indigo-900/20"
                        iconClassName="text-indigo-600 dark:text-indigo-400"
                    />
                    <TaskMetricCard
                        title="Action Required"
                        value={stats.urgent_followups}
                        icon={AlertTriangle}
                        trendInfo="Follow-ups due"
                        trendType={stats.urgent_followups > 0 ? "down" : "neutral"}
                        iconContainerClassName="bg-red-50 dark:bg-red-900/20"
                        iconClassName="text-red-600 dark:text-red-400"
                    />
                    <TaskMetricCard
                        title="Completed"
                        value={stats.completed_this_week}
                        icon={CheckCircle2}
                        trendInfo="This week"
                        trendType="up"
                        iconContainerClassName="bg-emerald-50 dark:bg-emerald-900/20"
                        iconClassName="text-emerald-600 dark:text-emerald-400"
                    />
                </div>

                {/* ── Search & Filters ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <div className="relative flex-1 min-w-0 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks, clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-9 bg-muted/50 border-transparent focus:bg-background"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <ListFilter className="h-3.5 w-3.5 text-muted-foreground mr-0.5" />
                            <button
                                onClick={() => setOperationFilter('')}
                                className={cn(
                                    'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                                    !operationFilter
                                        ? 'bg-foreground text-background border-foreground'
                                        : 'bg-background text-muted-foreground border-input hover:bg-muted'
                                )}
                            >
                                All
                            </button>
                            {availableOperations.map(op => (
                                <button
                                    key={op}
                                    onClick={() => setOperationFilter(operationFilter === op ? '' : op)}
                                    className={cn(
                                        'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                                        operationFilter === op
                                            ? 'bg-foreground text-background border-foreground'
                                            : 'bg-background text-muted-foreground border-input hover:bg-muted'
                                    )}
                                >
                                    {OPERATION_TYPE_LABELS[op]}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center border border-input rounded-lg ml-auto bg-background p-1">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={cn(
                                    'px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5',
                                    viewMode === 'kanban' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                                Board
                            </button>
                            <button
                                onClick={() => setViewMode('grouped')}
                                className={cn(
                                    'px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5',
                                    viewMode === 'grouped' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <List className="h-3.5 w-3.5" />
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Task Content ── */}
                {viewMode === 'kanban' ? (
                    <KanbanBoard
                        tasks={filteredTasks}
                        columns={kanbanColumns}
                        onTaskClick={(task) => router.push(`/rm/tasks/${task.id}`)}
                        onTaskMove={handleKanbanMove}
                    />
                ) : viewMode === 'grouped' ? (
                    <TaskGroupList
                        tasks={filteredTasks}
                        snoozedTasks={filteredSnoozed}
                        onTaskClick={(task) => router.push(`/rm/tasks/${task.id}`)}
                        onSnooze={handleSnooze}
                        onStart={handleStart}
                        onComplete={handleComplete}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {filteredTasks.map(task => (
                            <TaskManagerCard
                                key={task.id}
                                task={task}
                                onClick={(t) => router.push(`/rm/tasks/${t.id}`)}
                                onSnooze={handleSnooze}
                                onStart={handleStart}
                                onComplete={handleComplete}
                            />
                        ))}
                        {filteredTasks.length === 0 && (
                            <div className="col-span-full text-center py-16">
                                <p className="text-muted-foreground">No tasks match your filters.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Detail Sheet ── */}
                <TaskDetailSheet
                    task={selectedTask}
                    open={!!selectedTask}
                    onOpenChange={(open) => { if (!open) setSelectedTask(null); }}
                    onSnooze={(taskId, date, reason) => { handleSnooze(taskId, date, reason); setSelectedTask(null); }}
                    onStart={(taskId) => { handleStart(taskId); setSelectedTask(null); }}
                    onComplete={(taskId) => { handleComplete(taskId); setSelectedTask(null); }}
                />

                {/* ── Create Task Dialog ── */}
                <CreateTaskDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    onSubmit={handleCreateTask}
                    families={AVAILABLE_FAMILIES}
                    currentUserId={user?.id || ''}
                    currentUserName={user?.name || ''}
                />
            </motion.div>
        </ConsoleLayout>
    );
}
