'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animation-utils';
import {
    CheckSquare, Users, Bell, ClipboardList, Clock, FileCheck,
    AlertCircle, ChevronRight, MoreHorizontal, CheckCircle2,
    FileText, UserCheck, Folder, Calendar, TrendingUp, ArrowUpRight,
    ArrowDownRight, Timer, ListChecks, Search,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────

interface TaskItem {
    id: string;
    title: string;
    client: string;
    type: 'document_verification' | 'compliance_review' | 'data_entry' | 'follow_up';
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed';
    assignedBy: string;
}

const MOCK_TASKS: TaskItem[] = [
    { id: '1', title: 'Verify PAN Card — Sharma Family', client: 'Rajesh Sharma', type: 'document_verification', priority: 'high', dueDate: '2026-02-16', status: 'pending', assignedBy: 'Priya RM' },
    { id: '2', title: 'Review ITR Documents — Patel Family', client: 'Amit Patel', type: 'compliance_review', priority: 'high', dueDate: '2026-02-16', status: 'in_progress', assignedBy: 'Rahul RM' },
    { id: '3', title: 'Update Family Records — Gupta Account', client: 'Neha Gupta', type: 'data_entry', priority: 'medium', dueDate: '2026-02-17', status: 'pending', assignedBy: 'Priya RM' },
    { id: '4', title: 'Aadhaar Verification Pending — Singh', client: 'Vikram Singh', type: 'document_verification', priority: 'medium', dueDate: '2026-02-17', status: 'pending', assignedBy: 'Rahul RM' },
    { id: '5', title: 'Follow Up on Missing Bank Statement', client: 'Meera Joshi', type: 'follow_up', priority: 'low', dueDate: '2026-02-18', status: 'pending', assignedBy: 'Priya RM' },
    { id: '6', title: 'Risk Disclosure Sign-off — Kumar', client: 'Suresh Kumar', type: 'compliance_review', priority: 'high', dueDate: '2026-02-16', status: 'completed', assignedBy: 'Rahul RM' },
    { id: '7', title: 'Complete KYC Entry — Reddy Family', client: 'Lakshmi Reddy', type: 'data_entry', priority: 'medium', dueDate: '2026-02-18', status: 'completed', assignedBy: 'Priya RM' },
    { id: '8', title: 'Verify Cancelled Cheque — Malhotra', client: 'Karan Malhotra', type: 'document_verification', priority: 'low', dueDate: '2026-02-19', status: 'completed', assignedBy: 'Rahul RM' },
];

interface RecentActivity {
    id: string;
    action: string;
    client: string;
    time: string;
    type: 'verified' | 'rejected' | 'uploaded' | 'completed';
}

const RECENT_ACTIVITY: RecentActivity[] = [
    { id: '1', action: 'Verified PAN Card', client: 'Suresh Kumar', time: '10 min ago', type: 'verified' },
    { id: '2', action: 'Completed KYC entry', client: 'Lakshmi Reddy', time: '25 min ago', type: 'completed' },
    { id: '3', action: 'Rejected blurry Aadhaar scan', client: 'Pooja Mehta', time: '1 hour ago', type: 'rejected' },
    { id: '4', action: 'Uploaded updated ITR', client: 'Amit Patel', time: '2 hours ago', type: 'uploaded' },
    { id: '5', action: 'Verified Cancelled Cheque', client: 'Karan Malhotra', time: '3 hours ago', type: 'verified' },
];

// ─── Component ───────────────────────────────────────────────

export default function BackOfficeDashboard() {
    const { user } = useAuth();
    const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const pendingCount = MOCK_TASKS.filter(t => t.status === 'pending').length;
    const inProgressCount = MOCK_TASKS.filter(t => t.status === 'in_progress').length;
    const completedCount = MOCK_TASKS.filter(t => t.status === 'completed').length;
    const highPriorityCount = MOCK_TASKS.filter(t => t.priority === 'high' && t.status !== 'completed').length;

    const filteredTasks = useMemo(() => {
        let tasks = MOCK_TASKS;
        if (taskFilter !== 'all') tasks = tasks.filter(t => t.status === taskFilter);
        if (searchQuery) tasks = tasks.filter(t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.client.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return tasks;
    }, [taskFilter, searchQuery]);

    const stats = [
        { label: 'Pending Tasks', value: pendingCount, icon: Clock, color: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700', change: '+2 today' },
        { label: 'In Progress', value: inProgressCount, icon: Timer, color: 'from-blue-500 to-cyan-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700', change: 'On track' },
        { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', change: '+3 today' },
        { label: 'High Priority', value: highPriorityCount, icon: AlertCircle, color: 'from-red-500 to-pink-500', bgLight: 'bg-red-50', textColor: 'text-red-700', change: 'Due today' },
    ];

    const getTypeColor = (type: TaskItem['type']) => {
        switch (type) {
            case 'document_verification': return 'bg-purple-100 text-purple-700';
            case 'compliance_review': return 'bg-blue-100 text-blue-700';
            case 'data_entry': return 'bg-emerald-100 text-emerald-700';
            case 'follow_up': return 'bg-amber-100 text-amber-700';
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

    const getPriorityColor = (priority: TaskItem['priority']) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusBadge = (status: TaskItem['status']) => {
        switch (status) {
            case 'pending': return <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">Pending</Badge>;
            case 'in_progress': return <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">In Progress</Badge>;
            case 'completed': return <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Completed</Badge>;
        }
    };

    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'verified': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'rejected': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'uploaded': return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
            case 'completed': return <CheckSquare className="h-4 w-4 text-purple-500" />;
        }
    };

    return (
        <AppLayout>
            <motion.div
                className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {user?.name || 'Back Office'}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">Here&apos;s your task overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs px-3 py-1">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> {completedCount} completed today
                        </Badge>
                    </div>
                </div>

                {/* Stats Grid */}
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                        >
                            <Card className="border-0 shadow-sm bg-white/90 backdrop-blur hover:shadow-md transition-shadow overflow-hidden relative">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                            <p className={cn('text-xs mt-1.5', stat.textColor)}>{stat.change}</p>
                                        </div>
                                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', stat.color)}>
                                            <stat.icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                </CardContent>
                                <div className={cn('h-1 bg-gradient-to-r', stat.color)} />
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Task List — spans 2 columns */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <ClipboardList className="h-5 w-5 text-blue-600" />
                                            Task Queue
                                        </CardTitle>
                                        <CardDescription className="mt-0.5">Manage and track assigned tasks</CardDescription>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    {(['all', 'pending', 'in_progress', 'completed'] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setTaskFilter(f)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                                taskFilter === f
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                                            )}
                                        >
                                            {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                                            {f === 'pending' && ` (${pendingCount})`}
                                            {f === 'in_progress' && ` (${inProgressCount})`}
                                        </button>
                                    ))}

                                    <div className="flex-1" />

                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search tasks..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 border-0 text-xs w-40 focus:w-52 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    {filteredTasks.length === 0 ? (
                                        <div className="text-center py-8">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No tasks match your filter.</p>
                                        </div>
                                    ) : (
                                        filteredTasks.map(task => (
                                            <div
                                                key={task.id}
                                                className={cn(
                                                    'p-3.5 rounded-xl border transition-all hover:shadow-sm cursor-pointer group',
                                                    task.status === 'completed'
                                                        ? 'bg-slate-50/50 border-slate-100'
                                                        : 'bg-white border-gray-100 hover:border-blue-200'
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        'flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0',
                                                        getTypeColor(task.type)
                                                    )}>
                                                        {getTypeIcon(task.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={cn(
                                                                'text-sm font-medium',
                                                                task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                                                            )}>
                                                                {task.title}
                                                            </p>
                                                            {getStatusBadge(task.status)}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Users className="h-3 w-3" /> {task.client}
                                                            </span>
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                            <Badge variant="outline" className={cn('text-[9px] px-1.5', getPriorityColor(task.priority))}>
                                                                {task.priority}
                                                            </Badge>
                                                            <span className="text-[10px] text-gray-400">by {task.assignedBy}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Recent Activity */}
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-purple-600" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {RECENT_ACTIVITY.map(activity => (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 flex-shrink-0 mt-0.5">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">{activity.action}</p>
                                                <p className="text-xs text-gray-500">{activity.client} · {activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats Summary */}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
                            <CardContent className="py-6 relative z-10">
                                <h3 className="font-bold text-sm mb-4 text-slate-200">Today&apos;s Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">Documents Verified</span>
                                        <span className="font-bold text-lg">7</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">KYC Entries Done</span>
                                        <span className="font-bold text-lg">3</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">Follow-ups Sent</span>
                                        <span className="font-bold text-lg">2</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-300">Avg. Task Time</span>
                                        <span className="font-bold text-lg">12m</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </AppLayout >
    );
}
