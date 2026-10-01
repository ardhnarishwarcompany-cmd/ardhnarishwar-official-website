import { useCallback, useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import SuperAdminGuard from './SuperAdminGuard';
import { listAuditLogs, listAllOrganizations } from '../api/client';

function AuditLogViewerInner() {
  const [orgs, setOrgs] = useState(null);
  const [orgId, setOrgId] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState({ data: [], total: 0, page: 1, limit: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listAllOrganizations({ limit: 100 }).then((r) => setOrgs(r.data)).catch(() => setOrgs([]));
  }, []);

  const load = useCallback((page = 1) => {
    setLoading(true);
    listAuditLogs({ page, limit: 50, organizationId: orgId || undefined, action: action || undefined })
      .then(setResult)
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [orgId, action]);

  useEffect(() => { load(1); }, [load]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Audit Log</h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
        <select className="admin-input" value={orgId} onChange={(e) => setOrgId(e.target.value)}>
          <option value="">All organizations</option>
          {orgs?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <input
          className="admin-input"
          placeholder="Filter by action (e.g. ORGANIZATION_CREATED)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          style={{ minWidth: 260 }}
        />
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {loading ? (
        <p className="admin-muted">Loading audit log…</p>
      ) : result.data.length === 0 ? (
        <div className="admin-card" style={{ padding: 24, textAlign: 'center' }}>
          <p className="admin-muted">No audit entries match these filters.</p>
        </div>
      ) : (
        <>
          <div className="admin-card" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((log) => (
                  <tr key={log.id}>
                    <td className="admin-muted" style={{ whiteSpace: 'nowrap' }}>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td>
                    <td>{log.user ? `${log.user.name} (${log.user.email})` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{log.action}</td>
                    <td className="admin-muted">{log.entityType ? `${log.entityType} #${log.entityId}` : '—'}</td>
                    <td className="admin-muted" style={{ fontSize: 12, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.metadata ? JSON.stringify(log.metadata) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
            <span className="admin-muted">{result.total} entr{result.total === 1 ? 'y' : 'ies'}</span>
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

export default function AuditLogViewer() {
  return (
    <SuperAdminGuard>
      <AuditLogViewerInner />
    </SuperAdminGuard>
  );
}