"use client";
import React, { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // fetch real list
    (async function(){
      try{
        const res = await fetch('/api/admin/users', { headers: { authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` } });
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data.users || []);
      }catch(e){
        setUsers([]);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Users</h2>
      <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
        <table className="table">
          <thead>
            <tr><th>Email</th><th>Role</th><th>Clearance</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} style={{ color: 'rgba(230,238,248,0.6)' }}>No users (seed the DB or wire API)</td></tr>
            ) : users.map(u => (
              <tr key={u.id}><td>{u.email}</td><td>{u.roleId}</td><td>{u.clearance}</td><td><a href={`#/edit-${u.id}`} onClick={(e) => { e.preventDefault(); const newClear = prompt('New clearance (PUBLIC/INTERNAL/CONFIDENTIAL)', u.clearance) || u.clearance; const newRole = prompt('New roleId', u.roleId) || u.roleId; fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'content-type':'application/json', authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` }, body: JSON.stringify({ clearance: newClear, roleId: newRole }) }).then(()=>location.reload()) }}>Edit</a></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
