import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { LoadingState, ErrorState } from '../components/States';
import { getJobs } from '../api/client';

export default function Careers() {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJobs().then(setJobs).catch(() => setError(true));
  }, []);

  return (
    <Layout>
      <section className="bg-ink text-cream py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl"><em>Careers</em></h1>
          <p className="mt-4 text-cream/75 max-w-xl">
            Help build the platform that runs other companies' workforces.
          </p>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          {error && <ErrorState />}
          {!error && !jobs && <LoadingState label="Loading openings…" />}
          {jobs && jobs.length === 0 && (
            <p className="text-muted">No open roles right now — check back soon.</p>
          )}
          {jobs && jobs.map((job) => (
            <Link
              key={job.id}
              to={`/careers/${job.slug}`}
              className="block py-8 border-t border-ink/10 last:border-b group"
            >
              <div className="flex items-baseline justify-between gap-6">
                <h2 className="text-2xl group-hover:text-gold transition-colors">{job.title}</h2>
                <span className="text-xs text-gold bg-gold/10 px-2.5 py-1 rounded-sm shrink-0 capitalize">
                  {job.employmentType?.replace('-', ' ')}
                </span>
              </div>
              <p className="mt-2 text-muted text-[14px]">
                {[job.department, job.location].filter(Boolean).join(' · ')}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}