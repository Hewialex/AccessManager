'use client';

import React, { useState } from 'react';

export default function MacDebugPage() {
    const [userId, setUserId] = useState('');
    const [resourceId, setResourceId] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/debug/test-mac', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, resourceId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
        color: '#e6eef8',
    };

    const cardStyle = {
        background: '#0f1c30',
        borderRadius: '12px',
        padding: '30px',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        margin: '8px 0 20px',
        background: '#071024',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px',
        color: '#fff',
        fontSize: '15px',
        outline: 'none',
    };

    const buttonStyle = {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '15px',
        width: '100%',
        opacity: loading ? 0.7 : 1,
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '28px', marginBottom: '10px', fontWeight: 600 }}>MAC Access Tester</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
                Verify Mandatory Access Control policies by simulating a user accessing a resource.
            </p>

            <div style={cardStyle}>
                <form onSubmit={handleTest}>
                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>User ID</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="e.g. c0c88f45-..."
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>Resource ID</label>
                        <input
                            type="text"
                            value={resourceId}
                            onChange={(e) => setResourceId(e.target.value)}
                            placeholder="e.g. 94661ec0-..."
                            style={inputStyle}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? 'Testing Access...' : 'Test Access Checks'}
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#fca5a5' }}>
                        Error: {error}
                    </div>
                )}

                {result && (
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div style={{
                                padding: '8px 16px',
                                borderRadius: '50px',
                                background: result.allowed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                color: result.allowed ? '#4ade80' : '#f87171',
                                fontWeight: 'bold',
                                border: `1px solid ${result.allowed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                            }}>
                                {result.allowed ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ background: '#071024', padding: '15px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>User Clearance</div>
                                <div style={{ fontSize: '16px', fontWeight: 500 }}>{result.userClearance}</div>
                            </div>
                            <div style={{ background: '#071024', padding: '15px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>Resource Level</div>
                                <div style={{ fontSize: '16px', fontWeight: 500 }}>
                                    {result.resourceLevel} <span style={{ opacity: 0.5 }}>({result.resourceLabel})</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <details>
                                <summary style={{ cursor: 'pointer', color: '#64748b', fontSize: '13px' }}>View Raw Response</summary>
                                <pre style={{ background: '#050b16', padding: '15px', borderRadius: '6px', fontSize: '12px', color: '#cbd5e1', overflowX: 'auto', marginTop: '10px' }}>
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </details>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
