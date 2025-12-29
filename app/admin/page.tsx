"use client";

import React, { useState, useEffect } from 'react';

// Types mimicking Prisma schema
interface AdminUser {
  id: string;
  email: string;
  roleId: string;
  clearance: string;
  isAdmin: boolean;
  isLocked: boolean;
  mfaEnabled: boolean;
  attributes: string; // JSON
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
}

interface Label {
  id: string;
  name: string;
  level: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminUser>>({});

  // Create State
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({ email: '', password: '', roleId: '', clearance: 'INTERNAL', isAdmin: false });

  const getToken = () => localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${getToken()}` };
      const [uRes, rRes, lRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/roles', { headers }), // Need to ensure roles API exists or mock it
        fetch('/api/labels', { headers })
      ]);

      if (uRes.ok) setUsers((await uRes.json()).users);
      // Fallback for roles if API not implemented
      if (rRes.ok) setRoles((await rRes.json()).roles);
      else setRoles([{ id: '1', name: 'Employee' }, { id: '2', name: 'Manager' }, { id: '3', name: 'Admin' }]); // Mock fallback

      if (lRes.ok) setLabels((await lRes.json()).labels);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingUser(null);
        fetchData();
      } else {
        alert('Update failed');
      }
    } catch (e) {
      alert('Error updating user');
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createData)
      });
      if (res.ok) {
        setShowCreate(false);
        setCreateData({ email: '', password: '', roleId: '', clearance: 'INTERNAL', isAdmin: false });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Creation failed');
      }
    } catch (e) {
      alert('Error creating user: Network or System Error');
    }
  }

  // Styles
  // Using inline styles primarily to ensure functionality without reliant on Tailwind build success which had issues.
  // Will verify Tailwind later.
  const s = {
    page: { padding: '30px', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: 30, paddingBottom: 20, borderBottom: '1px solid #1e293b' },
    table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.9rem' },
    th: { textAlign: 'left' as const, padding: '12px 16px', background: '#1e293b', borderBottom: '2px solid #334155', color: '#94a3b8', textTransform: 'uppercase' as const, fontSize: '0.75rem', letterSpacing: '0.05em' },
    td: { padding: '12px 16px', borderBottom: '1px solid #1e293b' },
    btn: { padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
    badge: { padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 },
    modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalContent: { background: '#1e293b', padding: 30, borderRadius: 12, width: 500, maxWidth: '90%', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
    input: { width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: 6, marginBottom: 15 }
  };

  const getBadgeColor = (type: string, val: any) => {
    if (type === 'lock') return val ? '#ef4444' : '#22c55e'; // Red if locked, Green if open
    if (type === 'mfa') return val ? '#3b82f6' : '#64748b';
    return '#94a3b8';
  };

  if (loading) return <div style={{ padding: 40, color: 'white' }}>Loading Admin Console...</div>;

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Enterprise Admin Console</h1>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>User Management & Access Control Policies</p>
        </div>
        <div>
          <button style={{ ...s.btn, background: '#3b82f6', color: 'white' }} onClick={() => setShowCreate(true)}>+ Register User</button>
        </div>
      </header>

      <div style={{ background: '#1e293b', borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>User</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Role / Clearance</th>
              <th style={s.th}>MFA</th>
              <th style={s.th}>ABAC Attributes</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ background: u.isLocked ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{u.email}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>ID: {u.id.slice(0, 8)}...</div>
                </td>
                <td style={s.td}>
                  {u.isLocked ?
                    <span style={{ ...s.badge, background: '#fca5a5', color: '#7f1d1d' }}>LOCKED</span> :
                    <span style={{ ...s.badge, background: '#86efac', color: '#064e3b' }}>ACTIVE</span>
                  }
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ ...s.badge, background: 'rgba(255,255,255,0.1)' }}>{roles.find(r => r.id === u.roleId)?.name || u.roleId}</span>
                    <span style={{ ...s.badge, border: '1px solid #64748b', color: '#94a3b8' }}>{u.clearance}</span>
                  </div>
                </td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: u.mfaEnabled ? '#93c5fd' : '#f1f5f9', color: u.mfaEnabled ? '#1e3a8a' : '#94a3b8' }}>
                    {u.mfaEnabled ? 'ENABLED' : 'OFF'}
                  </span>
                </td>
                <td style={s.td}>
                  <code style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 4, display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.attributes === '{}' ? '—' : u.attributes}
                  </code>
                </td>
                <td style={s.td}>
                  <button onClick={() => { setEditingUser(u); setFormData(u); setShowModal(true); }} style={{ ...s.btn, background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', fontSize: '0.75rem' }}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {showModal && editingUser && (
        <div style={s.modal}>
          <div style={s.modalContent}>
            <h2 style={{ marginTop: 0 }}>Manage User: {editingUser.email}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.85rem' }}>Role</label>
                <select style={s.input} value={formData.roleId} onChange={e => setFormData({ ...formData, roleId: e.target.value })}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.85rem' }}>Clearance</label>
                <select style={s.input} value={formData.clearance} onChange={e => setFormData({ ...formData, clearance: e.target.value })}>
                  {labels.map(l => <option key={l.id} value={l.level}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <label style={{ display: 'block', marginBottom: 5, fontSize: '0.85rem' }}>ABAC Attributes (JSON)</label>
              <textarea
                style={{ ...s.input, height: 80, fontFamily: 'monospace', fontSize: '0.85rem' }}
                value={formData.attributes || '{}'}
                onChange={e => setFormData({ ...formData, attributes: e.target.value })}
              />
            </div>

            <div style={{ margin: '15px 0', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, display: 'flex', gap: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.isLocked || false} onChange={e => setFormData({ ...formData, isLocked: e.target.checked })} />
                <span style={{ color: formData.isLocked ? '#f87171' : 'inherit' }}>Lock Account</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.mfaEnabled || false} onChange={e => setFormData({ ...formData, mfaEnabled: e.target.checked })} />
                <span>Enable MFA</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ ...s.btn, background: 'transparent', border: '1px solid #475569' }}>Cancel</button>
              <button onClick={handleUpdate} style={{ ...s.btn, background: '#3b82f6', color: 'white' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div style={s.modal}>
          <div style={s.modalContent}>
            <h2 style={{ marginTop: 0 }}>Register User</h2>
            <input style={s.input} placeholder="Email" value={createData.email} onChange={e => setCreateData({ ...createData, email: e.target.value })} />
            <input style={s.input} type="password" placeholder="Password" value={createData.password} onChange={e => setCreateData({ ...createData, password: e.target.value })} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.85rem' }}>Role</label>
                <select style={s.input} value={createData.roleId} onChange={e => setCreateData({ ...createData, roleId: e.target.value })}>
                  <option value="">Select Role...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.85rem' }}>Clearance</label>
                <select style={s.input} value={createData.clearance} onChange={e => setCreateData({ ...createData, clearance: e.target.value })}>
                  {labels.map(l => <option key={l.id} value={l.level}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ margin: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={createData.isAdmin} onChange={e => setCreateData({ ...createData, isAdmin: e.target.checked })} />
                <span>Assign System Admin Privileges</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowCreate(false)} style={{ ...s.btn, background: 'transparent', border: '1px solid #475569' }}>Cancel</button>
              <button onClick={handleCreate} style={{ ...s.btn, background: '#22c55e', color: 'white' }}>Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
