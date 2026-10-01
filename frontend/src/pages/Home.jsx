import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Mail,
  MapPin,
  Layers,
  Bot,
  ShieldCheck,
  Wrench,
  Headphones,
  Rocket,
  ExternalLink,
  Briefcase,
  Building2,
  Users,
  Workflow,
} from 'lucide-react';

import Layout from '../components/Layout';
import Reveal from '../components/home/Reveal';
import FloatingVisual from '../components/home/FloatingVisual';
import GatewayFlowBackground from '../components/home/GatewayFlowBackground';
import TiltCard from '../components/home/TiltCard';
import CinematicScrollStory from '../components/home/CinematicScrollStory';
import ArdhnarishwarScrollStory from '../components/home/ArdhnarishwarScrollStory';
import TextAnimation from '../components/ui/text-animation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getServices, getBlogPosts, submitContactForm, getTestimonials } from '../api/client';

// 3D renders (replacing the earlier flat SVG placeholders)
import humanSculpture from '../assets/photos/human.png';
import platformEco from '../assets/photos/hrms.png';
import analyticsGrowth from '../assets/photos/why-us.png';
import workflowTimeline from '../assets/photos/doll.png';
import securityTrust from '../assets/photos/soulsphere.png';
import insightsDoc from '../assets/photos/book.png';
import ctaOrb from '../assets/photos/soulsphere.png';

// Hero video (replaces the hero orb SVG — hero section only)
import heroVideo from '../assets/video/hero-loop.mp4';
import heroPoster from '../assets/video/hero-poster.jpg';

// Service icon set
import iconHrWorkforce from '../assets/icons/01_HR_Workforce_Management.png';
import iconSmartAttendance from '../assets/icons/02_Smart_Attendance.png';
import iconAiRecruitment from '../assets/icons/03_AI_Recruitment.png';
import iconJobPortal from '../assets/icons/04_Job_Portal.png';
import iconAiAssistants from '../assets/icons/05_AI_Assistants.png';
import iconRoboticsAutomation from '../assets/icons/06_Robotics_Automation.png';
import iconCrmSupport from '../assets/icons/07_CRM_Customer_Support.png';
import iconProjectManagement from '../assets/icons/08_Project_Management.png';
import iconAnalyticsBi from '../assets/icons/09_Analytics_Business_Intelligence.png';
import iconPersonalAi from '../assets/icons/11_Personal_AI.png';
import iconAiAnswerSystem from '../assets/icons/12_AI_Answer_System.png';
import { iconFor } from '../data/serviceCategoryIcons';

const solutionIcons = [iconHrWorkforce, iconJobPortal, iconAiRecruitment, iconRoboticsAutomation];

// Services with a purpose-made icon image in the existing icon set get that
// image — one dedicated icon per service, never shared between two
// services. Anything not listed here (including any service added later
// through the admin panel) falls back to its category's icon — the same
// icon shown in that service's own hero on ServiceDetail.jsx — so it still
// gets a distinct, meaningful icon rather than one generic placeholder.
const iconBySlug = {
  'hrms-workforce-management': iconHrWorkforce,
  'smart-attendance-system': iconSmartAttendance,
  'job-portal': iconJobPortal,
  'ai-recruitment-cloud': iconAiRecruitment,
  'ai-agents-network': iconAiAssistants,
  'ai-robotics-automation': iconRoboticsAutomation,
  'crm-sales-cloud': iconCrmSupport,
  'project-operations-management': iconProjectManagement,
  'advanced-business-analytics': iconAnalyticsBi,
  'personal-ai-assistant': iconPersonalAi,
  'ai-answer-system': iconAiAnswerSystem,
};

// Returns { img } for services with a dedicated icon image, or { Icon } for
// services that should fall back to their category's lucide icon.
function iconForService(service) {
  const img = iconBySlug[service.slug];
  if (img) return { img };
  return { Icon: iconFor(service.category) };
}



const fallbackSolutions = [
  {
    number: '01',
    slug: 'hrms-attendance',
    title: 'HRMS & Attendance',
    description: 'Staffing, recruitment, attendance, payroll inputs, performance and employee operations in one connected system.',
    tone: 'lavender',
    icon: Building2,
  },
  {
    number: '02',
    slug: 'staffing-job-portal',
    title: 'Staffing & Job Portal',
    description: 'Help people find the right opportunities and help businesses build the teams that move them forward.',
    tone: 'cream',
    icon: Briefcase,
  },
  {
    number: '03',
    slug: 'ai-recruitment',
    title: 'AI Recruitment',
    description: 'Screening, document processing and repeatable hiring workflows handled by AI, with human judgment kept in the loop.',
    tone: 'lavender',
    icon: Users,
  },
  {
    number: '04',
    slug: 'automation-crm',
    title: 'Automation & CRM',
    description: 'Enterprise automation that connects business answers, approvals and customer workflows without the friction.',
    tone: 'cream',
    icon: Workflow,
  },
];

const whyChoose = [
  { icon: Layers, title: 'Complete HR & business ecosystem', text: 'HRMS, staffing, attendance, recruitment and enterprise tools in one connected platform.' },
  { icon: Bot, title: 'AI, robotics & automation', text: 'AI agents and RPA handle the repeatable work across every department.' },
  { icon: ShieldCheck, title: 'Global compliance & security', text: 'Zero-trust architecture and continuous compliance monitoring, built in.' },
  { icon: Wrench, title: 'Custom solutions for every business', text: 'Custom HRMS, integrations and managed services when off-the-shelf isn’t enough.' },
  { icon: Headphones, title: '24/7 support & dedicated team', text: 'A team behind every deployment, not just a dashboard.' },
  { icon: Rocket, title: 'Future-ready technology', text: 'Built to expand with your business as you scale into new markets.' },
];

const processSteps = [
  { num: '01', title: 'Discover', text: 'We map your current workflows, pain points and goals across people, process and technology.' },
  { num: '02', title: 'Configure', text: 'Modules, policies and integrations are tailored to the way your organisation actually works.' },
  { num: '03', title: 'Connect', text: 'Systems, teams and data streams are linked into one intelligent operating layer.' },
  { num: '04', title: 'Automate', text: 'Repeatable work is handed to AI and RPA so people can focus on judgment and relationships.' },
  { num: '05', title: 'Grow', text: 'Dashboards, insights and continuous improvement keep the platform evolving with you.' },
];

const trustPoints = [
  { title: 'Human-centered by design', text: 'Every feature starts from a real person doing real work.' },
  { title: 'Connected, not fragmented', text: 'One ecosystem instead of a patchwork of tools.' },
  { title: 'Intelligent automation', text: 'AI assists; humans decide.' },
  { title: 'Built for scale', text: 'Infrastructure that grows with your organisation.' },
];

export default function Home() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [services, setServices] = useState([]);
  const [posts, setPosts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeModule, setActiveModule] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', interestedIn: '', message: '' });

  useEffect(() => {
    getServices()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.services || data?.data || [];
        setServices(list);
      })
      .catch(() => setServices([]));
    getBlogPosts()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.posts || data?.data || [];
        setPosts(list.slice(0, 3));
      })
      .catch(() => setPosts([]));
    getTestimonials()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.testimonials || data?.data || [];
        setTestimonials(list.slice(0, 3));
      })
      .catch(() => setTestimonials([]));
  }, []);

  const heroVisualRef = useRef(null);

  useEffect(() => {
    const el = heroVisualRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: 50,
        scale: 0.97,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-premium',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const location = useLocation();
  useEffect(() => {
    if (location.hash === '#platforms') {
      setTimeout(() => {
        document.getElementById('platforms')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location.hash]);

  
  
  // "Live products" cards on the homepage — any service the admin has given
  // an External platform URL to shows up here automatically. No longer
  // limited to a fixed list; add/edit a service's URL in
  // Admin → Solutions → Edit and it appears here on next load.
  const platforms = services
    .filter((s) => s.externalUrl)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((s) => ({
      key: s.slug || s._id,
      ...iconForService(s),
      title: s.title || s.name,
      description: s.shortDescription || s.description || '',
      url: s.externalUrl,
    }));


  const modules = [
    { title: 'Recruitment', desc: 'Sourcing, screening and hiring workflows connected to your HRMS.' },
    { title: 'Workforce', desc: 'Attendance, shifts, leave and real-time workforce visibility.' },
    { title: 'Automation', desc: 'RPA and AI agents that remove repetitive administrative work.' },
    { title: 'Analytics', desc: 'People and process intelligence that surfaces what matters.' },
    { title: 'Employee Experience', desc: 'Self-service, engagement and support in one place.' },
    { title: 'Reporting', desc: 'Clear, actionable reports across every connected module.' },
  ];

  const solutions =
    services.length > 0
      ? services.slice(0, 4).map((s, i) => ({
          number: String(i + 1).padStart(2, '0'),
          slug: s.slug || s._id,
          title: s.title || s.name,
          description: s.shortDescription || s.description || s.summary || '',
          tone: i % 2 === 0 ? 'lavender' : 'cream',
          icon: [Building2, Briefcase, Users, Workflow][i % 4],
        }))
      : fallbackSolutions;

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];
  const visibleInsights = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitContactForm(form);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <Layout>
      <main id="top">
        {/* ========== SECTION 1 — HERO ========== */}
        <section className="hero-premium">
          <div className="hero-gateway-flow" aria-hidden="true">
            <GatewayFlowBackground />
          </div>
          <div className="section-shell">
          <div className="hero-premium-inner">
            <div className="hero-copy">
              <div className="hero-eyebrow">
                <span className="eyebrow-dot" />
                Technology + Human Intelligence
              </div>
              <h1 className="hero-heading">
                <TextAnimation>Where people-work</TextAnimation>
                <br />
                <span>
                  <TextAnimation as="em" delay={0.3}>meets</TextAnimation>
                  <TextAnimation delay={0.38}>machine-work.</TextAnimation>
                </span>
              </h1>
              <p className="hero-lede">
                Ardhnarishwar brings HR, staffing, attendance and recruitment together with AI and
                automation — so people-work and machine-work run as one connected system.
              </p>
              <div className="hero-actions">
                <Link to="/services" className="button button-dark">
                  Explore solutions <ArrowRight size={16} />
                </Link>
                <Link to="/why-ardhnarishwar" className="text-link">
                  Why Ardhnarishwar <ArrowRight size={15} />
                </Link>
              </div>
              <div className="hero-note">
                <span className="mini-orbit">
                  <i />
                  <i />
                  <i />
                </span>
                <span>One platform. Multiple intelligent business solutions.</span>
              </div>
            </div>

            <div className="hero-visual-wrap" ref={heroVisualRef}>
              <div className="hero-orb-glow" />
              <div className="hero-alignment-lines" aria-hidden="true" />
              <FloatingVisual
                video={heroVideo}
                poster={heroPoster}
                withSound
                alt="Ardhnarishwar — technology and human intelligence working at a normal pace"
                className="hero-orb floating-card"
                float
                parallax
              />
            </div>
          </div>
          </div>
        </section>

        {/* ========== CINEMATIC SCROLL STORY ========== */}
        <ArdhnarishwarScrollStory />
        <CinematicScrollStory />

        {/* ========== SECTION 2 — HUMAN-CENTERED ========== */}
        <section className="human-section section-shell">
          <Reveal>
            <div className="human-card">
              <div className="human-copy">
                <span className="small-label">Human-centered</span>
                <h2>
                  Technology should make
                  <br />
                  the work feel <em>more human</em>.
                </h2>
                <p>
                  Businesses run on people first. Every module starts from a real workflow a
                  recruiter, manager or employee already has — then removes the friction around it.
                </p>
                <p>
                  The result is software that supports judgment, relationships and growth instead of
                  adding another layer of complexity.
                </p>
                <Link to="/about" className="text-link">
                  Our philosophy <ArrowRight size={15} />
                </Link>
              </div>
              <div className="human-visual">
                <FloatingVisual
                  src={humanSculpture}
                  alt="Human-centered design — a person shaping technology with intention"
                  className="floating-card"
                  float
                  parallax
                />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ========== SECTION 3 — SOLUTIONS ========== */}
        <section className="solutions-premium section-shell" id="solutions">
          <Reveal>
            <div className="section-head">
              <div>
                <div className="section-kicker">Solutions</div>
                <h2>
                  Everything your
                  <br />
                  <em>workforce</em> needs.
                </h2>
              </div>
              <p>
                Connected modules covering the full workforce lifecycle — from attendance to
                AI-assisted hiring to enterprise automation.
              </p>
            </div>
          </Reveal>

          <div className="solution-grid-premium">
            {solutions.map((s, i) => {
              return (
                <Reveal key={s.slug} delay={i * 0.08}>
                  <TiltCard to={`/services/${s.slug}`} className={`solution-card-premium ${s.tone}`}>
                    <div className="solution-visual">
                      <FloatingVisual
                        src={solutionIcons[i % solutionIcons.length]}
                        alt=""
                        float
                      />
                    </div>
                    <span className="solution-number">{s.number}</span>
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                    <span className="card-arrow">
                      <ArrowRight size={14} />
                    </span>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <div className="section-cta-center">
              <Link to="/services" className="button button-dark">
                View all solutions <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ========== SECTION 4 — PLATFORM ECOSYSTEM ========== */}
        <section className="ecosystem-section section-shell" id="platforms">
          <Reveal>
            <div className="section-head">
              <div>
                <div className="section-kicker">Platform ecosystem</div>
                <h2>
                  One intelligent core.
                  <br />
                  <em>Many connected modules.</em>
                </h2>
              </div>
              <p>
                Ardhnarishwar connects recruitment, workforce, automation, analytics and employee
                experience into a single operating system for business.
              </p>
            </div>
          </Reveal>

          <div className="ecosystem-layout">
            <Reveal className="ecosystem-visual">
              <FloatingVisual
                src={platformEco}
                alt="Central intelligent platform connecting HR modules and documents"
                className="floating-card"
                float
                rotate
              />
            </Reveal>

            <div className="ecosystem-modules">
              {modules.map((m, i) => (
                <Reveal key={m.title} delay={i * 0.06}>
                  <button
                    type="button"
                    className={`module-chip ${activeModule === i ? 'is-active' : ''}`}
                    onClick={() => setActiveModule(i)}
                    onMouseEnter={() => setActiveModule(i)}
                  >
                    <span className="module-dot" />
                    <div>
                      <strong>{m.title}</strong>
                      <span>{m.desc}</span>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Live product cards — one per published service with an External platform URL set */}
          {platforms.length > 0 && (
            <Reveal>
              <div className="live-platforms">
                <h3 className="live-heading">Live products</h3>
                <div className="live-grid">
                  {platforms.map((p) => (
                    <div key={p.key} className="live-card">
                      <div className="live-icon">
                        {p.img ? <img src={p.img} alt="" /> : <p.Icon size={20} />}
                      </div>
                      <h4>{p.title}</h4>
                      <p>{p.description}</p>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-link">
                        Launch <ExternalLink size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </section>

        {/* ========== SECTION 5 — WHY US ========== */}
        <section className="why-premium section-shell">
          <div className="why-premium-grid">
            <div className="why-premium-copy">
              <Reveal>
                <span className="small-label">Why Ardhnarishwar</span>
                <h2>
                  Built differently.
                  <br />
                  <em>For people first.</em>
                </h2>
                <p className="why-intro">
                  Most platforms optimise for the system. We optimise for the people who use it —
                  then connect every workflow so the system works as hard as they do.
                </p>
              </Reveal>

              <div className="why-list">
                {whyChoose.map(({ icon: Icon, title, text }, i) => (
                  <Reveal key={title} delay={i * 0.05}>
                    <div className="why-row">
                      <span className="why-icon">
                        <Icon size={17} />
                      </span>
                      <div>
                        <h4>{title}</h4>
                        <p>{text}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <Link to="/why-ardhnarishwar" className="text-link" style={{ marginTop: 28, display: 'inline-flex' }}>
                  See the full comparison <ArrowRight size={15} />
                </Link>
              </Reveal>
            </div>

            <Reveal className="why-visual">
              <FloatingVisual
                src={analyticsGrowth}
                alt="Focused, effortless productivity across email, video, scheduling and ratings"
                className="floating-card"
                float
                rotate
              />
            </Reveal>
          </div>
        </section>

        {/* ========== SECTION 6 — HOW IT WORKS ========== */}
        <section className="how-section section-shell">
          <Reveal>
            <div className="section-head">
              <div>
                <div className="section-kicker">How it works</div>
                <h2>
                  From discovery
                  <br />
                  to <em>continuous growth</em>.
                </h2>
              </div>
              <p>A clear, human process that respects the complexity of real organisations.</p>
            </div>
          </Reveal>

          <div className="how-visual-wrap">
            <FloatingVisual
              src={workflowTimeline}
              alt="Teams collaborating through a connected, step-by-step workflow"
              className="how-timeline-visual floating-card"
              float
            />
          </div>

          <div className="timeline-track">
            <div className="timeline-progress" />
            <div className="timeline-steps">
              {processSteps.map((step, i) => (
                <div key={step.num} className="timeline-step">
                  <span className="step-num">{step.num}</span>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SECTION 7 — TRUST ========== */}
        <section className="trust-section section-shell">
          <div className="trust-layout">
            <Reveal className="trust-visual">
              <FloatingVisual
                src={securityTrust}
                alt="A protected, intelligent core — trust and reliability at the center"
                className="floating-card"
                float
                rotate
              />
            </Reveal>
            <div className="trust-copy">
              <Reveal>
                <span className="small-label">Trust & reliability</span>
                <h2>
                  Professional.
                  <br />
                  <em>Human-centered.</em>
                  <br />
                  Built to last.
                </h2>
                <p>
                  Reliability is not a feature — it is the foundation. We design for clarity,
                  continuity and the quiet confidence that comes from systems that simply work.
                </p>
              </Reveal>
              <div className="trust-points">
                {trustPoints.map((t, i) => (
                  <Reveal key={t.title} delay={i * 0.07}>
                    <div className="trust-point">
                      <Check size={16} className="trust-check" />
                      <div>
                        <strong>{t.title}</strong>
                        <span>{t.text}</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 8 — INSIGHTS ========== */}
        <section className="insights-premium section-shell">
          <Reveal>
            <div className="section-head">
              <div>
                <div className="section-kicker">Insights</div>
                <h2>
                  Ideas that move
                  <br />
                  <em>people and process</em>.
                </h2>
              </div>
              <p>Practical thinking on HR technology, automation and the future of work.</p>
            </div>
          </Reveal>

          {posts.length > 0 ? (
            <>
              {categories.length > 1 && (
                <div className="insight-cats">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`cat-btn ${activeCategory === c ? 'is-active' : ''}`}
                      onClick={() => setActiveCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div className="insight-grid">
                {visibleInsights.map((post, i) => (
                  <Reveal key={post._id || post.slug || i} delay={i * 0.08}>
                    <TiltCard to={`/blog/${post.slug || post._id}`} className="insight-card">
                      <div className="insight-visual">
                        <FloatingVisual src={insightsDoc} alt="" float />
                      </div>
                      {post.category && <span className="insight-cat">{post.category}</span>}
                      <h3>{post.title}</h3>
                      {post.excerpt || post.summary ? (
                        <p>{(post.excerpt || post.summary).slice(0, 110)}…</p>
                      ) : null}
                      <span className="card-arrow">
                        Read <ArrowRight size={13} />
                      </span>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <Reveal>
              <div className="insight-placeholder">
                <FloatingVisual
                  src={insightsDoc}
                  alt="An open book of ideas and resources"
                  className="floating-card"
                  style={{ maxWidth: 220, margin: '0 auto' }}
                  float
                />
                <p>Insights and resources will appear here.</p>
                <Link to="/blog" className="text-link">
                  Visit the blog <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>
          )}
        </section>

        {/* ========== SECTION 9 — FINAL CTA ========== */}
        <section className="cta-premium section-shell">
          <div className="cta-inner">
            <Reveal>
              <div className="cta-copy">
                <h2>
                  Build a more
                  <br />
                  <em>connected</em> way to work.
                </h2>
                <p>
                  Whether you are starting with one module or connecting an entire enterprise, we
                  are ready to help you move forward.
                </p>
                <div className="cta-actions">
                  <Link to="/request-demo" className="button button-dark">
                    Request a demo <ArrowRight size={16} />
                  </Link>
                  <Link to="/contact" className="button button-ghost">
                    Talk to us
                  </Link>
                </div>
              </div>
            </Reveal>
            <div className="cta-visual">
              <div className="cta-glow" />
              <FloatingVisual
                src={ctaOrb}
                alt="A glowing, intelligent sphere — the connected system ahead"
                className="floating-card"
                float
                rotate
              />
            </div>
          </div>
        </section>

        {/* Contact strip (kept from original, refined) */}
        <section className="contact-strip section-shell">
          <Reveal>
            <div className="contact-strip-inner">
              <div>
                <span className="small-label">Get in touch</span>
                <h2>Ready when you are.</h2>
                <p className="contact-lede">
                  Tell us about your organisation and the outcomes you care about. We will respond
                  with a clear next step.
                </p>
                <div className="contact-meta">
                  <span>
                    <Mail size={15} /> hello@ardhnarishwar.com
                  </span>
                  <span>
                    <MapPin size={15} /> Global · Remote-first
                  </span>
                </div>
              </div>

              {!sent ? (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <input
                      name="name"
                      placeholder="Name"
                      required
                      value={form.name}
                      onChange={onChange}
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Work email"
                      required
                      value={form.email}
                      onChange={onChange}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      name="company"
                      placeholder="Company"
                      value={form.company}
                      onChange={onChange}
                    />
                    <input
                      name="phone"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={onChange}
                    />
                  </div>
                  <textarea
                    name="message"
                    placeholder="What are you looking to improve?"
                    rows={3}
                    value={form.message}
                    onChange={onChange}
                  />
                  <button type="submit" className="button button-dark" disabled={sending}>
                    {sending ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              ) : (
                <div className="success-state">
                  <div className="success-icon">
                    <Check size={22} />
                  </div>
                  <h3>Message received.</h3>
                  <p>We will be in touch shortly.</p>
                </div>
              )}
            </div>
          </Reveal>
        </section>
      </main>
    </Layout>
  );
}