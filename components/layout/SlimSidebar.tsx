"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CheckSquare,
    Bell,
    PieChart,
    LogOut,
    Settings,
    HelpCircle,
    UserPlus,
    FileText,
    Target
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Reuse navigation logic
const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Onboarding', href: '/admin/onboarding', icon: CheckSquare },
    { name: 'Invite Client', href: '/admin/onboarding/invite', icon: UserPlus },
    { name: 'B2A Planning', href: '/admin/planning', icon: Target },
    { name: 'Reminders', href: '/admin/reminders', icon: Bell },
];

const rmNavigation = [
    { name: 'Dashboard', href: '/rm/dashboard', icon: LayoutDashboard },
    { name: 'My Clients', href: '/rm/clients', icon: Users },
    { name: 'Invite Client', href: '/rm/onboarding', icon: UserPlus },
    { name: 'Wealth Planner', href: '/rm/planning', icon: Target },
    { name: 'Reminders', href: '/rm/reminders', icon: Bell },
];

const clientNavigation = [
    { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
    { name: 'My Portfolio', href: '/client/portfolio', icon: PieChart },
    { name: 'Documents', href: '/client/documents', icon: FileText },
];

const backOfficeNavigation = [
    { name: 'Dashboard', href: '/back-office/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/back-office/tasks', icon: CheckSquare },
    { name: 'Reminders', href: '/back-office/reminders', icon: Bell },
];

export function SlimSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navigation = (() => {
        switch (user?.role) {
            case 'admin': return adminNavigation;
            case 'rm': return rmNavigation;
            case 'back_office': return backOfficeNavigation;
            default: return clientNavigation;
        }
    })();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 w-16 z-50 items-center py-6">
            {/* Brand Icon */}
            <div className="mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                    <span className="font-bold text-xs tracking-tighter">NRP</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 w-full px-2 space-y-4">
                <TooltipProvider delayDuration={0}>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Tooltip key={item.name}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 mx-auto',
                                            isActive
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="bg-slate-900 border-slate-700 text-white ml-2 font-medium">
                                    {item.name}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>

            {/* Bottom Actions */}
            <div className="w-full px-2 space-y-4 flex flex-col items-center pt-4 border-t border-slate-800">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                <Settings className="h-5 w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-900 border-slate-700 text-white ml-2">
                            Settings
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => logout()}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-900 border-slate-700 text-white ml-2">
                            Sign Out
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mt-2 cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 hover:ring-offset-slate-950 transition-all">
                    <span className="text-[10px] font-bold text-slate-300">{user ? getInitials(user.name) : 'U'}</span>
                </div>
            </div>
        </div>
    );
}
