import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllIndustries, updateIndustry, deleteIndustry } from '../api/client';

export default function IndustriesList() {
  const [industries, setIndustries] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    getAllIndustries().then(setIndustries).catch(() => setError(true));
  }

  useEffect(load, []);

  async function togglePublish(industry) {
    const updated = await updateIndustry(industry.id, { isPublished: !industry.isPublished });
    setIndustries((prev) => prev.map((i) => (i.id === industry.id ? updated : i)));
  }

  async function handleDelete(industry) {
    if (!confirm(`Delete "${industry.name}"? This can't be undone.`)) return;
    await deleteIndustry(industry.id);
    setIndustries((prev) => prev.filter((i) => i.id !== industry.id));
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">Industries</h1>
        <Link to="/admin/industries/new" className="admin-btn admin-btn-gold">
          + New industry
        </Link>
      </div>

      {error && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Could not load industries.</p>}
      {!error && !industries && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Loading…</p>}
      {industries && industries.length === 0 && (
        <p style={{color:"#786c87",fontSize:14,marginTop:24}}>No industries yet — add the first one.</p>
      )}

      {industries && industries.length > 0 && (
        <div className="mt-8 divide-y divide-ink/10 border-t border-b border-ink/10">
          {industries.map((i) => (
            <div key={i.id} className="py-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-muted mt-0.5">/{i.slug}</p>
              </div>

              <button
                onClick={() => togglePublish(i)}
                className="text-xs px-2.5 py-1 rounded-sm flex-shrink-0"
                style={
                  i.isPublished
                    ? { color: 'var(--color-teal)', background: 'color-mix(in srgb, var(--color-teal) 12%, transparent)' }
                    : { color: 'var(--color-muted)', background: 'color-mix(in srgb, var(--color-ink) 5%, transparent)' }
                }
              >
                {i.isPublished ? 'Published' : 'Draft'}
              </button>

              <Link to={`/admin/industries/${i.id}/edit`} className="text-sm text-muted hover:text-gold flex-shrink-0">
                Edit
              </Link>
              <button onClick={() => handleDelete(i)} className="text-sm text-muted hover:text-red-500 flex-shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
