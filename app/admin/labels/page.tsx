"use client";
import React, { useEffect, useState } from 'react';

type Label = { id: string; name: string; level: string; description?: string };

export default function AdminLabels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('INTERNAL');
  const [description, setDescription] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchLabels() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/labels', { headers: { authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLabels(data.labels || []);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) fetchLabels(); }, [token]);

  async function createLabel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/labels', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ name, level, description }) });
      if (!res.ok) throw new Error(await res.text());
      setName(''); setDescription(''); setLevel('INTERNAL');
      await fetchLabels();
    } catch (err: any) {
      setError(String(err.message || err));
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>Admin — Security Labels (MAC)</h1>
      <p>Only system administrators may manage these system-controlled labels. Paste an admin JWT to authenticate requests.</p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Admin JWT (paste here)</label>
        <input value={token} onChange={e => setToken(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div>
          <h3>Existing labels</h3>
          {loading && <div>Loading…</div>}
          {error && <div style={{ color: 'crimson' }}>{error}</div>}
          <ul>
            {labels.map(l => (
              <li key={l.id}><strong>{l.name}</strong> — {l.level} {l.description ? `— ${l.description}` : ''}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Create label</h3>
          <div style={{ marginBottom: 8 }}>
            <input placeholder="Label name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6 }}>
              <option value="PUBLIC">PUBLIC</option>
              <option value="INTERNAL">INTERNAL</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <textarea placeholder="Optional description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, minHeight: 80 }} />
          </div>
          <div>
            <button onClick={createLabel} disabled={loading || !token} style={{ padding: '8px 12px', background: '#111827', color: 'white', borderRadius: 6, border: 'none' }}>Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}
