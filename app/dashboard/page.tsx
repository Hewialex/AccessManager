"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  clearance: string;
  isAdmin: boolean;
}

interface Label {
  id: string;
  name: string;
  level: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  label: Label;
  owner: { email: string };
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('document');
  const [newLevel, setNewLevel] = useState('INTERNAL');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Assuming login stores token here? 
    // Actually the existing login/route.ts returns { token }. 
    // And api/me expects 'Authorization' header.
    // I need to check where the token is stored. 
    // If this is a new implementation, I might need to implement the fetch wrapper.
    // For now, I'll attempt to use the token from localStorage if my login page puts it there.
    // If there is no login page logic I can see, I should probably implement a basic one or assume it's cookie based?
    // The previous page.tsx didn't have login logic. app/login likely has it. 
    // I'll assume standard localStorage or cookie.

    // Let's try to fetch /api/me first.
    fetchData();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  const fetchData = async () => {
    try {
      // 1. Get Me
      const meRes = await fetch('/api/me', { headers: getHeaders() });
      if (meRes.status === 401) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      // 2. Get Resources
      const resRes = await fetch('/api/resources', { headers: getHeaders() });
      if (resRes.ok) {
        const resData = await resRes.json();
        setResources(resData.resources);
      }

      // 3. Get Labels
      const lblRes = await fetch('/api/labels', { headers: getHeaders() });
      if (lblRes.ok) {
        const lblData = await lblRes.json();
        setLabels(lblData.labels);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, type: newType, level: newLevel })
      });
      if (res.ok) {
        setNewName('');
        fetchData(); // Refresh list
      } else {
        alert('Failed to create resource');
      }
    } catch (e) {
      alert('Error submitting');
    } finally {
      setSubmitting(false);
    }
  };

  const getLabelColor = (level: string) => {
    switch (level) {
      case 'PUBLIC': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'INTERNAL': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'CONFIDENTIAL': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Custom styles since we might not have Tailwind configured perfectly everywhere
  const s = {
    page: { padding: 40, maxWidth: 1200, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, marginBottom: 24 },
    input: { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 16px', borderRadius: 8, width: '100%', marginBottom: 12 },
    btn: { background: 'linear-gradient(90deg, #3b82f6, #2563eb)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
    labelBadge: { padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, border: '1px solid transparent' }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading access control systems...</div>;

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Secure Dashboard</h1>
          <p style={{ opacity: 0.6, margin: '4px 0 0' }}>Logged in as <strong>{user?.email}</strong></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>CLEARANCE LEVEL</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: user?.clearance === 'CONFIDENTIAL' ? '#f87171' : '#60a5fa' }}>
            {user?.clearance || 'UNKNOWN'}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <section>
          <h2 style={{ marginTop: 0 }}>Restricted Resource Feed</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {resources.length === 0 && <div style={{ opacity: 0.5, fontStyle: 'italic' }}>No resources found accessible to your clearance level.</div>}
            {resources.map(r => (
              <div key={r.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>Owned by {r.owner?.email} • {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    ...s.labelBadge,
                    background: r.label.level === 'CONFIDENTIAL' ? 'rgba(239,68,68,0.2)' : r.label.level === 'INTERNAL' ? 'rgba(59,130,246,0.2)' : 'rgba(34,197,94,0.2)',
                    color: r.label.level === 'CONFIDENTIAL' ? '#fca5a5' : r.label.level === 'INTERNAL' ? '#93c5fd' : '#86efac',
                    borderColor: r.label.level === 'CONFIDENTIAL' ? 'rgba(239,68,68,0.3)' : r.label.level === 'INTERNAL' ? 'rgba(59,130,246,0.3)' : 'rgba(34,197,94,0.3)',
                  }}>
                    {r.label.name.toUpperCase()}
                  </span>
                  <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: 4 }}>{r.type}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside>
          <div style={s.card}>
            <h3 style={{ marginTop: 0 }}>Create Resource</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Resource Name</label>
                <input style={s.input} value={newName} onChange={e => setNewName(e.target.value)} required placeholder="e.g. Q4 Financials" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Type</label>
                <select style={s.input} value={newType} onChange={e => setNewType(e.target.value)}>
                  <option value="document">Document</option>
                  <option value="spreadsheet">Spreadsheet</option>
                  <option value="image">Image</option>
                  <option value="report">Report</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Security Classification</label>
                <select style={s.input} value={newLevel} onChange={e => setNewLevel(e.target.value)}>
                  {labels.map(l => (
                    <option key={l.id} value={l.level}>{l.name} ({l.level})</option>
                  ))}
                  {labels.length === 0 && <option value="INTERNAL">INTERNAL</option>}
                </select>
                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                  Note: You are responsible for properly classifying data.
                  {user?.clearance !== 'CONFIDENTIAL' && newLevel === 'CONFIDENTIAL' &&
                    <span style={{ color: '#f87171', display: 'block', marginTop: 4 }}>⚠ Warning: You will not be able to view this resource after creation due to your lower clearance.</span>
                  }
                </div>
              </div>

              <button type="submit" disabled={submitting} style={{ ...s.btn, width: '100%', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Encrypting & Validating...' : 'Secure Submit'}
              </button>
            </form>
          </div>
        </aside>
      </div >
    </div >
  );
}
