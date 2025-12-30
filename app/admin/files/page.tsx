'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Shield, Lock, Upload, X, Users } from 'lucide-react';

interface Role {
    id: string;
    name: string;
}

interface Resource {
    id: string;
    name: string;
    type: string;
    confidentialityLevel: string;
    owner: { email: string };
    acls: { granteeRoleId: string, permission: string }[];
}

export default function AdminFilesPage() {
    const [files, setFiles] = useState<Resource[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState('Document');
    const [level, setLevel] = useState('INTERNAL');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const levels = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'TOP_SECRET'];

    useEffect(() => {
        fetchResources();
        fetchRoles();
    }, []);

    const fetchResources = () => {
        fetch('/api/resources', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.resources) setFiles(data.resources);
            })
            .catch(console.error);
    };

    const fetchRoles = () => {
        fetch('/api/roles')
            .then(res => res.json())
            .then(setRoles)
            .catch(console.error);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setFileName(f.name);
            setFileType(f.type || 'Document');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let fileContent = null;
            if (file) {
                // Convert to Base64
                fileContent = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    name: fileName,
                    type: fileType,
                    level: level,
                    roles: selectedRoles,
                    fileContent // Send Base64 data
                })
            });

            if (res.ok) {
                fetchResources();
                setIsModalOpen(false);
                // Reset form
                setFileName('');
                setFileType('Document');
                setLevel('INTERNAL');
                setSelectedRoles([]);
                setFile(null);
            } else {
                const err = await res.json();
                alert(`Failed to upload resource: ${err.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('An unexpected error occurred during upload.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleRole = (roleId: string) => {
        if (selectedRoles.includes(roleId)) {
            setSelectedRoles(selectedRoles.filter(id => id !== roleId));
        } else {
            setSelectedRoles([...selectedRoles, roleId]);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="text-slate-400 hover:text-white flex items-center gap-2 text-sm mb-2 transition-colors"
                >
                    &larr; Back to Dashboard
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Secure File Management</h1>
                        <p className="text-slate-400 mt-1">Manage files with MAC (Clearance) and RBAC (Role) restrictions</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Upload className="w-4 h-4" />
                        Upload File
                    </button>
                </div>
            </div>

            <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#0F172A] text-slate-400 font-medium border-b border-[#334155]">
                        <tr>
                            <th className="px-6 py-4">File Name</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Confidentiality (MAC)</th>
                            <th className="px-6 py-4">Restricted To Roles (RBAC)</th>
                            <th className="px-6 py-4">Owner</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                        {files.map(file => (
                            <tr key={file.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        {file.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{file.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${file.confidentialityLevel === 'TOP_SECRET' ? 'text-red-400 border-red-400/20 bg-red-400/10' :
                                        file.confidentialityLevel === 'CONFIDENTIAL' ? 'text-orange-400 border-orange-400/20 bg-orange-400/10' :
                                            file.confidentialityLevel === 'INTERNAL' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                                                'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
                                        }`}>
                                        {file.confidentialityLevel}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {file.acls.length > 0 ? (
                                            file.acls.map(acl => {
                                                const roleName = roles.find(r => r.id === acl.granteeRoleId)?.name || 'Unknown Role';
                                                return (
                                                    <span key={acl.granteeRoleId} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs border border-slate-600">
                                                        <Users className="w-3 h-3 mr-1" />
                                                        {roleName}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span className="text-slate-500 italic text-xs">All roles with clearance</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs">{file.owner.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {files.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No files uploaded yet.</div>
                )}
            </div>

            {/* Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155] bg-[#1E293B]/50 shrink-0">
                            <h2 className="text-xl font-bold text-white">Upload Secure File</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Selected File</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">File Name</label>
                                <input
                                    required
                                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={fileName}
                                    onChange={e => setFileName(e.target.value)}
                                    placeholder="e.g. Q4 Financial Report.pdf"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">File Type</label>
                                <input
                                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={fileType}
                                    onChange={e => setFileType(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Confidentiality Level (MAC)</label>
                                <p className="text-xs text-slate-500 mb-3">Only users with this clearance or higher can view this file.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {levels.map(lvl => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => setLevel(lvl)}
                                            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${level === lvl
                                                ? 'bg-blue-600 border-blue-500 text-white'
                                                : 'bg-[#1E293B] border-[#334155] text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Restrict to Roles (RBAC)</label>
                                <p className="text-xs text-slate-500 mb-3">Optional. If selected, ONLY these roles can view the file (must also match clearance).</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                    {roles.map(role => (
                                        <label key={role.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B] border border-[#334155] cursor-pointer hover:border-slate-500 transition-colors">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedRoles.includes(role.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                                                {selectedRoles.includes(role.id) && <Users className="w-3 h-3 text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedRoles.includes(role.id)}
                                                onChange={() => toggleRole(role.id)}
                                            />
                                            <span className={selectedRoles.includes(role.id) ? 'text-white' : 'text-slate-400'}>{role.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </form>

                        <div className="px-6 py-5 border-t border-[#334155] bg-[#1E293B]/50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-[#334155] rounded-xl transition-all">Cancel</button>
                            <button onClick={handleUpload} disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/20 transition-all">
                                {isSubmitting ? 'Uploading...' : 'Upload File'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
