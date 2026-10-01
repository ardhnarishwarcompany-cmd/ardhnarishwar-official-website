import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllTeam, createTeamMember, updateTeamMember, uploadMedia, mediaUrl } from '../api/client';

const empty = { name: '', role: '', bio: '', photoUrl: '', linkedinUrl: '', sortOrder: 0, isPublished: true };

export default function TeamForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInput = useRef(null);

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getAllTeam()
      .then((all) => {
        const found = all.find((m) => String(m.id) === id);
        if (!found) setError('Team member not found.');
        else setForm({ ...empty, ...found });
      })
      .catch(() => setError('Could not load this team member.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file);
      update('photoUrl', media.url);
    } catch {
      setError('Photo upload failed.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      if (isEdit) await updateTeamMember(id, payload);
      else await createTeamMember(payload);
      navigate('/admin/team');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this team member.');
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
      <h1 className="admin-page-title">{isEdit ? 'Edit team member' : 'New team member'}</h1>

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
          <label className="block text-xs text-muted mb-1.5">Role</label>
          <input
            value={form.role || ''}
            onChange={(e) => update('role', e.target.value)}
            placeholder="e.g. Head of Product"
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Bio</label>
          <textarea
            rows={4}
            value={form.bio || ''}
            onChange={(e) => update('bio', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">LinkedIn URL</label>
          <input
            value={form.linkedinUrl || ''}
            onChange={(e) => update('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Photo</label>
          {form.photoUrl && (
            <img src={mediaUrl(form.photoUrl)} alt="" className="w-28 h-28 object-cover rounded-sm mb-2 border border-ink/10" />
          )}
          <input ref={fileInput} type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
          {uploading && <p className="text-xs text-muted mt-1">Uploading…</p>}
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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add team member'}
          </button>
          <button type="button" onClick={() => navigate('/admin/team')} className="text-sm px-5 py-2.5 rounded-sm border border-ink/15">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}