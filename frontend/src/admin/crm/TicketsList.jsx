import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { crmListTickets, crmCreateTicket, crmUpdateTicket, crmDeleteTicket } from '../../api/client';

export default function TicketsList() {
  const [result, setResult] = useState({ data: [] });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', customerName: '', customerEmail: '', priority: 'MEDIUM' });

  function load() {
    crmListTickets({ limit: 50 }).then(setResult);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await crmCreateTicket(form);
    setShowForm(false);
    setForm({ subject: '', description: '', customerName: '', customerEmail: '', priority: 'MEDIUM' });
    load();
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Support Tickets</h1>
        <button type="button" className="admin-btn admin-btn-gold" onClick={() => setShowForm(!showForm)}>+ Ticket</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="admin-card" style={{ padding: 16, marginBottom: 16, display: 'grid', gap: 10, maxWidth: 560 }}>
          <input className="admin-input" placeholder="Subject *" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <textarea className="admin-input" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="admin-input" placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          <input className="admin-input" placeholder="Customer email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
          <select className="admin-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <button type="submit" className="admin-btn admin-btn-gold">Create Ticket</button>
        </form>
      )}
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%' }}>
          <thead><tr><th>#</th><th>Subject</th><th>Customer</th><th>Status</th><th>Priority</th><th></th></tr></thead>
          <tbody>
            {result.data.map((t) => (
              <tr key={t.id}>
                <td>{t.ticketNumber}</td>
                <td>{t.subject}</td>
                <td>{t.customerName || t.customerEmail || '—'}</td>
                <td>
                  <select className="admin-input" style={{ padding: '2px 6px' }} value={t.status} onChange={async (e) => { await crmUpdateTicket(t.id, { status: e.target.value }); load(); }}>
                    {['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>{t.priority}</td>
                <td><button type="button" className="admin-btn admin-btn-ghost" style={{ color: '#ef4444', padding: '4px 8px' }} onClick={async () => { if (confirm('Delete?')) { await crmDeleteTicket(t.id); load(); } }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.data.length === 0 && <p className="admin-muted" style={{ padding: 16 }}>No tickets yet.</p>}
      </div>
    </AdminLayout>
  );
}
