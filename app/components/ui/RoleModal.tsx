
'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight, ChevronDown } from 'lucide-react';

interface Permission {
    id: string;
    name: string;
    description: string;
}

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (roleData: any) => Promise<void>;
    initialData?: any;
}

export default function RoleModal({ isOpen, onClose, onSave, initialData }: RoleModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [roleType, setRoleType] = useState('User role');
    const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Data Workbench']));

    useEffect(() => {
        fetch('/api/permissions')
            .then(res => res.json())
            .then(data => setPermissions(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setRoleType(initialData.type || 'User role');
            // Assuming initialData.permissions involves a fetch or we pass IDs differently
            // ideally we pass the list of permission IDs owned by the role
        } else {
            setName('');
            setDescription('');
            setRoleType('User role');
            setSelectedPerms(new Set());
        }
    }, [initialData]);

    const handleSave = async () => {
        await onSave({
            name,
            description,
            type: roleType,
            permissions: Array.from(selectedPerms)
        });
        onClose();
    };

    const toggleGroup = (group: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(group)) newExpanded.delete(group);
        else newExpanded.add(group);
        setExpandedGroups(newExpanded);
    };

    const togglePermission = (id: string) => {
        const newSelected = new Set(selectedPerms);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedPerms(newSelected);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155] bg-[#1E293B]/50">
                    <div>
                        <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Role' : 'Create Role'}</h2>
                        <p className="text-sm text-slate-400 mt-1">Define role permissions and access levels</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Role Name <span className="text-red-500">*</span></label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-600 transition-all"
                                    placeholder="Ex: Tag Admin"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Role Type</label>
                                <select
                                    value={roleType}
                                    onChange={(e) => setRoleType(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Administrator">Administrator</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Employee">Employee</option>
                                    <option value="External">External</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-600 transition-all h-24 resize-none"
                                placeholder="Describe expectations and limitations for this role..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-xs font-semibold uppercase text-slate-500">Permissions</label>
                                <div className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full font-medium">
                                    {selectedPerms.size} selected
                                </div>
                            </div>

                            <div className="relative mb-3 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    className="w-full bg-[#1E293B] border border-[#334155] rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-600 transition-all"
                                    placeholder="Search permissions..."
                                />
                            </div>

                            <div className="border border-[#334155] rounded-xl overflow-hidden bg-[#1E293B]/30">
                                {Object.entries(permissions).map(([group, perms]) => (
                                    <div key={group} className="border-b border-[#334155] last:border-0">
                                        <div
                                            className="flex items-center gap-3 px-4 py-3 bg-[#1E293B]/50 cursor-pointer hover:bg-[#1E293B] transition-colors"
                                            onClick={() => toggleGroup(group)}
                                        >
                                            {expandedGroups.has(group)
                                                ? <ChevronDown className="w-4 h-4 text-blue-400" />
                                                : <ChevronRight className="w-4 h-4 text-slate-500" />
                                            }
                                            <span className="text-sm font-medium text-slate-200">{group}</span>
                                            <span className="ml-auto text-xs text-slate-600 bg-[#0F172A] px-2 py-0.5 rounded-full border border-[#334155]">{perms.length}</span>
                                        </div>

                                        {expandedGroups.has(group) && (
                                            <div className="p-2 space-y-1 bg-[#0F172A]/50">
                                                {perms.map(p => (
                                                    <label key={p.id} className="flex items-start gap-3 p-2 hover:bg-[#1E293B] rounded-lg cursor-pointer group transition-colors">
                                                        <div className="relative flex items-center mt-0.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPerms.has(p.id)}
                                                                onChange={() => togglePermission(p.id)}
                                                                className="peer h-4 w-4 rounded border-slate-600 bg-[#0F172A] text-blue-500 focus:ring-offset-[#0F172A] focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className={`text-sm font-medium transition-colors ${selectedPerms.has(p.id) ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>
                                                                {p.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500 group-hover:text-slate-400">{p.description}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-[#334155] bg-[#1E293B]/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-[#334155] rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Save Role
                    </button>
                </div>
            </div>
        </div>
    );
}
