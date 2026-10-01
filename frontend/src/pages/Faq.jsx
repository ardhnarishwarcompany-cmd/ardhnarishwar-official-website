import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingState, ErrorState } from '../components/States';
import { getFaqs } from '../api/client';

export default function Faq() {
  const [faqs, setFaqs] = useState(null);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    getFaqs().then(setFaqs).catch(() => setError(true));
  }, []);

  return (
    <Layout>
      <section className="bg-ink text-cream py-20 px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl">Frequently asked <em>questions</em></h1>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-3xl mx-auto">
          {error && <ErrorState />}
          {!error && !faqs && <LoadingState label="Loading…" />}
          {faqs && faqs.length === 0 && <p className="text-muted">No FAQs published yet.</p>}
          {faqs && faqs.map((f) => {
            const isOpen = openId === f.id;
            return (
              <div key={f.id} className="border-t border-ink/10 last:border-b">
                <button
                  onClick={() => setOpenId(isOpen ? null : f.id)}
                  className="w-full text-left py-6 flex items-center justify-between gap-6"
                >
                  <span className="text-lg">{f.question}</span>
                  <span className="text-gold text-xl shrink-0">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p className="pb-6 text-muted text-[15px] max-w-2xl">{f.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}