'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Mail,
  FileText,
  Settings,
  LogOut,
  ClipboardList,
  MessageSquare,
  Bell,
  PieChart,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Admin CRM Navigation
const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Onboarding', href: '/admin/onboarding', icon: CheckSquare },
  { name: 'Invite Client', href: '/admin/onboarding/invite', icon: UserPlusIcon },
  { name: 'Reminders', href: '/admin/reminders', icon: Bell },
];

// RM Navigation
const rmNavigation = [
  { name: 'Dashboard', href: '/rm/dashboard', icon: LayoutDashboard },
  { name: 'My Clients', href: '/rm/clients', icon: Users },
  { name: 'Invite Client', href: '/rm/onboarding', icon: UserPlusIcon },
  { name: 'Reminders', href: '/rm/reminders', icon: Bell },
];

// Client Navigation
const clientNavigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
  { name: 'My Portfolio', href: '/client/portfolio', icon: PieChart },
  { name: 'Documents', href: '/client/documents', icon: FileText },
];

// Back Office Navigation
const backOfficeNavigation = [
  { name: 'Dashboard', href: '/back-office/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/back-office/tasks', icon: CheckSquare },
  { name: 'Reminders', href: '/back-office/reminders', icon: Bell },
];

// Helper icon for invite
function UserPlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

export function Sidebar() {
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

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-xl text-white w-72 border-r border-slate-800 shadow-2xl z-50">
      {/* Brand Section */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800/60 bg-slate-900/50">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
          <span className="font-bold text-sm tracking-widest">{user ? getInitials(user.name) : 'NR'}</span>
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"></div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight text-white">NRP CRM</h1>
          <p className="text-[11px] font-medium text-indigo-300 uppercase tracking-wider">
            {user?.role?.replace('_', ' ') || 'Wealth'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-4">
          Menu
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out',
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20 translate-x-1'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-indigo-100" : "text-slate-500 group-hover:text-indigo-400"
                )}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Logic (Bottom) */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <span className="text-xs font-medium text-slate-300">{getInitials(user?.name || 'User')}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'user@nrp.com'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
