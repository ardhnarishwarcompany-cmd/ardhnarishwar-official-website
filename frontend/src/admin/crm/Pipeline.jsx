import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { crmGetPipeline, crmMoveStage } from '../../api/client';

const STAGES = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

export default function Pipeline() {
  const [pipeline, setPipeline] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    crmGetPipeline()
      .then(setPipeline)
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function onStageChange(id, stage) {
    try {
      await crmMoveStage(id, stage);
      load();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Sales Pipeline</h1>
        <Link to="/admin/crm/opportunities/new" className="admin-btn admin-btn-gold">+ Opportunity</Link>
      </div>
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {loading && <p className="admin-muted">Loading pipeline…</p>}
      {pipeline && (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12 }}>
          {STAGES.map((stage) => {
            const col = pipeline[stage] || { items: [], count: 0, totalValue: 0 };
            return (
              <div key={stage} style={{
                minWidth: 240, maxWidth: 280, background: 'var(--paper)',
                border: '1px solid var(--line)', borderRadius: 12, padding: 12,
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{stage}</strong>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{col.count}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                  ₹{Number(col.totalValue || 0).toLocaleString()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(col.items || []).map((o) => (
                    <div key={o.id} style={{
                      background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 8,
                      padding: 10,
                    }}>
                      <Link to={`/admin/crm/opportunities/${o.id}`} style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>
                        {o.title}
                      </Link>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                        {o.company?.name || '—'} · ₹{Number(o.expectedValue || 0).toLocaleString()}
                      </div>
                      <select
                        className="admin-input"
                        style={{ marginTop: 6, fontSize: 12, padding: '4px 6px' }}
                        value={o.stage}
                        onChange={(e) => onStageChange(o.id, e.target.value)}
                      >
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                  {(col.items || []).length === 0 && (
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>Empty</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}