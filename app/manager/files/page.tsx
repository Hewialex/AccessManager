
'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { FileText, Share2, Plus, Lock, Users, X, Upload, Trash2 } from 'lucide-react';

interface Resource {
    id: string;
    name: string;
    type: string;
    confidentialityLevel: string;
    ownerId: string;
    owner: { name: string };
    acls: any[];
}

interface ShareEntry {
    userId: string;
    permission: string;
}

export default function ManagerFilesPage() {
    const { currentUser } = useUser();
    const [files, setFiles] = useState<Resource[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [view, setView] = useState<'all' | 'mine' | 'shared'>('all');

    // UI State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<Resource | null>(null);
    const [fileLogs, setFileLogs] = useState<any[]>([]);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    // Upload Form State
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [confidentialityLevel, setConfidentialityLevel] = useState('INTERNAL');
    const [uploadShares, setUploadShares] = useState<ShareEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Temporary Share State (for adding rows)
    const [tempShareUser, setTempShareUser] = useState('');
    const [tempSharePerm, setTempSharePerm] = useState('READ');

    useEffect(() => {
        if (currentUser) {
            fetchFiles();
            fetchUsers();
        }
    }, [currentUser]);

    const fetchFiles = () => {
        if (!currentUser) return;
        fetch(`/api/manager/files?userId=${currentUser.id}`)
            .then(res => res.json())
            .then(setFiles)
            .catch(console.error);
    };

    const fetchUsers = () => {
        fetch('/api/users')
            .then(res => res.json())
            .then(setAllUsers)
            .catch(console.error);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setFileName(f.name);
        }
    };

    const addShare = () => {
        if (tempShareUser && tempSharePerm) {
            if (uploadShares.some(s => s.userId === tempShareUser)) return; // Prevent dupes
            setUploadShares([...uploadShares, { userId: tempShareUser, permission: tempSharePerm }]);
            setTempShareUser('');
        }
    };

    const removeShare = (userId: string) => {
        setUploadShares(uploadShares.filter(s => s.userId !== userId));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSubmitting(true);

        try {
            let fileContent = null;
            if (file) {
                fileContent = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            const res = await fetch('/api/manager/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fileName,
                    type: file?.type || 'document',
                    ownerId: currentUser.id,
                    confidentialityLevel,
                    fileContent,
                    shares: uploadShares
                })
            });

            if (res.ok) {
                fetchFiles();
                setIsUploadModalOpen(false);
                // Reset
                setFile(null);
                setFileName('');
                setUploadShares([]);
                setConfidentialityLevel('INTERNAL');
            } else {
                alert('Upload failed.');
            }
        } catch (e) {
            console.error(e);
            alert('Error uploading file.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openFile = async (r: Resource) => {
        if (!currentUser) return;
        await fetch('/api/manager/files/access', {
            method: 'POST',
            body: JSON.stringify({ resourceId: r.id, userId: currentUser.id, action: 'OPENED' })
        });
        alert(`Opening ${r.name}...`);
    };

    const viewLogs = async (r: Resource) => {
        if (!currentUser) return;
        // Logic check: Only owner or if you have WRITE permission? For now let owner view.
        // Actually, shared users probably shouldn't see logs.
        if (r.ownerId !== currentUser.id) {
            alert("Only the owner can view logs.");
            return;
        }

        setSelectedFile(r);
        const res = await fetch(`/api/manager/files/access?resourceId=${r.id}&ownerId=${currentUser.id}`);
        if (res.ok) {
            setFileLogs(await res.json());
            setIsLogModalOpen(true);
        }
    };

    const filteredFiles = files.filter(f => {
        if (!currentUser) return false;
        if (view === 'mine') return f.ownerId === currentUser.id;
        if (view === 'shared') return f.acls.some(a => a.granteeId === currentUser.id);
        return true;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Secure Files</h1>
                    <p className="text-slate-400">Manage and access your secure documents.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-4 h-4" /> Upload File
                    </button>
                    <button onClick={fetchFiles} className="text-slate-400 hover:text-white px-3 py-2 border border-[#334155] rounded-xl text-sm">Refresh</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-[#334155]">
                <button
                    onClick={() => setView('all')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${view === 'all' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    All Files
                </button>
                <button
                    onClick={() => setView('mine')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${view === 'mine' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    Shared by Me
                </button>
                <button
                    onClick={() => setView('shared')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${view === 'shared' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    Shared with Me
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFiles.length === 0 && <div className="col-span-full py-12 text-center text-slate-500">No files found used this filter.</div>}
                {filteredFiles.map(file => {
                    const isOwner = file.ownerId === currentUser?.id;
                    const sharedWithMe = !isOwner && file.acls.some(a => a.granteeId === currentUser?.id);

                    return (
                        <div key={file.id} className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-blue-500/30 transition-all group relative">
                            {sharedWithMe && <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded uppercase">Shared with Me</div>}
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${file.confidentialityLevel === 'TOP_SECRET' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                                        file.confidentialityLevel === 'CONFIDENTIAL' ? 'text-orange-400 border-orange-500/20 bg-orange-500/10' :
                                            'text-blue-400 border-blue-500/20 bg-blue-500/10'
                                    }`}>
                                    {file.confidentialityLevel}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-200 mb-1 truncate">{file.name}</h3>
                            <div className="text-xs text-slate-500 mb-4">Owner: <span className="text-slate-300">{file.owner.name}</span></div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#334155]">
                                {isOwner && (
                                    <button onClick={() => viewLogs(file)} className="flex-1 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-[#0F172A] rounded hover:bg-slate-700">
                                        Logs
                                    </button>
                                )}
                                <button onClick={() => openFile(file)} className="flex-1 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-500">
                                    Open
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155] bg-[#1E293B]/50 shrink-0">
                            <h2 className="text-xl font-bold text-white">Upload Secure File</h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            {/* File & Details */}
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">File</label>
                                <input type="file" onChange={handleFileChange} className="w-full text-slate-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-600/20 file:text-blue-400 file:border-0" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Display Name</label>
                                <input value={fileName} onChange={e => setFileName(e.target.value)} className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Confidentiality</label>
                                <select value={confidentialityLevel} onChange={e => setConfidentialityLevel(e.target.value)} className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white">
                                    <option value="INTERNAL">INTERNAL</option>
                                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                                    <option value="TOP_SECRET">TOP_SECRET</option>
                                </select>
                            </div>

                            {/* DAC Sharing */}
                            <div className="border-t border-[#334155] pt-4">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-3">Grant Access (DAC)</label>
                                <div className="flex gap-2 mb-2">
                                    <select value={tempShareUser} onChange={e => setTempShareUser(e.target.value)} className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-2 py-2 text-sm text-white">
                                        <option value="">Select User...</option>
                                        {allUsers.map(u => (u.id !== currentUser?.id && <option key={u.id} value={u.id}>{u.name} ({u.role})</option>))}
                                    </select>
                                    <select value={tempSharePerm} onChange={e => setTempSharePerm(e.target.value)} className="w-24 bg-[#1E293B] border border-[#334155] rounded-lg px-2 py-2 text-sm text-white">
                                        <option value="READ">Read</option>
                                        <option value="WRITE">Edit</option>
                                    </select>
                                    <button type="button" onClick={addShare} className="bg-blue-600/20 text-blue-400 px-3 rounded-lg text-sm font-medium hover:bg-blue-600/30">Add</button>
                                </div>

                                <div className="space-y-2">
                                    {uploadShares.map(share => {
                                        const u = allUsers.find(x => x.id === share.userId);
                                        return (
                                            <div key={share.userId} className="flex justify-between items-center bg-[#1E293B] p-2 rounded border border-[#334155] text-sm">
                                                <span className="text-slate-300">{u?.name} <span className="text-slate-500 text-xs">({share.permission})</span></span>
                                                <button type="button" onClick={() => removeShare(share.userId)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                                            </div>
                                        );
                                    })}
                                    {uploadShares.length === 0 && <div className="text-xs text-slate-500 italic">No users selected. File will be private to you (unless level matches).</div>}
                                </div>
                            </div>
                        </form>

                        <div className="px-6 py-5 border-t border-[#334155] bg-[#1E293B]/50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={handleUpload} disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl">
                                {isSubmitting ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logs Modal */}
            {isLogModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1E293B] border border-[#334155] rounded-2xl w-full max-w-xl p-6 relative">
                        <button onClick={() => setIsLogModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        <h2 className="text-xl font-bold text-white mb-4">Access Logs</h2>
                        <div className="max-h-80 overflow-y-auto space-y-2">
                            {fileLogs.map((log, i) => (
                                <div key={i} className="text-sm text-slate-300 border-b border-[#334155] pb-2 mb-2">
                                    <span className="font-bold text-white">{log.user?.name}</span> {log.action} <span className="text-slate-500 text-xs float-right">{new Date(log.createdAt).toLocaleString()}</span>
                                </div>
                            ))}
                            {fileLogs.length === 0 && <div className="text-slate-500">No logs.</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
