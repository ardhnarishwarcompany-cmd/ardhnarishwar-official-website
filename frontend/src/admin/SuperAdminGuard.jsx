import AdminLayout from './AdminLayout';
import { getSuperAdminUser, isSuperAdminAuthed } from '../api/client';

// Wraps the 5 platform Super Admin pages (Organizations, Roles, Modules,
// Subscriptions, Audit Log). These ride on their own Super Admin session
// (ardh_superadmin_* keys), set automatically when a CMS admin
// (/admin/login) logs in and that same account is a promoted platform
// Super Admin — see admin/Login.jsx. This is intentionally a SEPARATE
// session from the Client Portal (ardh_platform_*): it only ever gets set
// when isSuperAdmin is true, and it's never used to gate the public
// website's own login screens. If this account hasn't been promoted with
// `npm run seed:superadmin` yet (see backend/src/seedSuperAdmin.js), show a
// clear message instead of letting the page crash on 401/403s.
export default function SuperAdminGuard({ children }) {
  const superAdminUser = getSuperAdminUser();
  const ok = isSuperAdminAuthed() && superAdminUser?.isSuperAdmin;

  if (!ok) {
    return (
      <AdminLayout>
        <div className="admin-card" style={{ padding: 24, maxWidth: 640 }}>
          <h1 className="admin-page-title" style={{ marginTop: 0 }}>Super Admin access not set up yet</h1>
          <p className="admin-muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
            This account needs to be promoted to a platform Super Admin. On the server, run:
          </p>
          <pre style={{ background: 'rgba(0,0,0,0.05)', padding: '10px 14px', borderRadius: 6, fontSize: 13, overflowX: 'auto' }}>
            cd backend{'\n'}npm run seed:superadmin
          </pre>
          <p className="admin-muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
            Then log out and log back in at <code>/admin/login</code> with the same email and
            password you already use — no new credentials or extra login step needed.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return children;
}