import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Users, Briefcase, Globe2, Bot, Workflow, LineChart,
  BookOpen, ShieldCheck, Wrench, Layers, ExternalLink, Lock,
  Sparkles, CheckCircle2, Zap, Settings2, BarChart3, Puzzle,
  Clock, Eye, Repeat, Database, TrendingUp, ArrowRight,
} from 'lucide-react';
import Layout from '../components/Layout';
import { LoadingState, ErrorState } from '../components/States';
import Reveal from '../components/home/Reveal';
import TiltCard from '../components/home/TiltCard';
import ServiceDemoPreview from '../components/ServiceDemoPreview';
import { getDemoContent, BENEFITS } from '../data/serviceDemoContent';
import { getToolsContent } from '../data/serviceToolsContent';
import { emphasizeLastWord } from '../utils/emphasize';
import {
  getServiceBySlug, getServices, getServiceLiveStats,
  isAuthed, isPlatformAuthed, isCandidateAuthed,
  mediaUrl,
} from '../api/client';

// How often to re-poll the live product for fresh numbers while a visitor
// sits on the page. Only runs once a live source has been confirmed working
// for this service — never while it's absent or unreachable.
const LIVE_STATS_POLL_MS = 30000;

const categoryIcons = {
  'HR & Workforce': Users,
  'Staffing': Briefcase,
  'Artificial Intelligence': Bot,
  'Automation': Workflow,
  'Enterprise Tools': LineChart,
  'Knowledge & Communication': BookOpen,
  'Security': ShieldCheck,
  'Global Network': Globe2,
  'Custom Solutions': Wrench,
};

function iconFor(category) {
  return categoryIcons[category] || Layers;
}


const FEATURE_ICONS = [CheckCircle2, Sparkles, Zap, Settings2, BarChart3, Puzzle];
const BENEFIT_ICONS = [Clock, Repeat, Eye, Zap, Database, TrendingUp];

// Which login page to send an unauthenticated visitor to, per access type.
// 'both' goes to a small chooser page that lets the visitor pick
// organization or candidate login themselves (see LoginChoice.jsx).
const LOGIN_PATH = {
  organization: '/portal/login',
  candidate: '/candidate/login',
  admin: '/admin/login',
  both: '/login/choose',
};

// Which "is this person signed in" check applies to a given access type.
function isAuthedFor(accessType) {
  if (accessType === 'candidate') return isCandidateAuthed();
  if (accessType === 'admin') return isAuthed();
  if (accessType === 'public') return true;
  // 'both' accepts either kind of login — organization OR candidate.
  if (accessType === 'both') return isPlatformAuthed() || isCandidateAuthed();
  return isPlatformAuthed(); // 'organization' (default)
}

// Remembers which service the visitor was trying to reach across the login
// redirect, so we can pick the access flow back up automatically once they
// return here authenticated — without looping back to login again.
const PENDING_KEY = 'ardh_pending_service_access';

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [service, setService] = useState(null);
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);
  const [launching, setLaunching] = useState(false);
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    setService(null);
    setError(null);
    setRelated([]);
    setLiveData(null);
    getServiceBySlug(slug)
      .then((s) => {
        setService(s);
        if (s?.category) {
          getServices()
            .then((all) => {
              const list = Array.isArray(all) ? all : all?.services || all?.data || [];
              setRelated(list.filter((r) => r.category === s.category && r.slug !== s.slug).slice(0, 3));
            })
            .catch(() => setRelated([]));
        }
      })
      .catch(() => setError(true));
  }, [slug]);

  // Real numbers, once the actual product is live — falls back to demo
  // content silently (getServiceLiveStats resolves to null) whenever no
  // live source is configured or it can't be reached, so nothing here
  // breaks a service that isn't wired up yet.
  useEffect(() => {
    if (!service?.slug) return undefined;
    let cancelled = false;

    function refresh() {
      getServiceLiveStats(service.slug).then((data) => {
        if (!cancelled) setLiveData(data);
      });
    }

    refresh();
    const interval = setInterval(refresh, LIVE_STATS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [service?.slug]);

  const accessType = service?.accessType || 'organization';
  const authed = service ? isAuthedFor(accessType) : false;

  function launch(target) {
    setLaunching(true);
    if (target.externalUrl) {
      window.open(target.externalUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => setLaunching(false), 900);
    } else {
      // No external/internal platform configured yet — send them to Request
      // a Demo instead of a dead "Launch Platform" link.
      navigate('/request-demo', { state: { service: target.title } });
    }
  }

  // If we sent this visitor to login from this exact service, and they've
  // now come back authenticated, continue the access flow automatically
  // instead of making them click "Access This Service" a second time.
  useEffect(() => {
    if (!service) return;
    const pending = sessionStorage.getItem(PENDING_KEY);
    if (pending === service.slug && isAuthedFor(service.accessType || 'organization')) {
      sessionStorage.removeItem(PENDING_KEY);
      launch(service);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  function handleAccessClick() {
    if (!service || launching) return;
    if (isAuthedFor(accessType)) {
      launch(service);
      return;
    }
    // Preserve the original destination through the login flow.
    sessionStorage.setItem(PENDING_KEY, service.slug);
    const loginPath = LOGIN_PATH[accessType] || LOGIN_PATH.organization;
    navigate(loginPath, { state: { from: { pathname: location.pathname } } });
  }

  const demo = useMemo(() => getDemoContent(service), [service]);
  // Prefer real numbers when we have them; otherwise the usual demo content.
  const previewContent = liveData || demo;
  const isLive = Boolean(liveData);
  const tools = useMemo(() => getToolsContent(service), [service]);

  if (error) {
    return (
      <Layout>
        <section className="section-shell" style={{ paddingTop: 120, paddingBottom: 120 }}>
          <ErrorState message="We couldn't find that solution." />
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Link to="/services" className="text-link">← All solutions</Link>
          </div>
        </section>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  const Icon = iconFor(service.category);
  const hasFeatures = Array.isArray(service.features) && service.features.length > 0;
  const showDemo = service.demoEnabled !== false;

  let ctaLabel = 'Access This Service';
  let CtaIcon = Lock;
  if (launching) {
    ctaLabel = 'Opening platform…';
    CtaIcon = ExternalLink;
  } else if (authed) {
    ctaLabel = 'Launch Platform';
    CtaIcon = ExternalLink;
  }

  return (
    <Layout>
      {/* SECTION A — HERO */}
      <section className="detail-page">
        <div className="section-shell detail-hero">
          <div>
            <Link to="/services" className="text-link" style={{ marginBottom: 22 }}>
              ← All solutions
            </Link>
            {service.category && (
              <span className="detail-kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Icon size={13} /> {service.category}
              </span>
            )}
            <h1>{emphasizeLastWord(service.title)}</h1>
            {service.shortDescription && <p className="detail-intro">{service.shortDescription}</p>}

            <div className="hero-actions" style={{ marginTop: 34 }}>
              <a href="#demo-preview" className="button button-ghost">
                Explore Demo
              </a>
              <button
                type="button"
                onClick={handleAccessClick}
                disabled={launching}
                className="button button-dark"
              >
                {ctaLabel} <CtaIcon size={15} />
              </button>
            </div>
            {!authed && accessType !== 'public' && (
              <p className="hero-note" style={{ marginTop: 22 }}>
                <Lock size={13} /> Sign in required to launch — everything below is open to explore first.
              </p>
            )}
          </div>

          {(service.heroImageUrl || service.imageUrl) ? (
            <div className="detail-visual">
              <img
                src={mediaUrl(service.heroImageUrl || service.imageUrl)}
                alt={service.title || ''}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="detail-orb">
              <span />
              <Icon size={64} />
            </div>
          )}
        </div>
      </section>

      {/* SECTION D — PRODUCT PREVIEW */}
      {showDemo && (
        <section id="demo-preview" className="section-shell" style={{ paddingBottom: 90 }}>
          <Reveal>
            <ServiceDemoPreview content={previewContent} label={service.title} live={isLive} />
          </Reveal>
        </section>
      )}

      {/* SECTION 5 — WHAT THIS SERVICE DOES */}
      <section className="section-shell" style={{ paddingBottom: 90 }}>
        <Reveal>
          <div className="section-kicker">What is it?</div>
          <div className="section-head" style={{ marginBottom: 28 }}>
            <h2>What is {service.title}?</h2>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          {service.description && (
            <p style={{ color: 'var(--muted)', lineHeight: 1.85, fontSize: 16.5, maxWidth: 720 }}>
              {service.description}
            </p>
          )}
        </Reveal>
        {demo.whoFor?.length > 0 && (
          <Reveal delay={0.1}>
            <div style={{ marginTop: 28 }}>
              <div className="small-label" style={{ marginBottom: 14 }}>Who it's for</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {demo.whoFor.map((who) => (
                  <span
                    key={who}
                    style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--plum)',
                      background: 'var(--lav)', borderRadius: 999, padding: '9px 16px',
                    }}
                  >
                    {who}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* SECTION 6 — FEATURES */}
      {hasFeatures && (
        <section className="section-shell" style={{ paddingBottom: 90 }}>
          <Reveal>
            <div className="section-kicker">Included</div>
            <div className="section-head" style={{ marginBottom: 30 }}>
              <h2>What's included</h2>
            </div>
          </Reveal>
          <div className="feature-card-grid">
            {service.features.map((f, i) => {
              const FIcon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <Reveal key={f} delay={i * 0.05}>
                  <div className="feature-card-premium">
                    <span className="feature-card-icon"><FIcon size={18} /></span>
                    <h4>{f}</h4>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 8 — BENEFITS */}
      <section className="section-shell" style={{ paddingBottom: 90 }}>
        <Reveal>
          <div className="section-kicker">Why it matters</div>
          <div className="section-head" style={{ marginBottom: 30 }}>
            <h2>Why businesses use this solution</h2>
          </div>
        </Reveal>
        <div className="benefit-grid">
          {BENEFITS.map((b, i) => {
            const BIcon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
            return (
              <Reveal key={b.title} delay={i * 0.05}>
                <div className="benefit-card">
                  <span className="benefit-card-icon"><BIcon size={18} /></span>
                  <h4>{b.title}</h4>
                  <p>{b.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* SECTION 7 — HOW IT WORKS */}
      {demo.steps?.length > 0 && (
        <section className="section-shell" style={{ paddingBottom: 100 }}>
          <Reveal>
            <div className="section-kicker">How it works</div>
            <div className="section-head" style={{ marginBottom: 10 }}>
              <h2>Getting started</h2>
            </div>
          </Reveal>
          <div className="workflow-list">
            {demo.steps.map((step, i) => (
              <Reveal key={step} delay={i * 0.06}>
                <div className="workflow-step">
                  <span className="workflow-num">{String(i + 1).padStart(2, '0')}</span>
                  <h4>{step}</h4>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* SECTION — SUMMARY (tools/technology behind this solution) */}
      {(tools.techSummary || tools.techStack.length > 0) && (
        <section className="section-shell tech-stack" style={{ paddingTop: 0, paddingBottom: 90 }}>
          <Reveal>
            <div className="section-kicker">Summary</div>
            <div className="section-head" style={{ marginBottom: 22 }}>
              <h2>Summary</h2>
            </div>
          </Reveal>
          {tools.techSummary && (
            <Reveal delay={0.05}>
              <p style={{ color: 'var(--muted)', lineHeight: 1.85, fontSize: 16.5, maxWidth: 760 }}>
                {tools.techSummary}
              </p>
            </Reveal>
          )}
          {tools.techStack.length > 0 && (
            <Reveal delay={0.1}>
              <div className="tech-grid" style={{ marginTop: tools.techSummary ? 28 : 36 }}>
                {tools.techStack.map((t) => (
                  <span key={t} className="tech-chip">{t}</span>
                ))}
              </div>
            </Reveal>
          )}
        </section>
      )}

      {/* RELATED SERVICES */}
      {related.length > 0 && (
        <section className="section-shell" style={{ paddingBottom: 100 }}>
          <Reveal>
            <div className="section-kicker">Keep exploring</div>
            <div className="section-head" style={{ marginBottom: 30 }}>
              <h2>More in {service.category}</h2>
            </div>
          </Reveal>
          <div className="solution-grid-premium" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {related.map((r, i) => {
              const RIcon = iconFor(r.category);
              return (
                <Reveal key={r.slug} delay={i * 0.08}>
                  <TiltCard to={`/services/${r.slug}`} className={`solution-card-premium ${i % 2 === 0 ? 'lavender' : 'cream'}`}>
                    <span className="solution-icon-fallback"><RIcon size={22} /></span>
                    <h3 style={{ marginTop: 16 }}>{r.title}</h3>
                    <p>{r.shortDescription}</p>
                    <span className="card-arrow">
                      Explore <ArrowRight size={14} />
                    </span>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 9 — SERVICE ACCESS CTA */}
      <section className="cta-premium section-shell">
        <Reveal>
          <div className="cta-inner">
            <div className="cta-copy">
              <span className="small-label">Ready when you are</span>
              <h2>
                Ready to use <em>{service.title}</em>?
              </h2>
              <p>Access the platform and start using this solution for your organization.</p>
              <div className="cta-actions">
                <button
                  type="button"
                  onClick={handleAccessClick}
                  disabled={launching}
                  className="button button-dark"
                >
                  {ctaLabel} <CtaIcon size={15} />
                </button>
                <Link to="/request-demo" className="button button-ghost">
                  Request a Demo
                </Link>
                <Link to="/contact" className="text-link">
                  Ask about {service.title}
                </Link>
              </div>
            </div>
            <div className="cta-visual">
              <div className="cta-glow" />
              {service.ctaImageUrl ? (
                <img
                  src={mediaUrl(service.ctaImageUrl)}
                  alt=""
                  className="cta-image"
                  style={{ maxWidth: 280, width: '100%', borderRadius: 18, objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="detail-orb" style={{ width: 220, height: 220 }}>
                  <span />
                  <Icon size={48} />
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </Layout>
  );
}