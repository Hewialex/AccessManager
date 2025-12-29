
'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Tag as TagIcon, MoreHorizontal, Edit } from 'lucide-react';
import TagModal from '@/app/components/ui/TagModal';

interface Tag {
    id: string;
    key: string;
    values: string[];
    type: string;
}

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    const fetchTags = () => {
        fetch('/api/tags')
            .then(res => res.json())
            .then(setTags)
            .catch(console.error);
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleCreate = () => {
        setEditingTag(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tag: Tag) => {
        setEditingTag(tag);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            fetchTags();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Tag Management</h1>
                    <p className="text-slate-400 mt-1">Define attributes and values for ABAC policies</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Tag
                </button>
            </div>

            <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#0F172A] text-slate-400 font-medium border-b border-[#334155]">
                        <tr>
                            <th className="px-6 py-4 w-64">Tag Key</th>
                            <th className="px-6 py-4">Values</th>
                            <th className="px-6 py-4 w-48">Type</th>
                            <th className="px-6 py-4 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                        {tags.map((tag) => (
                            <tr key={tag.id} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-4 font-medium text-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <TagIcon className="w-4 h-4" />
                                        </div>
                                        {tag.key}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {tag.values.slice(0, 5).map((val, i) => (
                                            <span key={i} className="inline-block px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs border border-slate-600">
                                                {val}
                                            </span>
                                        ))}
                                        {tag.values.length > 5 && (
                                            <span className="text-xs text-slate-500 self-center">+{tag.values.length - 5} more</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{tag.type}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEdit(tag)}
                                        className="text-slate-500 hover:text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tags.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No tags found. Create one to get started.
                    </div>
                )}
            </div>

            <TagModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingTag}
            />
        </div>
    );
}
