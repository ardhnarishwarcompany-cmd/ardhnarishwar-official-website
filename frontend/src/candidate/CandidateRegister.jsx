import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { candidateRegister } from '../api/client';

export default function CandidateRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await candidateRegister(form);
      // Step 1 (Register) is done. Step 2 (Verify) happens next.
      navigate('/candidate/verify', { replace: true, state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center p-4">
      <div className="auth-card bg-white rounded-2xl shadow-lg border border-line p-8">
        <div className="text-center mb-8">
          <span className="brand-mark" style={{ margin: '0 auto 14px' }}><span /><span /></span>
          <h1 className="auth-title text-center">Create your account</h1>
          <p className="text-muted text-sm mt-1">Register as a candidate to explore our services</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Full name</label>
            <input required value={form.name} onChange={update('name')}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input type="email" required value={form.email} onChange={update('email')}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Mobile number <span className="text-muted font-normal">(optional)</span></label>
            <input value={form.phone} onChange={update('phone')}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={update('password')}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold" />
            <p className="text-xs text-muted mt-1">At least 8 characters.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink hover:bg-teal text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/candidate/login" className="text-gold hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
