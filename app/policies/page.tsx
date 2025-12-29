
'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Shield, Edit, Trash2 } from 'lucide-react';
import PolicyModal from '@/app/components/ui/PolicyModal';

interface Policy {
    id: string;
    name: string;
    description: string;
    type: string;
    roleName: string;
    roleId: string;
    tags: Record<string, string>;
    effect: string;
}

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

    const fetchPolicies = () => {
        fetch('/api/policies')
            .then(res => res.json())
            .then(setPolicies)
            .catch(console.error);
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleCreate = () => {
        setEditingPolicy(null);
        setIsModalOpen(true);
    };

    const handleEdit = (policy: Policy) => {
        setEditingPolicy(policy);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            await fetch('/api/policies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            fetchPolicies();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Policies</h1>
                    <p className="text-slate-400 mt-1">Manage system-wide ABAC and RBAC policies</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Policy
                </button>
            </div>

            <div className="grid gap-4">
                {policies.map(policy => (
                    <div key={policy.id} className="bg-[#1E293B] rounded-lg border border-[#334155] p-5 flex items-start justify-between hover:border-blue-500/50 transition-colors group">
                        <div className="flex gap-4">
                            <div className={`mt-1 w-10 h-10 rounded-lg flex items-center justify-center ${policy.effect === 'ALLOW' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                <Shield className="w-5 h-5" />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-slate-100 text-lg">{policy.name}</h3>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${policy.effect === 'ALLOW' ? 'border-green-800 text-green-500' : 'border-red-800 text-red-500'}`}>
                                        {policy.effect}
                                    </span>
                                    <span className="text-xs text-slate-500 px-2 border-l border-slate-700">{policy.type}</span>
                                </div>

                                <p className="text-sm text-slate-400 mb-3">{policy.description}</p>

                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700 text-slate-400">Role: <span className="text-slate-200">{policy.roleName}</span></span>
                                    {Object.entries(policy.tags).map(([k, v]) => (
                                        <span key={k} className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700 text-slate-400">
                                            {k}: <span className="text-slate-200">{v}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleEdit(policy)}
                            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                        >
                            Edit Policy
                        </button>
                    </div>
                ))}

                {policies.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-[#1E293B]/50 rounded-lg border border-dashed border-[#334155]">
                        No policies active.
                    </div>
                )}
            </div>

            <PolicyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingPolicy}
            />
        </div>
    );
}
