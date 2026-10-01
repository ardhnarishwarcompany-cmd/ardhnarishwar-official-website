import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCog, MessageSquarePlus, ExternalLink, Lock, ArrowRight } from 'lucide-react';
import { listOrgMembers, listMyPortalInquiries, getServices } from '../api/client';
import Reveal from '../components/home/Reveal';

const STEPS = [
  { key: 'users', title: 'Users & roles', blurb: 'Invite teammates and assign roles.' },
  { key: 'ops', title: 'Daily operations', blurb: 'Submit inquiries and track their status.' },
];

const STATUS_STYLE = {
  NEW: 'bg-amber-100 text-amber-800',
  CONTACTED: 'bg-sky-100 text-sky-800',
  QUALIFIED: 'bg-sky-100 text-sky-800',
  PROPOSAL: 'bg-violet-100 text-violet-800',
  NEGOTIATION: 'bg-violet-100 text-violet-800',
  WON: 'bg-emerald-100 text-emerald-800',
  LOST: 'bg-rose-100 text-rose-800',
};

export default function Workspace() {
  const [memberCount, setMemberCount] = useState(0);
  const [inquiries, setInquiries] = useState([]);
  const [services, setServices] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [members, myInquiries, svc] = await Promise.all([
        listOrgMembers().catch(() => []),
        listMyPortalInquiries().catch(() => []),
        getServices().catch(() => []),
      ]);
      setMemberCount(Array.isArray(members) ? members.length : 0);
      setInquiries(Array.isArray(myInquiries) ? myInquiries : []);
      const svcList = Array.isArray(svc) ? svc : svc?.services || svc?.data || [];
      setServices(svcList);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const done = {
    users: memberCount > 0,
    ops: true,
  };

  // Only services this organization login can actually access.
  const orgServices = useMemo(() => {
    if (!services) return [];
    return services.filter((s) => ['organization', 'both'].includes(s.accessType || 'organization'));
  }, [services]);

  function launch(s) {
    if (s.externalUrl) window.open(s.externalUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Workspace</h1>
        <p className="text-sm text-muted">
          Invite your team, browse our services, and track every inquiry you send us.
        </p>
      </div>

      {error && <div className="bg-cream text-gold text-sm px-4 py-2 rounded-lg">{error}</div>}
      {loading && <p className="text-sm text-muted">Loading workspace…</p>}

      <div className="grid md:grid-cols-2 gap-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.key} delay={i * 0.08}>
          <div
            className={`rounded-xl border p-4 ${done[s.key] ? 'border-emerald-200 bg-emerald-50/50' : 'border-line bg-white'}`}
          >
            <div className="text-[10px] uppercase tracking-wide text-muted mb-1">Step {i + 1}</div>
            <div className="font-semibold text-ink text-sm">{s.title}</div>
            <p className="text-xs text-muted mt-1">{s.blurb}</p>
            <div className={`mt-2 text-[11px] font-medium ${done[s.key] ? 'text-emerald-700' : 'text-muted'}`}>
              {done[s.key] ? 'Ready' : 'Pending'}
            </div>
          </div>
          </Reveal>
        ))}
      </div>

      {/* Your Services: the services this org login can actually access right now. */}
      <Reveal delay={0.12}>
      <div className="bg-white border border-line rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink">Your Services</h2>
          <Link to="/portal/services" className="text-xs font-medium text-ink hover:text-gold inline-flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {!services ? (
          <p className="text-sm text-muted">Loading services…</p>
        ) : orgServices.length === 0 ? (
          <p className="text-sm text-muted">No services are available to your organization yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orgServices.slice(0, 3).map((s) => (
              <div key={s.id || s.slug} className="border border-line rounded-lg p-4">
                <h3 className="font-semibold text-ink text-sm mb-1">{s.title}</h3>
                {s.shortDescription && (
                  <p className="text-xs text-muted line-clamp-2 mb-3">{s.shortDescription}</p>
                )}
                <div className="flex items-center gap-3">
                  {s.externalUrl ? (
                    <button
                      type="button"
                      onClick={() => launch(s)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-ink hover:bg-teal px-3 py-1.5 rounded-lg transition"
                    >
                      Launch <ExternalLink size={12} />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                      <Lock size={11} /> Not yet available
                    </span>
                  )}
                  <Link
                    to={`/services/${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted hover:text-ink"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </Reveal>

      {/* My Inquiries: every inquiry this client has submitted, with live status. */}
      <Reveal delay={0.2}>
      <div className="bg-white border border-line rounded-xl p-5">
        <h2 className="font-semibold text-ink mb-3">My Inquiries</h2>
        {inquiries.length === 0 ? (
          <p className="text-sm text-muted">No inquiries submitted yet.</p>
        ) : (
          <ul className="space-y-2">
            {inquiries.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm border-b border-line pb-2 gap-3">
                <span>
                  <span className="text-ink">{r.subject || r.requirement || 'Inquiry'}</span>
                  <span className="block text-[11px] text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLE[r.status] || 'bg-paper-2 text-muted'}`}>
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      </Reveal>

      <Reveal delay={0.28}>
      <div className="bg-white border border-line rounded-xl p-5">
        <h2 className="font-semibold text-ink mb-3">Next actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/portal/team"
            className="inline-flex items-center gap-2 text-sm font-semibold bg-ink text-cream px-4 py-2.5 rounded-lg hover:bg-teal transition"
            style={{ color: '#fbf8f2' }}
          >
            <UserCog size={16} style={{ color: '#fbf8f2' }} />
            Invite team members
          </Link>
          <Link
            to="/portal/inquiry"
            className="inline-flex items-center gap-2 text-sm font-semibold border border-line px-4 py-2.5 rounded-lg hover:bg-paper transition"
          >
            <MessageSquarePlus size={16} />
            Submit an inquiry
          </Link>
        </div>
      </div>
      </Reveal>
    </div>
  );
}