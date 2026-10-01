import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PricingContent from '../components/PricingContent';

export default function Pricing() {
  return (
    <Layout>
      <section className="bg-ink text-cream py-20 px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-wide text-gold font-semibold mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl">Simple, transparent <em>commercials</em></h1>
          <p className="text-cream/70 mt-4 max-w-xl">
            Recruitment, HR outsourcing, and our HR technology products — one page, no hidden fees.
          </p>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <PricingContent />

          <div className="mt-16 rounded-2xl border border-line bg-cream/40 p-8 flex flex-wrap items-center justify-between gap-5">
            <div>
              <h3 className="font-semibold text-ink text-lg">Need a custom quote?</h3>
              <p className="text-muted text-sm mt-1">Talk to us about bulk hiring, multi-location deployment, or enterprise contracts.</p>
            </div>
            <Link to="/request-demo" className="nav-cta shrink-0">
              Request a quote <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}