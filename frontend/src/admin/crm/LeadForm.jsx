import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import {
  crmGetLead, crmCreateLead, crmUpdateLead,
  crmCreateActivity, crmCreateNote, crmCreateFollowUp, crmCreateTask,
  crmCreateOpportunity,
} from '../../api/client';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const empty = {
  name: '', company: '', email: '', phone: '', location: '',
  source: 'manual', status: 'NEW', priority: 'MEDIUM',
  industry: '', requirement: '', notes: '', estimatedValue: '',
};

export default function LeadForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('details');
  const [noteText, setNoteText] = useState('');
  const [activityForm, setActivityForm] = useState({ type: 'Call', subject: '', description: '' });
  const [fuForm, setFuForm] = useState({ title: '', dueDate: '', notes: '' });
  const [taskForm, setTaskForm] = useState({ title: '', dueDate: '', priority: 'MEDIUM' });

  useEffect(() => {
    if (isNew) return;
    crmGetLead(id)
      .then((data) => {
        setDetail(data);
        setForm({
          name: data.name || '',
          company: data.company || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          source: data.source || 'manual',
          status: data.status || 'NEW',
          priority: data.priority || 'MEDIUM',
          industry: data.industry || '',
          requirement: data.requirement || '',
          notes: data.notes || '',
          estimatedValue: data.estimatedValue || '',
        });
      })
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        estimatedValue: form.estimatedValue === '' ? null : form.estimatedValue,
      };
      if (isNew) {
        const created = await crmCreateLead(payload);
        navigate(`/admin/crm/leads/${created.id}`, { replace: true });
      } else {
        const updated = await crmUpdateLead(id, payload);
        setDetail((d) => ({ ...d, ...updated }));
        alert('Lead updated.');
      }
    } catch (e) {
      if (e.response?.status === 409) {
        setError(`Possible duplicate (existing lead #${e.response.data.existingId}).`);
      } else {
        setError(e.response?.data?.error || e.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function reloadDetail() {
    const data = await crmGetLead(id);
    setDetail(data);
  }

  async function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    await crmCreateNote({ leadId: Number(id), content: noteText });
    setNoteText('');
    await reloadDetail();
  }

  async function addActivity(e) {
    e.preventDefault();
    await crmCreateActivity({ ...activityForm, leadId: Number(id) });
    setActivityForm({ type: 'Call', subject: '', description: '' });
    await reloadDetail();
  }

  async function addFollowUp(e) {
    e.preventDefault();
    if (!fuForm.title || !fuForm.dueDate) return;
    await crmCreateFollowUp({ ...fuForm, leadId: Number(id) });
    setFuForm({ title: '', dueDate: '', notes: '' });
    await reloadDetail();
  }

  async function addTask(e) {
    e.preventDefault();
    if (!taskForm.title) return;
    await crmCreateTask({ ...taskForm, leadId: Number(id) });
    setTaskForm({ title: '', dueDate: '', priority: 'MEDIUM' });
    await reloadDetail();
  }

  async function convertToOpp() {
    if (!confirm('Create an opportunity from this lead?')) return;
    try {
      const opp = await crmCreateOpportunity({
        title: form.company ? `${form.company} — ${form.name}` : form.name,
        leadId: Number(id),
        stage: 'NEW',
        status: 'OPEN',
        expectedValue: form.estimatedValue || 0,
        notes: form.requirement || form.notes,
      });
      await crmUpdateLead(id, { status: 'QUALIFIED' });
      navigate(`/admin/crm/opportunities/${opp.id}`);
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  if (loading) {
    return <AdminLayout><p className="admin-muted">Loading…</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link to="/admin/crm/leads" className="admin-muted" style={{ fontSize: 13 }}>← Leads</Link>
          <h1 className="admin-page-title" style={{ margin: '4px 0 0' }}>
            {isNew ? 'New Lead' : form.name || 'Lead'}
          </h1>
        </div>
        {!isNew && (
          <button type="button" className="admin-btn admin-btn-dark" onClick={convertToOpp}>
            Convert to Opportunity
          </button>
        )}
      </div>

      {error && <div className="admin-alert admin-alert-error" style={{ marginBottom: 12 }}>{error}</div>}

      {!isNew && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['details', 'activity', 'notes', 'followups', 'tasks'].map((t) => (
            <button
              key={t}
              type="button"
              className={`admin-btn ${tab === t ? 'admin-btn-dark' : 'admin-btn-ghost'}`}
              onClick={() => setTab(t)}
              style={{ textTransform: 'capitalize' }}
            >{t}</button>
          ))}
        </div>
      )}

      {(isNew || tab === 'details') && (
        <form onSubmit={handleSubmit} className="admin-card" style={{ padding: 24, maxWidth: 760 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px 20px' }}>
            <label className="admin-label">
              Name *
              <input className="admin-input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </label>
            <label className="admin-label">
              Company
              <input className="admin-input" value={form.company} onChange={(e) => set('company', e.target.value)} />
            </label>
            <label className="admin-label">
              Email
              <input className="admin-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </label>
            <label className="admin-label">
              Phone
              <input className="admin-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </label>
            <label className="admin-label">
              Location
              <input className="admin-input" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </label>
            <label className="admin-label">
              Industry
              <input className="admin-input" value={form.industry} onChange={(e) => set('industry', e.target.value)} />
            </label>
            <label className="admin-label">
              Source
              <input className="admin-input" value={form.source} onChange={(e) => set('source', e.target.value)} />
            </label>
            <label className="admin-label">
              Estimated Value
              <input className="admin-input" type="number" value={form.estimatedValue} onChange={(e) => set('estimatedValue', e.target.value)} />
            </label>
            <label className="admin-label">
              Status
              <select className="admin-input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="admin-label">
              Priority
              <select className="admin-input" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <label className="admin-label" style={{ marginTop: 18 }}>
            Requirement
            <textarea className="admin-input" rows={3} value={form.requirement} onChange={(e) => set('requirement', e.target.value)} />
          </label>
          <label className="admin-label" style={{ marginTop: 18 }}>
            Notes
            <textarea className="admin-input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </label>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="submit" className="admin-btn admin-btn-gold" disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create Lead' : 'Save Changes'}
            </button>
            <Link to="/admin/crm/leads" className="admin-btn admin-btn-ghost">Cancel</Link>
          </div>
        </form>
      )}

      {!isNew && tab === 'activity' && (
        <div className="admin-card" style={{ padding: 20 }}>
          <form onSubmit={addActivity} style={{ display: 'grid', gap: 10, marginBottom: 20, maxWidth: 520 }}>
            <select className="admin-input" value={activityForm.type} onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}>
              {['Call', 'Email', 'Meeting', 'Note', 'Demo', 'Other'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <input className="admin-input" placeholder="Subject" value={activityForm.subject} onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })} />
            <textarea className="admin-input" rows={2} placeholder="Description" value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} />
            <button type="submit" className="admin-btn admin-btn-dark">Log Activity</button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(detail?.activities || []).map((a) => (
              <li key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <strong>{a.type}</strong> {a.subject && `— ${a.subject}`}
                <div style={{ fontSize: 13, color: '#64748b' }}>{a.description}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{a.activityDate ? new Date(a.activityDate).toLocaleString() : ''}</div>
              </li>
            ))}
            {(detail?.activities || []).length === 0 && <p className="admin-muted">No activities yet.</p>}
          </ul>
        </div>
      )}

      {!isNew && tab === 'notes' && (
        <div className="admin-card" style={{ padding: 20 }}>
          <form onSubmit={addNote} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input className="admin-input" style={{ flex: 1 }} placeholder="Add a note…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <button type="submit" className="admin-btn admin-btn-dark">Add</button>
          </form>
          {(detail?.notes || []).map((n) => (
            <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>{n.content}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {(detail?.notes || []).length === 0 && <p className="admin-muted">No notes yet.</p>}
        </div>
      )}

      {!isNew && tab === 'followups' && (
        <div className="admin-card" style={{ padding: 20 }}>
          <form onSubmit={addFollowUp} style={{ display: 'grid', gap: 10, marginBottom: 20, maxWidth: 520 }}>
            <input className="admin-input" placeholder="Title" value={fuForm.title} onChange={(e) => setFuForm({ ...fuForm, title: e.target.value })} required />
            <input className="admin-input" type="datetime-local" value={fuForm.dueDate} onChange={(e) => setFuForm({ ...fuForm, dueDate: e.target.value })} required />
            <textarea className="admin-input" rows={2} placeholder="Notes" value={fuForm.notes} onChange={(e) => setFuForm({ ...fuForm, notes: e.target.value })} />
            <button type="submit" className="admin-btn admin-btn-dark">Schedule Follow-up</button>
          </form>
          {(detail?.followUps || []).map((f) => (
            <div key={f.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <strong>{f.title}</strong> <span style={{ fontSize: 12, color: '#64748b' }}>({f.status})</span>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Due: {f.dueDate ? new Date(f.dueDate).toLocaleString() : '—'}</div>
            </div>
          ))}
          {(detail?.followUps || []).length === 0 && <p className="admin-muted">No follow-ups scheduled.</p>}
        </div>
      )}

      {!isNew && tab === 'tasks' && (
        <div className="admin-card" style={{ padding: 20 }}>
          <form onSubmit={addTask} style={{ display: 'grid', gap: 10, marginBottom: 20, maxWidth: 520 }}>
            <input className="admin-input" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
            <input className="admin-input" type="datetime-local" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            <select className="admin-input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button type="submit" className="admin-btn admin-btn-dark">Add Task</button>
          </form>
          {(detail?.tasks || []).map((t) => (
            <div key={t.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <strong>{t.title}</strong> — {t.status} / {t.priority}
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Due: {t.dueDate ? new Date(t.dueDate).toLocaleString() : '—'}</div>
            </div>
          ))}
          {(detail?.tasks || []).length === 0 && <p className="admin-muted">No tasks yet.</p>}
        </div>
      )}
    </AdminLayout>
  );
}