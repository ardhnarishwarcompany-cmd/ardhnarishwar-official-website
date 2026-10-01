import { Check, IndianRupee, Info, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Reveal from './home/Reveal';
import { useMediaQuery } from '../hooks/useMediaQuery';
import {
  recruitmentPlans, hrOutsourcing, saasPlans, individualProducts,
  commercialSummary, universalTerms, negotiationNote, pricingEffectiveDate,
} from '../data/pricing';

// Shared pricing content, reused on the public Pricing page, the client
// portal, and the candidate portal. `compact` trims the outer spacing so it
// fits neatly inside the portal/candidate dashboard shell instead of a full
// marketing page.
//
// Animation notes:
// - The two 3-card "featured plan" grids (Recruitment Service Plans, HR
//   Technology Subscription Plans) use the signature spring/perspective
//   treatment from the supplied reference pricing component: the plan
//   marked `featured` in data/pricing.js is raised and scaled up slightly
//   on scroll-in, the flanking cards recede a touch, ported to plain
//   framer-motion (already a project dependency) — no TypeScript, no
//   Next.js, no shadcn/ui, no new npm packages. The 3D-ish perspective
//   shift only runs on desktop (see useMediaQuery below), matching the
//   reference component's own `isDesktop` gate.
// - Everything else keeps the project's existing `Reveal` (GSAP) scroll
//   reveal for a simple, consistent fade/rise.
// - The reference component's monthly/annual toggle + confetti +
//   NumberFlow digit animation were intentionally NOT ported here: this
//   static commercial data (recruitment fee %, 11-month SaaS contracts,
//   per-unit product pricing) has no real monthly/annual pair to switch
//   between, and inventing one would mean showing a price that isn't
//   actually offered. A genuine billing-cycle toggle already exists where
//   it's backed by real data — see the Portal/Candidate "Upgrade your
//   subscription" panels, which read billingCycle straight from the
//   SubscriptionPlan API.
export default function PricingContent({ compact = false }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className={compact ? 'space-y-14' : 'space-y-20'}>
      {!compact && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <Info size={14} />
          <span>{pricingEffectiveDate}. Prices are subject to GST and applicable statutory taxes.</span>
        </div>
      )}

      {/* Recruitment plans */}
      <section>
        <Reveal>
          <SectionHead
            kicker="Section A"
            title="Recruitment Service Plans"
            desc="Choose the recruitment partnership that fits how fast you need to hire and how much replacement cover you want."
          />
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 md:pt-4">
          {recruitmentPlans.map((p, i) => (
            <FeaturedPlanCard key={p.tag} index={i} items={recruitmentPlans} isDesktop={isDesktop}>
              <div
                className={`pricing-card-anim relative rounded-2xl border p-6 flex flex-col h-full ${
                  p.featured ? 'pricing-card-anim--featured border-gold bg-ink text-cream shadow-lg' : 'border-line bg-white'
                }`}
              >
                {p.featured && <PopularBadge />}
                <span className={`inline-block w-fit text-[11px] uppercase tracking-wide font-semibold rounded-full px-2.5 py-1 mb-4 ${
                  p.featured ? 'bg-gold/20 text-gold' : 'bg-cream text-gold'
                }`}>
                  {p.tag}
                </span>
                <h3 className={`font-semibold text-lg mb-3 ${p.featured ? 'text-cream' : 'text-ink'}`}>{p.name}</h3>
                <p className={`text-2xl font-bold mb-1 ${p.featured ? 'text-cream' : 'text-ink'}`}>{p.fee}</p>
                {p.feeNote && <p className={`text-xs mb-4 ${p.featured ? 'text-cream/70' : 'text-muted'}`}>{p.feeNote}</p>}
                <ul className={`text-sm space-y-2 mb-5 ${p.featured ? 'text-cream/90' : 'text-ink'}`}>
                  <li><strong>Replacement:</strong> {p.replacement}</li>
                  <li><strong>Vacancy closure:</strong> {p.closure}</li>
                  <li><strong>Token amount:</strong> {p.token} (adjustable)</li>
                  <li>{p.hrms}</li>
                </ul>
                <div className={`mt-auto pt-4 border-t space-y-1.5 ${p.featured ? 'border-white/15' : 'border-line'}`}>
                  {p.benefits.map((b) => (
                    <div key={b} className={`flex items-center gap-2 text-xs ${p.featured ? 'text-cream/80' : 'text-muted'}`}>
                      <Check size={13} className="text-gold shrink-0" /> {b}
                    </div>
                  ))}
                </div>
              </div>
            </FeaturedPlanCard>
          ))}
        </div>
      </section>

      {/* HR outsourcing */}
      <section>
        <Reveal>
          <SectionHead
            kicker="Section A"
            title="All-in-One HR Outsourcing"
            desc="A full HR operations team under one 11-month contract, billed on your total employee salary value."
          />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="pricing-card-anim mt-8 rounded-2xl border border-line bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="font-semibold text-lg text-ink">{hrOutsourcing.name}</h3>
                <p className="text-sm text-muted mt-1">{hrOutsourcing.billing}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Pill>{hrOutsourcing.duration}</Pill>
                <Pill>Token {hrOutsourcing.token}</Pill>
                <Pill>{hrOutsourcing.replacement}</Pill>
              </div>
            </div>
            <p className="text-xs uppercase tracking-wide text-gold font-semibold mb-3">Included free services</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {hrOutsourcing.included.map((i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-ink">
                  <Check size={14} className="text-gold shrink-0" /> {i}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* SaaS plans */}
      <section>
        <Reveal>
          <SectionHead
            kicker="Section B"
            title="HR Technology Subscription Plans"
            desc="Ongoing SaaS access to our HR technology stack, bundled with hiring and operational support over an 11-month term."
          />
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 md:pt-4">
          {saasPlans.map((p, i) => (
            <FeaturedPlanCard key={p.name} index={i} items={saasPlans} isDesktop={isDesktop}>
              <div
                className={`pricing-card-anim relative rounded-2xl border p-6 flex flex-col h-full ${
                  p.featured ? 'pricing-card-anim--featured border-gold bg-ink text-cream shadow-lg' : 'border-line bg-white'
                }`}
              >
                {p.featured && <PopularBadge />}
                {p.featured && (
                  <span className="inline-block w-fit text-[11px] uppercase tracking-wide font-semibold rounded-full px-2.5 py-1 mb-3 bg-gold/20 text-gold">
                    Most popular
                  </span>
                )}
                <h3 className={`font-semibold text-lg mb-3 ${p.featured ? 'text-cream' : 'text-ink'}`}>{p.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-2xl font-bold ${p.featured ? 'text-cream' : 'text-ink'}`}>{p.price}</span>
                  <span className={`text-sm line-through ${p.featured ? 'text-cream/50' : 'text-muted'}`}>{p.mrp}</span>
                </div>
                <p className={`text-xs mb-5 ${p.featured ? 'text-cream/70' : 'text-muted'}`}>{p.contract}</p>
                <ul className="text-sm space-y-2">
                  {p.included.map((i) => (
                    <li key={i} className={`flex items-start gap-2 ${p.featured ? 'text-cream/90' : 'text-ink'}`}>
                      <Check size={14} className="text-gold shrink-0 mt-0.5" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            </FeaturedPlanCard>
          ))}
        </div>
      </section>

      {/* Individual products */}
      <section>
        <Reveal>
          <SectionHead
            kicker="Section B"
            title="Individual Product Pricing"
            desc="Prefer to start with a single product? Every platform is available on its own too."
          />
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
          {individualProducts.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06}>
              <div className="pricing-card-anim rounded-2xl border border-line bg-white p-6 h-full">
                <h3 className="font-semibold text-ink mb-3">{p.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl font-bold text-ink">{p.price}</span>
                  <span className="text-sm text-muted line-through">{p.mrp}</span>
                </div>
                <p className="text-xs text-muted mb-4">{p.terms}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.features.map((f) => (
                    <span key={f} className="text-[11px] bg-cream text-gold rounded-full px-2.5 py-1">{f}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Commercial summary table */}
      <section>
        <Reveal>
          <SectionHead title="Commercial Summary" desc="A quick side-by-side of market price versus our offer." />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-line bg-cream/40 text-left">
                  <th className="px-5 py-3 font-semibold text-ink">Service</th>
                  <th className="px-5 py-3 font-semibold text-ink">Market Price (MRP)</th>
                  <th className="px-5 py-3 font-semibold text-ink">Recruweb Price</th>
                </tr>
              </thead>
              <tbody>
                {commercialSummary.map((row, i) => (
                  <tr key={row.service} className={i % 2 === 1 ? 'bg-paper/60' : ''}>
                    <td className="px-5 py-3 text-ink font-medium border-t border-line">{row.service}</td>
                    <td className="px-5 py-3 text-muted border-t border-line">{row.mrp}</td>
                    <td className="px-5 py-3 text-gold font-semibold border-t border-line">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* Universal terms */}
      <section>
        <Reveal>
          <SectionHead title="Universal Commercial Terms" desc="These terms apply across all plans unless a custom agreement says otherwise." />
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {universalTerms.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.06}>
              <div className="pricing-card-anim rounded-xl border border-line bg-white p-5 h-full">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee size={15} className="text-gold" />
                  <h4 className="font-semibold text-ink text-sm">{t.title}</h4>
                </div>
                <p className="text-sm text-muted">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="text-sm text-muted mt-5 italic">{negotiationNote}</p>
      </section>
    </div>
  );
}

// Ports the reference component's signature entrance: the featured card in
// a 3-card row is raised and scaled up slightly, the flanking cards recede
// a touch — on desktop only. Falls back to a plain fade/rise on mobile.
function FeaturedPlanCard({ children, index, items, isDesktop }) {
  const featuredIndex = items.findIndex((it) => it.featured);
  const isFeatured = index === featuredIndex;
  const raise = isFeatured ? -16 : 0;
  const scale = isFeatured ? 1.02 : 0.97;
  const lean = featuredIndex === -1 || isFeatured ? 0 : index < featuredIndex ? -6 : 6;

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={
        isDesktop
          ? { y: raise, opacity: 1, x: lean, scale }
          : { y: 0, opacity: 1 }
      }
      whileHover={isDesktop ? { y: raise - 6 } : undefined}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.9,
        type: 'spring',
        stiffness: 120,
        damping: 22,
        delay: index * 0.12,
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function PopularBadge() {
  return (
    <div className="absolute top-0 right-6 -translate-y-1/2 bg-gold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
      <Star size={12} className="text-ink fill-current" />
    </div>
  );
}

function SectionHead({ kicker, title, desc }) {
  return (
    <div>
      {kicker && <p className="text-xs uppercase tracking-wide text-gold font-semibold mb-2">{kicker}</p>}
      <h2 className="text-2xl md:text-3xl font-semibold text-ink">{title}</h2>
      {desc && <p className="text-muted text-sm mt-2 max-w-2xl">{desc}</p>}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center text-xs font-medium bg-cream text-gold rounded-full px-3 py-1.5 whitespace-nowrap">
      {children}
    </span>
  );
}