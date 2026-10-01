import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAllJobs, updateJob, deleteJob } from '../api/client';

export default function JobsList() {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    getAllJobs().then(setJobs).catch(() => setError(true));
  }

  useEffect(load, []);

  async function togglePublish(job) {
    const updated = await updateJob(job.id, { isPublished: !job.isPublished });
    setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
  }

  async function handleDelete(job) {
    if (!confirm(`Delete "${job.title}"? This can't be undone.`)) return;
    await deleteJob(job.id);
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">Careers</h1>
        <Link to="/admin/careers/new" className="admin-btn admin-btn-gold">
          + New opening
        </Link>
      </div>

      {error && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Could not load job openings.</p>}
      {!error && !jobs && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Loading…</p>}
      {jobs && jobs.length === 0 && (
        <p style={{color:"#786c87",fontSize:14,marginTop:24}}>No openings yet — post the first one.</p>
      )}

      {jobs && jobs.length > 0 && (
        <div className="mt-8 divide-y divide-ink/10 border-t border-b border-ink/10">
          {jobs.map((j) => (
            <div key={j.id} className="py-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{j.title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {[j.department, j.location].filter(Boolean).join(' · ')} · /{j.slug}
                </p>
              </div>

              <button
                onClick={() => togglePublish(j)}
                className="text-xs px-2.5 py-1 rounded-sm flex-shrink-0"
                style={
                  j.isPublished
                    ? { color: 'var(--color-teal)', background: 'color-mix(in srgb, var(--color-teal) 12%, transparent)' }
                    : { color: 'var(--color-muted)', background: 'color-mix(in srgb, var(--color-ink) 5%, transparent)' }
                }
              >
                {j.isPublished ? 'Published' : 'Draft'}
              </button>

              <Link to={`/admin/careers/${j.id}/edit`} className="text-sm text-muted hover:text-gold flex-shrink-0">
                Edit
              </Link>
              <button onClick={() => handleDelete(j)} className="text-sm text-muted hover:text-red-500 flex-shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
