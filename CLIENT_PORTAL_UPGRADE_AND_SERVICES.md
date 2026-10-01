# Ardhnarishwar — Client portal upgrade + candidate services fix

Copy these files into your existing project root (same paths under `ardhnarishwar-platform-images-fixed/`).

## Files included

| Path | Change |
|------|--------|
| `frontend/src/candidate/CandidateServices.jsx` | Show **all** services in candidate Explore Services |
| `frontend/src/portal/PortalPricing.jsx` | Subscription upgrade UI on client Pricing |
| `frontend/src/portal/PortalProfile.jsx` | **New** My Profile (plan + upgrade + history) |
| `frontend/src/portal/PortalLayout.jsx` | My Profile nav + header link |
| `frontend/src/App.jsx` | Route `/portal/profile` |
| `frontend/src/api/client.js` | `platformListPlans`, `platformRequestPlanUpgrade`, `platformListPlanRequests` |
| `backend/src/controllers/platformAuthController.js` | Enhanced `me` + plan upgrade APIs |
| `backend/src/routes/platformAuthRoutes.js` | `/plans`, `/plan-request`, `/plan-requests` |

## After copying

1. Restart backend and frontend.
2. Client portal: open **Pricing** or **My Profile** → Request upgrade.
3. Candidate portal: **Explore Services** should list all published services.

Upgrade requests become CRM leads with source `org_plan_request` (client) or `candidate_plan_request` (candidate).
