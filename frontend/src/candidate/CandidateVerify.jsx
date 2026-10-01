import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { candidateVerifyOtp, candidateResendOtp } from '../api/client';

export default function CandidateVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.email ? 'We sent a 6-digit OTP to your email/mobile.' : '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await candidateVerifyOtp(email, otp);
      navigate('/candidate/login', { replace: true, state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please check the OTP and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setInfo('');
    setResending(true);
    try {
      await candidateResendOtp(email);
      setInfo('A new OTP has been sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-line p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ink">Verify your account</h1>
          <p className="text-muted text-sm mt-1">Step 2 of 3 — Register → Verify → Login</p>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          {info && (
            <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg border border-emerald-100">
              {info}
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
            <label className="block text-sm font-medium text-ink mb-1">6-digit OTP</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm tracking-[0.5em] text-center font-semibold focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-ink hover:bg-teal text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {loading ? 'Verifying…' : 'Verify & continue'}
          </button>
        </form>
        <button
          onClick={handleResend}
          disabled={resending || !email}
          className="w-full text-center text-sm text-gold hover:underline font-medium mt-4 disabled:opacity-60"
        >
          {resending ? 'Sending…' : "Didn't get the OTP? Resend"}
        </button>
        <p className="text-center text-xs text-muted mt-6">
          <Link to="/candidate/login" className="hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
