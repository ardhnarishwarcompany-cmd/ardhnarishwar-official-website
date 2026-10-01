import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { crmListLeads, crmDeleteLead, crmExport } from '../../api/client';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function LeadsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');

  const load = useCallback(() => {
    setLoading(true);
    const params = {
      page: searchParams.get('page') || 1,
      limit: 20,
      search: search || undefined,
      status: status || undefined,
      priority: priority || undefined,
    };
    crmListLeads(params)
      .then(setResult)
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [searchParams, search, status, priority]);

  useEffect(() => { load(); }, [load]);

  function applyFilters(e) {
    e?.preventDefault();
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    if (status) next.set('status', status);
    if (priority) next.set('priority', priority);
    setSearchParams(next);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lead?')) return;
    try {
      await crmDeleteLead(id);
      load();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  async function handleExport() {
    try {
      const blob = await crmExport('leads');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crm-leads-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Leads</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={handleExport}>Export CSV</button>
          <Link to="/admin/crm/leads/new" className="admin-btn admin-btn-gold">+ New Lead</Link>
        </div>
      </div>

      <form onSubmit={applyFilters} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          className="admin-input"
          placeholder="Search name, email, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 200, flex: 1 }}
        />
        <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="admin-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button type="submit" className="admin-btn admin-btn-dark">Filter</button>
      </form>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {loading ? (
        <p className="admin-muted">Loading leads…</p>
      ) : result.data.length === 0 ? (
        <div className="admin-card" style={{ padding: 24, textAlign: 'center' }}>
          <p className="admin-muted">No leads found. Create a lead or wait for website contact forms.</p>
          <Link to="/admin/crm/leads/new" className="admin-btn admin-btn-gold" style={{ marginTop: 12 }}>Create first lead</Link>
        </div>
      ) : (
        <>
          <div className="admin-card" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Source</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((l) => (
                  <tr key={l.id}>
                    <td><Link to={`/admin/crm/leads/${l.id}`}>{l.name}</Link></td>
                    <td>{l.company || '—'}</td>
                    <td>{l.email || '—'}</td>
                    <td>{l.phone || '—'}</td>
                    <td>{l.status}</td>
                    <td>{l.priority}</td>
                    <td>{l.source || '—'}</td>
                    <td>{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link to={`/admin/crm/leads/${l.id}`} className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px' }}>View</Link>
                      <button type="button" className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px', color: '#ef4444' }} onClick={() => handleDelete(l.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
            <span className="admin-muted">{result.total} lead(s)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                disabled={result.page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(result.page - 1));
                  setSearchParams(next);
                }}
              >Prev</button>
              <span className="admin-muted">Page {result.page} / {result.totalPages}</span>
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                disabled={result.page >= result.totalPages}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(result.page + 1));
                  setSearchParams(next);
                }}
              >Next</button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
