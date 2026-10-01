import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllBlogPosts,
  createBlogPost,
  updateBlogPost,
  uploadMedia, mediaUrl } from '../api/client';

const empty = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  author: '',
  isPublished: false,
};

export default function BlogForm() {
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
    getAllBlogPosts()
      .then((all) => {
        const found = all.find((p) => String(p.id) === id);
        if (!found) {
          setError('Post not found.');
        } else {
          setForm({ ...empty, ...found });
        }
      })
      .catch(() => setError('Could not load this post.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file);
      update('coverImageUrl', media.url);
    } catch {
      setError('Image upload failed.');
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
      if (isEdit) {
        await updateBlogPost(id, form);
      } else {
        await createBlogPost(form);
      }
      navigate('/admin/blog');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this post.');
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
      <h1 className="admin-page-title">{isEdit ? 'Edit post' : 'New post'}</h1>

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

        <div>
          <label className="block text-xs text-muted mb-1.5">Author</label>
          <input
            value={form.author || ''}
            onChange={(e) => update('author', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Excerpt</label>
          <textarea
            rows={2}
            maxLength={500}
            value={form.excerpt || ''}
            onChange={(e) => update('excerpt', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Content *</label>
          <textarea
            required
            rows={12}
            value={form.content}
            onChange={(e) => update('content', e.target.value)}
            className="w-full border border-ink/15 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold font-mono"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Cover image</label>
          {form.coverImageUrl && (
            <img src={mediaUrl(form.coverImageUrl)} alt="" className="w-40 h-28 object-cover rounded-sm mb-2 border border-ink/10" />
          )}
          <input ref={fileInput} type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          {uploading && <p className="text-xs text-muted mt-1">Uploading…</p>}
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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className="text-sm px-5 py-2.5 rounded-sm border border-ink/15"
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}