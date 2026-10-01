# Central Platform — Phase 1 (Organizations, RBAC, Module Access, Subscriptions, Upgraded Auth)

This phase adds the missing core platform infrastructure described in the
master prompt, **without touching the existing CMS admin panel, the
existing CRM behavior, or the public website.**

## Bug fixed along the way

`crmAssociations.js` had a naming collision: `Company`, `Contact`, `Lead`
and `Opportunity` each have a plain `notes` text column **and** a `hasMany
Note, { as: 'notes' }` association using the same name. Sequelize throws on
this at `sequelize.sync()` — meaning the app as shipped could not actually
start against a real database. Fixed by renaming those four association
aliases to `linkedNotes` (nothing in the controller or frontend referenced
the old alias, so this is a safe, no-op-for-behavior fix).

## What's new

**Models** (`backend/src/models/platform/`): `Organization`, `User`, `Role`,
`Permission`, `RolePermission`, `OrganizationUser`, `Module`,
`OrganizationModule`, `SubscriptionPlan`, `Subscription`, `RefreshToken`,
`AuditLog`, `Notification`.

**Auth** — `/api/platform-auth/*` (separate namespace from the existing
`/api/auth/*`, which still powers the legacy CMS Admin login untouched):
- `POST /register` — creates a User + a brand-new Organization (self-serve
  signup), with that user as org owner/ADMIN.
- `POST /login`, `POST /logout`, `POST /refresh-token` (rotating refresh
  tokens, stored hashed, old token revoked on every use).
- `POST /forgot-password`, `POST /reset-password`, `POST /verify-email`.
- `GET /me`.

**No email provider is configured** (none existed in the project). The
verification and reset links are logged to the server console instead of
emailed — search `[email-verify]`, `[password-reset]`, `[invite]` in the
logs. Wire a real SMTP/provider into the three `console.log` calls in
`platformAuthController.js` and `userController.js` when ready.

**Organizations** — `/api/organizations/*` (super-admin only for
cross-org actions: list all, create, edit, activate/suspend).

**RBAC** — `/api/roles/*`, `/api/permissions` (super-admin only). Seeded
roles: `SUPER_ADMIN` (implicit, platform staff), `ADMIN`, `MANAGER`,
`SALES_USER`, `RECRUITER`, `HR`, `EMPLOYEE`, `CLIENT`, each with a starter
permission set — fully editable via `PUT /api/roles/:id/permissions`.

**Module access** — `/api/modules/*`. `crm` is marked core (always on);
`analytics`, `support`, `project_tools` are toggleable per organization.

**Subscriptions** — `/api/subscriptions/*`. Plans + per-organization
subscription records, statuses `TRIAL/ACTIVE/PAUSED/EXPIRED/CANCELLED`. No
payment gateway is wired up (none existed in the project) — `assignPlan` in
`subscriptionController.js` is the exact spot a real gateway's webhook
would call into.

**Org users** — `/api/users/*` (org-scoped: invite, list, change role,
suspend/activate).

**Audit log** — `/api/audit-logs` + `utils/audit.js` helper, already wired
into every state-changing action added in this phase.

**Notifications** — `/api/notifications/*` + `utils/notify.js` helper
(model + endpoints only in this phase; not yet wired into CRM events —
that's part of Phase 2).

**Middleware** (`backend/src/middleware/`): `platformAuth.js`
(`requireUser`, `requireOrganization` — backend-level tenant check, not
just frontend hiding), `rbac.js` (`requirePermission(resource, action)`),
`moduleAccess.js` (`requireModule(key)`), `rateLimit.js` (in-memory; swap
for Redis before running multiple backend instances).

## Setup

```bash
cd backend
npm install
npm run seed             # existing CMS admin seed — unchanged
npm run seed:platform    # NEW — seeds roles, permissions, modules, a Free Trial plan
npm run dev
```

Then, e.g.:
```
POST /api/platform-auth/register
{ "name": "...", "email": "...", "password": "...", "organizationName": "..." }
```

## Verified

Ran an in-memory smoke test (register → login → /me → org-scoped
`user.MANAGE`-gated endpoint succeeds → super-admin-only endpoint correctly
403s a normal org admin → refresh-token rotation issues a new pair → reusing
the now-revoked refresh token correctly 401s). Full model sync (legacy
Admin + CRM + this phase's platform models together) succeeds cleanly.

## Deliberately NOT done in this phase

- CRM tables do **not** yet have an `organizationId` column, and
  `/api/crm/*` is **not** yet gated by `requireOrganization` /
  `requireModule('crm')`. The CRM still runs exactly as it did before —
  single-tenant, behind the legacy admin JWT. Wiring tenant isolation into
  every CRM model/controller is Phase 2.
- Notifications aren't yet triggered by CRM events (lead assigned, task
  overdue, etc.) — the infrastructure exists, the CRM-side triggers are
  Phase 2/3.
- No frontend work yet — `/portal/*` routes, login/register screens, the
  notification bell, and admin screens for Organizations/Roles/Modules/
  Subscriptions/Audit Log are all still to build.
- Central analytics (cross-module KPIs) is still to build, once there's
  more than one module's worth of data to aggregate.

## Suggested next phase

**Phase 2**: add `organizationId` to every CRM model, enforce
`requireOrganization` + `requireModule('crm')` + `requirePermission(...)`
on `/api/crm/*`, migrate existing CRM data to a default organization, and
fire notifications on lead-assigned/task-due/ticket-updated events. Say the
word and I'll build it next.

---

## Phase 2 (this update): CRM multi-tenant isolation

- Added `organizationId` (nullable + indexed) to every CRM model:
  Lead, Contact, Company, Opportunity, Activity, Task, FollowUp, Note, Ticket, TicketComment.
- `crmController.js` now scopes **all** list/get/count/report/search/export queries with `withOrg(req)` / `orgScope(req)`.
- Creates set `organizationId: req.organizationId` and use `actorId(req)` (platform user or legacy admin).
- `crmRoutes.js` uses dual auth:
  - Platform JWT → full tenant resolution via membership.
  - Legacy admin JWT → falls back to `organizationId = 1` so existing `/admin/crm` UI keeps working.
- Public website contact form creates/updates leads under `organizationId = 1`.
- `seed:platform` creates a default Organization (`slug: 'default'`) and backfills any NULL `organizationId` rows to that org.
- Module gate (`requireModule('crm')`) applied when a platform user is present.

Next: portal frontend under `/portal/*`, notification triggers on CRM events, finer-grained `requirePermission` on CRM routes, and central analytics.

---

## Phase 2b (this update): Notifications + Portal foundation

### Backend
- CRM events now fire notifications via `utils/notify.js`:
  - LEAD_ASSIGNED (create + reassignment)
  - TASK_ASSIGNED
  - OPPORTUNITY_UPDATED (pipeline stage move)
  - TICKET_ASSIGNED
  - FOLLOWUP_DUE
- Notifications API already at `/api/notifications` (list, mark read, mark all).

### Frontend portal (`/portal/*`)
- `/portal/login` + `/portal/register` (platform auth)
- `/portal` layout with sidebar, notification bell (poll + mark read)
- Live pages: CRM dashboard, leads list/filter/export, lead create/edit + notes
- Remaining portal CRM screens (pipeline, opportunities, contacts, companies, tasks, tickets, reports) are stubbed and ready to expand — admin CRM under `/admin/crm/*` remains fully functional.
- API client supports dual tokens (platform preferred for CRM/notifications).

### Still to expand
- Full portal CRM pages for remaining entities (can largely mirror admin components with portal links)
- Token auto-refresh interceptor
- Super-admin org management UI
- Central analytics page

---

## Auto token refresh (platform auth)

Frontend (`frontend/src/api/client.js`):
- Response interceptor catches **401** on platform-scoped routes.
- Calls `POST /api/platform-auth/refresh-token` with the stored refresh token
  (via a **bare axios** call — not the shared client — to avoid interceptor recursion).
- Backend **rotates** the refresh token (old one revoked); both new access + refresh
  tokens are stored in `localStorage`.
- Concurrent 401s are **queued** on a single in-flight refresh promise so the
  refresh token is only used once (required because of rotation).
- On refresh failure: session cleared + redirect to `/portal/login`.
- Request interceptor skips attaching Authorization on the refresh-token call.

---

## Portal CRM complete

All portal CRM screens under `/portal/crm/*` are live:

| Route | Features |
|-------|----------|
| `/portal/crm` | Dashboard KPIs, recent leads/activities |
| `/portal/crm/leads` | List, search, filter, export, delete |
| `/portal/crm/leads/new` `:id` | Create/edit + notes |
| `/portal/crm/pipeline` | Kanban columns, stage change, value totals |
| `/portal/crm/opportunities` | List, create, delete |
| `/portal/crm/contacts` | List, search, create, delete |
| `/portal/crm/companies` | List, search, create, delete |
| `/portal/crm/tasks` | List, create, status change, delete |
| `/portal/crm/tickets` | List, create, status change, delete |
| `/portal/crm/reports` | Live charts + CSV export for all entities |

All data is organization-scoped via the platform JWT + auto token refresh.

---

## CRM route-level RBAC

Every `/api/crm/*` route now enforces `requirePermission(resource, action)`:

| Resource | VIEW | CREATE | EDIT | DELETE | EXPORT |
|----------|------|--------|------|--------|--------|
| lead | list/get/search | create, convert | update | delete | — |
| contact | list/get | create | update | delete | — |
| company | list/get | create | update | delete | — |
| opportunity | list/get/pipeline | create | update, stage move | delete | — |
| activity | list | create | update | delete | — |
| task | list | create | update | delete | — |
| followup | list | create | update | delete | — |
| note | list | create | — | delete | — |
| ticket | list/get | create | update, comment | delete | — |
| report | dashboard, reports | — | — | — | export |

Middleware rules (`middleware/rbac.js`):
1. `req.user.isSuperAdmin` → allow
2. Legacy CMS `req.admin` (no platform user) → allow (admin CRM unbroken)
3. Platform member → RolePermission check (`MANAGE` covers all actions on that resource)
4. Else → 403 `Missing permission: resource.action`

Seed roles (ADMIN, MANAGER, SALES_USER, etc.) already map to these resources via `seed:platform`.

---

## Portal Team members UI

- Route: `/portal/team`
- Features: list members, invite by email + role, change role, change membership status (ACTIVE/INVITED/SUSPENDED)
- APIs: `GET/POST /api/users`, `PATCH /api/users/:id/role|status`
- Role dropdown: `GET /api/roles/catalog` (any authenticated platform user; excludes SUPER_ADMIN)
- Requires `user.VIEW` / `user.CREATE` / `user.MANAGE` — org ADMIN has MANAGE on all resources via seed
