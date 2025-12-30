'use client';

import React, { useEffect } from 'react';
import { Users, Lock, Tag, FileText } from 'lucide-react';
import { useUser } from './context/UserContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { currentUser, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role !== 'Administrator' && currentUser.role !== 'Admin') {
        if (currentUser.role === 'Manager') {
          router.replace('/dashboard');
        } else {
          router.replace('/workspace');
        }
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || (currentUser && currentUser.role !== 'Administrator' && currentUser.role !== 'Admin')) {
    return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;
  }

  const stats = [
    { label: 'Total Users', value: '3', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Roles', value: '4', icon: Lock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Defined Tags', value: '2', icon: Tag, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Policies', value: '1', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, Admin</h1>
        <p className="text-slate-400">Here is an overview of your security posture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#1E293B] border border-[#334155] p-6 rounded-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-slate-400">User <span className="text-slate-200">Abebe</span> accessed Resource <span className="text-slate-200">Financial Docs</span></span>
                <span className="ml-auto text-slate-600 text-xs">2 mins ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-lg bg-[#0F172A] border border-[#334155] hover:border-blue-500/50 text-left transition-colors">
              <div className="font-medium text-slate-200 mb-1">Add New User</div>
              <div className="text-xs text-slate-500">Create user & assign role</div>
            </button>
            <button className="p-4 rounded-lg bg-[#0F172A] border border-[#334155] hover:border-blue-500/50 text-left transition-colors">
              <div className="font-medium text-slate-200 mb-1">Create Policy</div>
              <div className="text-xs text-slate-500">Define new access rule</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
