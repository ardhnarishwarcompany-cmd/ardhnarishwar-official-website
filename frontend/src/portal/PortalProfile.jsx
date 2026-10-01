import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building2,
  IndianRupee,
  ArrowUpRight,
  Loader2,
  LayoutGrid,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  platformMe,
  platformListPlans,
  platformRequestPlanUpgrade,
  platformListPlanRequests,
} from '../api/client';

const STATUS_STYLE = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  TRIAL: 'bg-sky-100 text-sky-800',
  NEW: 'bg-amber-100 text-amber-800',
  CONTACTED: 'bg-blue-100 text-blue-800',
  QUALIFIED: 'bg-violet-100 text-violet-800',
  INACTIVE: 'bg-paper-2 text-muted',
  SUSPENDED: 'bg-rose-100 text-rose-800',
};

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '—';
  }
}

function formatPrice(plan) {
  const price = Number(plan.price);
  if (!price || price <= 0) {
    if ((plan.billingCycle || '').toUpperCase() === 'TRIAL') return 'Trial';
    return 'Free';
  }
  const cycle = (plan.billingCycle || 'MONTHLY').toLowerCase();
  return `₹${price.toLocaleString('en-IN')}/${cycle === 'yearly' ? 'yr' : 'mo'}`;
}

export default function PortalProfile() {
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState({});
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [me, planList, reqList] = await Promise.all([
          platformMe(),
          platformListPlans().catch(() => []),
          platformListPlanRequests().catch(() => []),
        ]);
        if (cancelled) return;
        setData(me);
        setPlans(Array.isArray(planList) ? planList : []);
        setRequests(Array.isArray(reqList) ? reqList : []);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.error || e.message || 'Could not load profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const plan = data?.plan || {
    name: 'Trial',
    type: 'TRIAL',
    description: 'Default trial workspace.',
    status: 'ACTIVE',
  };
  const org = data?.organization;
  const services = data?.accessibleServices || [];

  const pendingPlanIds = new Set(
    requests
      .filter((r) => ['NEW', 'CONTACTED', 'QUALIFIED'].includes(r.status))
      .map((r) => r.planId)
  );

  const upgradePlans = plans.filter(
    (p) => Number(p.price) > 0 || (p.billingCycle && p.billingCycle !== 'TRIAL')
  );

  async function handleUpgrade(planItem) {
    setActionState((s) => ({ ...s, [planItem.id]: 'sending' }));
    try {
      await platformRequestPlanUpgrade(
        planItem.id,
        upgradeMessage || (selectedPlanId === planItem.id ? upgradeMessage : undefined)
      );
      setActionState((s) => ({ ...s, [planItem.id]: 'sent' }));
      setUpgradeMessage('');
      const reqList = await platformListPlanRequests().catch(() => []);
      setRequests(Array.isArray(reqList) ? reqList : []);
    } catch (e) {
      setActionState((s) => ({ ...s, [planItem.id]: 'error' }));
      if (e.response?.status === 409) {
        const reqList = await platformListPlanRequests().catch(() => []);
        setRequests(Array.isArray(reqList) ? reqList : []);
      }
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading profile…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-ink">My Profile</h1>
        <p className="text-muted text-sm mt-1">
          Your account details, organization plan, and subscription upgrade options.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account */}
        <section className="bg-white rounded-xl border border-line p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-gold" />
            <h2 className="text-base font-semibold text-ink">Account</h2>
          </div>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3 items-start">
              <User size={16} className="text-muted mt-0.5 shrink-0" />
              <div>
                <dt className="text-muted text-xs uppercase tracking-wide">Name</dt>
                <dd className="text-ink font-medium">{data?.name || '—'}</dd>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Mail size={16} className="text-muted mt-0.5 shrink-0" />
              <div>
                <dt className="text-muted text-xs uppercase tracking-wide">Email</dt>
                <dd className="text-ink font-medium break-all">{data?.email || '—'}</dd>
              </div>
            </div>
            {data?.phone && (
              <div className="flex gap-3 items-start">
                <Phone size={16} className="text-muted mt-0.5 shrink-0" />
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wide">Phone</dt>
                  <dd className="text-ink font-medium">{data.phone}</dd>
                </div>
              </div>
            )}
            <div className="flex gap-3 items-start">
              <ShieldCheck size={16} className="text-muted mt-0.5 shrink-0" />
              <div>
                <dt className="text-muted text-xs uppercase tracking-wide">Status</dt>
                <dd>
                  <span
                    className={`text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-full ${
                      STATUS_STYLE[data?.status] || STATUS_STYLE.ACTIVE
                    }`}
                  >
                    {data?.status || 'ACTIVE'}
                  </span>
                  {data?.emailVerified && (
                    <span className="ml-2 text-[11px] text-emerald-700">Verified</span>
                  )}
                </dd>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Clock size={16} className="text-muted mt-0.5 shrink-0" />
              <div>
                <dt className="text-muted text-xs uppercase tracking-wide">Member since</dt>
                <dd className="text-ink font-medium">{formatDate(data?.createdAt)}</dd>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Clock size={16} className="text-muted mt-0.5 shrink-0" />
              <div>
                <dt className="text-muted text-xs uppercase tracking-wide">Last login</dt>
                <dd className="text-ink font-medium">{formatDate(data?.lastLoginAt)}</dd>
              </div>
            </div>
          </dl>
        </section>

        {/* Organization */}
        {org && (
          <section className="bg-white rounded-xl border border-line p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={18} className="text-gold" />
              <h2 className="text-base font-semibold text-ink">Organization</h2>
            </div>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted text-xs uppercase tracking-wide">Name</dt>
                <dd className="text-ink font-medium">{org.name}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs uppercase tracking-wide">Status</dt>
                <dd>
                  <span
                    className={`text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-full ${
                      STATUS_STYLE[org.status] || STATUS_STYLE.ACTIVE
                    }`}
                  >
                    {org.status}
                  </span>
                </dd>
              </div>
              {org.role && (
                <div>
                  <dt className="text-muted text-xs uppercase tracking-wide">Your role</dt>
                  <dd className="text-ink font-medium">{org.role}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Current plan */}
        <section className="bg-white rounded-xl border border-line p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee size={18} className="text-gold" />
            <h2 className="text-base font-semibold text-ink">Your plan</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-lg font-semibold text-ink">{plan.name}</span>
            <span className="text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-full bg-gold/15 text-gold">
              {plan.type || 'TRIAL'}
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
            Trial and free plans cover core workspace modules. Paid plans unlock higher limits and
            commercial support.{' '}
            <Link to="/portal/pricing" className="text-ink font-medium underline-offset-2 hover:underline">
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
            Request a paid plan. Our team will contact you to complete billing and activate features —
            no payment is charged in-app yet.
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

        {/* Request history */}
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
            <Link to="/portal/services" className="text-sm text-ink font-medium hover:text-gold">
              Explore all
            </Link>
          </div>

          {loading && services.length === 0 && (
            <p className="text-sm text-muted">Loading services…</p>
          )}

          {!loading && services.length === 0 && (
            <p className="text-sm text-muted">
              No organization-facing services are published yet. Check back soon.
            </p>
          )}

          {services.length > 0 && (
            <ul className="grid sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <li key={s.id || s.slug}>
                  <Link
                    to={`/services/${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border border-line hover:border-gold/50 transition"
                  >
                    <span className="font-medium text-ink text-sm">{s.title}</span>
                    {s.category && (
                      <span className="block text-[11px] text-muted mt-0.5">{s.category}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
