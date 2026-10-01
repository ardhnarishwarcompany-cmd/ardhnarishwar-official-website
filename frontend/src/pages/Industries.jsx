import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingState, ErrorState } from '../components/States';
import { getIndustries } from '../api/client';

export default function Industries() {
  const [industries, setIndustries] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getIndustries().then(setIndustries).catch(() => setError(true));
  }, []);

  return (
    <Layout>
      <section className="bg-ink text-cream py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl">Industries we <em>serve</em></h1>
          <p className="mt-4 text-cream/75 max-w-xl">
            The same platform, tuned to how different industries actually run their workforce.
          </p>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          {error && <ErrorState />}
          {!error && !industries && <LoadingState label="Loading industries…" />}
          {industries && industries.map((ind) => (
            <div key={ind.id} className="grid md:grid-cols-[240px_1fr] gap-6 py-8 border-t border-ink/10 last:border-b">
              <h2 className="text-xl">{ind.name}</h2>
              <p className="text-muted text-[15px] max-w-xl">{ind.description}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}