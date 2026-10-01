import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllTeam, updateTeamMember, deleteTeamMember } from '../api/client';

export default function TeamList() {
  const [members, setMembers] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    getAllTeam().then(setMembers).catch(() => setError(true));
  }

  useEffect(load, []);

  async function togglePublish(member) {
    const updated = await updateTeamMember(member.id, { isPublished: !member.isPublished });
    setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
  }

  async function handleDelete(member) {
    if (!confirm(`Delete "${member.name}"? This can't be undone.`)) return;
    await deleteTeamMember(member.id);
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">Team</h1>
        <Link to="/admin/team/new" className="admin-btn admin-btn-gold">
          + New team member
        </Link>
      </div>

      {error && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Could not load team members.</p>}
      {!error && !members && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Loading…</p>}
      {members && members.length === 0 && (
        <p style={{color:"#786c87",fontSize:14,marginTop:24}}>No team members yet — add the first one.</p>
      )}

      {members && members.length > 0 && (
        <div className="mt-8 divide-y divide-ink/10 border-t border-b border-ink/10">
          {members.map((m) => (
            <div key={m.id} className="py-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted mt-0.5">{m.role || 'No role set'}</p>
              </div>

              <button
                onClick={() => togglePublish(m)}
                className="text-xs px-2.5 py-1 rounded-sm flex-shrink-0"
                style={
                  m.isPublished
                    ? { color: 'var(--color-teal)', background: 'color-mix(in srgb, var(--color-teal) 12%, transparent)' }
                    : { color: 'var(--color-muted)', background: 'color-mix(in srgb, var(--color-ink) 5%, transparent)' }
                }
              >
                {m.isPublished ? 'Published' : 'Draft'}
              </button>

              <Link to={`/admin/team/${m.id}/edit`} className="text-sm text-muted hover:text-gold flex-shrink-0">
                Edit
              </Link>
              <button onClick={() => handleDelete(m)} className="text-sm text-muted hover:text-red-500 flex-shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
