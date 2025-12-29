
'use client';

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Send, CheckCircle2, Clock } from 'lucide-react';

export default function RequestRolePage() {
    const { currentUser } = useUser();
    const [reason, setReason] = useState('');
    const [targetRole, setTargetRole] = useState('Manager'); // default demo value
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser?.id,
                    requestedRoleName: targetRole,
                    reason
                })
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (submitted) {
        return (
            <div className="p-10 max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Request Submitted</h2>
                <p className="text-slate-400">Your request to become a <span className="text-white font-medium">{targetRole}</span> has been sent to the status administrator.</p>
                <div className="mt-8 p-4 bg-[#1E293B] rounded-xl border border-[#334155] inline-flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-sm text-slate-300">Status: Pending Approval</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Request Role Change</h1>
            <p className="text-slate-400 mb-8">Submit a request to change your system access level.</p>

            <form onSubmit={handleSubmit} className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Current Role</label>
                    <div className="p-3 bg-[#0F172A] border border-[#334155] rounded-xl text-slate-400 text-sm">
                        {currentUser?.role || 'Loading...'}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Requested Role</label>
                    <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Manager">Manager</option>
                        <option value="Data Engineer">Data Engineer</option>
                        <option value="Tag Admin">Tag Admin</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Request</label>
                    <textarea
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                        placeholder="Explain why you need this access..."
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Send className="w-4 h-4" />
                        Submit Request
                    </button>
                </div>
            </form>
        </div>
    );
}
