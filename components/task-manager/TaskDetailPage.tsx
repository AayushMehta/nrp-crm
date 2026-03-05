'use client';

// TaskDetailPage — Shared full-page task detail & edit component
// Used by /rm/tasks/[id], /admin/tasks/[id], /back-office/task-manager/[id]

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ConsoleLayout } from '@/components/layout/ConsoleLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animation-utils';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import {
    ArrowLeft, Save, Calendar, Clock, User, Users, Flag, Tag,
    CheckCircle2, Play, Bell, Pencil, X, AlertTriangle,
} from 'lucide-react';
import { TaskService } from '@/lib/services/task-service';
import { TaskActivityTimeline } from '@/components/task-manager/TaskActivityTimeline';
import type { Task, TaskPriority, TaskStatus, TaskOperationType } from '@/types/tasks';
import { OPERATION_TYPE_LABELS, OPERATION_TYPE_COLORS } from '@/types/tasks';

// Safe date formatter — returns fallback if date is invalid
function safeFormat(dateStr: string | undefined, fmt: string, fallback = 'N/A'): string {
    if (!dateStr) return fallback;
    try {
        const d = parseISO(dateStr);
        if (isNaN(d.getTime())) return fallback;
        return format(d, fmt);
    } catch {
        return fallback;
    }
}

// ── Props ──

interface TaskDetailPageProps {
    taskId: string;
    backHref: string; // e.g. '/rm/tasks', '/admin/tasks', '/back-office/task-manager'
    currentUserId: string;
    currentUserName: string;
}

// ── Status display helpers ──

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: typeof Clock }> = {
    todo: { label: 'To Do', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Play },
    in_review: { label: 'In Review', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: Flag },
    pending_document_from_client: { label: 'Pending Document', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
    waiting_on_client: { label: 'Waiting on Client', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Users },
    blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
    done: { label: 'Done', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
    low: { label: 'Low', color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
};

const ALL_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'pending_document_from_client', 'waiting_on_client', 'blocked', 'done'];
const ALL_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

// ── Component ──

export function TaskDetailPage({ taskId, backHref, currentUserId, currentUserName }: TaskDetailPageProps) {
    const router = useRouter();
    const [task, setTask] = useState<Task | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
    const [editStatus, setEditStatus] = useState<TaskStatus>('todo');
    const [editDueDate, setEditDueDate] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editFollowUp, setEditFollowUp] = useState(false);
    const [editFollowUpDate, setEditFollowUpDate] = useState('');
    const [editFollowUpReason, setEditFollowUpReason] = useState('');

    // Load task
    useEffect(() => {
        const allTasks = TaskService.getAllTasks();
        const found = allTasks.find(t => t.id === taskId);
        if (found) {
            setTask(found);
            populateEditFields(found);
        }
        setLoading(false);
    }, [taskId]);

    const populateEditFields = (t: Task) => {
        setEditTitle(t.title);
        setEditDescription(t.description || '');
        setEditPriority(t.priority);
        setEditStatus(t.status);
        setEditDueDate(t.due_date);
        setEditNotes(t.notes || '');
        setEditFollowUp(!!t.needs_follow_up);
        setEditFollowUpDate(t.follow_up_date || '');
        setEditFollowUpReason(t.follow_up_reason || '');
    };

    const handleSave = () => {
        if (!task) return;
        const updated = TaskService.updateTask(
            task.id,
            {
                title: editTitle,
                description: editDescription || undefined,
                priority: editPriority,
                status: editStatus,
                due_date: editDueDate,
                notes: editNotes || undefined,
            },
            currentUserId,
            currentUserName,
        );
        if (updated) {
            // Manually set follow-up fields (not in TaskUpdateData yet)
            const allTasks = TaskService.getAllTasks();
            const idx = allTasks.findIndex(t => t.id === task.id);
            if (idx >= 0) {
                allTasks[idx].needs_follow_up = editFollowUp;
                allTasks[idx].follow_up_date = editFollowUp ? editFollowUpDate : undefined;
                allTasks[idx].follow_up_reason = editFollowUp ? editFollowUpReason : undefined;
                TaskService.saveTasks(allTasks);
            }
            setTask({ ...updated, needs_follow_up: editFollowUp, follow_up_date: editFollowUp ? editFollowUpDate : undefined, follow_up_reason: editFollowUp ? editFollowUpReason : undefined });
            setIsEditing(false);
            toast.success('Task updated');
        }
    };

    const handleCancel = () => {
        if (task) populateEditFields(task);
        setIsEditing(false);
    };

    const handleQuickAction = (action: 'start' | 'complete') => {
        if (!task) return;
        if (action === 'start') {
            TaskService.moveTaskToStatus(task.id, 'in_progress', currentUserId, currentUserName);
            toast.info('Task started');
        } else {
            TaskService.completeTask(task.id, currentUserId, currentUserName);
            toast.success('Task completed');
        }
        // Reload
        const updated = TaskService.getAllTasks().find(t => t.id === task.id);
        if (updated) { setTask(updated); populateEditFields(updated); }
    };

    // Activity log
    const activityLog = useMemo(() => {
        if (!task) return [];
        return TaskService.getTaskActivityLog(task.id);
    }, [task]);

    if (loading) {
        return (
            <ConsoleLayout hideContextPanel>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            </ConsoleLayout>
        );
    }

    if (!task) {
        return (
            <ConsoleLayout hideContextPanel>
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <p className="text-muted-foreground">Task not found</p>
                    <Button variant="outline" onClick={() => router.push(backHref)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tasks
                    </Button>
                </div>
            </ConsoleLayout>
        );
    }

    const statusCfg = STATUS_CONFIG[task.status];
    const priorityCfg = PRIORITY_CONFIG[task.priority];
    const opColors = task.operation_type ? OPERATION_TYPE_COLORS[task.operation_type] : null;
    const opLabel = task.operation_type
        ? (task.operation_type === 'other' && task.custom_type_label ? task.custom_type_label : OPERATION_TYPE_LABELS[task.operation_type])
        : null;
    const dueDate = parseISO(task.due_date);
    const dueDateValid = !isNaN(dueDate.getTime());

    return (
        <ConsoleLayout hideContextPanel>
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-6 md:p-8 pb-20 max-w-4xl mx-auto"
            >
                {/* ── Top bar ── */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" size="sm" onClick={() => router.push(backHref)} className="text-muted-foreground hover:text-foreground -ml-2">
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Back to Tasks
                    </Button>
                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                Edit
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" onClick={handleCancel}>
                                    <X className="h-3.5 w-3.5 mr-1.5" />
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Save className="h-3.5 w-3.5 mr-1.5" />
                                    Save
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Premium Header section ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-800 shadow-sm mb-8">
                    <div className="flex flex-col gap-6">
                        {/* Title Row */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    {opLabel && opColors && (
                                        <Badge className={cn('text-[10px] font-semibold tracking-wide border-0 shadow-sm', opColors.bg, opColors.text)}>
                                            {opLabel}
                                        </Badge>
                                    )}
                                    <Badge className={cn('text-[10px] uppercase font-bold tracking-wider border shadow-sm', statusCfg.color)}>
                                        {statusCfg.label}
                                    </Badge>
                                    <Badge className={cn('text-[10px] uppercase font-bold tracking-wider border shadow-sm', priorityCfg.color)}>
                                        {priorityCfg.label}
                                    </Badge>
                                </div>
                                {isEditing ? (
                                    <Input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="text-2xl md:text-3xl font-bold tracking-tight h-auto py-2 border-dashed"
                                    />
                                ) : (
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                                        {task.title}
                                    </h1>
                                )}
                            </div>

                            {/* Quick actions (when not editing) */}
                            {!isEditing && task.status !== 'done' && (
                                <div className="flex items-center gap-2 shrink-0">
                                    {task.status === 'todo' && (
                                        <Button size="sm" variant="outline" onClick={() => handleQuickAction('start')} className="h-9 shadow-sm">
                                            <Play className="h-4 w-4 mr-2" /> Start
                                        </Button>
                                    )}
                                    <Button size="sm" onClick={() => handleQuickAction('complete')} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Complete
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Metadata Row (Horizontal Stack) */}
                        <div className="flex items-center flex-wrap gap-x-8 gap-y-5 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                            {/* Assigned To */}
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-sm font-bold shadow-sm">
                                    {task.assigned_to_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Assigned To</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.assigned_to_name}</p>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />

                            {/* Due Date */}
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-sm">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Due Date</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {dueDateValid ? format(dueDate, 'MMM d, yyyy') : task.due_date}
                                    </p>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />

                            {/* Family */}
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Client Family</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.family_name}</p>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />

                            {/* Created By */}
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shadow-sm">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Created By</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.created_by_name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Content Grid ── */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Main Content */}
                    <div className="space-y-8 bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-800 shadow-sm">

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Description</Label>
                            {isEditing ? (
                                <Textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Task description..."
                                    rows={4}
                                    className="resize-none border-dashed"
                                />
                            ) : (
                                <p className="text-sm text-foreground leading-relaxed">
                                    {task.description || <span className="text-muted-foreground italic">No description</span>}
                                </p>
                            )}
                        </div>

                        {/* Edit fields: Status + Priority + Due date */}
                        {isEditing && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg border border-dashed border-border bg-muted/20">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <Select value={editStatus} onValueChange={(v) => setEditStatus(v as TaskStatus)}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ALL_STATUSES.map(s => (
                                                <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Priority</Label>
                                    <Select value={editPriority} onValueChange={(v) => setEditPriority(v as TaskPriority)}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ALL_PRIORITIES.map(p => (
                                                <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p].label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                                    <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="h-9" />
                                </div>
                            </div>
                        )}

                        {/* Follow-up section */}
                        {isEditing ? (
                            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-muted-foreground" />
                                        <Label htmlFor="edit-follow-up" className="text-sm font-medium cursor-pointer">
                                            Follow-up Needed
                                        </Label>
                                    </div>
                                    <Switch id="edit-follow-up" checked={editFollowUp} onCheckedChange={setEditFollowUp} />
                                </div>
                                {editFollowUp && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Follow-up Date</Label>
                                            <Input type="date" value={editFollowUpDate} onChange={(e) => setEditFollowUpDate(e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Reason</Label>
                                            <Input value={editFollowUpReason} onChange={(e) => setEditFollowUpReason(e.target.value)} placeholder="e.g. Waiting for PAN..." />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : task.needs_follow_up ? (
                            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
                                    <Bell className="h-4 w-4" />
                                    <span className="text-sm font-medium">Follow-up Required</span>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">
                                    {task.follow_up_date && `Due: ${safeFormat(task.follow_up_date, 'MMM d, yyyy')}`}
                                    {task.follow_up_reason && ` · ${task.follow_up_reason}`}
                                </p>
                            </div>
                        ) : null}

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Notes</Label>
                            {isEditing ? (
                                <Textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={3}
                                    className="resize-none border-dashed"
                                />
                            ) : (
                                <p className="text-sm text-foreground">
                                    {task.notes || <span className="text-muted-foreground italic">No notes</span>}
                                </p>
                            )}
                        </div>

                        {/* Activity Timeline */}
                        <div className="space-y-3 pt-4 border-t border-border/40">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Activity</h3>
                            <TaskActivityTimeline entries={activityLog} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </ConsoleLayout>
    );
}
