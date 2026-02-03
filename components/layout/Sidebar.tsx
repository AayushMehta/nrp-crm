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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Admin CRM Navigation
const adminNavigation = [
  { name: 'CRM Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Task Board', href: '/tasks', icon: CheckSquare },
  { name: 'Messages', href: '/communications', icon: MessageSquare },
  { name: 'Onboarding', href: '/admin/onboarding', icon: ClipboardList },
  { name: 'Meeting Notes', href: '/admin/meeting-notes', icon: MessageSquare },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Reminders', href: '/admin/reminders', icon: Bell },
  { name: 'Email Templates', href: '/admin/communications', icon: Mail },
  { name: 'Documents', href: '/admin/documents', icon: FileText },
];

// RM Navigation
const rmNavigation = [
  { name: 'Dashboard', href: '/rm/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Messages', href: '/communications', icon: MessageSquare },
  { name: 'Calendar', href: '/rm/calendar', icon: Calendar },
  { name: 'My Clients', href: '/rm/clients', icon: Users },
  { name: 'Reminders', href: '/rm/reminders', icon: Bell },
];

// Client Navigation
const clientNavigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
  { name: 'Messages', href: '/communications', icon: MessageSquare },
  { name: 'My Meetings', href: '/client/meetings', icon: Calendar },
  { name: 'Documents', href: '/client/documents', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = user?.role === 'admin'
    ? adminNavigation
    : user?.role === 'rm'
    ? rmNavigation
    : clientNavigation;

  const handleLogout = async () => {
    await logout();
  };

  // Get role-based gradient for avatar
  const getRoleGradient = () => {
    switch (user?.role) {
      case 'admin':
        return 'from-red-500 to-orange-600';
      case 'rm':
        return 'from-purple-500 to-blue-600';
      case 'family':
        return 'from-blue-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
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
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Logo / Brand Section */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white font-bold text-sm", getRoleGradient())}>
          {user ? getInitials(user.name) : 'NRP'}
        </div>
        <div>
          <h1 className="text-lg font-bold">NRP CRM</h1>
          <p className="text-xs text-slate-400 capitalize">{user?.role || 'CRM'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-800 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
