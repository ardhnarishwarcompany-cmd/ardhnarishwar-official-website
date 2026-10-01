import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllBlogPosts, updateBlogPost, deleteBlogPost } from '../api/client';

export default function BlogList() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    getAllBlogPosts().then(setPosts).catch(() => setError(true));
  }

  useEffect(load, []);

  async function togglePublish(post) {
    const updated = await updateBlogPost(post.id, { isPublished: !post.isPublished });
    setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
  }

  async function handleDelete(post) {
    if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    await deleteBlogPost(post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">Insights</h1>
        <Link to="/admin/blog/new" className="admin-btn admin-btn-gold">
          + New post
        </Link>
      </div>

      {error && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Could not load posts.</p>}
      {!error && !posts && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Loading…</p>}

      {posts && posts.length === 0 && (
        <p style={{color:"#786c87",fontSize:14,marginTop:24}}>No posts yet — write the first one.</p>
      )}

      {posts && posts.length > 0 && (
        <div className="mt-8 divide-y divide-ink/10 border-t border-b border-ink/10">
          {posts.map((p) => (
            <div key={p.id} className="py-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {p.author || 'Unattributed'} · /{p.slug}
                </p>
              </div>

              <button
                onClick={() => togglePublish(p)}
                className="text-xs px-2.5 py-1 rounded-sm flex-shrink-0"
                style={
                  p.isPublished
                    ? { color: 'var(--color-teal)', background: 'color-mix(in srgb, var(--color-teal) 12%, transparent)' }
                    : { color: 'var(--color-muted)', background: 'color-mix(in srgb, var(--color-ink) 5%, transparent)' }
                }
              >
                {p.isPublished ? 'Published' : 'Draft'}
              </button>

              <Link to={`/admin/blog/${p.id}/edit`} className="text-sm text-muted hover:text-gold flex-shrink-0">
                Edit
              </Link>
              <button onClick={() => handleDelete(p)} className="text-sm text-muted hover:text-red-500 flex-shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
