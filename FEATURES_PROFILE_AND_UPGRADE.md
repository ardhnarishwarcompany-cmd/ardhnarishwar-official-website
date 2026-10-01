# Candidate Profile & Subscription Upgrade

## What's included

### My Profile (`/candidate/profile`)
- Account details: name, email, phone, verification, status, member since, last login
- Current plan: **Candidate Access (Free)**
- **Services you can access** (accessType: candidate / both / public)
- Sidebar nav item + clickable name in header

### Subscription upgrade flow
- List active paid plans (Starter, Growth, Enterprise after seed)
- Request upgrade with optional note → creates CRM lead (`source: candidate_plan_request`)
- Dedupes pending requests for the same plan
- Request history with status (NEW, CONTACTED, …)
- Same upgrade CTAs on `/candidate/pricing` when logged in

### API
- `GET  /api/candidate-auth/me` — profile + plan + accessibleServices
- `GET  /api/candidate-auth/plans`
- `POST /api/candidate-auth/plan-request` `{ planId, message? }`
- `GET  /api/candidate-auth/plan-requests`

### Seed
Re-run to ensure paid plans exist:
```bash
cd backend && npm run seed:platform
```

### Setup (no node_modules in this zip)
```bash
cd backend && npm install && npm run seed:platform
cd ../frontend && npm install && npm run dev
```
