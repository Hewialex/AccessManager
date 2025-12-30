'use client';

import React, { useEffect, useState } from 'react';
import { User, Shield, Lock, MapPin, Briefcase, MoreHorizontal, Edit, Plus } from 'lucide-react';
import UserModal from '@/app/components/ui/UserModal';
import { useUser } from '../context/UserContext';

// ... interface UserData ...
interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    roleId?: string; // Need this for the modal select
    clearance: string;
    department?: string;
    jobTitle?: string;
    attributes: Record<string, string>;
}

export default function UsersPage() {
    const { hasPermission } = useUser();
    const [users, setUsers] = useState<UserData[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = () => {
        fetch('/api/users')
            .then(res => res.json())
            .then(setUsers)
            .catch(console.error);
    };

    const fetchRoles = () => {
        fetch('/api/roles')
            .then(res => res.json())
            .then(setRoles)
            .catch(console.error);
    };

    useEffect(() => {
        if (hasPermission('user_manage')) {
            fetchUsers();
            fetchRoles();
        }
    }, [hasPermission]);

    const handleEdit = (user: UserData) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            let res;
            if (selectedUser) {
                // Update existing user
                res = await fetch(`/api/users/${selectedUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                // Create new user (data includes name, email, password)
                res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            if (!res.ok) {
                const err = await res.json();
                alert(`Error: ${err.error || 'Operation failed'}`);
                return;
            }

            fetchUsers();
            setIsModalOpen(false);
        } catch (e) {
            console.error(e);
            alert('An unexpected error occurred.');
        }
    };

    if (!hasPermission('user_manage')) return <div className="p-6 text-slate-400">You do not have permission to view this page.</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-slate-400 hover:text-white flex items-center gap-2 text-sm mb-2 transition-colors"
                    >
                        &larr; Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-slate-100">Users & Groups</h1>
                    <p className="text-slate-400 mt-1">View users and their assigned attributes (ABAC)</p>
                </div>
                <button
                    onClick={handleAddUser}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#0F172A] text-slate-400 font-medium border-b border-[#334155]">
                        <tr>
                            <th className="px-6 py-4 w-64">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Clearance (MAC)</th>
                            <th className="px-6 py-4">Attributes (ABAC)</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium">
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-200">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
                                        <Shield className="w-3 h-3" />
                                        {user.role}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${user.clearance === 'TOP_SECRET' ? 'text-red-400 border-red-400/20 bg-red-400/10' :
                                        user.clearance === 'CONFIDENTIAL' ? 'text-orange-400 border-orange-400/20 bg-orange-400/10' :
                                            'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
                                        }`}>
                                        {user.clearance}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {user.department && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs border border-slate-700">
                                                <Briefcase className="w-3 h-3" /> {user.department}
                                            </span>
                                        )}
                                        {Object.entries(user.attributes || {}).map(([k, v]) => (
                                            <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs border border-slate-700">
                                                <span className="text-slate-500">{k}:</span> {v}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                roles={roles}
                onSave={handleSave}
            />
        </div>
    );
}
