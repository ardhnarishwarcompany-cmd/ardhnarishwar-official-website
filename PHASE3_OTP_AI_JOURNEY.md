# Phase 3 — Register→Verify→Login (OTP) + CRM AI Prediction + Customer Journey

This update aligns the platform with the exact roadmap in the master
document's **User Journey Flow** infographic and the **CRM & Sales Cloud**
workflow.

## 1. Login workflow: Register -> Verify (OTP) -> Login -> Dashboard

- `POST /api/platform-auth/register` now creates the account as
  `PENDING_VERIFICATION` and issues a 6-digit OTP (logged to the server
  console as `[otp-register] ...` since no SMS/email provider is
  configured) instead of logging the user in immediately.
- `POST /api/platform-auth/verify-email` now takes `{ email, otp }`
  (previously a long link-token) and activates the account. Max 5 wrong
  attempts before a new OTP is required.
- `POST /api/platform-auth/resend-otp` issues a fresh OTP.
- `POST /api/platform-auth/login` now rejects unverified accounts with
  `403 { requiresVerification: true, email }` instead of letting them in.
- Frontend: `/portal/register` → `/portal/verify` (new page, OTP entry +
  resend) → `/portal/login` → `/portal` dashboard. Register form also
  collects an optional mobile number.
- DB: added `otpAttempts`, `mobileVerified` to `platform_users`, applied
  automatically on startup via `migrateFeatureColumns.js` (safe on
  existing databases, same pattern as the earlier org-column migration).

## 2. CRM — Customer Intelligence & AI Sales Prediction

- New `backend/src/utils/leadScoring.js`: rule-based scoring
  (email/phone/company present, requirement detail, source quality,
  estimated value, priority) → `aiScore` (0-100) + `aiGrade`
  (`HOT`/`WARM`/`COLD`). Documented as explainable-by-design since no
  ML training data exists in the project; swap the internals for a real
  model later without touching any caller.
- Wired into: `crmController.createLead`, `crmController.updateLead`,
  and the public website contact-form → lead auto-create in
  `contactController.js`.
- CRM dashboard now reports a `hotLeads` KPI.
- DB: added `aiScore`, `aiGrade` to `crm_leads` (same safe migration).
- Frontend: new `AiScoreBadge` component, shown in the leads table, the
  lead detail page, the dashboard's recent-leads list, and a new
  "🤖 Hot Leads (AI)" KPI card.

## 3. CRM — Customer Journey Mapping

- `GET /api/crm/leads/:id` now also returns a merged `journey` array:
  lead-created + every activity, note, task, follow-up and opportunity
  stage, sorted chronologically — one timeline instead of separate tabs.
- Frontend: lead detail page renders this as a "Customer Journey"
  timeline.

## Not changed

- Legacy CMS admin login (`/admin/login`) is untouched.
- Existing CRM permissions/RBAC, multi-tenant scoping, and notifications
  are untouched — the AI score and journey data simply ride along with
  the same tenant-scoped queries.

## To apply on a running install

```bash
cd backend
npm install
npm run dev   # runs migrateOrgColumns + migrateFeatureColumns automatically, then syncs
```

No frontend env changes needed.
