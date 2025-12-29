import './globals.css';
import React from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

export const metadata = {
  title: 'Enterprise Access Control',
  description: 'Admin dashboard for Enterprise Access Control System',
};

import { UserProvider } from './context/UserContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-[#0F172A] text-slate-200">
        <UserProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950/30">
                {children}
              </main>
            </div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}

