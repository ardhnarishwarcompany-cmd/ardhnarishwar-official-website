import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { crmListOpportunities, crmDeleteOpportunity, crmExport } from '../../api/client';

export default function OpportunitiesList() {
  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    crmListOpportunities({ search: search || undefined, status: status || undefined, limit: 50 })
      .then(setResult)
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!confirm('Delete this opportunity?')) return;
    await crmDeleteOpportunity(id);
    load();
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Opportunities</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={async () => {
            const blob = await crmExport('opportunities');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'opportunities.csv'; a.click();
          }}>Export</button>
          <Link to="/admin/crm/opportunities/new" className="admin-btn admin-btn-gold">+ Opportunity</Link>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input className="admin-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
        <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="OPEN">OPEN</option>
          <option value="WON">WON</option>
          <option value="LOST">LOST</option>
        </select>
        <button type="button" className="admin-btn admin-btn-dark" onClick={load}>Filter</button>
      </div>
      {loading ? <p className="admin-muted">Loading…</p> : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Title</th><th>Company</th><th>Stage</th><th>Status</th><th>Value</th><th>Close</th><th></th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/admin/crm/opportunities/${o.id}`}>{o.title}</Link></td>
                  <td>{o.company?.name || '—'}</td>
                  <td>{o.stage}</td>
                  <td>{o.status}</td>
                  <td>₹{Number(o.expectedValue || 0).toLocaleString()}</td>
                  <td>{o.expectedCloseDate || '—'}</td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-ghost" style={{ color: '#ef4444', padding: '4px 8px' }} onClick={() => handleDelete(o.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.data.length === 0 && <p className="admin-muted" style={{ padding: 16 }}>No opportunities yet.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
