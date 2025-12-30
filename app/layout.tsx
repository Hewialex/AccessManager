import './globals.css';
import React from 'react';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Enterprise Access Control',
  description: 'Admin dashboard for Enterprise Access Control System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-[#0F172A] text-slate-200">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

