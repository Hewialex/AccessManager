'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { UserProvider } from './context/UserContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    return (
        <UserProvider>
            <div className="flex min-h-screen bg-[#0F172A] text-slate-200">
                {!isAuthPage && <Sidebar />}
                <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isAuthPage ? 'h-screen' : ''}`}>
                    {!isAuthPage && <Topbar />}
                    <main className={`flex-1 overflow-y-auto ${!isAuthPage ? 'p-6 md:p-8 bg-slate-950/30' : 'h-full'}`}>
                        {children}
                    </main>
                </div>
            </div>
        </UserProvider>
    );
}
