# CRM Module Implementation (Step 1)

## What was added

### Backend (`backend/src`)
- **Models**: Company, Contact, Lead, Opportunity, Activity, Task, FollowUp, Note, Ticket, TicketComment + associations
- **Controller**: `controllers/crmController.js` — full CRUD, dashboard KPIs, pipeline, reports, CSV export, global search, website→lead conversion
- **Routes**: `/api/crm/*` (all protected by existing admin JWT)
- **Contact form integration**: Public `/api/contact` auto-creates or updates a CRM Lead (duplicate detection by email/phone)

### Frontend (`frontend/src/admin/crm`)
| Route | Page |
|-------|------|
| `/admin/crm` | CRM Dashboard (live KPIs) |
| `/admin/crm/leads` | Lead list + filters + export |
| `/admin/crm/leads/new` / `:id` | Create / view / edit lead + activities, notes, follow-ups, tasks, convert to opportunity |
| `/admin/crm/pipeline` | Kanban-style pipeline with stage change |
| `/admin/crm/opportunities` | Opportunity list |
| `/admin/crm/opportunities/new` / `:id` | Opportunity form |
| `/admin/crm/contacts` | Contacts |
| `/admin/crm/companies` | Companies |
| `/admin/crm/tasks` | Tasks |
| `/admin/crm/tickets` | Support tickets |
| `/admin/crm/reports` | Real database reports |

Admin sidebar updated with CRM navigation.

## How to run

1. Ensure MySQL is running and `.env` DB credentials are correct.
2. Backend:
   ```bash
   cd backend
   npm install
   npm run seed   # creates admin if needed
   npm run dev
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Login at `/admin/login` (default seed: admin@ardhnarishwar.com / admin123)
5. Open **CRM** in the sidebar.

## Website → CRM flow
Contact form submission → ContactSubmission record + automatic Lead (or update existing by email/phone).

## Next steps (from master document)
- Multi-tenant Organization / RBAC / Module access / Subscriptions
- Notifications center
- Audit logs
- Central analytics beyond CRM
- Full portal routes under `/portal/*` for non-admin roles

No existing website pages or CMS modules were removed or replaced.
