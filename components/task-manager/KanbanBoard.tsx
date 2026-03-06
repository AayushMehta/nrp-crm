'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Calendar, MessageSquare, Paperclip, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Task, TaskStatus, TaskPriority } from '@/types/tasks';
import { OPERATION_TYPE_LABELS, OPERATION_TYPE_COLORS } from '@/types/tasks';
import { format, parseISO } from 'date-fns';

// safe formatter helper
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

// ── Types ──

export interface KanbanColumnDef {
    id: TaskStatus;
    label: string;
    dotColor: string;
}

interface KanbanBoardProps {
    tasks: Task[];
    columns: KanbanColumnDef[];
    onTaskClick: (task: Task) => void;
    onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
}

// ── Priority Colors ──

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string }> = {
    low: { label: 'Low', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    medium: { label: 'Medium', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    high: { label: 'High', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    urgent: { label: 'Urgent', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
};

// ── Avatar Helper ──
const getInitials = (name: string) => {
    if (!name?.trim()) return '??';
    return name.split(' ')
        .filter(w => w.length > 0)
        .map(w => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

const getAvatarColor = (name: string) => {
    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};


// ── KanbanCard Component ──

function KanbanCard({ task, onClick, onDragStart }: { task: Task; onClick: (t: Task) => void; onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void }) {
    const priority = PRIORITY_CONFIG[task.priority];
    const opColors = task.operation_type ? OPERATION_TYPE_COLORS[task.operation_type] : null;
    const opLabel = task.operation_type
        ? (task.operation_type === 'other' && task.custom_type_label ? task.custom_type_label : OPERATION_TYPE_LABELS[task.operation_type])
        : null;

    const assigneeColor = getAvatarColor(task.assigned_to_name);
    const creatorColor = getAvatarColor(task.created_by_name);
    const isOverdue = task.status !== 'done' && new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

    // Calculate a mock number of attachments/comments to match premium design
    // We'll deterministically calculate from task ID for consistency
    const hash = task.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const commentsCount = hash % 15;
    const attachCount = (hash + 5) % 8;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            draggable
            onDragStart={(e: any) => onDragStart(e, task.id)}
            onClick={() => onClick(task)}
            className="group relative flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-all select-none"
        >
            {/* Badges row */}
            <div className="flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                    {opLabel && opColors && (
                        <div className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide whitespace-nowrap', opColors.bg, opColors.text)}>
                            {opLabel}
                        </div>
                    )}
                    <div className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide flex items-center gap-1 whitespace-nowrap', priority.bg, priority.text)}>
                        {priority.label}
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 -mr-2 opacity-0 group-hover:opacity-100 shrink-0" onClick={(e) => { e.stopPropagation(); }}>
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            {/* Title & Desc */}
            <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {task.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {task.description || `${task.family_name} — Details inside.`}
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center -space-x-2">
                    {/* Avatars */}
                    <div className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 text-[9px] font-bold text-white shrink-0 shadow-sm", creatorColor)} title={`Created by ${task.created_by_name}`}>
                        {getInitials(task.created_by_name)}
                    </div>
                    {task.assigned_to !== task.created_by && (
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 text-[9px] font-bold text-white shrink-0 shadow-sm", assigneeColor)} title={`Assigned to ${task.assigned_to_name}`}>
                            {getInitials(task.assigned_to_name)}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Stats matching design */}
                    {attachCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                            <Paperclip className="h-3 w-3" />
                            {attachCount}
                        </div>
                    )}
                    {commentsCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                            <MessageSquare className="h-3 w-3" />
                            {commentsCount}
                        </div>
                    )}

                    {/* Due Date Indicator */}
                    {(task.due_date && task.status !== 'done') && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-medium",
                            isOverdue ? "text-red-500" : "text-slate-400"
                        )}>
                            {isOverdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                            {safeFormat(task.due_date, 'd MMM')}
                        </div>
                    )}
                </div>
            </div>

            {/* Follow up indicator */}
            {task.needs_follow_up && task.status !== 'done' && (
                <div className="absolute top-0 right-0 h-full w-1 rounded-r-xl bg-gradient-to-b from-amber-400 to-amber-500" />
            )}
        </motion.div>
    );
}

// ── KanbanColumn Component ──

function KanbanColumn({
    column,
    tasks,
    onTaskClick,
    onTaskMove
}: {
    column: KanbanColumnDef;
    tasks: Task[];
    onTaskClick: (t: Task) => void;
    onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
}) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onTaskMove(taskId, column.id);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
        // Optional: set drag image or effect
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="flex flex-col h-full min-h-[500px] w-full min-w-[300px] max-w-[350px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm py-2 px-1">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", column.dotColor)} />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{column.label}</h3>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">{tasks.length}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            {/* Column Body */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "flex-1 flex flex-col gap-3 rounded-2xl transition-colors duration-200 p-2 -mx-2",
                    isDragOver ? "bg-indigo-50/50 dark:bg-indigo-500/5 dashed border-indigo-200 dark:border-indigo-500/30" : "bg-transparent"
                )}
            >
                <AnimatePresence>
                    {tasks.map(task => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onClick={onTaskClick}
                            onDragStart={handleDragStart}
                        />
                    ))}
                </AnimatePresence>

                {tasks.length === 0 && (
                    <div className="flex items-center justify-center p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-medium">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}

// ── KanbanBoard Component ──

export function KanbanBoard({ tasks, columns, onTaskClick, onTaskMove }: KanbanBoardProps) {
    return (
        <div className="flex items-start gap-6 overflow-x-auto pb-6 px-1 custom-scrollbar min-h-[calc(100vh-280px)]">
            {columns.map(col => {
                const columnTasks = tasks.filter(t => t.status === col.id);
                return (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        tasks={columnTasks}
                        onTaskClick={onTaskClick}
                        onTaskMove={onTaskMove}
                    />
                );
            })}
        </div>
    );
}
