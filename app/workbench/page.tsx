
'use client';

import React from 'react';
import { Folder, Database, FileText, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function WorkbenchPage() {
    const { hasPermission } = useUser();

    const canCreate = hasPermission('folder_create');

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Data Workbench</h1>
                    <p className="text-slate-400 mt-1">Manage data pipelines and confidential resources.</p>
                </div>

                {canCreate && (
                    <button
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Folder
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Financial Reports Q3', 'Employee Records', 'Project Omega'].map((folder) => (
                    <div key={folder} className="bg-[#1E293B]/50 border border-[#334155] p-6 rounded-2xl hover:bg-[#1E293B] transition-all group cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                <Folder className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full border border-slate-700">CONFIDENTIAL</span>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{folder}</h3>
                        <p className="text-sm text-slate-500">Updated 2h ago by Marta</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
