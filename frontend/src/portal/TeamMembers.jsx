import { useEffect, useState } from 'react';
import {
  listOrgMembers,
  inviteOrgMember,
  updateMemberRole,
  updateMemberStatus,
  listRoleCatalog,
} from '../api/client';

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', roleName: 'SALES_USER' });
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [m, r] = await Promise.all([listOrgMembers(), listRoleCatalog()]);
      setMembers(m);
      setRoles(r);
      if (r.length && !form.roleName) {
        setForm((f) => ({ ...f, roleName: r[0].name }));
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleInvite(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await inviteOrgMember(form);
      setSuccess(`Invited ${form.email} as ${form.roleName}`);
      setShowInvite(false);
      setForm({ name: '', email: '', roleName: roles[0]?.name || 'SALES_USER' });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(userId, roleName) {
    setError('');
    try {
      await updateMemberRole(userId, roleName);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  async function changeStatus(userId, status) {
    setError('');
    try {
      await updateMemberStatus(userId, status);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Team members</h1>
          <p className="text-sm text-muted">
            Invite people and assign roles. Permissions are enforced on every CRM API.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="text-sm bg-ink text-white px-4 py-2 rounded-lg hover:bg-teal"
        >
          {showInvite ? 'Cancel' : '+ Invite member'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm">{success}</div>}

      {showInvite && (
        <form onSubmit={handleInvite} className="bg-white border border-line rounded-xl p-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Role *</label>
            <select
              required
              value={form.roleName}
              onChange={(e) => setForm({ ...form, roleName: e.target.value })}
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name}>{r.name}{r.description ? ` — ${r.description.slice(0, 48)}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-soft-orange hover:bg-[var(--soft-orange-dark)] text-white text-sm py-2 rounded-lg disabled:opacity-60"
            >
              {busy ? 'Inviting…' : 'Send invite'}
            </button>
          </div>
          <p className="sm:col-span-2 text-xs text-muted">
            New users receive a temporary password path (forgot-password). Existing platform accounts are added to this organization.
          </p>
        </form>
      )}

      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Membership</th>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Last login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">Loading…</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No members yet</td></tr>
            ) : members.map((m) => (
              <tr key={m.id} className="hover:bg-paper">
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">
                    {m.user?.name || '—'}
                    {m.isOwner && <span className="ml-2 text-[10px] uppercase bg-paper-2 text-gold px-1.5 py-0.5 rounded">Owner</span>}
                  </div>
                  <div className="text-xs text-muted">{m.user?.email}</div>
                </td>
                <td className="px-4 py-3">
                  {m.isOwner ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-paper-2">{m.role?.name}</span>
                  ) : (
                    <select
                      value={m.role?.name || ''}
                      onChange={(e) => changeRole(m.userId, e.target.value)}
                      className="text-xs border border-line rounded px-2 py-1 max-w-[160px]"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-4 py-3">
                  {m.isOwner ? (
                    <span className="text-xs text-muted">{m.status}</span>
                  ) : (
                    <select
                      value={m.status}
                      onChange={(e) => changeStatus(m.userId, e.target.value)}
                      className="text-xs border border-line rounded px-2 py-1"
                    >
                      {['ACTIVE', 'INVITED', 'SUSPENDED'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted">{m.user?.status || '—'}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {m.user?.lastLoginAt ? new Date(m.user.lastLoginAt).toLocaleString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {roles.length > 0 && (
        <div className="bg-white border border-line rounded-xl p-4">
          <h2 className="font-semibold text-ink mb-2 text-sm">Available roles</h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            {roles.map((r) => (
              <li key={r.id} className="text-sm border border-line rounded-lg px-3 py-2">
                <span className="font-medium text-ink">{r.name}</span>
                {r.description && <p className="text-xs text-muted mt-0.5">{r.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
