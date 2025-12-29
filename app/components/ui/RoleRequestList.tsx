
'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Check, X, Clock, Shield } from 'lucide-react';

interface Request {
    id: string;
    userId: string;
    user: { name: string, email: string, role: { name: string } }; // user.role relation might not be fetched deep enough in API, need to check
    requestedRoleName: string;
    reason: string;
    status: string;
    recommendation?: string;
    createdAt: string;
}

export default function RoleRequestList() {
    const [requests, setRequests] = useState<Request[]>([]);
    const { hasPermission } = useUser();

    const fetchRequests = () => {
        fetch('/api/requests')
            .then(res => res.json())
            .then(data => setRequests(data))
            .catch(console.error);
    };

    useEffect(() => {
        if (hasPermission('role_manage')) {
            fetchRequests();
        }
    }, [hasPermission]);

    const handleAction = async (id: string, action: 'APPROVE' | 'DENY') => {
        try {
            await fetch(`/api/requests/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            fetchRequests();
        } catch (e) {
            console.error(e);
        }
    };

    if (!hasPermission('role_manage')) return null;
    if (!Array.isArray(requests)) return null; // Defensive check
    if (requests.length === 0) return null;

    return (
        <div className="mb-10 bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between bg-[#0F172A]/50">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Pending Role Requests
                </h3>
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {requests.filter(r => r.status === 'PENDING').length}
                </span>
            </div>
            <div className="divide-y divide-[#334155]">
                {requests.filter(r => ['PENDING', 'RECOMMENDED'].includes(r.status)).map(req => (
                    <div key={req.id} className="p-4 flex items-center justify-between hover:bg-[#1E293B]/80 transition-colors">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">{req.user?.name || 'Unknown User'}</span>
                                <span className="text-slate-500 text-sm">wants to become</span>
                                <span className="font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded text-sm hover:bg-blue-400/20 transition-colors">{req.requestedRoleName}</span>
                                {req.status === 'RECOMMENDED' && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                                        <Shield className="w-3 h-3" />
                                        RECOMMENDED
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-400 italic">"{req.reason}"</p>
                            {req.recommendation && (
                                <div className="mt-2 text-xs text-slate-400 bg-green-900/10 border border-green-900/30 p-2 rounded">
                                    <span className="font-bold text-green-400">Manager Note:</span> {req.recommendation}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAction(req.id, 'DENY')}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Deny"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleAction(req.id, 'APPROVE')}
                                className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all"
                                title="Approve"
                            >
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
