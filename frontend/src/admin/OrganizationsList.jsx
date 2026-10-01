import { useCallback, useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import SuperAdminGuard from './SuperAdminGuard';
import {
  listAllOrganizations,
  createOrganization,
  setOrganizationStatus,
  listOrganizationUsers,
} from '../api/client';

const STATUSES = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'INACTIVE'];
const STATUS_COLORS = {
  ACTIVE: { color: '#0f9d6e', background: 'rgba(15,157,110,0.12)' },
  TRIAL: { color: '#c99b61', background: 'rgba(201,155,97,0.14)' },
  SUSPENDED: { color: '#ef4444', background: 'rgba(239,68,68,0.10)' },
  INACTIVE: { color: '#786c87', background: 'rgba(120,108,135,0.10)' },
};

function emptyForm() {
  return { name: '', slug: '', email: '', phone: '', website: '', industry: '' };
}

function OrganizationsListInner() {
  const [result, setResult] = useState({ data: [], total: 0, page: 1, limit: 20 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [expandedId, setExpandedId] = useState(null);
  const [members, setMembers] = useState({});

  const load = useCallback((page = 1) => {
    setLoading(true);
    listAllOrganizations({ page, limit: 20, status: statusFilter || undefined })
      .then(setResult)
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  function slugify(name) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.slug) {
      setFormError('Name and slug are required.');
      return;
    }
    setSaving(true);
    try {
      await createOrganization(form);
      setForm(emptyForm());
      setShowForm(false);
      load(1);
    } catch (e) {
      setFormError(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(org, status) {
    if (status === org.status) return;
    try {
      const updated = await setOrganizationStatus(org.id, status);
      setResult((prev) => ({ ...prev, data: prev.data.map((o) => (o.id === org.id ? updated : o)) }));
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  async function toggleUsers(org) {
    if (expandedId === org.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(org.id);
    if (!members[org.id]) {
      try {
        const list = await listOrganizationUsers(org.id);
        setMembers((prev) => ({ ...prev, [org.id]: list }));
      } catch (e) {
        setMembers((prev) => ({ ...prev, [org.id]: { error: e.response?.data?.error || e.message } }));
      }
    }
  }

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Organizations</h1>
        <button type="button" className="admin-btn admin-btn-gold" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Organization'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-card" style={{ padding: 20, marginBottom: 20, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {formError && <div className="admin-alert admin-alert-error" style={{ gridColumn: '1 / -1' }}>{formError}</div>}
          <div>
            <label style={{ fontSize: 13 }}>Name *</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({ ...f, name, slug: f.slug && f.slug !== slugify(f.name) ? f.slug : slugify(name) }));
              }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 13 }}>Slug *</label>
            <input className="admin-input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13 }}>Email</label>
            <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13 }}>Phone</label>
            <input className="admin-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13 }}>Website</label>
            <input className="admin-input" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13 }}>Industry</label>
            <input className="admin-input" value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="admin-btn admin-btn-gold" disabled={saving}>
              {saving ? 'Creating…' : 'Create organization'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select className="admin-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {loading ? (
        <p className="admin-muted">Loading organizations…</p>
      ) : result.data.length === 0 ? (
        <div className="admin-card" style={{ padding: 24, textAlign: 'center' }}>
          <p className="admin-muted">No organizations yet.</p>
        </div>
      ) : (
        <>
          <div className="admin-card" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((org) => (
                  <>
                    <tr key={org.id}>
                      <td>{org.name}</td>
                      <td className="admin-muted">{org.slug}</td>
                      <td className="admin-muted">{org.email || '—'}</td>
                      <td>
                        <select
                          value={org.status}
                          onChange={(e) => handleStatusChange(org, e.target.value)}
                          style={{
                            fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 6, padding: '4px 8px',
                            ...(STATUS_COLORS[org.status] || {}),
                          }}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="admin-muted">{org.createdAt ? new Date(org.createdAt).toLocaleDateString() : '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button type="button" className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => toggleUsers(org)}>
                          {expandedId === org.id ? 'Hide users' : 'View users'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === org.id && (
                      <tr key={`${org.id}-users`}>
                        <td colSpan={6} style={{ background: 'rgba(0,0,0,0.02)' }}>
                          {!members[org.id] && <p className="admin-muted" style={{ margin: '8px 0' }}>Loading users…</p>}
                          {members[org.id]?.error && <p style={{ color: '#ef4444', margin: '8px 0' }}>{members[org.id].error}</p>}
                          {Array.isArray(members[org.id]) && members[org.id].length === 0 && (
                            <p className="admin-muted" style={{ margin: '8px 0' }}>No users in this organization yet.</p>
                          )}
                          {Array.isArray(members[org.id]) && members[org.id].length > 0 && (
                            <ul style={{ margin: '8px 0', paddingLeft: 18 }}>
                              {members[org.id].map((m) => (
                                <li key={m.id} style={{ fontSize: 13, marginBottom: 4 }}>
                                  {m.user?.name} ({m.user?.email}) — {m.role?.name || '—'}
                                  {m.isOwner ? ' · Owner' : ''} · {m.status}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
            <span className="admin-muted">{result.total} organization(s)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="admin-btn admin-btn-ghost" disabled={result.page <= 1} onClick={() => load(result.page - 1)}>Prev</button>
              <span className="admin-muted">Page {result.page} / {totalPages}</span>
              <button type="button" className="admin-btn admin-btn-ghost" disabled={result.page >= totalPages} onClick={() => load(result.page + 1)}>Next</button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default function OrganizationsList() {
  return (
    <SuperAdminGuard>
      <OrganizationsListInner />
    </SuperAdminGuard>
  );
}