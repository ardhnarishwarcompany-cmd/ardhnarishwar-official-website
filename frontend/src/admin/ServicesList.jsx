import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllServices, updateService, deleteService } from '../api/client';

export default function ServicesList() {
  const [services, setServices] = useState(null);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  function load() {
    getAllServices().then(setServices).catch(() => setError(true));
  }
  useEffect(load, []);

  const categories = useMemo(() => {
    if (!services) return ['All'];
    return ['All', ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];
  }, [services]);

  const visibleServices = useMemo(() => {
    if (!services) return [];
    return activeCategory === 'All' ? services : services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  async function togglePublish(service) {
    const updated = await updateService(service.id, { isPublished: !service.isPublished });
    setServices((prev) => prev.map((s) => (s.id === service.id ? updated : s)));
  }

  async function handleDelete(service) {
    if (!confirm(`Delete "${service.title}"? This can't be undone.`)) return;
    await deleteService(service.id);
    setServices((prev) => prev.filter((s) => s.id !== service.id));
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 className="admin-page-title">Solutions</h1>
          <p className="admin-page-sub">Manage platform modules and services — {services ? services.length : '…'} total.</p>
        </div>
        <Link to="/admin/services/new" className="admin-btn admin-btn-gold">+ New solution</Link>
      </div>

      {error && <p style={{ color: '#786c87', fontSize: 14 }}>Could not load solutions.</p>}
      {!error && !services && <p style={{ color: '#786c87', fontSize: 14 }}>Loading…</p>}
      {services && services.length === 0 && (
        <p style={{ color: '#786c87', fontSize: 14 }}>No solutions yet — create the first one.</p>
      )}

      {services && services.length > 0 && (
        <>
          {categories.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '18px 0 20px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className="admin-btn"
                  style={{
                    padding: '6px 13px',
                    fontSize: 11.5,
                    background: activeCategory === cat ? 'var(--ink, #281b3d)' : 'rgba(40,27,61,0.06)',
                    color: activeCategory === cat ? '#fbf8f2' : '#786c87',
                  }}
                >
                  {cat} {cat !== 'All' ? `(${services.filter((s) => s.category === cat).length})` : `(${services.length})`}
                </button>
              ))}
            </div>
          )}

          <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleServices.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: '#786c87' }}>/{s.slug}</div>
                    </td>
                    <td style={{ color: '#786c87' }}>{s.category || '—'}</td>
                    <td>
                      <button
                        onClick={() => togglePublish(s)}
                        className="admin-btn"
                        style={{
                          padding: '5px 12px',
                          fontSize: 11,
                          background: s.isPublished ? 'rgba(201,155,97,0.15)' : 'rgba(40,27,61,0.06)',
                          color: s.isPublished ? '#c99b61' : '#786c87',
                        }}
                      >
                        {s.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/services/${s.id}/edit`} className="admin-btn admin-btn-ghost" style={{ padding: '5px 12px', fontSize: 12, marginRight: 6 }}>Edit</Link>
                      <button onClick={() => handleDelete(s)} className="admin-btn admin-btn-ghost" style={{ padding: '5px 12px', fontSize: 12, color: '#9b2c2c', borderColor: 'rgba(155,44,44,0.2)' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
