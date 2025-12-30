
'use client';

import React from 'react';
import { Clock, Calendar, CheckSquare, BarChart, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { redirect } from 'next/navigation';

export default function MyWorkspacePage() {
    const { currentUser, isLoading } = useUser();

    if (isLoading) return <div className="p-10 text-center text-slate-500">Loading Workspace...</div>;
    // In a real app we might check for specific 'employee_tools' permission
    // For now, if you are not Admin, you see this.

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">My Workspace</h1>
                    <p className="text-slate-400 mt-1">Welcome back, {currentUser?.name}</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg shadow-green-900/20 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Check In
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] hover:border-blue-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">Attendance</h3>
                    <p className="text-sm text-slate-500">View logs & request corrections</p>
                </div>

                <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] hover:border-orange-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">Leave Requests</h3>
                    <p className="text-sm text-slate-500">Apply for time off</p>
                </div>

                <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] hover:border-purple-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CheckSquare className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">My Tasks</h3>
                    <p className="text-sm text-slate-500">12 pending tasks</p>
                </div>

                <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] hover:border-pink-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BarChart className="w-6 h-6 text-pink-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">Performance</h3>
                    <p className="text-sm text-slate-500">View your assessment goals</p>
                </div>
            </div>

            {/* Task List Mock */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#334155] bg-[#0F172A]/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-100">Pending Tasks</h3>
                </div>
                <div className="divide-y divide-[#334155]">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-[#1E293B]/80 transition-colors">
                            <div className="w-6 h-6 rounded-full border-2 border-slate-600 cursor-pointer hover:border-green-500 hover:bg-green-500/20 transition-all" />
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-white">Complete Q4 Security Training</h4>
                                <p className="text-xs text-slate-500">Due in 2 days</p>
                            </div>
                            <span className="text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded">High Priority</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
