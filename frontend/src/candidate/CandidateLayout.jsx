import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, IndianRupee, LogOut, Menu, User } from 'lucide-react';
import { getCandidate, clearCandidateSession, candidateLogout } from '../api/client';

const nav = [
  { to: '/candidate/services', label: 'Explore Services', icon: LayoutGrid },
  { to: '/candidate/pricing', label: 'Pricing', icon: IndianRupee },
  { to: '/candidate/profile', label: 'My Profile', icon: User },
];

export default function CandidateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const candidate = getCandidate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    try { await candidateLogout(); } catch {}
    clearCandidateSession();
    navigate('/candidate/login');
  }

  return (
    <div className="min-h-screen bg-paper flex portal-shell">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-ink text-white transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-5 border-b border-line">
          <Link to="/candidate/services" className="font-semibold tracking-tight text-lg">
            Ardhnarishwar <span className="text-gold">Candidate</span>
          </Link>
        </div>
        <nav className="p-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gold/15 text-gold'
                    : 'text-cream/70 hover:text-gold hover:bg-white/5 hover:pl-5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gold transition-transform duration-200 origin-left ${
                      isActive ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'
                    }`}
                  />
                  <item.icon size={18} className="shrink-0" />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-line flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <button className="lg:hidden p-2 rounded-md hover:bg-paper-2" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-muted text-sm">
            <span>Candidate workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/candidate/profile" className="text-sm text-right hidden sm:block hover:opacity-80">
              <p className="font-medium text-ink">{candidate?.name || 'Candidate'}</p>
              <p className="text-xs text-muted">{candidate?.email}</p>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-paper-2 text-muted"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div key={location.pathname} className="portal-page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}