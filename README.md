# Volunteer Hub

A volunteer management system — a public application form paired with an admin dashboard for reviewing applicants, accepting them as volunteers, and managing their status over time. Built with **FastAPI + Next.js + PostgreSQL**, using HttpOnly-cookie JWT auth for the admin side.

## What it does

- **Public application form** (`/apply`) — a mobile-first, multi-step form (basic info, availability, skills, motivation, resume/photo upload) with client-side validation, a country picker with flags, and a phone input with country dial codes.
- **Admin dashboard** (`/dashboard`) — sign in, then:
  - Review applications, filter/search, and export to CSV.
  - **Accept** an application by setting a start date and a duration (1 week up to 6 months) — this creates a volunteer record and automatically computes an end date. Reject or mark as reviewing instead.
  - Manage volunteers: change status (active / inactive / suspended), edit the computed end date, export to CSV.
  - Toast notifications (via shadcn/sonner) confirm every action — logins, submissions, accept/reject, status changes.

## Stack

| Layer    | Tech                                              |
|----------|----------------------------------------------------|
| Backend  | FastAPI, SQLAlchemy (async), asyncpg, PostgreSQL   |
| Auth     | `python-jose` (JWT) + HttpOnly cookies, `passlib`/`bcrypt` |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Uploads  | Photos/resumes stored on disk, served via FastAPI `StaticFiles` |

## Project structure

```
volunteer-management/
├── backend/
│   └── app/
│       ├── api/routes/
│       │   ├── auth.py           # register, login, refresh, logout, me
│       │   ├── applications.py   # public submit; admin list/stats/export/review
│       │   └── volunteers.py     # admin list/detail/update/export
│       ├── core/                 # config, cookies, database, dependencies
│       ├── models/                # User, RefreshToken, Application, Volunteer
│       ├── schemas/               # auth + volunteer/application pydantic schemas
│       └── services/
│           ├── jwt_service.py / password_service.py
│           └── file_service.py    # photo/resume upload handling
└── frontend/
    ├── app/
    │   ├── page.tsx                # landing page
    │   ├── login/, register/
    │   ├── apply/                  # public multi-step form + success page
    │   └── dashboard/              # sidebar layout, overview, applications, volunteers
    ├── components/
    │   ├── dashboard/AppSidebar.tsx
    │   └── ui/                     # shadcn components (sidebar, select, sonner, ...)
    └── lib/
        ├── api.ts                  # all API calls
        └── form-types.ts           # form state, skill/duration/country options
```

## Quick start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=postgresql+asyncpg://postgres:<password>@localhost:5432/volunteer_management
JWT_SECRET_KEY=<generate one below>
FRONTEND_URL=http://localhost:3000
```

Generate a secret:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Create the database, then start the server (tables and the `uploads/` directory are created automatically on first run):

```bash
psql -U postgres -c "CREATE DATABASE volunteer_management;"
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App: http://localhost:3000

## Try it

1. Go to `/apply`, fill out the form, submit → redirected to `/apply/success`.
2. Register an admin account at `/register` → redirected to `/dashboard`.
3. Open **Applications**, click into the new application, and **Accept** it — you'll be asked for a start date and a duration before it's confirmed.
4. Open **Volunteers** — the accepted applicant now appears there with a computed end date, which you can edit from their detail page.

## Troubleshooting

| Symptom | Cause |
|---|---|
| CORS error | `FRONTEND_URL` in backend `.env` doesn't exactly match the frontend origin |
| `password cannot be longer than 72 bytes` / 500 on register | `passlib==1.7.4` breaks on `bcrypt>=4.1` — keep `bcrypt==4.0.1` pinned |
| Next.js server component throws `fetch failed` | Node resolves `localhost` to IPv6 first while uvicorn listens on IPv4 only — run dev with `NODE_OPTIONS=--dns-result-order=ipv4first` |
| Photos/resumes 404 | Confirm the backend is running — `uploads/` is served at `/uploads/...` and created automatically on startup |
