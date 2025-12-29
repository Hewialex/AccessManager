
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield, Users, Lock, Tag, FileText, Activity, Settings,
  Globe, LayoutDashboard, Database, Briefcase, CheckSquare
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { cn } from '@/lib/utils'; // We'll need to create this util or inline it

// Inline util validation since we might not have lib/utils yet
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, hasPermission, isLoading } = useUser();

  if (isLoading) return <aside className="w-72 bg-[#0F172A] border-r border-[#1E293B] h-screen" />;

  const menuGroups: { title: string; items: { name: string; href: string; icon: any; permission?: string }[] }[] = [
    ...((!currentUser || currentUser.role !== 'Administrator') ? [{
      title: 'My Workspace',
      items: [
        { name: 'Employee Dashboard', href: '/workspace', icon: Briefcase },
      ]
    }] : []),
    ...(currentUser?.role === 'Manager' ? [{
      title: 'Department',
      items: [
        { name: 'Team Overview', href: '/manager/team', icon: Users },
        { name: 'Approvals', href: '/manager/approvals', icon: CheckSquare },
        { name: 'Dept Files', href: '/manager/files', icon: Briefcase }, // Using Briefcase temporarily
      ]
    }] : []),
    ...(currentUser?.role === 'Manager' ? [{
      title: 'Department',
      items: [
        { name: 'Team Overview', href: '/manager/team', icon: Users },
        { name: 'Approvals', href: '/manager/approvals', icon: CheckSquare },
        { name: 'Dept Files', href: '/manager/files', icon: Briefcase },
      ]
    }] : []),
    {
      title: 'Security',
      items: [
        { name: 'Users & Groups', href: '/users', icon: Users, permission: 'user_manage' },
        { name: 'Roles', href: '/roles', icon: Lock, permission: 'role_manage' },
        { name: 'Tag Management', href: '/tags', icon: Tag, permission: 'folder_tag_edit' },
        { name: 'Policies', href: '/policies', icon: FileText, permission: 'policy_manage' },
        { name: 'Audit Log', href: '/audit', icon: Activity, permission: 'audit_view' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { name: 'Instance Details', href: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-[#0F172A] border-r border-[#1E293B] text-slate-300 flex flex-col h-screen sticky top-0 shadow-xl z-20">
      <div className="p-6 border-b border-[#1E293B] flex items-center gap-3 bg-[#0F172A]">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight">Access Control</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Enterprise Edition</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full font-bold">BETA</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div className="space-y-1">
          <Link
            href="/"
            className={classNames(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/"
                ? "bg-gradient-to-r from-blue-600/10 to-transparent text-blue-400 shadow-sm"
                : "hover:bg-[#1E293B]/60 hover:text-white"
            )}
          >
            <LayoutDashboard className={classNames("w-5 h-5", pathname === "/" ? "text-blue-500" : "text-slate-400")} />
            Overview
          </Link>
          {currentUser?.role !== 'Administrator' && (
            <Link
              href="/request-role"
              className={classNames(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === "/request-role"
                  ? "bg-gradient-to-r from-blue-600/10 to-transparent text-blue-400 shadow-sm"
                  : "hover:bg-[#1E293B]/60 hover:text-white"
              )}
            >
              <Globe className={classNames("w-5 h-5", pathname === "/request-role" ? "text-blue-500" : "text-slate-400")} />
              Request Role
            </Link>
          )}
        </div>

        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(item => !item.permission || hasPermission(item.permission));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title}>
              <h3 className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                {group.title}
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={classNames(
                        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-blue-600/10 text-blue-400"
                          : "hover:bg-[#1E293B]/60 hover:text-white"
                      )}
                    >
                      <item.icon className={classNames("w-4 h-4 transition-colors", isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-300")} />
                      {item.name}
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#1E293B] bg-[#0b1120]">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-inner border border-slate-600 group-hover:border-slate-500">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate group-hover:text-blue-100">{currentUser?.name || 'Loading...'}</div>
            <div className="text-xs text-slate-500 truncate">{currentUser?.role || '...'}</div>
          </div>
          <Settings className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
        </div>
      </div>
    </aside>
  );
}
