# Phase 4 — Real OTP email delivery + Candidate portal (Register → Verify → Login → Explore Services)

## 1. OTP emails now actually send (when configured)

Previously the OTP was only ever printed to the backend console — no email
provider was wired in. Fixed with a new `backend/src/utils/mailer.js`
(nodemailer-based):

- Uses SMTP if `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` are set in `.env`.
- Falls back to console-log-only if not configured (original dev behavior
  is unchanged — nothing breaks if you never fill these in).
- Wired into `platformAuthController.issueOtp` (org users) **and** the new
  `candidateAuthController.issueOtp` (candidates) — one function, both flows.
- See `backend/.env.example` for the exact variables. Works with any SMTP
  provider: Gmail (App Password), Outlook, SendGrid, Mailgun, Resend, AWS
  SES SMTP, Brevo, or a company mail server.

To enable, fill in `backend/.env`:
```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@yourdomain.com
SMTP_PASS=your-smtp-password-or-app-password
SMTP_FROM=Ardhnarishwar <no-reply@yourdomain.com>
```
Restart the backend after editing `.env`. Until then, OTPs keep showing up
in the backend console as before (`[otp-register] ...` / `[candidate-otp-register] ...`).

## 2. Candidate portal (new)

A brand-new account type, separate from organization/platform users —
candidates don't belong to an organization; they just register, verify,
log in, and explore services.

**Backend**
- `backend/src/models/candidate/Candidate.js` — new `candidates` table
  (mirrors the OTP fields on `platform_users`).
- `backend/src/models/candidate/CandidateRefreshToken.js` — new
  `candidate_refresh_tokens` table.
- `backend/src/controllers/candidateAuthController.js` — register, login,
  logout, refresh, forgot/reset password, verify-email (OTP), resend-otp, me.
- `backend/src/middleware/candidateAuth.js` — `requireCandidate`, checks a
  candidate-only JWT (`CANDIDATE_JWT_SECRET`, separate from both the admin
  and org-platform secrets, so tokens can never cross over).
- Routes mounted at `/api/candidate-auth/*` in `app.js`.
- Both new tables are created automatically by `sequelize.sync()` on next
  `npm run dev` — no manual migration needed (they're brand-new tables, not
  new columns on an existing one).

**Frontend**
- `frontend/src/candidate/CandidateRegister.jsx` → `CandidateVerify.jsx`
  (OTP entry + resend) → `CandidateLogin.jsx` → `/candidate/services`
  (`CandidateServices.jsx`), guarded by `RequireCandidateAuth.jsx` +
  `CandidateLayout.jsx`.
- "Explore Services" reuses the existing public `GET /api/services`
  endpoint — the same services shown on the public `/services` page —
  presented as a browsable, filterable grid inside the candidate's own
  logged-in dashboard.
- Routes added in `App.jsx` under `/candidate/*`.
- "Candidate Login" link added to the site header (`Navbar.jsx`), next to
  the existing "Client Login" link.

## Not included (out of scope for this pass)

Job browsing/search, applying to a specific job, and application-status
tracking are **not** built yet — only account creation + verification +
login + browsing the services catalog, per the requested scope. The
existing public `/careers` job listing is unrelated to this (that's
Ardhnarishwar's own hiring page, not the candidate-facing Job Portal
service). Extending candidate accounts to jobs/applications later is a
straightforward next step on top of this same `Candidate` model — happy to
build it whenever you're ready.
