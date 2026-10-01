import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllTestimonials, createTestimonial, updateTestimonial, uploadMedia, mediaUrl } from '../api/client';

const empty = {
  clientName: '',
  role: '',
  companyName: '',
  quote: '',
  logoUrl: '',
  avatarUrl: '',
  sortOrder: 0,
  isPublished: true,
};

export default function TestimonialForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const avatarInput = useRef(null);
  const logoInput = useRef(null);

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null); // 'avatar' | 'logo' | null
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getAllTestimonials()
      .then((all) => {
        const found = all.find((t) => String(t.id) === id);
        if (!found) setError('Testimonial not found.');
        else setForm({ ...empty, ...found });
      })
      .catch(() => setError('Could not load this testimonial.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleUpload(e, field) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const media = await uploadMedia(file);
      update(field, media.url);
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploading(null);
      if (avatarInput.current) avatarInput.current.value = '';
      if (logoInput.current) logoInput.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      if (isEdit) await updateTestimonial(id, payload);
      else await createTestimonial(payload);
      navigate('/admin/testimonials');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this testimonial.');
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
      <h1 className="admin-page-title">{isEdit ? 'Edit testimonial' : 'New testimonial'}</h1>

      <form onSubmit={handleSubmit} className="admin-form admin-card mt-8 max-w-xl space-y-5">
        <div>
          <label className="block text-xs text-muted mb-1.5">Client name *</label>
          <input
            required
            value={form.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Role</label>
            <input
              value={form.role || ''}
              onChange={(e) => update('role', e.target.value)}
              placeholder="e.g. HR Director"
              className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Company</label>
            <input
              value={form.companyName || ''}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder="e.g. Acme Manufacturing"
              className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Quote *</label>
          <textarea
            required
            rows={4}
            value={form.quote}
            onChange={(e) => update('quote', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Client photo</label>
          {form.avatarUrl && (
            <img src={mediaUrl(form.avatarUrl)} alt="" className="w-20 h-20 object-cover rounded-full mb-2 border border-ink/10" />
          )}
          <input ref={avatarInput} type="file" accept="image/*" onChange={(e) => handleUpload(e, 'avatarUrl')} className="text-sm" />
          {uploading === 'avatarUrl' && <p className="text-xs text-muted mt-1">Uploading…</p>}
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Company logo</label>
          {form.logoUrl && (
            <img src={mediaUrl(form.logoUrl)} alt="" className="w-28 h-14 object-contain rounded-sm mb-2 border border-ink/10 bg-white" />
          )}
          <input ref={logoInput} type="file" accept="image/*" onChange={(e) => handleUpload(e, 'logoUrl')} className="text-sm" />
          {uploading === 'logoUrl' && <p className="text-xs text-muted mt-1">Uploading…</p>}
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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add testimonial'}
          </button>
          <button type="button" onClick={() => navigate('/admin/testimonials')} className="text-sm px-5 py-2.5 rounded-sm border border-ink/15">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}