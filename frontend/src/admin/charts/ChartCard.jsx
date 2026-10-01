import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Palette drawn from the platform's existing theme tokens (--plum, --gold, --lav)
// plus a few complementary slate/teal accents so multi-series charts stay legible.
export const CHART_COLORS = [
  '#8b5cf6', // plum/violet
  '#c99b61', // gold
  '#3b82f6', // blue
  '#10b981', // green
  '#f97316', // orange
  '#ef4444', // red
  '#06b6d4', // teal
  '#a855f7', // purple
  '#f59e0b', // amber
  '#64748b', // slate
];

function ChartShell({ title, sub, action, height = 280, children, empty }) {
  return (
    <div className="admin-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{title}</h3>
          {sub && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>{sub}</p>}
        </div>
        {action}
      </div>
      {empty ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="admin-muted" style={{ margin: 0 }}>No data yet</p>
        </div>
      ) : (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 10,
    fontSize: 12,
    boxShadow: '0 8px 24px rgba(15,23,42,.08)',
  },
  labelStyle: { color: 'var(--ink)', fontWeight: 600 },
  itemStyle: { color: 'var(--ink)' },
};

/**
 * Donut/pie chart. data = [{ name, value }]
 */
export function PieChartCard({ title, sub, data, height, valueFormatter, colors = CHART_COLORS }) {
  const rows = (data || []).filter((d) => Number(d.value) > 0);
  return (
    <ChartShell title={title} sub={sub} height={height} empty={rows.length === 0}>
      <PieChart>
        <Pie
          data={rows}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="82%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {rows.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v) => (valueFormatter ? valueFormatter(v) : v)} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: '#475569', lineHeight: '20px' }}
        />
      </PieChart>
    </ChartShell>
  );
}

/**
 * Vertical bar chart. data = [{ name, ...seriesKeys }]
 * series = [{ key, label, color }]
 */
export function BarChartCard({ title, sub, data, series, height, valueFormatter, action }) {
  const rows = data || [];
  return (
    <ChartShell title={title} sub={sub} height={height} empty={rows.length === 0} action={action}>
      <BarChart data={rows} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
          interval={0}
          angle={rows.length > 6 ? -20 : 0}
          textAnchor={rows.length > 6 ? 'end' : 'middle'}
          height={rows.length > 6 ? 50 : 30}
        />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} formatter={(v) => (valueFormatter ? valueFormatter(v) : v)} cursor={{ fill: 'rgba(148,163,184,.08)' }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label || s.key} fill={s.color || CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} maxBarSize={44} />
        ))}
      </BarChart>
    </ChartShell>
  );
}

/**
 * Line chart for trends over time. data = [{ name, ...seriesKeys }]
 */
export function LineChartCard({ title, sub, data, series, height, valueFormatter, action }) {
  const rows = data || [];
  return (
    <ChartShell title={title} sub={sub} height={height} empty={rows.length === 0} action={action}>
      <LineChart data={rows} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} formatter={(v) => (valueFormatter ? valueFormatter(v) : v)} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label || s.key}
            stroke={s.color || CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ChartShell>
  );
}