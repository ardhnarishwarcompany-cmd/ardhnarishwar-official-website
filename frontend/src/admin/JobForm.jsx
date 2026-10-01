import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllJobs, createJob, updateJob } from '../api/client';

const empty = {
  title: '', slug: '', department: '', location: '', employmentType: 'full-time',
  description: '', requirements: [], isPublished: true,
};

export default function JobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [reqDraft, setReqDraft] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getAllJobs()
      .then((all) => {
        const found = all.find((j) => String(j.id) === id);
        if (!found) setError('Job opening not found.');
        else setForm({ ...empty, ...found, requirements: found.requirements || [] });
      })
      .catch(() => setError('Could not load this job opening.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addRequirement() {
    const v = reqDraft.trim();
    if (!v) return;
    update('requirements', [...form.requirements, v]);
    setReqDraft('');
  }

  function removeRequirement(idx) {
    update('requirements', form.requirements.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isEdit) await updateJob(id, form);
      else await createJob(form);
      navigate('/admin/careers');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this job opening.');
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
      <h1 className="admin-page-title">{isEdit ? 'Edit opening' : 'New opening'}</h1>

      <form onSubmit={handleSubmit} className="admin-form admin-card mt-8 max-w-xl space-y-5">
        <div>
          <label className="block text-xs text-muted mb-1.5">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">
            Slug {isEdit ? '' : '(leave blank to auto-generate from title)'}
          </label>
          <input
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Department</label>
            <input
              value={form.department || ''}
              onChange={(e) => update('department', e.target.value)}
              className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Location</label>
            <input
              value={form.location || ''}
              onChange={(e) => update('location', e.target.value)}
              placeholder="e.g. Remote / India"
              className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Employment type</label>
          <select
            value={form.employmentType}
            onChange={(e) => update('employmentType', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Description</label>
          <textarea
            rows={5}
            value={form.description || ''}
            onChange={(e) => update('description', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Requirements</label>
          <div className="flex gap-2 mb-2">
            <input
              value={reqDraft}
              onChange={(e) => setReqDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
              placeholder="e.g. 2+ years with React"
              className="flex-1 border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
            <button type="button" onClick={addRequirement} className="text-sm px-4 rounded-sm bg-ink text-cream">
              Add
            </button>
          </div>
          {form.requirements.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {form.requirements.map((r, i) => (
                <li key={i} className="text-xs bg-ink/5 rounded-sm px-2.5 py-1.5 flex items-center gap-2">
                  {r}
                  <button type="button" onClick={() => removeRequirement(i)} className="text-muted hover:text-red-500">×</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => update('isPublished', e.target.checked)} />
          Published (visible on the live site)
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="text-sm font-semibold text-white bg-soft-orange hover:bg-[var(--soft-orange-dark)] px-5 py-2.5 rounded-sm disabled:opacity-60">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Post opening'}
          </button>
          <button type="button" onClick={() => navigate('/admin/careers')} className="text-sm px-5 py-2.5 rounded-sm border border-ink/15">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}