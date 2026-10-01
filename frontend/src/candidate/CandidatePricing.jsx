import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Loader2, Check } from 'lucide-react';
import PricingContent from '../components/PricingContent';
import Reveal from '../components/home/Reveal';
import {
  candidateListPlans,
  candidateRequestPlanUpgrade,
  candidateListPlanRequests,
  isCandidateAuthed,
} from '../api/client';

function formatPrice(plan) {
  const price = Number(plan.price);
  if (!price || price <= 0) return 'Free';
  const cycle = (plan.billingCycle || 'MONTHLY').toLowerCase();
  return `₹${price.toLocaleString('en-IN')}/${cycle === 'yearly' ? 'yr' : cycle === 'trial' ? 'trial' : 'mo'}`;
}

export default function CandidatePricing() {
  const [plans, setPlans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState({});
  const [banner, setBanner] = useState('');
  const authed = isCandidateAuthed();

  useEffect(() => {
    if (!authed) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [planList, reqList] = await Promise.all([
          candidateListPlans().catch(() => []),
          candidateListPlanRequests().catch(() => []),
        ]);
        if (cancelled) return;
        setPlans(Array.isArray(planList) ? planList : []);
        setRequests(Array.isArray(reqList) ? reqList : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  const pendingPlanIds = new Set(
    requests
      .filter((r) => ['NEW', 'CONTACTED', 'QUALIFIED'].includes(r.status))
      .map((r) => r.planId)
  );

  const upgradePlans = plans.filter(
    (p) => Number(p.price) > 0 || (p.billingCycle && p.billingCycle !== 'TRIAL')
  );

  async function handleUpgrade(plan) {
    setActionState((s) => ({ ...s, [plan.id]: 'sending' }));
    setBanner('');
    try {
      await candidateRequestPlanUpgrade(plan.id);
      setActionState((s) => ({ ...s, [plan.id]: 'sent' }));
      setBanner(`Upgrade request for ${plan.name} submitted. We'll contact you shortly.`);
      const reqList = await candidateListPlanRequests().catch(() => []);
      setRequests(Array.isArray(reqList) ? reqList : []);
    } catch (e) {
      setActionState((s) => ({ ...s, [plan.id]: 'error' }));
      setBanner(e.response?.data?.error || e.message || 'Could not submit request.');
      if (e.response?.status === 409) {
        const reqList = await candidateListPlanRequests().catch(() => []);
        setRequests(Array.isArray(reqList) ? reqList : []);
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-ink">Pricing & Plans</h1>
        <p className="text-muted text-sm mt-1">
          What employers pay for recruitment, HR outsourcing, and our HR technology products.
          As a candidate you can request a paid workspace plan for your organization.
        </p>
      </div>

      {authed && (
        <section className="mb-10 bg-white rounded-xl border border-line p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-semibold text-ink">Upgrade your subscription</h2>
              <p className="text-sm text-muted mt-0.5">
                You are on free Candidate Access. Request a plan below — our team handles billing offline.
              </p>
            </div>
            <Link to="/candidate/profile" className="text-sm font-medium text-ink hover:text-gold">
              View profile →
            </Link>
          </div>

          {banner && (
            <div className="mb-4 text-sm px-3 py-2 rounded-lg bg-cream text-ink border border-line">
              {banner}
            </div>
          )}

          {loading && (
            <p className="text-sm text-muted flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Loading plans…
            </p>
          )}

          {!loading && upgradePlans.length === 0 && (
            <p className="text-sm text-muted">No paid plans available right now.</p>
          )}

          {upgradePlans.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upgradePlans.map((p, i) => {
                const state = actionState[p.id];
                const pending = pendingPlanIds.has(p.id) || state === 'sent';
                const features = Array.isArray(p.features) ? p.features : [];
                return (
                  <Reveal key={p.id} delay={i * 0.06}>
                  <div
                    className="pricing-card-anim rounded-xl border border-line p-5 flex flex-col h-full hover:border-gold/50"
                  >
                    <h3 className="font-semibold text-ink">{p.name}</h3>
                    <p className="text-xl font-bold text-gold mt-1">{formatPrice(p)}</p>
                    {p.description && (
                      <p className="text-xs text-muted mt-2 flex-1">{p.description}</p>
                    )}
                    {features.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {features.slice(0, 5).map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-ink">
                            <Check size={12} className="text-gold shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4">
                      {pending ? (
                        <span className="inline-block text-[11px] px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-medium">
                          Request pending
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpgrade(p)}
                          disabled={state === 'sending'}
                          className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold bg-ink text-cream px-4 py-2 rounded-lg hover:bg-teal transition disabled:opacity-60"
                          style={{ color: '#fbf8f2' }}
                        >
                          {state === 'sending' ? (
                            <>
                              <Loader2 size={14} className="animate-spin" /> Sending…
                            </>
                          ) : (
                            <>
                              Request upgrade <ArrowUpRight size={14} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>
      )}

      {!authed && (
        <div className="mb-8 text-sm text-muted bg-cream/50 border border-line rounded-lg px-4 py-3">
          <Link to="/candidate/login" className="font-medium text-ink underline-offset-2 hover:underline">
            Sign in
          </Link>{' '}
          to request a subscription upgrade from this page.
        </div>
      )}

      <PricingContent compact />
    </div>
  );
}