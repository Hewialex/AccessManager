
'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { FileText, Share2, Plus, Lock, Users, X } from 'lucide-react';

interface Resource {
    id: string;
    name: string;
    type: string;
    confidentialityLevel: string;
    owner: { name: string };
    acls: any[];
}

export default function ManagerFilesPage() {
    const { currentUser } = useUser();
    const [files, setFiles] = useState<Resource[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<Resource | null>(null);
    const [team, setTeam] = useState<any[]>([]);
    const [fileLogs, setFileLogs] = useState<any[]>([]);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    // Share Form
    const [shareUserId, setShareUserId] = useState('');
    const [permission, setPermission] = useState('READ');

    const fetchFiles = () => {
        if (!currentUser) return;
        fetch(`/api/manager/files?userId=${currentUser.id}`)
            .then(res => res.json())
            .then(setFiles)
            .catch(console.error);
    };

    const fetchTeam = () => {
        if (!currentUser) return;
        fetch(`/api/manager/team?managerId=${currentUser.id}`)
            .then(res => res.json())
            .then(setTeam)
            .catch(console.error);
    };

    useEffect(() => {
        if (currentUser) {
            fetchFiles();
            fetchTeam();
        }
    }, [currentUser]);

    const handleCreateFile = async () => {
        const name = prompt("Enter file name (e.g. Q3 Review.pdf):");
        if (!name || !currentUser) return;

        await fetch('/api/manager/files', {
            method: 'POST',
            body: JSON.stringify({
                name,
                type: 'document',
                ownerId: currentUser.id,
                confidentialityLevel: 'CONFIDENTIAL'
            })
        });
        fetchFiles();
    };

    const openShare = (file: Resource) => {
        setSelectedFile(file);
        setIsShareModalOpen(true);
    };

    const openFile = async (file: Resource) => {
        if (!currentUser) return;
        alert(`Opening ${file.name}... (This event will be logged)`);

        await fetch('/api/manager/files/access', {
            method: 'POST',
            body: JSON.stringify({
                resourceId: file.id,
                userId: currentUser.id,
                action: 'OPENED'
            })
        });
    };

    const viewLogs = async (file: Resource) => {
        if (!currentUser) return;
        setSelectedFile(file);

        const res = await fetch(`/api/manager/files/access?resourceId=${file.id}&ownerId=${currentUser.id}`);
        if (res.ok) {
            const data = await res.json();
            setFileLogs(data);
            setIsLogModalOpen(true);
        } else {
            alert("Only the owner can view access logs.");
        }
    };

    const handleShare = async () => {
        if (!selectedFile || !shareUserId || !currentUser) return;

        await fetch('/api/manager/files/share', {
            method: 'POST',
            body: JSON.stringify({
                resourceId: selectedFile.id,
                granteeId: shareUserId,
                permission,
                grantedBy: currentUser.id
            })
        });
        setIsShareModalOpen(false);
        setShareUserId('');
        fetchFiles(); // Refresh to see updated ACLs? (Not visible in list yet but good practice)
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Department Files (DAC)</h1>
                    <p className="text-slate-400">Manage and share sensitive documents with discretionary access.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCreateFile}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
                    >
                        <Plus className="w-4 h-4" /> Upload File
                    </button>
                    <button
                        onClick={fetchFiles}
                        className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 px-4 py-2 rounded-xl border border-[#334155] border-l-0 text-sm font-medium transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.length === 0 && <div className="text-slate-500 col-span-full text-center py-10">No files found.</div>}

                {files.map(file => (
                    <div key={file.id} className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-blue-500/30 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${file.confidentialityLevel === 'TOP_SECRET' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                                'text-orange-400 border-orange-500/20 bg-orange-500/10'
                                }`}>
                                {file.confidentialityLevel}
                            </span>
                        </div>

                        <h3 className="font-bold text-slate-200 mb-1 truncate">{file.name}</h3>
                        <div className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                            Owner: <span className="text-slate-300">{file.owner.name}</span>
                        </div>

                        {/* ACL Preview */}
                        <div className="mb-4 space-y-1">
                            <div className="text-[10px] uppercase text-slate-500 font-bold">Shared With:</div>
                            <div className="flex -space-x-2 overflow-hidden">
                                {file.acls.length === 0 && <span className="text-xs text-slate-600">Only you</span>}
                                {file.acls.map((acl: any) => (
                                    <div key={acl.id} className="w-6 h-6 rounded-full bg-slate-700 border border-[#1E293B] flex items-center justify-center text-[10px] text-white" title={acl.permission}>
                                        U
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => viewLogs(file)}
                                className="flex-1 py-2 bg-[#0F172A] hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition-all"
                            >
                                View Logs
                            </button>
                            <button
                                onClick={() => openShare(file)}
                                className="flex-1 py-2 bg-[#0F172A] hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                            >
                                <Share2 className="w-3 h-3" /> Share
                            </button>
                            <button
                                onClick={() => openFile(file)}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all"
                            >
                                Open
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Log Modal */}
            {isLogModalOpen && selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1E293B] border border-[#334155] rounded-2xl w-full max-w-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Access Logs: {selectedFile.name}</h2>
                            <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {fileLogs.length === 0 && <div className="text-center text-slate-500 py-4">No access events recorded.</div>}
                            {fileLogs.map(log => (
                                <div key={log.id} className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                            {log.user?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{log.user?.name}</div>
                                            <div className="text-xs text-slate-500">{log.action}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isShareModalOpen && selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1E293B] border border-[#334155] rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Share "{selectedFile.name}"</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select User</label>
                                <select
                                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm"
                                    value={shareUserId}
                                    onChange={e => setShareUserId(e.target.value)}
                                >
                                    <option value="">Choose a team member...</option>
                                    {team.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Permission Level</label>
                                <div className="flex gap-2">
                                    <button
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border ${permission === 'READ' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#0F172A] text-slate-400 border-[#334155]'}`}
                                        onClick={() => setPermission('READ')}
                                    >
                                        READ ONLY
                                    </button>
                                    <button
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border ${permission === 'WRITE' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#0F172A] text-slate-400 border-[#334155]'}`}
                                        onClick={() => setPermission('WRITE')}
                                    >
                                        EDIT & SHARE
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsShareModalOpen(false)} className="flex-1 py-2 text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={handleShare} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20">Grant Access</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
