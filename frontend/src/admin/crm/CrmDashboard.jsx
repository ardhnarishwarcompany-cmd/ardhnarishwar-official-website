import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { crmDashboard } from '../../api/client';
import { PieChartCard, BarChartCard } from '../charts/ChartCard';

function Kpi({ label, value, sub }) {
  return (
    <div className="admin-card" style={{ padding: '16px 18px', minWidth: 140 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: 'var(--ink)' }}>{value}</div>
      {sub != null && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const statusColor = {
  NEW: '#3b82f6', CONTACTED: '#8b5cf6', QUALIFIED: '#10b981',
  PROPOSAL: '#f59e0b', NEGOTIATION: '#f97316', WON: '#059669', LOST: '#ef4444',
};

export default function CrmDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmDashboard()
      .then(setData)
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="admin-muted">Loading CRM dashboard…</p>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-alert admin-alert-error">{error}</div>
      </AdminLayout>
    );
  }

  const k = data.kpis || {};

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="admin-page-title" style={{ margin: 0 }}>CRM Dashboard</h1>
          <p className="admin-muted" style={{ margin: '4px 0 0' }}>Live pipeline &amp; sales activity</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/admin/crm/leads/new" className="admin-btn admin-btn-gold">+ New Lead</Link>
          <Link to="/admin/crm/pipeline" className="admin-btn admin-btn-dark">Pipeline</Link>
          <Link to="/admin/crm/reports" className="admin-btn admin-btn-ghost">Reports</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Kpi label="Total Leads" value={k.totalLeads ?? 0} />
        <Kpi label="New Leads" value={k.newLeads ?? 0} />
        <Kpi label="Qualified" value={k.qualifiedLeads ?? 0} />
        <Kpi label="Open Opps" value={k.openOpportunities ?? 0} />
        <Kpi label="Won Deals" value={k.wonDeals ?? 0} />
        <Kpi label="Lost Deals" value={k.lostDeals ?? 0} />
        <Kpi label="Conversion" value={`${k.conversionRate ?? 0}%`} />
        <Kpi label="Follow-ups Due" value={k.followUpsDue ?? 0} />
        <Kpi label="Tasks Due" value={k.tasksDue ?? 0} />
        <Kpi label="Pipeline Value" value={`₹${Number(k.pipelineValue || 0).toLocaleString()}`} />
        <Kpi label="Won Revenue" value={`₹${Number(k.wonRevenue || 0).toLocaleString()}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <PieChartCard
          title="Leads by Status"
          sub="Current distribution across the pipeline"
          data={(data.leadsByStatus || []).map((s) => ({ name: s.status, value: Number(s.count) }))}
        />
        <BarChartCard
          title="Pipeline by Stage"
          sub="Number of open opportunities per stage"
          data={(data.pipelineByStage || []).map((s) => ({ name: s.stage, count: Number(s.count) }))}
          series={[{ key: 'count', label: 'Opportunities', color: '#8b5cf6' }]}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="admin-card" style={{ padding: 18 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Recent Leads</h3>
          {(data.recentLeads || []).length === 0 ? (
            <p className="admin-muted">No leads yet. Create one or wait for website inquiries.</p>
          ) : (
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.map((l) => (
                  <tr key={l.id}>
                    <td><Link to={`/admin/crm/leads/${l.id}`}>{l.name}</Link></td>
                    <td>{l.company || '—'}</td>
                    <td>
                      <span style={{
                        background: (statusColor[l.status] || '#94a3b8') + '22',
                        color: statusColor[l.status] || '#64748b',
                        padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      }}>{l.status}</span>
                    </td>
                    <td>{l.source || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ marginTop: 12 }}>
            <Link to="/admin/crm/leads" className="admin-btn admin-btn-ghost">View all leads →</Link>
          </div>
        </div>

        <div className="admin-card" style={{ padding: 18 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Recent Activities</h3>
          {(data.recentActivities || []).length === 0 ? (
            <p className="admin-muted">No activities logged yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {data.recentActivities.map((a) => (
                <li key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <strong>{a.type}</strong>
                  {a.subject ? ` — ${a.subject}` : ''}
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {a.activityDate ? new Date(a.activityDate).toLocaleString() : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="admin-card" style={{ padding: 18, marginTop: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Pipeline Summary</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(data.pipelineByStage || []).map((s) => (
            <div key={s.stage} style={{
              background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10,
              padding: '12px 16px', minWidth: 120,
            }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{s.stage}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{s.count}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>₹{Number(s.totalValue || 0).toLocaleString()}</div>
            </div>
          ))}
          {(data.pipelineByStage || []).length === 0 && (
            <p className="admin-muted">No opportunities in pipeline yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}