import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import AnimatedCounter from './AnimatedCounter';

const tooltipStyle = {
  contentStyle: { borderRadius: 10, border: '1px solid rgba(40,27,61,.1)', fontSize: 12 },
  labelStyle: { color: 'var(--ink)', fontWeight: 600 },
};

// Product/dashboard preview for a service's demo page. Renders stat cards +
// a small chart from serviceDemoContent.js by default (mock data, never real
// tenant data — the public services API only ever exposes marketing
// information). When the parent has successfully fetched real numbers from
// the live product (see liveStatsUrl / getServiceLiveStats), pass them in as
// `content` and set `live` — the label and indicator dot switch to reflect
// that these are real figures.
export default function ServiceDemoPreview({ content, label, live = false }) {
  const { stats = [], chart } = content || {};

  return (
    <div className="demo-window">
      <div className="demo-window-topbar">
        <span className="demo-window-dot dot-a" />
        <span className="demo-window-dot dot-b" />
        <span className={`demo-window-dot dot-c${live ? ' dot-live' : ''}`} />
        <span className="demo-window-title">
          {label ? `${label} · ` : ''}Live Preview {live ? '(live data)' : '(demo data)'}
        </span>
      </div>

      <div className="demo-window-body">
        {stats.length > 0 && (
          <div className="demo-stat-grid">
            {stats.map((s) => (
              <div className="demo-stat-card" key={s.label}>
                <div className="demo-stat-value">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="demo-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {chart && Array.isArray(chart.data) && chart.data.length > 0 && (
          <div className="demo-chart-panel">
            <div className="demo-chart-title">{chart.title}</div>
            <div style={{ width: '100%', height: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === 'line' ? (
                  <LineChart data={chart.data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(40,27,61,.08)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b7e94' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8b7e94' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip {...tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b245d"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#3b245d' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chart.data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(40,27,61,.08)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#8b7e94' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={chart.data.length > 4 ? -18 : 0}
                      textAnchor={chart.data.length > 4 ? 'end' : 'middle'}
                      height={chart.data.length > 4 ? 42 : 26}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#8b7e94' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(201,155,97,.1)' }} />
                    <Bar dataKey="value" fill="#c99b61" radius={[6, 6, 0, 0]} maxBarSize={38} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}