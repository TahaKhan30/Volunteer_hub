# JWT Auth Starter

A production-ready authentication starter — **FastAPI + Next.js + PostgreSQL**, secured with HttpOnly cookies instead of `localStorage` tokens. Clone it, swap the name, and ship the next project's auth in minutes instead of days.

## Why this exists

Most "JWT auth tutorials" store the token in `localStorage` and call it done — which means any XSS bug on the site hands over the keys. This starter does it the way you actually want in production:

- 🔒 **HttpOnly cookies, set only by the server.** JavaScript can never read the tokens — `document.cookie` comes back empty. XSS can't steal what it can't see.
- 🔁 **Short-lived access token (15 min) + rotating refresh token (7 days).** Every refresh issues a new refresh token and revokes the old one, so a leaked token has a tiny blast radius.
- 🧂 **Refresh tokens are hashed before they ever touch the database.** A DB dump doesn't hand out valid sessions.
- 🚪 **Next.js middleware is UX-only.** It redirects based on whether a cookie *exists* — it never trusts the token's contents. The actual security check lives entirely in FastAPI's `get_current_user` dependency.

## Stack

| Layer    | Tech                                      |
|----------|--------------------------------------------|
| Backend  | FastAPI, SQLAlchemy (async), asyncpg, PostgreSQL |
| Auth     | `python-jose` (JWT), `passlib`/`bcrypt` (hashing) |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |

## Project structure

```
jwt-auth-starter/
├── backend/
│   └── app/
│       ├── api/routes/
│       │   ├── auth.py           # register, login, refresh, logout, me
│       │   └── users.py          # example protected route
│       ├── core/
│       │   ├── config.py         # settings, loaded from .env
│       │   ├── cookies.py        # set_auth_cookies / clear_auth_cookies
│       │   ├── database.py       # async SQLAlchemy session
│       │   └── dependencies.py   # get_current_user — use on every protected route
│       ├── models/                # User, RefreshToken (hashed)
│       ├── schemas/auth.py
│       ├── services/
│       │   ├── jwt_service.py    # create/decode access + refresh tokens
│       │   └── password_service.py
│       └── main.py
└── frontend/
    ├── app/
    │   ├── login/, register/      # auth forms
    │   └── dashboard/              # server component, fetches user via cookie
    ├── components/LogoutButton.tsx
    ├── lib/api.ts                  # every call uses credentials: "include"
    └── middleware.ts               # redirect-only, not a security boundary
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
DATABASE_URL=postgresql+asyncpg://postgres:<password>@localhost:5432/jwt_auth
JWT_SECRET_KEY=<generate one below>
```

Generate a secret:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Create the database, then start the server (tables auto-create on first run):

```bash
psql -U postgres -c "CREATE DATABASE jwt_auth;"
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

1. http://localhost:3000 → redirected to `/login`
2. Register an account → redirected to `/dashboard`
3. Refresh the page → still logged in (cookie persists)
4. Sign out → cookies cleared, back to `/login`
5. Try `/dashboard` directly while logged out → bounced to `/login`

## Adding a new protected route

**Backend:**

```python
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/api/my-feature")
async def my_feature(user: User = Depends(get_current_user)):
    return {"data": "protected content", "user_id": user.id}
```

**Frontend:**

```typescript
// lib/api.ts
export async function getMyFeatureData() {
  const res = await apiFetch("/api/my-feature"); // credentials already set
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
```

## Troubleshooting

| Symptom | Cause |
|---|---|
| CORS error | `FRONTEND_URL` in backend `.env` doesn't exactly match the frontend origin |
| Cookies never sent | A fetch in `lib/api.ts` is missing `credentials: "include"` |
| `secure=True` cookie fails on `localhost` | Set `secure=False` in `backend/app/core/cookies.py` for local dev — flip it back before deploying |
| 401 on `/api/auth/me` right after login | Almost always the CORS + credentials issue above — check the Network tab for `Set-Cookie` on the login response |
| Next.js server component throws `fetch failed` | Node resolves `localhost` to IPv6 first while uvicorn listens on IPv4 only — run dev with `NODE_OPTIONS=--dns-result-order=ipv4first` |
| `password cannot be longer than 72 bytes` / 500 on register | `passlib==1.7.4` breaks on `bcrypt>=4.0` — pin `bcrypt==4.0.1` |

## License

Use it, fork it, strip the branding — it's a starter, not a product.
