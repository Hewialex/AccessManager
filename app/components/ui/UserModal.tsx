
'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Briefcase, MapPin } from 'lucide-react';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    roles: any[];
    onSave: (data: any) => Promise<void>;
}

export default function UserModal({ isOpen, onClose, user, roles, onSave }: UserModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState('');
    const [clearance, setClearance] = useState('INTERNAL');
    const [department, setDepartment] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [attributes, setAttributes] = useState<Record<string, string>>({});
    const [customKey, setCustomKey] = useState('');
    const [customValue, setCustomValue] = useState('');

    useEffect(() => {
        if (user) {
            setRoleId(user.roleId || (roles.find(r => r.name === user.role)?.id || ''));
            setClearance(user.clearance || 'INTERNAL');
            setDepartment(user.department || '');
            setJobTitle(user.jobTitle || '');
            setAttributes(user.attributes || {});
        } else {
            // Reset for create mode
            setName('');
            setEmail('');
            setPassword('');
            setRoleId(roles[0]?.id || ''); // Default to first role
            setClearance('INTERNAL');
            setDepartment('');
            setJobTitle('');
            setAttributes({});
        }
    }, [user, roles]);

    const handleSave = async () => {
        await onSave({
            ...(user ? {} : { name, email, password }), // Only include these if creating
            roleId,
            clearance,
            department,
            jobTitle,
            attributes
        });
        onClose();
    };

    const addAttribute = () => {
        if (customKey && customValue) {
            setAttributes(prev => ({ ...prev, [customKey]: customValue }));
            setCustomKey('');
            setCustomValue('');
        }
    };

    const removeAttribute = (key: string) => {
        const newAttrs = { ...attributes };
        delete newAttrs[key];
        setAttributes(newAttrs);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155] bg-[#1E293B]/50 shrink-0">
                    <h2 className="text-xl font-bold text-white">{user ? 'Edit User' : 'Add New User'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                    {/* User Info (Editable for Create, Read-only for Edit) */}
                    <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 space-y-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                                    {user.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{user.name}</div>
                                    <div className="text-xs text-slate-400">{user.email}</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                                        <input
                                            placeholder="e.g. John Doe"
                                            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Email Address</label>
                                        <input
                                            placeholder="john@company.com"
                                            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Temporary Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* RBAC Role */}
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Role (RBAC)</label>
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* MAC Clearance */}
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Clearance Level (MAC)</label>
                        <select
                            value={clearance}
                            onChange={(e) => setClearance(e.target.value)}
                            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="PUBLIC">PUBLIC</option>
                            <option value="INTERNAL">INTERNAL</option>
                            <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                            <option value="TOP_SECRET">TOP_SECRET</option>
                        </select>
                    </div>

                    {/* ABAC Attributes */}
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">ABAC Attributes</label>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Department</label>
                                <input
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Job Title</label>
                                <input
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Custom Attributes */}
                        <div className="space-y-2">
                            <div className="text-xs text-slate-400 font-medium">Custom Attributes</div>
                            <div className="flex gap-2 mb-2">
                                <input
                                    placeholder="Key (e.g. Region)"
                                    value={customKey}
                                    onChange={(e) => setCustomKey(e.target.value)}
                                    className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    placeholder="Value (e.g. EMEA)"
                                    value={customValue}
                                    onChange={(e) => setCustomValue(e.target.value)}
                                    className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    onClick={addAttribute}
                                    className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 text-sm font-medium whitespace-nowrap"
                                >
                                    + Add Item
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(attributes).map(([k, v]) => (
                                    <span key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                                        <span className="text-slate-500">{k}:</span> {v}
                                        <button onClick={() => removeAttribute(k)} className="hover:text-red-400 ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 border-t border-[#334155] bg-[#1E293B]/50 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-[#334155] rounded-xl transition-all">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/20 transition-all">{user ? 'Save Changes' : 'Create User'}</button>
                </div>
            </div>
        </div>
    );
}
