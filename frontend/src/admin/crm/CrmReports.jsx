import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { crmReports } from '../../api/client';
import { PieChartCard, BarChartCard, LineChartCard } from '../charts/ChartCard';

function StatTable({ title, rows, labelKey = 'status', valueKey = 'count' }) {
  return (
    <div className="admin-card" style={{ padding: 16 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>{title}</h3>
      {(rows || []).length === 0 ? (
        <p className="admin-muted">No data</p>
      ) : (
        <table className="admin-table" style={{ width: '100%' }}>
          <thead><tr><th>Label</th><th>Count</th>{rows[0]?.totalValue != null && <th>Value</th>}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r[labelKey] || r.source || r.stage || '—'}</td>
                <td>{r[valueKey]}</td>
                {r.totalValue != null && <td>₹{Number(r.totalValue || 0).toLocaleString()}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function CrmReports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    crmReports()
      .then(setData)
      .catch((e) => setError(e.response?.data?.error || e.message));
  }, []);

  return (
    <AdminLayout>
      <h1 className="admin-page-title">CRM Reports</h1>
      <p className="admin-muted" style={{ margin: '4px 0 20px' }}>Visual breakdown of pipeline health and team activity</p>
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {!data && !error && <p className="admin-muted">Loading reports…</p>}
      {data && (
        <>
          <div style={{ marginBottom: 20 }}>
            <LineChartCard
              title="Leads &amp; Revenue Trend"
              sub="Last 6 months"
              data={(data.monthlyTrend || []).map((m) => ({ name: m.month, newLeads: m.newLeads, wonRevenue: m.wonRevenue }))}
              series={[
                { key: 'newLeads', label: 'New Leads', color: '#8b5cf6' },
                { key: 'wonRevenue', label: 'Won Revenue (₹)', color: '#c99b61' },
              ]}
              height={260}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <PieChartCard
              title="Leads by Status"
              data={(data.leadsByStatus || []).map((r) => ({ name: r.status, value: Number(r.count) }))}
            />
            <BarChartCard
              title="Leads by Source"
              data={(data.leadsBySource || []).map((r) => ({ name: r.source || 'Unknown', count: Number(r.count) }))}
              series={[{ key: 'count', label: 'Leads', color: '#3b82f6' }]}
            />
            <BarChartCard
              title="Opportunities by Stage"
              sub="Value in ₹"
              data={(data.oppsByStage || []).map((r) => ({ name: r.stage, value: Number(r.totalValue || 0) }))}
              series={[{ key: 'value', label: 'Value (₹)', color: '#10b981' }]}
              valueFormatter={(v) => `₹${Number(v).toLocaleString()}`}
            />
            <PieChartCard
              title="Won vs Lost"
              data={(data.wonVsLost || []).map((r) => ({ name: r.status, value: Number(r.count) }))}
              colors={['#10b981', '#ef4444', '#94a3b8']}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
            <BarChartCard
              title="Tasks by Status"
              height={220}
              data={(data.taskStats || []).map((r) => ({ name: r.status, count: Number(r.count) }))}
              series={[{ key: 'count', label: 'Tasks', color: '#f59e0b' }]}
            />
            <BarChartCard
              title="Tickets by Status"
              height={220}
              data={(data.ticketStats || []).map((r) => ({ name: r.status, count: Number(r.count) }))}
              series={[{ key: 'count', label: 'Tickets', color: '#06b6d4' }]}
            />
            <BarChartCard
              title="Follow-ups by Status"
              height={220}
              data={(data.followUpStats || []).map((r) => ({ name: r.status, count: Number(r.count) }))}
              series={[{ key: 'count', label: 'Follow-ups', color: '#a855f7' }]}
            />
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Detailed Breakdown</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <StatTable title="Leads by Status" rows={data.leadsByStatus} />
            <StatTable title="Leads by Source" rows={data.leadsBySource} labelKey="source" />
            <StatTable title="Opportunities by Stage" rows={data.oppsByStage} labelKey="stage" />
            <StatTable title="Won vs Lost" rows={data.wonVsLost} />
            <StatTable title="Tasks by Status" rows={data.taskStats} />
            <StatTable title="Tickets by Status" rows={data.ticketStats} />
            <StatTable title="Follow-ups by Status" rows={data.followUpStats} />
          </div>
        </>
      )}
    </AdminLayout>
  );
}
