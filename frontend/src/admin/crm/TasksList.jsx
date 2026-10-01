import { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { crmListTasks, crmCreateTask, crmUpdateTask, crmDeleteTask } from '../../api/client';

export default function TasksList() {
  const [result, setResult] = useState({ data: [] });
  const [form, setForm] = useState({ title: '', dueDate: '', priority: 'MEDIUM' });
  const [showForm, setShowForm] = useState(false);

  function load() {
    crmListTasks({ limit: 50 }).then(setResult);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await crmCreateTask(form);
    setShowForm(false);
    setForm({ title: '', dueDate: '', priority: 'MEDIUM' });
    load();
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Tasks</h1>
        <button type="button" className="admin-btn admin-btn-gold" onClick={() => setShowForm(!showForm)}>+ Task</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="admin-card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="admin-input" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ flex: 1 }} />
          <input className="admin-input" type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <select className="admin-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <button type="submit" className="admin-btn admin-btn-gold">Create</button>
        </form>
      )}
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%' }}>
          <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Due</th><th></th></tr></thead>
          <tbody>
            {result.data.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>
                  <select className="admin-input" style={{ padding: '2px 6px' }} value={t.status} onChange={async (e) => { await crmUpdateTask(t.id, { status: e.target.value }); load(); }}>
                    {['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>{t.priority}</td>
                <td>{t.dueDate ? new Date(t.dueDate).toLocaleString() : '—'}</td>
                <td><button type="button" className="admin-btn admin-btn-ghost" style={{ color: '#ef4444', padding: '4px 8px' }} onClick={async () => { if (confirm('Delete?')) { await crmDeleteTask(t.id); load(); } }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.data.length === 0 && <p className="admin-muted" style={{ padding: 16 }}>No tasks yet.</p>}
      </div>
    </AdminLayout>
  );
}
