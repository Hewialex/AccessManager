
'use client';

import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policyData: any) => Promise<void>;
    initialData?: any;
}

interface Role {
    id: string;
    name: string;
}

interface Tag {
    id: string;
    key: string;
    values: string[];
}

export default function PolicyModal({ isOpen, onClose, onSave, initialData }: PolicyModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('User Policy');
    const [selectedroleId, setSelectedRoleId] = useState('');
    const [selectedTags, setSelectedTags] = useState<Record<string, string>>({}); // { Geo: 'Japan' }
    const [effect, setEffect] = useState('ALLOW');

    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);

    useEffect(() => {
        // Fetch options
        fetch('/api/roles').then(res => res.json()).then(setAvailableRoles).catch(console.error);
        fetch('/api/tags').then(res => res.json()).then(setAvailableTags).catch(console.error);
    }, []);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setType(initialData.type || 'User Policy');
            setSelectedRoleId(initialData.roleId || '');
            setSelectedTags(initialData.tags || {});
            setEffect(initialData.effect || 'ALLOW');
        } else {
            setName('');
            setDescription('');
            setType('User Policy');
            setSelectedRoleId('');
            setSelectedTags({});
            setEffect('ALLOW');
        }
    }, [initialData]);

    const handleSave = async () => {
        await onSave({
            name,
            description,
            type,
            roleId: selectedroleId || undefined,
            tags: selectedTags,
            effect
        });
        onClose();
    };

    const updateTagSelection = (key: string, value: string) => {
        const newTags = { ...selectedTags };
        if (!value) delete newTags[key];
        else newTags[key] = value;
        setSelectedTags(newTags);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-[600px] h-[720px] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-slate-900">{initialData ? 'Edit Policy' : 'Create Policy'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Japan Data Engineer Policy"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                            placeholder="Describe the policy intent..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Policy Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="User Policy">User Policy</option>
                            <option value="Resource Policy">Resource Policy</option>
                        </select>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="text-sm font-medium text-slate-900 mb-3">Conditions (ABAC)</h3>

                        <div className="bg-slate-50 p-4 rounded-md space-y-4 border border-slate-200">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">User Role</label>
                                <select
                                    value={selectedroleId}
                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Any Role</option>
                                    {availableRoles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tag Logic */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Attributes (Tags)</label>
                                <div className="space-y-3">
                                    {availableTags.map(tag => (
                                        <div key={tag.id} className="flex items-center gap-3">
                                            <div className="w-1/3 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md">
                                                {tag.key}
                                            </div>
                                            <div className="text-slate-400">=</div>
                                            <select
                                                value={selectedTags[tag.key] || ''}
                                                onChange={(e) => updateTagSelection(tag.key, e.target.value)}
                                                className="flex-1 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">(Ignore)</option>
                                                {tag.values.map((val, i) => (
                                                    <option key={i} value={val}>{val}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                    {availableTags.length === 0 && <span className="text-xs text-slate-400">No tags available.</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">Effect:</span>
                        <div className="flex bg-slate-200 rounded-lg p-1">
                            <button
                                onClick={() => setEffect('ALLOW')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${effect === 'ALLOW' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                            >
                                ALLOW
                            </button>
                            <button
                                onClick={() => setEffect('DENY')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${effect === 'DENY' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                            >
                                DENY
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-md hover:bg-slate-800">Save Policy</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
