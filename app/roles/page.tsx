
'use client';

import React, { useEffect, useState } from 'react';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import RoleModal from '@/app/components/ui/RoleModal';
import { useUser } from '../context/UserContext';
import RoleRequestList from '@/app/components/ui/RoleRequestList';

interface Role {
    id: string;
    name: string;
    description: string;
    type: string;
    userCount: number;
    permissions: string[]; // names
    permissionCount: number;
}

export default function RolesPage() {
    const { hasPermission } = useUser();
    const [roles, setRoles] = useState<Role[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const fetchRoles = () => {
        fetch('/api/roles')
            .then(res => res.json())
            .then(setRoles)
            .catch(console.error);
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreate = () => {
        setEditingRole(null);
        setIsModalOpen(true);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            fetchRoles();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <RoleRequestList />
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Roles</h1>
                    <p className="text-slate-400 mt-1">Manage system roles and permissions</p>
                </div>
                {hasPermission('role_manage') && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Role
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-[#1E293B] rounded-lg border border-[#334155] p-5 hover:border-blue-500/50 transition-colors group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                                    {role.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-100">{role.name}</h3>
                                    <span className="text-xs text-slate-500">{role.type}</span>
                                </div>
                            </div>
                            <div className="relative">
                                <button className="text-slate-500 hover:text-slate-300 p-1 rounded-md">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 mb-6 h-10 line-clamp-2">
                            {role.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-[#334155]">
                            <div className="text-xs text-slate-500">
                                <span className="text-slate-300 font-medium">{role.userCount}</span> users
                                <span className="mx-2">•</span>
                                <span className="text-slate-300 font-medium">{role.permissionCount}</span> permissions
                            </div>

                            <button
                                onClick={() => handleEdit(role)}
                                className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Edit className="w-3 h-3" /> Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <RoleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingRole}
            />
        </div>
    );
}
