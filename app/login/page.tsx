"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [mfaCode, setMfaCode] = useState(''); // MFA not fully implemented in API yet
  const [stage, setStage] = useState<'auth' | 'mfa'>('auth');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: '#e6eef8' }}>
      <div style={{ width: 420, background: '#1e293b', padding: 30, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <h2 style={{ marginTop: 0, marginBottom: 20, textAlign: 'center' }}>Sign in</h2>
        {error && <div style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '8px 12px', borderRadius: 6, marginBottom: 16, fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', color: '#94a3b8' }}>Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: 16 }}
            placeholder="admin@example.com"
          />

          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', color: '#94a3b8' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: 24 }}
            placeholder="••••••••"
          />

          <button style={{ width: '100%', padding: '12px', borderRadius: 6, background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
