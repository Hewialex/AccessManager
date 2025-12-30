
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { switchUser as switchUserAction } from '@/app/actions';

interface User {
    id: string;
    name: string;
    role: string;
    email: string;
    department?: string; // Added department
    clearance: string; // Added clearance
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
        async function fetchMe() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data.user);
                } else {
                    setCurrentUser(null);
                    if (typeof window !== 'undefined' &&
                        !window.location.pathname.startsWith('/login') &&
                        !window.location.pathname.startsWith('/register')) {
                        window.location.href = '/login';
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchMe();

        // Fetch all users only for Admin if needed? For now we disable the list logic.
        // setUsers([]); 
    }, []);

    const switchUser = async (userId: string) => {
        // Deprecated: Now we use real login
        console.warn("Switch user deprecated. Use logout/login.");
    };

    const hasPermission = (permission: string) => {
        // Admin role usually has all, but here we check the specific permission list from DB
        // For "Administrator" role we might want to wildcard, but our seed data gave explicit permissions too.
        if (!currentUser) return false;
        if (currentUser.role === 'Administrator' || currentUser.role === 'Admin') return true; // Super admin override for showcase comfort
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
