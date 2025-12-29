
'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Users, CheckCircle, Clock, Plus } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    assignedTasks: any[];
}

export default function ManagerTeamPage() {
    const { currentUser } = useUser();
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [newTask, setNewTask] = useState({ title: '', assigneeId: '' });

    useEffect(() => {
        if (currentUser) {
            fetch(`/api/manager/team?managerId=${currentUser.id}`)
                .then(res => res.json())
                .then(setTeam)
                .catch(console.error);
        }
    }, [currentUser]);

    const assignTask = async () => {
        if (!newTask.title || !newTask.assigneeId || !currentUser) return;
        await fetch('/api/manager/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: newTask.title,
                assigneeId: newTask.assigneeId,
                creatorId: currentUser.id
            })
        });
        setNewTask({ title: '', assigneeId: '' });
        // Refresh
        fetch(`/api/manager/team?managerId=${currentUser.id}`)
            .then(res => res.json())
            .then(setTeam);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Department Overview: {currentUser?.department}</h1>
                <p className="text-slate-400">Manage your team and assign tasks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map(member => (
                    <div key={member.id} className="bg-[#1E293B] border border-[#334155] rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                                {member.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-semibold text-white">{member.name}</div>
                                <div className="text-xs text-slate-400">{member.jobTitle}</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-xs font-semibold text-slate-500 uppercase">Current Tasks</div>
                            {member.assignedTasks?.length === 0 && <div className="text-xs text-slate-600 italic">No active tasks</div>}
                            {member.assignedTasks?.map((t: any) => (
                                <div key={t.id} className="flex items-center gap-2 text-sm text-slate-300 bg-[#0F172A] p-2 rounded border border-[#334155]">
                                    <Clock className="w-3 h-3 text-orange-400" />
                                    {t.title}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Task Assignment */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 max-w-md">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Assign New Task</h3>
                <div className="space-y-4">
                    <input
                        placeholder="Task Title"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <select
                        value={newTask.assigneeId}
                        onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}
                        className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm"
                    >
                        <option value="">Select Employee...</option>
                        {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <button
                        onClick={assignTask}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg text-sm"
                    >
                        Assign Task
                    </button>
                </div>
            </div>
        </div>
    );
}
