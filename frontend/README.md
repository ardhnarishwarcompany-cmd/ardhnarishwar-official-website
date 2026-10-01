# Ardhnarishwar Frontend (Step 2)

React + Vite public website: Home, Solutions (services), Insights (blog), About, Contact.
Pulls all content live from the Step 1 backend API.

## Requirements
- Node.js 18+
- The backend from Step 1 running at http://localhost:5000

## Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Copy the environment file (default already points at the local backend):
   ```
   cp .env.example .env
   ```

3. Make sure the backend is running (`npm run dev` inside `backend/`), then start the frontend:
   ```
   npm run dev
   ```

4. Open http://localhost:5173

## Pages

| Route | Purpose |
|---|---|
| `/` | Home — hero, stats, "two forces" section, a preview of solutions |
| `/services` | Full list of all published solutions, pulled from the API |
| `/services/:slug` | One solution's detail page |
| `/blog` | List of published blog posts |
| `/blog/:slug` | One post's detail page |
| `/about` | Company positioning and stats |
| `/contact` | Contact/demo request form — submits to `POST /api/contact` |

## Notes

- If a page shows "Something went wrong", it means the backend isn't reachable —
  check it's running at the URL set in `.env` (`VITE_API_BASE_URL`).
- The Blog page will say "No posts published yet" until you add posts through
  the backend (or the admin dashboard in Step 3).
- Design system: colors and fonts are defined as CSS variables in `src/index.css`
  (Tailwind v4's `@theme` block) — change them there to restyle the whole site.

## What's next
Step 3 builds the admin dashboard (login + manage services, blog posts and
media) so none of this content needs to be edited by hand in the database.
