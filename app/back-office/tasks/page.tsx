'use client';

// app/back-office/tasks/page.tsx
// Back Office — Assigned Tasks management page

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ConsoleLayout } from '@/components/layout/ConsoleLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animation-utils';
import { toast } from 'sonner';
import {
    CheckSquare, Clock, AlertCircle, FileCheck, ListChecks, FileText,
    Bell, Users, Calendar, ChevronRight, Search, CheckCircle2,
    Timer, Filter, Plus, MoreHorizontal,
} from 'lucide-react';

interface TaskItem {
    id: string;
    title: string;
    client: string;
    type: 'document_verification' | 'compliance_review' | 'data_entry' | 'follow_up';
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed';
    assignedBy: string;
    notes?: string;
}

const STORAGE_KEY = 'nrp_bo_tasks';

function getDefaultTasks(): TaskItem[] {
    return [
        { id: '1', title: 'Verify PAN Card — Sharma Family', client: 'Rajesh Sharma', type: 'document_verification', priority: 'high', dueDate: '2026-02-16', status: 'pending', assignedBy: 'Priya RM' },
        { id: '2', title: 'Review ITR Documents — Patel Family', client: 'Amit Patel', type: 'compliance_review', priority: 'high', dueDate: '2026-02-16', status: 'in_progress', assignedBy: 'Rahul RM' },
        { id: '3', title: 'Update Family Records — Gupta Account', client: 'Neha Gupta', type: 'data_entry', priority: 'medium', dueDate: '2026-02-17', status: 'pending', assignedBy: 'Priya RM' },
        { id: '4', title: 'Aadhaar Verification Pending — Singh', client: 'Vikram Singh', type: 'document_verification', priority: 'medium', dueDate: '2026-02-17', status: 'pending', assignedBy: 'Rahul RM' },
        { id: '5', title: 'Follow Up on Missing Bank Statement', client: 'Meera Joshi', type: 'follow_up', priority: 'low', dueDate: '2026-02-18', status: 'pending', assignedBy: 'Priya RM' },
        { id: '6', title: 'Risk Disclosure Sign-off — Kumar', client: 'Suresh Kumar', type: 'compliance_review', priority: 'high', dueDate: '2026-02-16', status: 'completed', assignedBy: 'Rahul RM' },
        { id: '7', title: 'Complete KYC Entry — Reddy Family', client: 'Lakshmi Reddy', type: 'data_entry', priority: 'medium', dueDate: '2026-02-18', status: 'completed', assignedBy: 'Priya RM' },
        { id: '8', title: 'Verify Cancelled Cheque — Malhotra', client: 'Karan Malhotra', type: 'document_verification', priority: 'low', dueDate: '2026-02-19', status: 'completed', assignedBy: 'Rahul RM' },
    ];
}

function loadTasks(): TaskItem[] {
    if (typeof window === 'undefined') return getDefaultTasks();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try { return JSON.parse(stored); } catch { /* fallthrough */ }
    }
    const defaults = getDefaultTasks();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
}

function saveTasks(tasks: TaskItem[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
}

export default function BackOfficeTasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<TaskItem[]>(loadTasks);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;

    const filteredTasks = useMemo(() => {
        let result = tasks;
        if (filter !== 'all') result = result.filter(t => t.status === filter);
        if (searchQuery) result = result.filter(t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.client.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return result;
    }, [tasks, filter, searchQuery]);

    const updateTaskStatus = (taskId: string, newStatus: TaskItem['status']) => {
        const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        setTasks(updated);
        saveTasks(updated);
        const task = tasks.find(t => t.id === taskId);
        if (newStatus === 'completed') {
            toast.success(`Task completed: "${task?.title}"`);
        } else if (newStatus === 'in_progress') {
            toast.info(`Started: "${task?.title}"`);
        }
    };

    const getTypeColor = (type: TaskItem['type']) => {
        switch (type) {
            case 'document_verification': return 'bg-purple-100 text-purple-700';
            case 'compliance_review': return 'bg-blue-100 text-blue-700';
            case 'data_entry': return 'bg-emerald-100 text-emerald-700';
            case 'follow_up': return 'bg-amber-100 text-amber-700';
        }
    };

    const getTypeLabel = (type: TaskItem['type']) => {
        switch (type) {
            case 'document_verification': return 'Doc Verification';
            case 'compliance_review': return 'Compliance';
            case 'data_entry': return 'Data Entry';
            case 'follow_up': return 'Follow Up';
        }
    };

    const getTypeIcon = (type: TaskItem['type']) => {
        switch (type) {
            case 'document_verification': return <FileCheck className="h-3.5 w-3.5" />;
            case 'compliance_review': return <ListChecks className="h-3.5 w-3.5" />;
            case 'data_entry': return <FileText className="h-3.5 w-3.5" />;
            case 'follow_up': return <Bell className="h-3.5 w-3.5" />;
        }
    };

    const getPriorityBadge = (priority: TaskItem['priority']) => {
        const colors = {
            high: 'bg-red-100 text-red-700 border-red-200',
            medium: 'bg-amber-100 text-amber-700 border-amber-200',
            low: 'bg-slate-100 text-slate-600 border-slate-200',
        };
        return <Badge variant="outline" className={cn('text-[10px] px-1.5', colors[priority])}>{priority}</Badge>;
    };

    return (
        <ConsoleLayout>
            <motion.div
                className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-8"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Assigned Tasks</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">Back Office Mode</Badge>
                            <p className="text-muted-foreground text-lg">Manage document verification, compliance, and data entry tasks</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-sm px-3 py-1">
                            <Clock className="h-3.5 w-3.5 mr-1.5" /> {pendingCount} pending
                        </Badge>
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-sm px-3 py-1">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> {completedCount} done
                        </Badge>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Pending', value: pendingCount, color: 'from-amber-500 to-orange-500', icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/10' },
                        { label: 'In Progress', value: inProgressCount, color: 'from-blue-500 to-cyan-500', icon: Timer, bg: 'bg-blue-50 dark:bg-blue-900/10' },
                        { label: 'Completed', value: completedCount, color: 'from-emerald-500 to-teal-500', icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                    ].map(stat => (
                        <Card key={stat.label} className="border shadow-sm bg-card overflow-hidden">
                            <CardContent className={cn("pt-5 pb-4", stat.bg)}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                                    </div>
                                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', stat.color)}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                            <div className={cn('h-1 bg-gradient-to-r', stat.color)} />
                        </Card>
                    ))}
                </div>

                {/* Task List */}
                <Card className="border shadow-sm bg-card">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckSquare className="h-5 w-5 text-primary" />
                                    Task Queue
                                </CardTitle>
                                <CardDescription className="mt-0.5">Click actions to update task status</CardDescription>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {(['all', 'pending', 'in_progress', 'completed'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                                            filter === f
                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                : 'bg-background text-muted-foreground border-input hover:bg-muted'
                                        )}
                                    >
                                        {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                                        {f === 'pending' && ` (${pendingCount})`}
                                        {f === 'in_progress' && ` (${inProgressCount})`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-3 py-2 rounded-lg bg-background border border-input text-sm w-full md:w-64 focus:w-80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <div className="space-y-3">
                            {filteredTasks.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-muted/30 p-4 rounded-full w-fit mx-auto mb-3">
                                        <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground">No tasks match your filter.</p>
                                </div>
                            ) : (
                                filteredTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            'p-4 rounded-xl border transition-all hover:bg-muted/40 group',
                                            task.status === 'completed'
                                                ? 'bg-muted/30 border-border opacity-75'
                                                : 'bg-card border-border hover:border-primary/30'
                                        )}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                                            <div className={cn(
                                                'flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0',
                                                getTypeColor(task.type)
                                            )}>
                                                {getTypeIcon(task.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                                    <div>
                                                        <p className={cn(
                                                            'font-medium text-base',
                                                            task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'
                                                        )}>
                                                            {task.title}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Users className="h-3.5 w-3.5" /> {task.client}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                            {getPriorityBadge(task.priority)}
                                                            <Badge variant="outline" className={cn('text-[10px] px-1.5', getTypeColor(task.type))}>
                                                                {getTypeLabel(task.type)}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                                                        <Badge className={cn(
                                                            'text-[10px] border-0 flex-shrink-0 h-6 px-2',
                                                            task.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-emerald-100 text-emerald-700'
                                                        )}>
                                                            {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                        </Badge>

                                                        {/* Action Buttons */}
                                                        {task.status !== 'completed' && (
                                                            <div className="flex items-center gap-2">
                                                                {task.status === 'pending' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-8 text-xs"
                                                                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                                    >
                                                                        <Timer className="h-3.5 w-3.5 mr-1.5" /> Start
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                    onClick={() => updateTaskStatus(task.id, 'completed')}
                                                                >
                                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Complete
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </ConsoleLayout>
    );
}
