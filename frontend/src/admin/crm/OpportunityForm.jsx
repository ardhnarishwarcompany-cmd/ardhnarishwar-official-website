import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { crmGetOpportunity, crmCreateOpportunity, crmUpdateOpportunity } from '../../api/client';

const STAGES = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

const empty = {
  title: '', expectedValue: '', probability: 0, expectedCloseDate: '',
  stage: 'NEW', notes: '', companyId: '', contactId: '', leadId: '',
};

export default function OpportunityForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    crmGetOpportunity(id)
      .then((d) => setForm({
        title: d.title || '',
        expectedValue: d.expectedValue || '',
        probability: d.probability || 0,
        expectedCloseDate: d.expectedCloseDate || '',
        stage: d.stage || 'NEW',
        notes: d.notes || '',
        companyId: d.companyId || '',
        contactId: d.contactId || '',
        leadId: d.leadId || '',
      }))
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        expectedValue: form.expectedValue === '' ? 0 : form.expectedValue,
        companyId: form.companyId || null,
        contactId: form.contactId || null,
        leadId: form.leadId || null,
      };
      if (isNew) {
        const created = await crmCreateOpportunity(payload);
        navigate(`/admin/crm/opportunities/${created.id}`, { replace: true });
      } else {
        await crmUpdateOpportunity(id, payload);
        alert('Saved.');
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLayout><p className="admin-muted">Loading…</p></AdminLayout>;

  return (
    <AdminLayout>
      <Link to="/admin/crm/opportunities" className="admin-muted" style={{ fontSize: 13 }}>← Opportunities</Link>
      <h1 className="admin-page-title">{isNew ? 'New Opportunity' : 'Edit Opportunity'}</h1>
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="admin-card" style={{ padding: 24, maxWidth: 680 }}>
        <label className="admin-label">Title *
          <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px 20px', marginTop: 18 }}>
          <label className="admin-label">Expected Value
            <input className="admin-input" type="number" value={form.expectedValue} onChange={(e) => setForm({ ...form, expectedValue: e.target.value })} />
          </label>
          <label className="admin-label">Probability %
            <input className="admin-input" type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} />
          </label>
          <label className="admin-label">Expected Close
            <input className="admin-input" type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
          </label>
          <label className="admin-label">Stage
            <select className="admin-input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <label className="admin-label" style={{ marginTop: 18 }}>Notes
          <textarea className="admin-input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button type="submit" className="admin-btn admin-btn-gold" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <Link to="/admin/crm/opportunities" className="admin-btn admin-btn-ghost">Cancel</Link>
        </div>
      </form>
    </AdminLayout>
  );
}