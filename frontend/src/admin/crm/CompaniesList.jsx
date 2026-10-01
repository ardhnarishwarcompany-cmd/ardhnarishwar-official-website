import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { crmListCompanies, crmCreateCompany, crmDeleteCompany } from '../../api/client';

export default function CompaniesList() {
  const [result, setResult] = useState({ data: [] });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', email: '', phone: '', city: '', country: '' });

  function load() {
    crmListCompanies({ search: search || undefined, limit: 50 }).then(setResult);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await crmCreateCompany(form);
    setShowForm(false);
    setForm({ name: '', industry: '', website: '', email: '', phone: '', city: '', country: '' });
    load();
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Companies</h1>
        <button type="button" className="admin-btn admin-btn-gold" onClick={() => setShowForm(!showForm)}>+ Company</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input className="admin-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
        <button type="button" className="admin-btn admin-btn-dark" onClick={load}>Search</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="admin-card" style={{ padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input className="admin-input" placeholder="Company name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="admin-input" placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <input className="admin-input" placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <input className="admin-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="admin-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="admin-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="admin-input" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <button type="submit" className="admin-btn admin-btn-gold">Create</button>
        </form>
      )}
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%' }}>
          <thead><tr><th>Name</th><th>Industry</th><th>Email</th><th>Phone</th><th>City</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {result.data.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.industry || '—'}</td>
                <td>{c.email || '—'}</td>
                <td>{c.phone || '—'}</td>
                <td>{c.city || '—'}</td>
                <td>{c.status}</td>
                <td><button type="button" className="admin-btn admin-btn-ghost" style={{ color: '#ef4444', padding: '4px 8px' }} onClick={async () => { if (confirm('Delete?')) { await crmDeleteCompany(c.id); load(); } }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.data.length === 0 && <p className="admin-muted" style={{ padding: 16 }}>No companies yet.</p>}
      </div>
    </AdminLayout>
  );
}
