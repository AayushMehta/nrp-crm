'use client';

// CreateTaskDialog — Modal for creating new financial tasks
// Features: family picker, 11+Other operation type pills, priority, due date, follow-up toggle

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Calendar, AlertTriangle, ArrowRight, ChevronRight, Bell,
} from 'lucide-react';
import type { TaskOperationType, TaskPriority, TaskCreateData } from '@/types/tasks';
import { OPERATION_TYPE_LABELS, OPERATION_TYPE_COLORS } from '@/types/tasks';

// ── Props ──

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: TaskCreateData) => void;
    families: { id: string; name: string }[];
    currentUserId: string;
    currentUserName: string;
}

// ── Operation type list (all 11 + Other) ──

const OPERATION_TYPES: TaskOperationType[] = [
    'sip_setup',
    'sip_cancellation',
    'swp_setup',
    'stp_setup',
    'switch_plans',
    'lumpsum_investment',
    'redemption',
    'client_onboarding',
    'kyc_update',
    'bank_mandate',
    'nomination_update',
    'other',
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
];

// ── Component ──

export function CreateTaskDialog({
    open,
    onOpenChange,
    onSubmit,
    families,
    currentUserId,
    currentUserName,
}: CreateTaskDialogProps) {
    const [familyId, setFamilyId] = useState('');
    const [operationType, setOperationType] = useState<TaskOperationType | ''>('');
    const [customTypeLabel, setCustomTypeLabel] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [needsFollowUp, setNeedsFollowUp] = useState(false);
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpReason, setFollowUpReason] = useState('');

    const selectedFamily = useMemo(() =>
        families.find(f => f.id === familyId), [families, familyId]
    );

    const isValid = useMemo(() => {
        if (!familyId || !operationType || !dueDate) return false;
        if (operationType === 'other' && !customTypeLabel.trim()) return false;
        if (needsFollowUp && !followUpDate) return false;
        return true;
    }, [familyId, operationType, dueDate, customTypeLabel, needsFollowUp, followUpDate]);

    const resetForm = () => {
        setFamilyId('');
        setOperationType('');
        setCustomTypeLabel('');
        setPriority('medium');
        setDueDate('');
        setNotes('');
        setNeedsFollowUp(false);
        setFollowUpDate('');
        setFollowUpReason('');
    };

    const handleSubmit = () => {
        if (!isValid || !operationType) return;

        const title = operationType === 'other'
            ? customTypeLabel
            : `${OPERATION_TYPE_LABELS[operationType]} — ${selectedFamily?.name || ''}`;

        const data: TaskCreateData = {
            title,
            description: notes || undefined,
            context_type: 'general',
            operation_type: operationType,
            custom_type_label: operationType === 'other' ? customTypeLabel : undefined,
            family_id: familyId,
            assigned_to: currentUserId, // Will be auto-reassigned by service to BO user
            priority,
            due_date: dueDate,
            notes: notes || undefined,
            needs_follow_up: needsFollowUp,
            follow_up_date: needsFollowUp ? followUpDate : undefined,
            follow_up_reason: needsFollowUp ? followUpReason : undefined,
        };

        onSubmit(data);
        resetForm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
            <DialogContent className="sm:max-w-[540px] p-0 gap-0 max-h-[90vh] flex flex-col">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
                    <DialogTitle className="text-lg font-semibold">Create Task</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Select a family and task type. The task will be auto-assigned to the back-office team.
                    </DialogDescription>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* 1. Family picker */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Family / Client *</Label>
                        <Select value={familyId} onValueChange={setFamilyId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a family..." />
                            </SelectTrigger>
                            <SelectContent>
                                {families.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 2. Task Type — pill grid */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Task Type *</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {OPERATION_TYPES.map(type => {
                                const colors = OPERATION_TYPE_COLORS[type];
                                const isSelected = operationType === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setOperationType(type)}
                                        className={cn(
                                            'px-3 py-2 rounded-lg text-xs font-medium transition-all text-left border',
                                            isSelected
                                                ? `${colors.bg} ${colors.text} border-current ring-1 ring-current/20`
                                                : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground'
                                        )}
                                    >
                                        {OPERATION_TYPE_LABELS[type]}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Other — custom label input */}
                        {operationType === 'other' && (
                            <Input
                                placeholder="Describe the task type..."
                                value={customTypeLabel}
                                onChange={(e) => setCustomTypeLabel(e.target.value)}
                                className="mt-2"
                                autoFocus
                            />
                        )}
                    </div>

                    {/* 3. Priority */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Priority</Label>
                        <div className="flex gap-2">
                            {PRIORITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setPriority(opt.value)}
                                    className={cn(
                                        'flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                                        priority === opt.value
                                            ? `${opt.color} ring-1 ring-current/20`
                                            : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60'
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Due date */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Due Date *</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* 5. Follow-up toggle */}
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="follow-up-toggle" className="text-sm font-medium cursor-pointer">
                                    Follow-up Needed
                                </Label>
                            </div>
                            <Switch
                                id="follow-up-toggle"
                                checked={needsFollowUp}
                                onCheckedChange={setNeedsFollowUp}
                            />
                        </div>
                        {needsFollowUp && (
                            <div className="space-y-3 pt-1 border-t border-border/40">
                                <div className="space-y-1.5 mt-3">
                                    <Label className="text-xs text-muted-foreground">Follow-up Date *</Label>
                                    <Input
                                        type="date"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Reason</Label>
                                    <Input
                                        placeholder="e.g. Document name change, Awaiting PAN correction..."
                                        value={followUpReason}
                                        onChange={(e) => setFollowUpReason(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 6. Notes */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Notes</Label>
                        <Textarea
                            placeholder="Any additional details..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20">
                    <Button variant="ghost" onClick={() => { resetForm(); onOpenChange(false); }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <ArrowRight className="h-4 w-4 mr-1.5" />
                        Create Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
