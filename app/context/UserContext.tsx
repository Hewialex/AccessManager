
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { switchUser as switchUserAction } from '@/app/actions';

interface User {
    id: string;
    name: string;
    role: string;
    email: string;
    department?: string; // Added department
    permissions: string[];
}

interface UserContextType {
    currentUser: User | null;
    users: User[];
    isLoading: boolean;
    switchUser: (userId: string) => Promise<void>;
    hasPermission: (permission: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch('/api/users');
                const data = await res.json();
                setUsers(data);
                // In a real app, we would hydrate the logged-in user from the session/cookie
                // For this showcase, we default to Admin (first user usually)
                if (data.length > 0) {
                    // Try to recover state or default to admin
                    const savedId = localStorage.getItem('demo_current_user_id');
                    const found = data.find((u: User) => u.id === savedId) || data[0];
                    setCurrentUser(found);
                }
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const switchUser = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('demo_current_user_id', userId);
            await switchUserAction(userId);
        }
    };

    const hasPermission = (permission: string) => {
        // Admin role usually has all, but here we check the specific permission list from DB
        // For "Administrator" role we might want to wildcard, but our seed data gave explicit permissions too.
        if (!currentUser) return false;
        if (currentUser.role === 'Administrator') return true; // Super admin override for showcase comfort
        return currentUser.permissions.includes(permission);
    };

    return (
        <UserContext.Provider value={{ currentUser, users, isLoading, switchUser, hasPermission }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
