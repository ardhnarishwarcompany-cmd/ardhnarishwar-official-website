import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquarePlus, Bell, LogOut, Menu, Search, UserCog, Rocket, LayoutGrid, IndianRupee, User
} from 'lucide-react';
import {
  getPlatformUser, clearPlatformSession, platformLogout,
  listNotifications, markNotificationRead, markAllNotificationsRead
} from '../api/client';

const nav = [
  { to: '/portal/inquiry', label: 'Inquiry', icon: MessageSquarePlus, end: true },
  { to: '/portal/services', label: 'Explore Services', icon: LayoutGrid },
  { to: '/portal/pricing', label: 'Pricing', icon: IndianRupee },
  { to: '/portal/workspace', label: 'Workspace', icon: Rocket },
  { to: '/portal/team', label: 'Team', icon: UserCog },
  { to: '/portal/profile', label: 'My Profile', icon: User },
];

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getPlatformUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const unread = notifs.filter((n) => !n.isRead).length;

  useEffect(() => {
    listNotifications().then(setNotifs).catch(() => {});
    const t = setInterval(() => {
      listNotifications().then(setNotifs).catch(() => {});
    }, 60000);
    return () => clearInterval(t);
  }, []);

  async function handleLogout() {
    try { await platformLogout(); } catch {}
    clearPlatformSession();
    navigate('/portal/login');
  }

  async function handleMarkRead(id) {
    await markNotificationRead(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="min-h-screen bg-paper flex portal-shell">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-ink text-white transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-5 border-b border-line">
          <Link to="/portal/inquiry" className="font-semibold tracking-tight text-lg">
            Ardhnarishwar <span className="text-gold">Portal</span>
          </Link>
        </div>
        <nav className="p-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
            <Search size={16} />
            <span>Client workspace</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-paper-2"
                onClick={() => setBellOpen((v) => !v)}
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-line z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="font-medium text-sm">Notifications</span>
                    {unread > 0 && (
                      <button className="text-xs text-gold hover:underline" onClick={handleMarkAll}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <p className="text-sm text-muted p-4 text-center">No notifications</p>
                    ) : (
                      notifs.slice(0, 20).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`w-full text-left px-4 py-3 border-b border-line hover:bg-paper ${!n.isRead ? 'bg-cream/50' : ''}`}
                        >
                          <p className="text-sm font-medium text-ink">{n.title}</p>
                          {n.message && <p className="text-xs text-muted mt-0.5">{n.message}</p>}
                          <p className="text-[10px] text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link to="/portal/profile" className="text-sm text-right hidden sm:block hover:opacity-80">
              <p className="font-medium text-ink">{user?.name || 'User'}</p>
              <p className="text-xs text-muted">{user?.email}</p>
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