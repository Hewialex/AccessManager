
'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface TagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tagData: any) => Promise<void>;
    initialData?: any;
}

export default function TagModal({ isOpen, onClose, onSave, initialData }: TagModalProps) {
    const [key, setKey] = useState('');
    const [type, setType] = useState('Resource access');
    const [values, setValues] = useState<string[]>([]);
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        if (initialData) {
            setKey(initialData.key);
            setType(initialData.type);
            setValues(initialData.values || []);
        } else {
            setKey('');
            setType('Resource access');
            setValues([]);
            setNewValue('');
        }
    }, [initialData]);

    const handleAddValue = () => {
        if (newValue.trim()) {
            setValues([...values, newValue.trim()]);
            setNewValue('');
        }
    };

    const removeValue = (index: number) => {
        setValues(values.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        await onSave({
            key,
            type,
            values
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-[500px] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-slate-900">{initialData ? 'Edit Tag' : 'Create Tag'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tag Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Resource access">Resource access</option>
                            <option value="Object Tag">Object Tag</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Key <span className="text-red-500">*</span></label>
                        <input
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Geo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Values <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 mb-2">
                            <input
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
                                className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add value (e.g. Japan)"
                            />
                            <button
                                onClick={handleAddValue}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-md border border-slate-200"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="border border-slate-200 rounded-md p-2 min-h-[100px] max-h-[150px] overflow-y-auto bg-slate-50">
                            {values.length === 0 && <div className="text-xs text-slate-400 text-center py-4">No values added yet.</div>}
                            <div className="flex flex-wrap gap-2">
                                {values.map((val, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-sm text-slate-700 shadow-sm">
                                        {val}
                                        <button onClick={() => removeValue(idx)} className="text-slate-400 hover:text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-md hover:bg-slate-800">Save</button>
                </div>
            </div>
        </div>
    );
}
