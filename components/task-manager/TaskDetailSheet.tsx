'use client';

// TaskDetailSheet — Sliding right panel for deep-diving into a task
// Shows full metadata, type-specific fields, action buttons, and activity timeline

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    User, Calendar, Clock, Play, CheckCircle2, AlertCircle,
    Briefcase, Hash, FileText, MapPin, Phone, IndianRupee,
    Building2, CreditCard, Users, ClipboardList,
} from 'lucide-react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import type { Task, TaskActivityLogEntry } from '@/types/tasks';
import {
    OPERATION_TYPE_LABELS,
    OPERATION_TYPE_COLORS,
    TASK_PRIORITY_LABELS,
    TASK_STATUS_LABELS,
} from '@/types/tasks';
import { TaskService } from '@/lib/services/task-service';
import { SnoozePopover } from './SnoozePopover';
import { TaskActivityTimeline } from './TaskActivityTimeline';

// ── Props ──

interface TaskDetailSheetProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSnooze?: (taskId: string, date: string, reason: string) => void;
    onStart?: (taskId: string) => void;
    onComplete?: (taskId: string) => void;
}

// ── Priority badge styles ──

const PRIORITY_STYLES: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_STYLES: Record<string, string> = {
    todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending_document_from_client: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    waiting_on_client: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

// ── Type-Specific Metadata per Operation Type ──

interface MetadataField {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    getValue: (task: Task) => string;
}

function getTypeSpecificFields(task: Task): MetadataField[] {
    const base: MetadataField[] = [
        { label: 'Client', icon: User, getValue: (t) => t.family_name },
        { label: 'Assigned To', icon: Briefcase, getValue: (t) => t.assigned_to_name },
    ];

    switch (task.operation_type) {
        case 'sip_setup':
        case 'sip_cancellation':
            return [
                ...base,
                { label: 'SIP Type', icon: IndianRupee, getValue: () => task.operation_type === 'sip_setup' ? 'New SIP Registration' : 'SIP Cancellation / Pause' },
                { label: 'Reference', icon: Hash, getValue: (t) => t.id.slice(-8).toUpperCase() },
                { label: 'Mandate', icon: CreditCard, getValue: () => 'Auto-debit linked' },
            ];
        case 'swp_setup':
        case 'stp_setup':
            return [
                ...base,
                { label: 'Plan Type', icon: ClipboardList, getValue: () => task.operation_type === 'swp_setup' ? 'Systematic Withdrawal' : 'Systematic Transfer' },
                { label: 'Reference', icon: Hash, getValue: (t) => t.id.slice(-8).toUpperCase() },
            ];
        case 'switch_plans':
            return [
                ...base,
                { label: 'Switch Type', icon: ClipboardList, getValue: () => 'Scheme to Scheme' },
                { label: 'Reference', icon: Hash, getValue: (t) => t.id.slice(-8).toUpperCase() },
            ];
        case 'lumpsum_investment':
            return [
                ...base,
                { label: 'Investment Type', icon: IndianRupee, getValue: () => 'One-time Purchase' },
                { label: 'Reference', icon: Hash, getValue: (t) => t.id.slice(-8).toUpperCase() },
            ];
        case 'redemption':
            return [
                ...base,
                { label: 'Redemption Type', icon: IndianRupee, getValue: () => 'Full / Partial Withdrawal' },
                { label: 'Reference', icon: Hash, getValue: (t) => t.id.slice(-8).toUpperCase() },
            ];
        case 'client_onboarding':
            return [
                ...base,
                { label: 'Onboarding Stage', icon: Users, getValue: () => 'Account / Demat Setup' },
                { label: 'KYC Status', icon: FileText, getValue: () => 'Pending verification' },
                { label: 'Address', icon: MapPin, getValue: () => 'On file' },
                { label: 'Contact', icon: Phone, getValue: () => 'Verified' },
            ];
        case 'kyc_update':
            return [
                ...base,
                { label: 'KYC Type', icon: FileText, getValue: () => 'Aadhar/PAN Linking' },
                { label: 'Document Status', icon: ClipboardList, getValue: () => 'Verification pending' },
            ];
        case 'bank_mandate':
            return [
                ...base,
                { label: 'Mandate Type', icon: Building2, getValue: () => 'Auto-debit (OTM)' },
                { label: 'Bank', icon: CreditCard, getValue: () => 'Linked account' },
            ];
        case 'nomination_update':
            return [
                ...base,
                { label: 'Update Type', icon: Users, getValue: () => 'Nominee Change' },
                { label: 'Status', icon: FileText, getValue: () => 'Awaiting documents' },
            ];
        default:
            return [
                ...base,
                { label: 'Type', icon: ClipboardList, getValue: (t) => t.custom_type_label || OPERATION_TYPE_LABELS[t.operation_type!] || 'General' },
                { label: 'Reference', icon: Hash, getValue: (t) => t.id.slice(-8).toUpperCase() },
            ];
    }
}

// ── Component ──

export function TaskDetailSheet({
    task,
    open,
    onOpenChange,
    onSnooze,
    onStart,
    onComplete,
}: TaskDetailSheetProps) {
    const activityLog = useMemo<TaskActivityLogEntry[]>(() => {
        if (!task) return [];
        return TaskService.getTaskActivityLog(task.id);
    }, [task]);

    if (!task) return null;

    const dueDate = parseISO(task.due_date);
    const isOverdue = task.status !== 'done' && isPast(dueDate) && !isToday(dueDate);
    const isDueToday = task.status !== 'done' && isToday(dueDate);
    const opColors = task.operation_type ? OPERATION_TYPE_COLORS[task.operation_type] : null;
    const opLabel = task.operation_type ? OPERATION_TYPE_LABELS[task.operation_type] : null;
    const typeFields = getTypeSpecificFields(task);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-lg w-full p-0 flex flex-col">
                {/* ── Header ── */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 space-y-3">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {opLabel && opColors && (
                            <Badge
                                variant="outline"
                                className={cn('text-[11px] font-semibold px-2.5 py-0.5 border-0', opColors.bg, opColors.text)}
                            >
                                {opLabel}
                            </Badge>
                        )}
                        <Badge
                            variant="outline"
                            className={cn('text-[11px] px-2 py-0.5 border-0', PRIORITY_STYLES[task.priority])}
                        >
                            {TASK_PRIORITY_LABELS[task.priority]}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn('text-[11px] px-2 py-0.5 border-0', STATUS_STYLES[task.status])}
                        >
                            {TASK_STATUS_LABELS[task.status]}
                        </Badge>
                        {task.is_follow_up_due && (
                            <Badge className="bg-red-500 text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Follow-up Due
                            </Badge>
                        )}
                    </div>

                    <SheetTitle className="text-lg font-semibold text-foreground leading-snug pr-6">
                        {task.title}
                    </SheetTitle>
                    {task.description && (
                        <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
                            {task.description}
                        </SheetDescription>
                    )}
                </SheetHeader>

                {/* ── Scrollable Body ── */}
                <ScrollArea className="flex-1">
                    <div className="px-6 py-5 space-y-6">

                        {/* ── Snooze warning (if currently snoozed) ── */}
                        {task.status === 'waiting_on_client' && task.snooze_reason && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3.5 flex items-start gap-2.5">
                                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                        {task.snooze_reason}
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                                        Follow-up {task.snooze_date ? format(parseISO(task.snooze_date), 'EEEE, MMM d, yyyy') : '—'}
                                        {(task.snooze_count ?? 0) > 0 && ` · Snoozed ${task.snooze_count}x`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Metadata Grid ── */}
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Details
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {typeFields.map((field) => {
                                    const Icon = field.icon;
                                    return (
                                        <div
                                            key={field.label}
                                            className="bg-muted/40 rounded-lg p-3 space-y-1"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <Icon className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-[11px] text-muted-foreground font-medium">
                                                    {field.label}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {field.getValue(task)}
                                            </p>
                                        </div>
                                    );
                                })}

                                {/* Due date */}
                                <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[11px] text-muted-foreground font-medium">
                                            Due Date
                                        </span>
                                    </div>
                                    <p className={cn(
                                        'text-sm font-medium truncate',
                                        isOverdue && 'text-red-600 dark:text-red-400',
                                        isDueToday && 'text-blue-600 dark:text-blue-400',
                                        !isOverdue && !isDueToday && 'text-foreground',
                                    )}>
                                        {isOverdue ? 'Overdue · ' : isDueToday ? 'Today · ' : ''}
                                        {format(dueDate, 'MMM d, yyyy')}
                                    </p>
                                </div>

                                {/* Created */}
                                <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[11px] text-muted-foreground font-medium">
                                            Created
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {format(parseISO(task.created_at), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Notes ── */}
                        {task.notes && (
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Notes
                                </h3>
                                <div className="bg-muted/40 rounded-lg p-3.5">
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {task.notes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Activity Timeline ── */}
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Activity
                            </h3>
                            <TaskActivityTimeline entries={activityLog} />
                        </div>
                    </div>
                </ScrollArea>

                {/* ── Footer Actions ── */}
                {task.status !== 'done' && (
                    <div className="border-t border-border/40 px-6 py-4 flex items-center gap-3 bg-background">
                        {task.status === 'todo' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    onStart?.(task.id);
                                    onOpenChange(false);
                                }}
                            >
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Start
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                                onComplete?.(task.id);
                                onOpenChange(false);
                            }}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Complete
                        </Button>
                        {task.status !== 'waiting_on_client' && (
                            <SnoozePopover
                                onSnooze={(date, reason) => {
                                    onSnooze?.(task.id, date, reason);
                                    onOpenChange(false);
                                }}
                            >
                                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                                    Snooze
                                </Button>
                            </SnoozePopover>
                        )}
                    </div>
                )}

                {/* Done state */}
                {task.status === 'done' && task.completed_at && (
                    <div className="border-t border-border/40 px-6 py-4 bg-emerald-50/50 dark:bg-emerald-900/10">
                        <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                                Completed {format(parseISO(task.completed_at), 'MMM d, yyyy · h:mm a')}
                                {task.completed_by_name && ` by ${task.completed_by_name}`}
                            </span>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
