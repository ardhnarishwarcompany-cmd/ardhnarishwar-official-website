import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Briefcase, ChevronDown, Menu, ShieldCheck, User, UserPlus, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import TubelightNav from './ui/tubelight-navbar';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Solutions' },
  { to: '/why-ardhnarishwar', label: 'Why Us' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Team' },
  { to: '/blog', label: 'Insights' },
  { to: '/faq', label: 'FAQ' },
  { to: '/pricing', label: 'Pricing' },
];

// Login/register/verify pages aren't in navItems, so none of them would
// ever glow — this makes those routes light up "Home" instead of showing
// a plain, glow-less nav.
const HOME_HIGHLIGHT_PREFIXES = [
  '/portal/login',
  '/portal/register',
  '/portal/verify',
  '/candidate/login',
  '/candidate/register',
  '/candidate/verify',
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();
  const loginRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
      const cinematicEl = document.getElementById('cinematic-story');
      if (cinematicEl) {
        const rect = cinematicEl.getBoundingClientRect();
        const inSection = rect.top <= 76 && rect.bottom >= 76;
        setIsCinematic(inSection);
      } else {
        setIsCinematic(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  useEffect(() => { setOpen(false); setLoginOpen(false); }, [location.pathname]);

  const forceHomeActive = HOME_HIGHLIGHT_PREFIXES.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    function onClickOutside(e) {
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${isCinematic ? 'is-cinematic' : ''}`}>
        <Link to="/" className="brand" aria-label="Ardhnarishwar home">
          <span className="brand-mark"><span /><span /></span>
          <span>Ardhnarishwar</span>
        </Link>
        <TubelightNav items={navItems} activeOverride={forceHomeActive ? '/' : undefined} />
        <div className="flex items-center gap-2 shrink-0">
          <div className="nav-login hidden md:block" ref={loginRef}>
            <button
              type="button"
              className={`nav-login-btn ${loginOpen ? 'is-open' : ''}`}
              onClick={() => setLoginOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={loginOpen}
            >
              Login <ChevronDown size={14} />
            </button>
            {loginOpen && (
              <div className="nav-login-menu" role="menu">
                <Link to="/portal/login" role="menuitem" onClick={() => setLoginOpen(false)}>
                  <Briefcase size={16} /> Login as Client
                </Link>
                <Link to="/candidate/login" role="menuitem" onClick={() => setLoginOpen(false)}>
                  <User size={16} /> Login as Candidate
                </Link>
                <Link to="/admin/login" role="menuitem" onClick={() => setLoginOpen(false)}>
                  <ShieldCheck size={16} /> Login as Admin
                </Link>
                <div className="nav-login-divider" />
                <Link to="/portal/register" role="menuitem" className="nav-login-register" onClick={() => setLoginOpen(false)}>
                  <UserPlus size={16} /> New here? Register
                </Link>
              </div>
            )}
          </div>
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link to="/request-demo" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium border border-line rounded-full px-3 py-1.5 hover:bg-paper">
            Request Demo
          </Link>
          <Link to="/portal/register" className="nav-cta">
            Start trial <ArrowUpRight size={15} />
          </Link>
        </div>
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close' : 'Open'}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>
      {open && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)}>{item.label}</NavLink>
          ))}
          <Link to="/request-demo" onClick={() => setOpen(false)}>Request Demo</Link>
          <Link to="/portal/login" onClick={() => setOpen(false)}>Login as Client</Link>
          <Link to="/candidate/login" onClick={() => setOpen(false)}>Login as Candidate</Link>
          <Link to="/admin/login" onClick={() => setOpen(false)}>Login as Admin</Link>
          <Link
            to="/portal/register"
            onClick={() => setOpen(false)}
            style={{ background: 'var(--soft-orange)', color: '#fff', borderRadius: 10, padding: '10px 14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            New here? Register <ArrowUpRight size={15} />
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
}