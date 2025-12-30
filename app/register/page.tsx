'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, User, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                // Success -> Redirect to workspace
                window.location.href = data.redirect;
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
            <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-green-600/20 text-green-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-400 mt-2">Join as an Employee</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                required
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                required
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
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
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-400">
                            Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Log In</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
