import React, { useState, useEffect } from 'react';
import { X, Lock, Check, Shield } from 'lucide-react';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (roleData: any) => void;
}

interface Permission {
    id: string;
    name: string;
    description: string;
    group: string;
}

export default function RoleModal({ isOpen, onClose, onSave }: RoleModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // Fetch permissions
            fetch('/api/permissions')
                .then(res => res.json())
                .then(data => {
                    setPermissions(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load permissions", err);
                    setLoading(false);
                });

            // Reset form
            setName('');
            setDescription('');
            setSelectedPermissions(new Set());
        }
    }, [isOpen]);

    const togglePermission = (id: string) => {
        const newSet = new Set(selectedPermissions);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedPermissions(newSet);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({
                name,
                description,
                type: 'CUSTOM',
                permissions: Array.from(selectedPermissions)
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-[#334155] flex justify-between items-center bg-[#0F172A] rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Create New Role</h2>
                            <p className="text-sm text-slate-400">Define a new role and assign permissions</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Role Name</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Auditor"
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Description</label>
                            <input
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Brief description of the role..."
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-400" />
                                Permissions
                            </label>
                            <span className="text-xs text-slate-500">{selectedPermissions.size} selected</span>
                        </div>

                        <div className="bg-[#0F172A] rounded-lg border border-[#334155] p-4 max-h-60 overflow-y-auto space-y-4 custom-scrollbar">
                            {loading && <div className="text-center text-slate-500 py-4">Loading permissions...</div>}

                            {!loading && Object.entries(permissions).map(([group, groupPerms]) => (
                                <div key={group}>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-[#0F172A] py-1">{group}</h4>
                                    <div className="space-y-2 pl-2">
                                        {groupPerms.map(perm => (
                                            <label key={perm.id} className="flex items-start gap-3 p-2 rounded hover:bg-[#1E293B] cursor-pointer group transition-colors">
                                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedPermissions.has(perm.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-600 group-hover:border-slate-500'}`}>
                                                    {selectedPermissions.has(perm.id) && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedPermissions.has(perm.id)}
                                                    onChange={() => togglePermission(perm.id)}
                                                />
                                                <div>
                                                    <div className={`text-sm font-medium transition-colors ${selectedPermissions.has(perm.id) ? 'text-blue-400' : 'text-slate-300'}`}>
                                                        {perm.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{perm.description}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-[#334155] bg-[#0F172A] flex justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>Create Role</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
