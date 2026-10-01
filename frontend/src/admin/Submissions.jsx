import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { getSubmissions, updateSubmissionStatus } from '../api/client';

const statusOptions = ['new', 'contacted', 'in_progress', 'resolved', 'closed'];
const statusLabels = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function Submissions() {
  const [submissions, setSubmissions] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getSubmissions().then(setSubmissions).catch(() => setError(true));
  }, []);

  async function handleStatusChange(sub, status) {
    const updated = await updateSubmissionStatus(sub.id, status);
    setSubmissions((prev) => prev.map((s) => (s.id === sub.id ? updated : s)));
  }

  const visible = submissions
    ? filter === 'all'
      ? submissions
      : submissions.filter((s) => s.status === filter)
    : null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="admin-page-title">Submissions</h1>
        <div className="flex gap-1.5 text-xs">
          {['all', ...statusOptions].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-sm capitalize ${
                filter === f ? 'bg-ink text-cream' : 'bg-ink/5 text-muted'
              }`}
            >
              {f === 'all' ? 'All' : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Could not load submissions.</p>}
      {!error && !submissions && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Loading…</p>}
      {visible && visible.length === 0 && <p style={{color:"#786c87",fontSize:14,marginTop:24}}>Nothing here.</p>}

      {visible && visible.length > 0 && (
        <div className="mt-8 space-y-4">
          {visible.map((s) => (
            <div key={s.id} className="border border-ink/10 rounded-sm p-5 bg-white">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium">{s.name} <span className="text-muted font-normal">· {s.email}</span></p>
                  <p className="text-xs text-muted mt-0.5">
                    {[s.company, s.phone, s.interestedIn].filter(Boolean).join(' · ') || '—'}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>

                <select
                  value={s.status}
                  onChange={(e) => handleStatusChange(s, e.target.value)}
                  className="text-xs border border-ink/15 rounded-sm px-2.5 py-1.5 capitalize"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>{statusLabels[opt]}</option>
                  ))}
                </select>
              </div>

              <p className="mt-3 text-sm text-ink/85 whitespace-pre-wrap">{s.message}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
