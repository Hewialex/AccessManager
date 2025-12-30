
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, User, Search, Bell, Settings } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { cn } from '@/lib/utils';

export default function Topbar() {
  const router = useRouter();
  const { users, currentUser, switchUser, isLoading } = useUser();

  const handleUserSwitch = async (userId: string) => {
    await switchUser(userId);
    // Ideally user state update triggers re-render, no need to force currentUser set here if context does it
  };

  return (
    <header className="h-20 glass-header flex items-center justify-between px-8 sticky top-0 z-10 transition-all duration-300">
      {/* Left Search Bar */}
      <div className="flex items-center w-full max-w-lg">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search Policy, User, or Tag..."
            className="w-full bg-[#1E293B]/50 hover:bg-[#1E293B] border border-transparent hover:border-[#334155] focus:border-blue-500/50 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <span className="text-[10px] text-slate-600 font-mono border border-slate-700 rounded px-1.5 py-0.5">⌘K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* User Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold text-white">{currentUser?.name}</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{currentUser?.role}</div>
          </div>
          <button
            onClick={() => {
              // Clear cookie/token
              document.cookie = 'token=; Max-Age=0; path=/;';
              document.cookie = 'x-user-id=; Max-Age=0; path=/;';
              window.location.href = '/login';
            }}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-500/20"
          >
            Logout
          </button>
        </div>

        <div className="h-8 w-px bg-[#1E293B]" />

        <div className="flex items-center gap-4">
          <button className="relative text-slate-400 hover:text-white transition-colors p-2 hover:bg-[#1E293B] rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F172A]"></span>
          </button>
          <button className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-[#1E293B] rounded-lg">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
