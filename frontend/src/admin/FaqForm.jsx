import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllFaqs, createFaq, updateFaq } from '../api/client';

const empty = { question: '', answer: '', category: '', sortOrder: 0, isPublished: true };

export default function FaqForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getAllFaqs()
      .then((all) => {
        const found = all.find((f) => String(f.id) === id);
        if (!found) setError('FAQ not found.');
        else setForm({ ...empty, ...found });
      })
      .catch(() => setError('Could not load this FAQ.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      if (isEdit) await updateFaq(id, payload);
      else await createFaq(payload);
      navigate('/admin/faqs');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this FAQ.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-sm text-muted">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="admin-page-title">{isEdit ? 'Edit FAQ' : 'New FAQ'}</h1>

      <form onSubmit={handleSubmit} className="admin-form admin-card mt-8 max-w-xl space-y-5">
        <div>
          <label className="block text-xs text-muted mb-1.5">Question *</label>
          <input
            required
            value={form.question}
            onChange={(e) => update('question', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Answer *</label>
          <textarea
            required
            rows={5}
            value={form.answer}
            onChange={(e) => update('answer', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Category</label>
            <input
              value={form.category || ''}
              onChange={(e) => update('category', e.target.value)}
              placeholder="e.g. Pricing"
              className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Sort order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => update('sortOrder', e.target.value)}
              className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => update('isPublished', e.target.checked)} />
          Published (visible on the live site)
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="text-sm font-semibold text-white bg-soft-orange hover:bg-[var(--soft-orange-dark)] px-5 py-2.5 rounded-sm disabled:opacity-60">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add FAQ'}
          </button>
          <button type="button" onClick={() => navigate('/admin/faqs')} className="text-sm px-5 py-2.5 rounded-sm border border-ink/15">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}