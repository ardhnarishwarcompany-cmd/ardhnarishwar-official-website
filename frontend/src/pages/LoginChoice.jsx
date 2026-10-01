import { Link, useLocation } from 'react-router-dom';
import { Building2, UserRound, ArrowRight } from 'lucide-react';

// Shown when a visitor clicks "Access This Service" on a service whose
// accessType is 'both' — i.e. it can be unlocked by EITHER an organization
// (client portal) login or a candidate (job-seeker) login. This page just
// asks which one they want, then hands off to the existing login pages,
// forwarding the same `from`/`highlightSlug` state so the post-login
// redirect back to the service still works exactly as before.
export default function LoginChoice() {
  const location = useLocation();
  const forwardState = location.state;

  return (
    <div className="min-h-screen bg-paper-2 flex items-center justify-center p-4">
      <div className="auth-card bg-white rounded-2xl shadow-lg border border-line p-8" style={{ maxWidth: 460 }}>
        <div className="text-center mb-8">
          <span className="brand-mark" style={{ margin: '0 auto 14px' }}><span /><span /></span>
          <h1 className="auth-title text-center">Sign in to continue</h1>
          <p className="text-muted text-sm mt-1">
            This service is available through either portal — choose how you'd like to sign in.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/portal/login"
            state={forwardState}
            className="flex items-center justify-between gap-3 w-full border border-line rounded-lg px-4 py-3.5 hover:border-gold hover:bg-cream transition group"
          >
            <span className="flex items-center gap-3">
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full"
                style={{ background: 'var(--lav)', color: 'var(--plum)' }}
              >
                <Building2 size={18} />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-ink">Continue as Organization</span>
                <span className="block text-xs text-muted">Client / employer portal login</span>
              </span>
            </span>
            <ArrowRight size={16} className="text-muted group-hover:text-gold" />
          </Link>

          <Link
            to="/candidate/login"
            state={forwardState}
            className="flex items-center justify-between gap-3 w-full border border-line rounded-lg px-4 py-3.5 hover:border-gold hover:bg-cream transition group"
          >
            <span className="flex items-center gap-3">
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full"
                style={{ background: 'var(--lav)', color: 'var(--plum)' }}
              >
                <UserRound size={18} />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-ink">Continue as Candidate</span>
                <span className="block text-xs text-muted">Job-seeker portal login</span>
              </span>
            </span>
            <ArrowRight size={16} className="text-muted group-hover:text-gold" />
          </Link>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          <Link to="/services" className="hover:underline">← Back to all solutions</Link>
        </p>
      </div>
    </div>
  );
}