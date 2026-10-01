import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { candidateLogin, setCandidateSession, candidateMe } from '../api/client';
import Navbar from '../components/Navbar';

export default function CandidateLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/candidate/services';
  const registered = location.state?.registered;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await candidateLogin(email, password);
      setCandidateSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        candidate: data.candidate,
      });
      try {
        const me = await candidateMe();
        if (me) setCandidateSession({ candidate: me });
      } catch {}
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresVerification) {
        navigate('/candidate/verify', { state: { email: data.email || email } });
        return;
      }
      setError(data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper-2 flex items-center justify-center p-4 pt-28">
      <div className="auth-card bg-white rounded-2xl shadow-lg border border-line p-8">
        <div className="text-center mb-8">
          <span className="brand-mark" style={{ margin: '0 auto 14px' }}><span /><span /></span>
          <h1 className="auth-title text-center">Candidate Login</h1>
          <p className="text-muted text-sm mt-1">Ardhnarishwar Global Business Solutions</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {registered && (
            <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg border border-emerald-100">
              Account verified. Sign in with your email and password.
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink hover:bg-teal text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-muted mt-6">No account?</p>
        <div className="flex justify-center mt-2">
          <Link
            to="/candidate/register"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-soft-orange border border-soft-orange rounded-full px-4 py-2 hover:bg-[var(--soft-orange-dark)] transition"
          >
            Register as a candidate
          </Link>
        </div>
        <p className="text-center text-xs text-muted mt-3">
          <Link to="/portal/login" className="hover:underline">Organization / Portal login</Link>
        </p>
      </div>
      </div>
    </>
  );
}