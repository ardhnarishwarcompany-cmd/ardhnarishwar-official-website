import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllServices, getAllBlogPosts, getSubmissions, getAllTestimonials } from '../api/client';
import { PieChartCard, BarChartCard } from './charts/ChartCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);

  useEffect(() => {
    Promise.all([getAllServices(), getAllBlogPosts(), getSubmissions(), getAllTestimonials()])
      .then(([services, posts, submissions, testimonials]) => {
        const svc = Array.isArray(services) ? services : [];
        const pts = Array.isArray(posts) ? posts : [];
        const subs = Array.isArray(submissions) ? submissions : [];
        const tests = Array.isArray(testimonials) ? testimonials : [];
        setStats({
          services: svc.length,
          publishedServices: svc.filter((s) => s.isPublished).length,
          posts: pts.length,
          publishedPosts: pts.filter((p) => p.isPublished).length,
          newSubmissions: subs.filter((s) => s.status === 'new').length,
          totalSubmissions: subs.length,
          testimonials: tests.length,
          publishedTestimonials: tests.filter((t) => t.isPublished).length,
        });

        const byCategory = {};
        svc.forEach((s) => {
          const cat = s.category || 'Uncategorized';
          if (!byCategory[cat]) byCategory[cat] = { total: 0, published: 0 };
          byCategory[cat].total += 1;
          if (s.isPublished) byCategory[cat].published += 1;
        });
        setCategoryStats(
          Object.entries(byCategory)
            .map(([category, v]) => ({ category, ...v }))
            .sort((a, b) => b.total - a.total)
        );
      })
      .catch(() => setStats(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Solutions', value: stats.services, sub: `${stats.publishedServices} published`, to: '/admin/services' },
        { label: 'Insights posts', value: stats.posts, sub: `${stats.publishedPosts} published`, to: '/admin/blog' },
        { label: 'New submissions', value: stats.newSubmissions, sub: `${stats.totalSubmissions} total`, to: '/admin/submissions' },
        { label: 'Testimonials', value: stats.testimonials, sub: `${stats.publishedTestimonials} published`, to: '/admin/testimonials' },
      ]
    : [];

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-sub">A quick look at your site's content.</p>

      {stats === false && (
        <p style={{ color: '#786c87', fontSize: 14 }}>Something went wrong loading the dashboard.</p>
      )}

      {stats === null && (
        <p style={{ color: '#786c87', fontSize: 14 }}>Loading…</p>
      )}

      {stats && (
        <div className="admin-stat-grid">
          {cards.map((c) => (
            <Link key={c.label} to={c.to} className="admin-stat">
              <div className="label">{c.label}</div>
              <div className="value">{c.value}</div>
              <div className="sub">{c.sub}</div>
            </Link>
          ))}
        </div>
      )}

      {stats && (
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <PieChartCard
            title="Content Distribution"
            sub="Published items across the site"
            data={[
              { name: 'Solutions', value: stats.publishedServices },
              { name: 'Insights posts', value: stats.publishedPosts },
              { name: 'Testimonials', value: stats.publishedTestimonials },
            ]}
          />
          {categoryStats.length > 0 && (
            <BarChartCard
              title="Modules by Category"
              sub="Total vs. published"
              data={categoryStats.map((c) => ({ name: c.category, total: c.total, published: c.published }))}
              series={[
                { key: 'total', label: 'Total', color: '#c99b61' },
                { key: 'published', label: 'Published', color: '#8b5cf6' },
              ]}
            />
          )}
        </div>
      )}

      {categoryStats.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Modules by category</h2>
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Modules</th>
                  <th>Published</th>
                  <th style={{ textAlign: 'right' }}>Manage</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map((c) => (
                  <tr key={c.category}>
                    <td style={{ fontWeight: 600 }}>{c.category}</td>
                    <td style={{ color: '#786c87' }}>{c.total}</td>
                    <td style={{ color: '#786c87' }}>{c.published} / {c.total}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to="/admin/services" className="admin-btn admin-btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Link to="/admin/services/new" className="admin-btn admin-btn-gold">+ New solution</Link>
        <Link to="/admin/blog/new" className="admin-btn admin-btn-dark">+ New post</Link>
        <Link to="/admin/team/new" className="admin-btn admin-btn-ghost">+ Team member</Link>
        <Link to="/admin/testimonials/new" className="admin-btn admin-btn-ghost">+ Testimonial</Link>
        <Link to="/admin/settings" className="admin-btn admin-btn-ghost">Platform links & settings</Link>
      </div>
    </AdminLayout>
  );
}
