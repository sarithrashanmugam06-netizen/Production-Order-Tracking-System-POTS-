# Production Order Tracking System (POTS)

Track products, inventory, work orders, production runs and issues for a
manufacturing floor. FastAPI + SQLite backend, React (Vite) frontend.

## Run it

**Backend** (Python 3.10+)

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload        # http://127.0.0.1:8000  (docs at /docs)
```

**Frontend** (Node 20+)

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

The frontend talks to `http://127.0.0.1:8000` by default. To change that, copy
`frontend/.env.example` to `frontend/.env` and edit `VITE_API_URL`.
Backend settings (all optional): `DATABASE_URL`, `CORS_ORIGINS` (comma-separated).

## Signing in

Users sign in with **email + password**; passwords are checked by the server
and stored only as scrypt hashes.

- **First run:** if nobody has a password yet (a fresh install, or a database
  from before sign-in existed), the server gives one Admin a password and
  prints it **once** in the terminal:
  `[POTS] First run: sign in as georgy@gmail.com with password ...`
  Pick the account/password yourself with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Then open **Users** and set a password for everyone else (new users need one;
  when editing, leaving the password blank keeps the current one).

| Role | Can see and change |
|---|---|
| Admin | everything, including Users and Settings |
| Planner | products, inventory, work orders, production, issues |
| Supervisor | production and issues |
| Management | reports and dashboard; production and issues read-only |

Everyone signed in can *read* products, inventory and work orders (the
dashboard and reports need them). The API enforces all of this; the UI also
hides controls you cannot use.

Backend environment variables (all optional):
`SECRET_KEY` (token signing key; **set this in production**. Otherwise one is
generated into `backend/.secret_key`), `TOKEN_TTL_MINUTES` (default 480),
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL`, `CORS_ORIGINS`.

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## Known limitations

- **Serve it over HTTPS** if it is reachable by anyone but you; passwords and
  tokens are otherwise sent in clear text.
- The sign-in token is kept in the browser's localStorage, so any script that
  runs on the page could read it. Keep untrusted scripts out of the app.
- Tokens are stateless: signing out removes the token from the browser, but a
  copied token stays valid until it expires (default 8 hours). Switching a user
  to Inactive cuts them off immediately.
- The failed-login limit (5 tries per email+IP per 15 minutes) is kept in
  memory, so it is per server process and resets on restart.
- There is no "forgot password" flow or self-service password change yet; an
  Admin sets passwords on the Users page.
- **No migrations.** Tables are created with `create_all`, which never alters an
  existing table (only the small `users.password_hash` upgrade is applied
  automatically). Foreign keys / unique constraints are enforced in code
  (`backend/rules.py`).
- `products.quantity` and `inventory.current_stock` both describe stock and can
  drift apart; pick one as the source of truth.
- Existing sample data has orphans (see CHANGES.md); the API now prevents new ones.
