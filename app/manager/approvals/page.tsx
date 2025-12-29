
'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Check, X, Clock, Shield } from 'lucide-react';

export default function ManagerApprovalsPage() {
    const { currentUser } = useUser();
    const [requests, setRequests] = useState<any[]>([]);
    const [notes, setNotes] = useState<Record<string, string>>({});

    const fetchRequests = () => {
        if (currentUser) {
            fetch(`/api/manager/approvals?managerId=${currentUser.id}`)
                .then(res => res.json())
                .then(setRequests)
                .catch(console.error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [currentUser]);

    const handleAction = async (requestId: string, action: 'RECOMMEND' | 'REJECT') => {
        await fetch('/api/manager/approvals', {
            method: 'POST',
            body: JSON.stringify({
                requestId,
                managerId: currentUser?.id,
                action,
                recommendation: notes[requestId] || ''
            })
        });
        fetchRequests();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Approval Queue</h1>
                <p className="text-slate-400">Review role requests from your department ({currentUser?.department})</p>
            </div>

            <div className="space-y-4">
                {requests.length === 0 && (
                    <div className="p-8 text-center text-slate-500 bg-[#1E293B] rounded-xl border border-[#334155]">
                        <Check className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        No pending requests found.
                    </div>
                )}

                {requests.map(req => (
                    <div key={req.id} className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                    REQUEST
                                </span>
                                <span className="text-slate-500 text-xs flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-200">
                                {req.user.name} <span className="text-slate-500 font-normal">wants to catch</span> {req.requestedRoleName}
                            </h3>
                            <p className="text-slate-400 text-sm mt-1 border-l-2 border-slate-600 pl-3">
                                &quot;{req.reason}&quot;
                            </p>
                        </div>

                        <div className="w-full md:w-auto flex flex-col gap-3">
                            <input
                                placeholder="Add recommendation note..."
                                className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                value={notes[req.id] || ''}
                                onChange={e => setNotes({ ...notes, [req.id]: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction(req.id, 'REJECT')}
                                    className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium border border-red-500/20 transition-all"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'RECOMMEND')}
                                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    Recommend
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
