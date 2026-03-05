'use client';

// SnoozePopover — Follow-up date & reason picker
// Used on task cards to snooze/pause tasks awaiting client action

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, addDays, nextMonday } from 'date-fns';
import { Clock, CalendarIcon, ChevronRight } from 'lucide-react';
import { SNOOZE_REASONS } from '@/types/tasks';

interface SnoozePopoverProps {
    children: React.ReactNode;
    onSnooze: (date: string, reason: string) => void;
}

const QUICK_OPTIONS = [
    { label: 'Tomorrow', getDays: () => 1 },
    { label: 'In 3 Days', getDays: () => 3 },
    {
        label: 'Next Week', getDays: () => {
            const next = nextMonday(new Date());
            const diff = Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return diff;
        }
    },
    { label: 'In 2 Weeks', getDays: () => 14 },
];

export function SnoozePopover({ children, onSnooze }: SnoozePopoverProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'date' | 'reason'>('date');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [showCalendar, setShowCalendar] = useState(false);

    const handleQuickSelect = (days: number) => {
        const date = format(addDays(new Date(), days), 'yyyy-MM-dd');
        setSelectedDate(date);
        setStep('reason');
    };

    const handleCustomDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val) {
            setSelectedDate(val);
            setShowCalendar(false);
            setStep('reason');
        }
    };

    const handleReasonSelect = (reason: string) => {
        onSnooze(selectedDate, reason);
        setOpen(false);
        // Reset for next use
        setStep('date');
        setSelectedDate('');
        setShowCalendar(false);
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setStep('date');
            setSelectedDate('');
            setShowCalendar(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end" sideOffset={8}>
                {step === 'date' && !showCalendar && (
                    <div className="p-3 space-y-1">
                        <div className="flex items-center gap-2 px-2 pb-2 border-b border-border/50 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">Remind me in...</span>
                        </div>
                        {QUICK_OPTIONS.map((option) => (
                            <button
                                key={option.label}
                                onClick={() => handleQuickSelect(option.getDays())}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm
                  text-foreground hover:bg-muted/80 transition-colors group"
                            >
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                    {format(addDays(new Date(), option.getDays()), 'MMM d')}
                                </span>
                            </button>
                        ))}
                        <div className="border-t border-border/50 pt-1 mt-1">
                            <button
                                onClick={() => setShowCalendar(true)}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm
                  text-foreground hover:bg-muted/80 transition-colors group"
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    Custom Date
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 'date' && showCalendar && (
                    <div className="p-3">
                        <button
                            onClick={() => setShowCalendar(false)}
                            className="text-xs text-muted-foreground hover:text-foreground px-1 py-1 mb-2"
                        >
                            ← Back
                        </button>
                        <p className="text-sm font-medium text-foreground mb-2 px-1">Pick a date</p>
                        <input
                            type="date"
                            min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                            onChange={handleCustomDateSelect}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                )}

                {step === 'reason' && (
                    <div className="p-3 space-y-1">
                        <div className="flex items-center gap-2 px-2 pb-2 border-b border-border/50 mb-2">
                            <span className="text-sm font-semibold text-foreground">Why are you snoozing?</span>
                        </div>
                        <p className="text-xs text-muted-foreground px-2 pb-1">
                            Follow-up on{' '}
                            <span className="font-semibold text-foreground">
                                {selectedDate ? format(new Date(selectedDate + 'T00:00:00'), 'MMM d, yyyy') : ''}
                            </span>
                        </p>
                        {SNOOZE_REASONS.map((reason) => (
                            <button
                                key={reason}
                                onClick={() => handleReasonSelect(reason)}
                                className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-left
                  text-foreground hover:bg-muted/80 transition-colors"
                            >
                                {reason}
                            </button>
                        ))}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
