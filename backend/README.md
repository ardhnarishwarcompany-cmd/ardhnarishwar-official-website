# Ardhnarishwar Backend (Step 1)

Express + MySQL API for the company website: services, blog posts, media uploads,
contact form submissions, and admin login.

## Requirements
- Node.js 18+
- MySQL 8+ running locally

## Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```

2. Create the database (MySQL command line, or any MySQL GUI):
   ```sql
   CREATE DATABASE ardhnarishwar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   (You don't need to run `schema.sql` manually — the app creates tables on first run.
   It's included for reference.)

3. Copy the environment file and fill in your MySQL password and a JWT secret:
   ```
   cp .env.example .env
   ```

4. Start the server in dev mode (auto-restarts on changes):
   ```
   npm run dev
   ```
   You should see:
   ```
   Database connection established.
   Database synced.
   Ardhnarishwar backend running on http://localhost:5000
   ```

5. In a second terminal, seed the database with an admin account and starter
   services pulled from your master document:
   ```
   npm run seed
   ```
   This creates the admin login using `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
   from your `.env` file.

## Try it

- Health check: `GET http://localhost:5000/api/health`
- List services: `GET http://localhost:5000/api/services`
- Admin login: `POST http://localhost:5000/api/auth/login` with JSON body
  `{ "email": "...", "password": "..." }` — returns a token to use as
  `Authorization: Bearer <token>` on admin-only routes.

## API overview

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /api/auth/login | Public | Admin login, returns JWT |
| GET | /api/auth/me | Admin | Current admin profile |
| GET | /api/services | Public | List published services |
| GET | /api/services?all=true | Admin | List all services (incl. unpublished) |
| GET | /api/services/:slug | Public | One service by slug |
| POST | /api/services | Admin | Create service |
| PUT | /api/services/:id | Admin | Update service |
| DELETE | /api/services/:id | Admin | Delete service |
| GET | /api/blog | Public | List published posts |
| GET | /api/blog/:slug | Public | One post by slug |
| POST /PUT /DELETE | /api/blog... | Admin | Manage posts |
| POST | /api/media | Admin | Upload an image |
| GET | /api/media | Admin | List uploaded media |
| DELETE | /api/media/:id | Admin | Delete media record |
| POST | /api/contact | Public | Submit contact/demo form |
| GET | /api/contact | Admin | View submissions |
| PUT | /api/contact/:id/status | Admin | Update submission status |

## What's next
Step 2 will build the React + Vite public site that consumes this API
(Home, Services, Blog, About, Contact), followed by the admin dashboard
in Step 3.
