import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Clock,
  LayoutGrid,
  ExternalLink,
  BadgeCheck,
  IndianRupee,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import {
  candidateMe,
  getCandidate,
  setCandidateSession,
  mediaUrl,
  candidateListPlans,
  candidateRequestPlanUpgrade,
  candidateListPlanRequests,
} from '../api/client';

const STATUS_STYLE = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-800',
  INACTIVE: 'bg-slate-100 text-slate-700',
  SUSPENDED: 'bg-rose-100 text-rose-800',
  NEW: 'bg-amber-100 text-amber-800',
  CONTACTED: 'bg-sky-100 text-sky-800',
  QUALIFIED: 'bg-sky-100 text-sky-800',
  WON: 'bg-emerald-100 text-emerald-800',
  LOST: 'bg-rose-100 text-rose-800',
};

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(value);
  }
}

function formatPrice(plan) {
  const price = Number(plan.price);
  if (!price || price <= 0) return 'Free';
  const cycle = (plan.billingCycle || 'MONTHLY').toLowerCase();
  return `₹${price.toLocaleString('en-IN')}/${cycle === 'yearly' ? 'yr' : cycle === 'trial' ? 'trial' : 'mo'}`;
}

export default function CandidateProfile() {
  const cached = getCandidate();
  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState({}); // { [planId]: 'sending' | 'sent' | 'error' }
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [me, planList, reqList] = await Promise.all([
        candidateMe().catch((e) => {
          throw e;
        }),
        candidateListPlans().catch(() => []),
        candidateListPlanRequests().catch(() => []),
      ]);
      setProfile(me);
      setPlans(Array.isArray(planList) ? planList : []);
      setRequests(Array.isArray(reqList) ? reqList : []);
      if (me?.id) {
        setCandidateSession({
          candidate: {
            id: me.id,
            name: me.name,
            email: me.email,
            phone: me.phone,
            emailVerified: me.emailVerified,
            status: me.status,
          },
        });
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Could not load profile.');
      if (cached) {
        setProfile({
          ...cached,
          plan: {
            name: 'Candidate Access',
            type: 'FREE',
            description: 'Free access for job seekers.',
            status: cached.status || 'ACTIVE',
          },
          accessibleServices: [],
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const data = profile || cached;
  const services = Array.isArray(data?.accessibleServices) ? data.accessibleServices : [];
  const plan = data?.plan || {
    name: 'Candidate Access',
    type: 'FREE',
    status: data?.status || 'ACTIVE',
  };

  const pendingPlanIds = new Set(
    requests
      .filter((r) => ['NEW', 'CONTACTED', 'QUALIFIED'].includes(r.status))
      .map((r) => r.planId)
  );

  // Paid / higher plans available to upgrade to (exclude free/zero-price trial if desired)
  const upgradePlans = plans.filter((p) => Number(p.price) > 0 || (p.billingCycle && p.billingCycle !== 'TRIAL'));

  async function handleUpgrade(planItem) {
    setActionState((s) => ({ ...s, [planItem.id]: 'sending' }));
    try {
      await candidateRequestPlanUpgrade(
        planItem.id,
        upgradeMessage || selectedPlanId === planItem.id ? upgradeMessage : undefined
      );
      setActionState((s) => ({ ...s, [planItem.id]: 'sent' }));
      setUpgradeMessage('');
      setSelectedPlanId(null);
      await loadAll();
    } catch (e) {
      const msg = e.response?.data?.error || e.message;
      setActionState((s) => ({ ...s, [planItem.id]: 'error' }));
      if (e.response?.status === 409) {
        // already pending — refresh list
        await loadAll();
      } else {
        setError(msg);
      }
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">My Profile</h1>
        <p className="text-muted text-sm mt-1">
          Your account details, current plan, and subscription upgrade options.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100 flex justify-between gap-3">
          <span>{error}</span>
          <button type="button" className="text-xs underline shrink-0" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      {loading && !data && (
        <p className="text-sm text-muted py-8 text-center">Loading profile…</p>
      )}

      {data && (
        <>
          {/* Account details */}
          <section className="bg-white rounded-xl border border-line p-5 sm:p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="h-14 w-14 rounded-full bg-ink text-white flex items-center justify-center text-xl font-semibold shrink-0">
                {(data.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-ink truncate">{data.name || 'Candidate'}</h2>
                <p className="text-sm text-muted truncate">{data.email}</p>
                <span
                  className={`inline-block mt-2 text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-full ${
                    STATUS_STYLE[data.status] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {data.status || 'UNKNOWN'}
                </span>
              </div>
            </div>

            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex gap-3 items-start">
                <Mail size={16} className="text-muted mt-0.5 shrink-0" />
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wide">Email</dt>
                  <dd className="text-ink font-medium break-all">{data.email || '—'}</dd>
                  <dd className="text-xs mt-0.5 flex items-center gap-1">
                    {data.emailVerified ? (
                      <>
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span className="text-emerald-700">Verified</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={12} className="text-amber-600" />
                        <span className="text-amber-700">Not verified</span>
                      </>
                    )}
                  </dd>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Phone size={16} className="text-muted mt-0.5 shrink-0" />
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wide">Phone</dt>
                  <dd className="text-ink font-medium">{data.phone || 'Not provided'}</dd>
                  {data.phone && (
                    <dd className="text-xs mt-0.5 flex items-center gap-1">
                      {data.mobileVerified ? (
                        <>
                          <ShieldCheck size={12} className="text-emerald-600" />
                          <span className="text-emerald-700">Verified</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={12} className="text-amber-600" />
                          <span className="text-amber-700">Not verified</span>
                        </>
                      )}
                    </dd>
                  )}
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Calendar size={16} className="text-muted mt-0.5 shrink-0" />
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wide">Member since</dt>
                  <dd className="text-ink font-medium">{formatDate(data.createdAt)}</dd>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Clock size={16} className="text-muted mt-0.5 shrink-0" />
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wide">Last login</dt>
                  <dd className="text-ink font-medium">{formatDate(data.lastLoginAt)}</dd>
                </div>
              </div>
            </dl>
          </section>

          {/* Current plan */}
          <section className="bg-white rounded-xl border border-line p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee size={18} className="text-gold" />
              <h2 className="text-base font-semibold text-ink">Your plan</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-lg font-semibold text-ink">{plan.name}</span>
              <span className="text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-full bg-gold/15 text-gold">
                {plan.type || 'FREE'}
              </span>
              <span
                className={`text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-full ${
                  STATUS_STYLE[plan.status] || STATUS_STYLE.ACTIVE
                }`}
              >
                {plan.status || 'ACTIVE'}
              </span>
            </div>
            {plan.description && <p className="text-sm text-muted mb-2">{plan.description}</p>}
            <p className="text-sm text-muted">
              Free candidate access covers job-seeker and dual-access services. Paid plans unlock organization workspace features (CRM, HRMS, team seats).{' '}
              <Link to="/candidate/pricing" className="text-ink font-medium underline-offset-2 hover:underline">
                See full pricing
              </Link>
            </p>
          </section>

          {/* Upgrade flow */}
          <section className="bg-white rounded-xl border border-line p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight size={18} className="text-gold" />
              <h2 className="text-base font-semibold text-ink">Upgrade subscription</h2>
            </div>
            <p className="text-sm text-muted mb-4">
              Request a paid plan. Our team will contact you to complete billing and activate an organization workspace — no payment is charged in-app yet.
            </p>

            {loading && upgradePlans.length === 0 && (
              <p className="text-sm text-muted flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading plans…
              </p>
            )}

            {!loading && upgradePlans.length === 0 && (
              <p className="text-sm text-muted">
                No upgrade plans are published yet. Contact support or check back later.
              </p>
            )}

            {upgradePlans.length > 0 && (
              <>
                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">
                    Optional note for our team
                  </label>
                  <textarea
                    value={upgradeMessage}
                    onChange={(e) => setUpgradeMessage(e.target.value)}
                    rows={2}
                    placeholder="e.g. Need CRM for a 12-person hiring team…"
                    className="w-full text-sm border border-line rounded-lg px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <ul className="space-y-3">
                  {upgradePlans.map((p) => {
                    const state = actionState[p.id];
                    const pending = pendingPlanIds.has(p.id) || state === 'sent';
                    const features = Array.isArray(p.features) ? p.features : [];
                    return (
                      <li
                        key={p.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-line hover:border-gold/40 transition"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-ink">{p.name}</span>
                            <span className="text-sm text-gold font-medium">{formatPrice(p)}</span>
                          </div>
                          {p.description && (
                            <p className="text-xs text-muted mt-1">{p.description}</p>
                          )}
                          {features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {features.slice(0, 6).map((f) => (
                                <span
                                  key={f}
                                  className="text-[10px] uppercase tracking-wide bg-cream text-gold rounded-full px-2 py-0.5"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          {pending ? (
                            <span className="inline-block text-[11px] px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-medium">
                              Request pending
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPlanId(p.id);
                                handleUpgrade(p);
                              }}
                              disabled={state === 'sending'}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-ink text-cream px-4 py-2 rounded-lg hover:bg-teal transition disabled:opacity-60"
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
                          {state === 'error' && (
                            <p className="text-[11px] text-rose-600 mt-1 text-right">Failed — try again</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>

          {/* Your upgrade requests */}
          {requests.length > 0 && (
            <section className="bg-white rounded-xl border border-line p-5 sm:p-6">
              <h2 className="text-base font-semibold text-ink mb-3">Your upgrade requests</h2>
              <ul className="space-y-2">
                {requests.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between text-sm border-b border-line pb-2 gap-3"
                  >
                    <span>
                      <span className="font-medium text-ink">{r.planName || 'Plan request'}</span>
                      <span className="block text-[11px] text-muted">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                        STATUS_STYLE[r.status] || 'bg-paper-2 text-muted'
                      }`}
                    >
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Accessible services */}
          <section className="bg-white rounded-xl border border-line p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-gold" />
                <h2 className="text-base font-semibold text-ink">Services you can access</h2>
              </div>
              <Link to="/candidate/services" className="text-sm text-ink font-medium hover:text-gold">
                Explore all
              </Link>
            </div>

            {loading && services.length === 0 && (
              <p className="text-sm text-muted">Loading services…</p>
            )}

            {!loading && services.length === 0 && (
              <p className="text-sm text-muted">
                No candidate-facing services are published yet. Check back soon.
              </p>
            )}

            {services.length > 0 && (
              <ul className="space-y-3">
                {services.map((s) => (
                  <li
                    key={s.id || s.slug}
                    className="flex items-start gap-3 p-3 rounded-lg border border-line hover:border-gold/40 transition"
                  >
                    {s.imageUrl ? (
                      <img
                        src={mediaUrl(s.imageUrl)}
                        alt=""
                        className="h-10 w-10 rounded-md object-cover shrink-0 bg-paper-2"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-paper-2 flex items-center justify-center shrink-0">
                        <BadgeCheck size={18} className="text-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink text-sm">{s.title}</p>
                        {s.category && (
                          <span className="text-[10px] uppercase tracking-wide text-gold bg-cream rounded-full px-2 py-0.5">
                            {s.category}
                          </span>
                        )}
                        <span className="text-[10px] uppercase tracking-wide text-muted bg-paper-2 rounded-full px-2 py-0.5">
                          {s.accessType}
                        </span>
                      </div>
                      {s.shortDescription && (
                        <p className="text-xs text-muted mt-0.5 line-clamp-2">{s.shortDescription}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Link
                        to={`/services/${s.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-ink hover:text-gold"
                      >
                        Details <ExternalLink size={12} />
                      </Link>
                      {s.externalUrl && (
                        <a
                          href={s.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
                        >
                          Launch
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
