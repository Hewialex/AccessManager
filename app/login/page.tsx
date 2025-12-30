'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        // If demo mode needs localStorage reset:
        localStorage.removeItem('token');
        // We might rely on cookies now, but if your frontend uses localStorage 'token' for headers:
        // We should probably set it if the API returned it?
        // The cookie is set (httpOnly), so middleware works. 
        // But client calls explicitly checking "Bearer " locally might fail if we don't store it.
        // However, our verifyAuth now checks cookies! So we are good.

        // Force reload or redirect
        window.location.href = data.redirect || '/';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
      <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-2">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-400">
              Don't have an account? <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create one</Link>
            </p>
          </div>
        </form>

        {/* Demo Credentials Hint */}
        <div className="mt-8 pt-6 border-t border-[#334155] text-center">
          <p className="text-xs text-slate-500 mb-2">Demo Credentials:</p>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
            <div className="bg-[#0F172A] p-2 rounded border border-[#334155]">
              <div className="font-bold text-white">Admin</div>
              <div>admin@example.com</div>
              <div>Admin#1234</div>
            </div>
            <div className="bg-[#0F172A] p-2 rounded border border-[#334155]">
              <div className="font-bold text-orange-400">Manager</div>
              <div>martha@example.com</div>
              <div>password123</div>
            </div>
            <div className="bg-[#0F172A] p-2 rounded border border-[#334155]">
              <div className="font-bold text-green-400">Employee</div>
              <div>abebe@example.com</div>
              <div>password123</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 italic">* Defaults unless changed</p>
        </div>
      </div>
    </div>
  );
}
