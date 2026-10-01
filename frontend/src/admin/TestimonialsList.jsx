import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllTestimonials, updateTestimonial, deleteTestimonial } from '../api/client';

export default function TestimonialsList() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    getAllTestimonials().then(setItems).catch(() => setError(true));
  }
  useEffect(load, []);

  async function togglePublish(item) {
    const updated = await updateTestimonial(item.id, { isPublished: !item.isPublished });
    setItems((prev) => prev.map((t) => (t.id === item.id ? updated : t)));
  }

  async function handleDelete(item) {
    if (!confirm(`Delete the testimonial from "${item.clientName}"? This can't be undone.`)) return;
    await deleteTestimonial(item.id);
    setItems((prev) => prev.filter((t) => t.id !== item.id));
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 className="admin-page-title">Testimonials</h1>
          <p className="admin-page-sub">Client quotes and logos shown on the homepage.</p>
        </div>
        <Link to="/admin/testimonials/new" className="admin-btn admin-btn-gold">+ New testimonial</Link>
      </div>

      {error && <p style={{ color: '#786c87', fontSize: 14 }}>Could not load testimonials.</p>}
      {!error && !items && <p style={{ color: '#786c87', fontSize: 14 }}>Loading…</p>}
      {items && items.length === 0 && (
        <p style={{ color: '#786c87', fontSize: 14 }}>No testimonials yet — add the first one.</p>
      )}

      {items && items.length > 0 && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Company</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.clientName}</div>
                    <div style={{ fontSize: 12, color: '#786c87' }}>{t.role || '—'}</div>
                  </td>
                  <td style={{ color: '#786c87' }}>{t.companyName || '—'}</td>
                  <td>
                    <button
                      onClick={() => togglePublish(t)}
                      className="admin-btn"
                      style={{
                        padding: '5px 12px',
                        fontSize: 11,
                        background: t.isPublished ? 'rgba(201,155,97,0.15)' : 'rgba(40,27,61,0.06)',
                        color: t.isPublished ? '#c99b61' : '#786c87',
                      }}
                    >
                      {t.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/admin/testimonials/${t.id}/edit`} className="admin-btn admin-btn-ghost" style={{ padding: '5px 12px', fontSize: 12, marginRight: 6 }}>Edit</Link>
                    <button onClick={() => handleDelete(t)} className="admin-btn admin-btn-ghost" style={{ padding: '5px 12px', fontSize: 12, color: '#9b2c2c', borderColor: 'rgba(155,44,44,0.2)' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
