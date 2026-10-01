import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { crmListContacts, crmCreateContact, crmDeleteContact } from '../../api/client';

export default function ContactsList() {
  const [result, setResult] = useState({ data: [] });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', companyName: '' });

  function load() {
    crmListContacts({ search: search || undefined, limit: 50 }).then(setResult);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await crmCreateContact(form);
    setShowForm(false);
    setForm({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', companyName: '' });
    load();
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Contacts</h1>
        <button type="button" className="admin-btn admin-btn-gold" onClick={() => setShowForm(!showForm)}>+ Contact</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input className="admin-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
        <button type="button" className="admin-btn admin-btn-dark" onClick={load}>Search</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="admin-card" style={{ padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input className="admin-input" placeholder="First name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <input className="admin-input" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <input className="admin-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="admin-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="admin-input" placeholder="Job title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
          <input className="admin-input" placeholder="Company" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <button type="submit" className="admin-btn admin-btn-gold">Create</button>
        </form>
      )}
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%' }}>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Title</th><th></th></tr></thead>
          <tbody>
            {result.data.map((c) => (
              <tr key={c.id}>
                <td>{c.firstName} {c.lastName}</td>
                <td>{c.email || '—'}</td>
                <td>{c.phone || '—'}</td>
                <td>{c.companyName || c.company?.name || '—'}</td>
                <td>{c.jobTitle || '—'}</td>
                <td><button type="button" className="admin-btn admin-btn-ghost" style={{ color: '#ef4444', padding: '4px 8px' }} onClick={async () => { if (confirm('Delete?')) { await crmDeleteContact(c.id); load(); } }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.data.length === 0 && <p className="admin-muted" style={{ padding: 16 }}>No contacts yet.</p>}
      </div>
    </AdminLayout>
  );
}
