import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearToken, clearSuperAdminSession, getMe } from '../api/client';
import ThemeToggle from '../components/ThemeToggle';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/crm', label: 'CRM' },
  { to: '/admin/crm/leads', label: 'Leads' },
  { to: '/admin/crm/pipeline', label: 'Pipeline' },
  { to: '/admin/crm/opportunities', label: 'Opportunities' },
  { to: '/admin/crm/contacts', label: 'Contacts' },
  { to: '/admin/crm/companies', label: 'Companies' },
  { to: '/admin/crm/tasks', label: 'Tasks' },
  { to: '/admin/crm/tickets', label: 'Tickets' },
  { to: '/admin/crm/reports', label: 'CRM Reports' },
  { to: '/admin/services', label: 'Solutions' },
  { to: '/admin/blog', label: 'Insights' },
  { to: '/admin/team', label: 'Team' },
  { to: '/admin/careers', label: 'Careers' },
  { to: '/admin/faqs', label: 'FAQs' },
  { to: '/admin/industries', label: 'Industries' },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/media', label: 'Media Library' },
  { to: '/admin/submissions', label: 'Submissions' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/organizations', label: 'Organizations' },
  { to: '/admin/roles', label: 'Roles & Permissions' },
  { to: '/admin/subscriptions', label: 'Subscriptions' },
  { to: '/admin/audit-log', label: 'Audit Log' },
];

export default function AdminLayout({ children }) {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then(setAdmin)
      .catch(() => {
        clearToken();
        navigate('/admin/login', { replace: true });
      });
  }, [navigate]);

  function handleLogout() {
    // Admin login may also start a separate Super Admin session (for the 5
    // platform sections) — clear that too, but never the Client Portal
    // session (ardh_platform_*), which belongs to public website visitors
    // and has nothing to do with this admin account.
    clearToken();
    clearSuperAdminSession();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-sidebar-brand">
          <span className="brand-mark"><span /><span /></span>
          <span>Ardhnarishwar</span>
        </Link>
        <div style={{ padding: "8px 16px 4px", display: "flex", justifyContent: "flex-end" }}>
          <ThemeToggle size={16} />
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {admin && <p className="admin-name">{admin.name || admin.email}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <Link to="/">View site</Link>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}