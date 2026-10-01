import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllServices,
  createService,
  updateService,
  uploadMedia, mediaUrl } from '../api/client';

const empty = {
  title: '',
  slug: '',
  category: '',
  shortDescription: '',
  description: '',
  features: [],
  techSummary: '',
  techStack: [],
  imageUrl: '',
  heroImageUrl: '',
  ctaImageUrl: '',
  externalUrl: '',
  liveStatsUrl: '',
  liveStatsApiKey: '',
  accessType: 'organization',
  demoEnabled: true,
  sortOrder: 0,
  isPublished: true,
};

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const thumbnailInput = useRef(null);
  const heroInput = useRef(null);
  const ctaInput = useRef(null);

  const [form, setForm] = useState(empty);
  const [featureDraft, setFeatureDraft] = useState('');
  const [techDraft, setTechDraft] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getAllServices()
      .then((all) => {
        const found = all.find((s) => String(s.id) === id);
        if (!found) {
          setError('Solution not found.');
        } else {
          setForm({ ...empty, ...found, features: found.features || [], techStack: found.techStack || [] });
        }
      })
      .catch(() => setError('Could not load this solution.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addFeature() {
    const v = featureDraft.trim();
    if (!v) return;
    update('features', [...form.features, v]);
    setFeatureDraft('');
  }

  function removeFeature(idx) {
    update('features', form.features.filter((_, i) => i !== idx));
  }

  function addTech() {
    const v = techDraft.trim();
    if (!v) return;
    update('techStack', [...form.techStack, v]);
    setTechDraft('');
  }

  function removeTech(idx) {
    update('techStack', form.techStack.filter((_, i) => i !== idx));
  }

  async function handleImageUpload(field, ref, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(field);
    try {
      const media = await uploadMedia(file);
      update(field, media.url);
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploadingField(null);
      if (ref.current) ref.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      if (isEdit) {
        await updateService(id, payload);
      } else {
        await createService(payload);
      }
      navigate('/admin/services');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this solution.');
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
      <h1 className="admin-page-title">{isEdit ? 'Edit solution' : 'New solution'}</h1>

      <form onSubmit={handleSubmit} className="admin-form admin-card mt-8 max-w-2xl space-y-5">
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
            <label className="block text-xs text-muted mb-1.5">Category</label>
            <input
              value={form.category || ''}
              onChange={(e) => update('category', e.target.value)}
              placeholder="e.g. Artificial Intelligence"
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

        <div>
          <label className="block text-xs text-muted mb-1.5">Short description</label>
          <textarea
            rows={2}
            maxLength={500}
            value={form.shortDescription || ''}
            onChange={(e) => update('shortDescription', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Full description</label>
          <textarea
            rows={6}
            value={form.description || ''}
            onChange={(e) => update('description', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Features</label>
          <div className="flex gap-2 mb-2">
            <input
              value={featureDraft}
              onChange={(e) => setFeatureDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
              placeholder="e.g. Real-time dashboard"
              className="flex-1 border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
            <button type="button" onClick={addFeature} className="text-sm px-4 rounded-sm bg-ink text-cream">
              Add
            </button>
          </div>
          {form.features.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {form.features.map((f, i) => (
                <li key={i} className="text-xs bg-ink/5 rounded-sm px-2.5 py-1.5 flex items-center gap-2">
                  {f}
                  <button type="button" onClick={() => removeFeature(i)} className="text-muted hover:text-red-500">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Tools &amp; technology summary</label>
          <textarea
            rows={3}
            value={form.techSummary || ''}
            onChange={(e) => update('techSummary', e.target.value)}
            placeholder="What powers this solution end-to-end — what it does, and the stack behind it (e.g. Backend: Python Flask, DB: MongoDB)."
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <p className="text-xs text-muted mt-1.5">
            Shown in the "Tools &amp; technology" section on this solution's page.
          </p>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Tech stack chips</label>
          <div className="flex gap-2 mb-2">
            <input
              value={techDraft}
              onChange={(e) => setTechDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTech();
                }
              }}
              placeholder="e.g. Backend: Python (Flask)"
              className="flex-1 border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
            <button type="button" onClick={addTech} className="text-sm px-4 rounded-sm bg-ink text-cream">
              Add
            </button>
          </div>
          {form.techStack.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {form.techStack.map((t, i) => (
                <li key={i} className="text-xs bg-ink/5 rounded-sm px-2.5 py-1.5 flex items-center gap-2">
                  {t}
                  <button type="button" onClick={() => removeTech(i)} className="text-muted hover:text-red-500">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">
            External platform URL (optional)
          </label>
          <input
            type="url"
            value={form.externalUrl || ''}
            onChange={(e) => update('externalUrl', e.target.value)}
            placeholder="https://jobs.ardhnarishwar.com"
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <p className="text-xs text-muted mt-1.5">
            For solutions that are separately-built, live products (e.g. Job Portal, Smart
            Attendance, HRMS). When set, a "Launch Platform" button appears on this solution's
            page and card, opening this URL in a new tab.
          </p>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">
            Live stats API URL (optional)
          </label>
          <input
            type="url"
            value={form.liveStatsUrl || ''}
            onChange={(e) => update('liveStatsUrl', e.target.value)}
            placeholder="https://hrms.ardhnarishwar.com/api/dashboard-summary"
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <p className="text-xs text-muted mt-1.5">
            Once the real product exposes a summary endpoint, paste it here and the demo
            preview below switches from mock numbers to real ones automatically (checked
            every 30s). It must return JSON shaped like{' '}
            <code>{'{ stats: [{ label, value }], chart: { title, type, data: [{ name, value }] } }'}</code>.
            Leave blank to keep showing demo data.
          </p>
        </div>

        {form.liveStatsUrl && (
          <div>
            <label className="block text-xs text-muted mb-1.5">
              Live stats API key (optional)
            </label>
            <input
              type="password"
              value={form.liveStatsApiKey || ''}
              onChange={(e) => update('liveStatsApiKey', e.target.value)}
              placeholder="Sent as an Authorization: Bearer header"
              className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
            <p className="text-xs text-muted mt-1.5">
              Only needed if that endpoint requires auth. Stored server-side and never sent
              to visitors' browsers.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Access type</label>
            <select
              value={form.accessType || 'organization'}
              onChange={(e) => update('accessType', e.target.value)}
              className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            >
              <option value="organization">Organization (client portal login)</option>
              <option value="candidate">Candidate (job-seeker login)</option>
              <option value="both">Both (candidate or client login)</option>
              <option value="public">Public (no login required)</option>
              <option value="admin">Admin / internal only</option>
            </select>
            <p className="text-xs text-muted mt-1.5">
              Who must sign in before "Access This Service" actually launches the platform.
              The public demo page is always visible to everyone regardless of this setting.
            </p>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Demo preview</label>
            <label className="flex items-center gap-2 text-sm border border-ink/15 rounded-sm px-3.5 py-2.5">
              <input
                type="checkbox"
                checked={form.demoEnabled !== false}
                onChange={(e) => update('demoEnabled', e.target.checked)}
              />
              Show interactive dashboard preview on the demo page
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Thumbnail image</label>
            {form.imageUrl && (
              <img src={mediaUrl(form.imageUrl)} alt="" className="w-full h-24 object-cover rounded-sm mb-2 border border-ink/10" />
            )}
            <input
              ref={thumbnailInput}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('imageUrl', thumbnailInput, e)}
              className="text-sm"
            />
            {uploadingField === 'imageUrl' && <p className="text-xs text-muted mt-1">Uploading…</p>}
            <p className="text-xs text-muted mt-1.5">Shown on the Solutions grid card.</p>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Hero image</label>
            {form.heroImageUrl && (
              <img src={mediaUrl(form.heroImageUrl)} alt="" className="w-full h-24 object-cover rounded-sm mb-2 border border-ink/10" />
            )}
            <input
              ref={heroInput}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('heroImageUrl', heroInput, e)}
              className="text-sm"
            />
            {uploadingField === 'heroImageUrl' && <p className="text-xs text-muted mt-1">Uploading…</p>}
            <p className="text-xs text-muted mt-1.5">Shown at the top of this solution's own page.</p>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">CTA image</label>
            {form.ctaImageUrl && (
              <img src={mediaUrl(form.ctaImageUrl)} alt="" className="w-full h-24 object-cover rounded-sm mb-2 border border-ink/10" />
            )}
            <input
              ref={ctaInput}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('ctaImageUrl', ctaInput, e)}
              className="text-sm"
            />
            {uploadingField === 'ctaImageUrl' && <p className="text-xs text-muted mt-1">Uploading…</p>}
            <p className="text-xs text-muted mt-1.5">Shown in the "Ready to use" section at the bottom.</p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => update('isPublished', e.target.checked)}
          />
          Published (visible on the live site)
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-semibold text-white bg-soft-orange hover:bg-[var(--soft-orange-dark)] px-5 py-2.5 rounded-sm disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create solution'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
            className="text-sm px-5 py-2.5 rounded-sm border border-ink/15"
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}