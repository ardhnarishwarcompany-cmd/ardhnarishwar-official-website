import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { LoadingState, ErrorState } from '../components/States';
import { getJobBySlug } from '../api/client';
import { emphasizeLastWord } from '../utils/emphasize';

export default function JobDetail() {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setJob(null);
    setError(null);
    getJobBySlug(slug).then(setJob).catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <Layout>
        <ErrorState message="We couldn't find that opening." />
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-ink text-cream py-20 px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/careers" className="text-sm text-cream/60 hover:text-gold">← All openings</Link>
          <h1 className="mt-4 text-4xl md:text-5xl">{emphasizeLastWord(job.title)}</h1>
          <p className="mt-4 text-cream/75">
            {[job.department, job.location].filter(Boolean).join(' · ')}
            {job.employmentType && ` · ${job.employmentType.replace('-', ' ')}`}
          </p>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-3xl mx-auto">
          {job.description && (
            <p className="text-[16px] leading-relaxed max-w-2xl">{job.description}</p>
          )}

          {Array.isArray(job.requirements) && job.requirements.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl mb-5">What we're looking for</h2>
              <ul className="space-y-3">
                {job.requirements.map((r) => (
                  <li key={r} className="text-[15px] relative pl-4">
                    <span className="absolute left-0 top-2 w-1.5 h-1.5" style={{ background: 'var(--color-teal)' }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-14 pt-8 border-t border-ink/10">
            <Link to="/contact" className="bg-soft-orange hover:bg-[var(--soft-orange-dark)] text-white font-semibold px-6 py-3.5 rounded-sm inline-block">
              Apply for this role
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}