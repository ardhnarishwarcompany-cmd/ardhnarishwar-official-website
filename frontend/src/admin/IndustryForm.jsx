import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllIndustries, createIndustry, updateIndustry } from '../api/client';

const empty = { name: '', slug: '', description: '', imageUrl: '', sortOrder: 0, isPublished: true };

export default function IndustryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getAllIndustries()
      .then((all) => {
        const found = all.find((i) => String(i.id) === id);
        if (!found) setError('Industry not found.');
        else setForm({ ...empty, ...found });
      })
      .catch(() => setError('Could not load this industry.'))
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
      if (isEdit) await updateIndustry(id, payload);
      else await createIndustry(payload);
      navigate('/admin/industries');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this industry.');
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
      <h1 className="admin-page-title">{isEdit ? 'Edit industry' : 'New industry'}</h1>

      <form onSubmit={handleSubmit} className="admin-form admin-card mt-8 max-w-xl space-y-5">
        <div>
          <label className="block text-xs text-muted mb-1.5">Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">
            Slug {isEdit ? '' : '(leave blank to auto-generate from name)'}
          </label>
          <input
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Description</label>
          <textarea
            rows={4}
            value={form.description || ''}
            onChange={(e) => update('description', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Sort order</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => update('sortOrder', e.target.value)}
            className="w-32 border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => update('isPublished', e.target.checked)} />
          Published (visible on the live site)
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="text-sm font-semibold text-white bg-soft-orange hover:bg-[var(--soft-orange-dark)] px-5 py-2.5 rounded-sm disabled:opacity-60">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add industry'}
          </button>
          <button type="button" onClick={() => navigate('/admin/industries')} className="text-sm px-5 py-2.5 rounded-sm border border-ink/15">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}