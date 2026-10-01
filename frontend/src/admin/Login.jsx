import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { adminLogin, setToken, platformLogin, setSuperAdminSession } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/admin';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await adminLogin(email, password);
      setToken(token);

      // Best-effort: if this CMS admin account is also a promoted platform
      // Super Admin, sign it into the Super Admin session too — same
      // credentials, one login screen — so Organizations, Roles, Modules,
      // Subscriptions and Audit Log work immediately. This is stored under
      // its own ardh_superadmin_* keys, completely separate from the
      // Client Portal session (ardh_platform_*). It deliberately does NOT
      // call setPlatformSession — logging into the admin panel must never
      // make the public website think a visitor is a logged-in client.
      // If this account isn't a platform user, or isn't a super admin, this
      // just fails/no-ops silently and the 5 Super Admin sections show
      // their own "not set up" message.
      try {
        const platformData = await platformLogin(email, password);
        if (platformData?.user?.isSuperAdmin) {
          setSuperAdminSession({
            accessToken: platformData.accessToken,
            refreshToken: platformData.refreshToken,
            user: platformData.user,
          });
        }
      } catch (_) {
        // Not a platform user at all — nothing to do.
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="brand-mark" style={{ position: 'relative', width: 28, height: 28, display: 'inline-block' }}>
            <span style={{ position: 'absolute', top: 4, left: 0, width: 18, height: 18, border: '1.5px solid #af93d9', borderRadius: '50%', background: 'rgba(175,147,217,0.35)' }} />
            <span style={{ position: 'absolute', top: 8, right: 0, width: 18, height: 18, border: '1.5px solid #c99b61', borderRadius: '50%', background: 'rgba(201,155,97,0.18)' }} />
          </span>
          Ardhnarishwar Admin
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          {error && <div className="admin-error">{error}</div>}

          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ardhnarishwar.com"
            autoComplete="username"
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <button className="admin-btn admin-btn-gold" type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#786c87' }}>
          <Link to="/" style={{ color: '#c99b61', fontWeight: 600 }}>← Back to website</Link>
        </p>
      </div>
    </div>
  );
}