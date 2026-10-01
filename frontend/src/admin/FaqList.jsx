import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllFaqs, updateFaq, deleteFaq } from '../api/client';

export default function FaqList() {
  const [faqs, setFaqs] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    getAllFaqs().then(setFaqs).catch(() => setError(true));
  }

  useEffect(load, []);

  async function togglePublish(faq) {
    const updated = await updateFaq(faq.id, { isPublished: !faq.isPublished });
    setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
  }

  async function handleDelete(faq) {
    if (!confirm('Delete this FAQ? This can\'t be undone.')) return;
    await deleteFaq(faq.id);
    setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">FAQs</h1>
        <Link to="/admin/faqs/new" className="admin-btn admin-btn-gold">
          + New FAQ
        </Link>
      </div>

      {error && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Could not load FAQs.</p>}
      {!error && !faqs && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Loading…</p>}
      {faqs && faqs.length === 0 && (
        <p style={{color:"#786c87",fontSize:14,marginTop:24}}>No FAQs yet — add the first one.</p>
      )}

      {faqs && faqs.length > 0 && (
        <div className="mt-8 divide-y divide-ink/10 border-t border-b border-ink/10">
          {faqs.map((f) => (
            <div key={f.id} className="py-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{f.question}</p>
                <p className="text-xs text-muted mt-0.5">{f.category || 'Uncategorized'}</p>
              </div>

              <button
                onClick={() => togglePublish(f)}
                className="text-xs px-2.5 py-1 rounded-sm flex-shrink-0"
                style={
                  f.isPublished
                    ? { color: 'var(--color-teal)', background: 'color-mix(in srgb, var(--color-teal) 12%, transparent)' }
                    : { color: 'var(--color-muted)', background: 'color-mix(in srgb, var(--color-ink) 5%, transparent)' }
                }
              >
                {f.isPublished ? 'Published' : 'Draft'}
              </button>

              <Link to={`/admin/faqs/${f.id}/edit`} className="text-sm text-muted hover:text-gold flex-shrink-0">
                Edit
              </Link>
              <button onClick={() => handleDelete(f)} className="text-sm text-muted hover:text-red-500 flex-shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
