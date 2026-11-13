# Finku — Personal Finance Tracker

## What Is This?
Personal finance PWA for tracking Indonesian bank accounts.
Solo developer. Privacy-first — financial data stays on the local machine / home server.
Strictly invite-only / single-admin provisioning. No public registration or cloud-hosted Finku backend. Exchange-rate lookups use an external provider and do not send account, transaction, or balance data.

## Quick Start
### Backend
```bash
cd backend
source .venv/bin/activate   # Windows: .venv\Scripts\activate
fastapi dev app/main.py     # runs on localhost:8000
```

### Frontend
```bash
cd frontend
npm run dev                 # runs on localhost:5173
```

### Tests
```bash
cd backend
pytest tests/ -v
```

### Database
```bash
cd backend
alembic upgrade head        # apply migrations
python seed.py              # seed test data
```

---

## Tech Stack

### Backend
- Python 3.12
- FastAPI 0.141 + Uvicorn
- SQLAlchemy 2.0 (Mapped + mapped_column — NOT old Column style)
- Alembic (migrations — always use batch mode for SQLite FK changes)
- uv (package manager — NOT pip, NOT poetry)
- pdfplumber (PDF parsing)
- bcrypt (password hashing — NOT passlib)
- python-jose (JWT)
- loguru (logging)
- slowapi (rate limiting)

### Frontend
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4 (NO tailwind.config.js — just @import "tailwindcss")
- shadcn/ui (component library)
- TanStack Query v5 (server state)
- React Router v7 (navigation)
- Axios (HTTP client)

---

## Project Structure
```
finku/
├── CLAUDE.md
├── architecture.md
├── .gitignore
├── README.md
├── openspec/
│   ├── config.yaml
│   ├── specs/              # main active specs
│   └── changes/            # active and archived change proposals
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── accounts.py
│   │   │       ├── analytics.py
│   │   │       ├── auth.py
│   │   │       ├── balances.py
│   │   │       ├── exchange_rate.py
│   │   │       ├── imports.py
│   │   │       └── transactions.py
│   │   ├── core/
│   │   │   ├── auth_utils.py       # bcrypt + JWT helpers
│   │   │   ├── config.py           # pydantic settings
│   │   │   ├── database.py         # SQLAlchemy engine + session
│   │   │   ├── dependencies.py     # CurrentUser, DbSession aliases
│   │   │   ├── exceptions.py       # custom exception handlers
│   │   │   ├── logging.py          # loguru setup + middleware
│   │   │   └── rate_limit.py       # slowapi limiter configuration
│   │   ├── models/
│   │   │   └── models.py           # all SQLAlchemy models + enums
│   │   ├── parsers/
│   │   │   ├── base_parser.py      # shared parser logic
│   │   │   ├── bca_pdf.py          # BCA PDF parser
│   │   │   ├── mandiri_pdf.py      # Mandiri PDF parser
│   │   │   ├── jago_pdf.py         # Bank Jago PDF parser
│   │   │   └── seabank_pdf.py      # Seabank PDF parser
│   │   ├── schemas/
│   │   │   └── schemas.py          # all Pydantic schemas
│   │   └── main.py                 # FastAPI app entry point
│   ├── migrations/                 # Alembic migration files
│   ├── tests/
│   │   ├── conftest.py             # pytest fixtures
│   │   ├── test_accounts.py
│   │   ├── test_accounts_rate_limit.py
│   │   ├── test_analytics.py
│   │   ├── test_balances.py
│   │   ├── test_imports.py
│   │   ├── test_other_rate_limits.py
│   │   ├── test_seed.py
│   │   └── test_transactions.py
│   ├── .env                        # local secrets (gitignored)
│   ├── .env.example                # template (committed)
│   ├── pyproject.toml              # uv dependencies
│   ├── seed.py                     # seed database with test data
│   └── alembic.ini
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── analytics/          # charts, net worth trends, category breakdown
    │   │   ├── dashboard/          # account grid, metrics
    │   │   ├── layout/             # AppShell, Sidebar, BottomNav
    │   │   ├── settings/           # profile, password, account CRUD
    │   │   ├── shared/             # reusable across pages
    │   │   ├── transactions/       # transaction row, sheet, delete dialog, filters
    │   │   └── ui/                 # shadcn auto-generated
    │   ├── contexts/
    │   │   └── CurrencyContext.tsx # active display currency context
    │   ├── hooks/                  # TanStack Query & helper hooks
    │   │   ├── useAccounts.ts
    │   │   ├── useAmountVisibility.ts
    │   │   ├── amountVisibilityState.ts
    │   │   ├── useAnalytics.ts
    │   │   ├── useAuth.ts
    │   │   ├── useBalances.ts
    │   │   ├── useDarkMode.ts
    │   │   ├── useExchangeRate.ts
    │   │   ├── usePageTitle.ts
    │   │   ├── useTransactions.ts
    │   │   └── index.ts
    │   ├── lib/
    │   │   ├── constants.ts        # bank colors, labels, nav items
    │   │   ├── formatters.ts       # formatIDR, formatUSD, formatDate, etc
    │   │   └── utils.ts            # cn(), getBankColor(), etc
    │   ├── pages/
    │   │   ├── dashboard/
    │   │   ├── transactions/
    │   │   ├── analytics/
    │   │   ├── import/
    │   │   ├── settings/
    │   │   ├── login/
    │   │   ├── AdminCreateUserPage.tsx
    │   │   └── NotFoundPage.tsx
    │   ├── services/               # all axios API calls
    │   │   ├── api.ts              # axios instance + interceptors
    │   │   ├── accountService.ts
    │   │   ├── analyticsService.ts
    │   │   ├── authService.ts
    │   │   ├── balanceService.ts
    │   │   ├── exchangeRateService.ts
    │   │   ├── importService.ts
    │   │   ├── transactionService.ts
    │   │   └── index.ts
    │   ├── types/
    │   │   └── index.ts            # TypeScript types mirroring backend schemas
    │   ├── App.tsx                 # routes & providers
    │   └── main.tsx                # entry point
    ├── public/
    │   └── icons/                  # generated PWA icon assets
    ├── scripts/
    │   └── generate-icons.mjs      # reproducible PWA icon generation
    ├── tests/
    │   └── amountVisibilityState.test.mjs
    ├── .env.local                  # local env vars (gitignored)
    ├── .env.example
    ├── package.json
    └── vite.config.ts
```

---

## Critical Rules — READ BEFORE CHANGING ANYTHING

### Backend Rules
- NEVER use Float for money → always Decimal / Numeric(18,2)
- NEVER return data without user_id filter → data isolation is critical
- NEVER use old SQLAlchemy Column style → always use Mapped + mapped_column
- NEVER use pip → always use uv add / uv remove
- NEVER use passlib → use bcrypt directly
- ALL SQLite FK migrations → must use batch mode (op.batch_alter_table)
- All financial and user-specific API routes require CurrentUser, except login and admin-key-protected registration. Service root, `/health`, `/docs`, and `/redoc` are public.
- ALL user registration → strictly admin-only with X-Admin-Key matching ADMIN_SECRET_KEY (no public signup)
- ALL money calculations → use Decimal, never float arithmetic

### Frontend Rules
- NEVER call axios directly in components → always use services/
- NEVER use useState + useEffect for server data → always TanStack Query
- NEVER store money as number → always string
- NEVER use raw hex colors → always use BANK_COLORS from constants.ts
- NEVER import from @/services/accountService → import from @/services
- ALL currency display → use the shared amount formatter / active CurrencyContext, not hardcoded IDR assumptions
- ALL date display → use formatDate() or formatDateShort()
- NEVER expose public self-registration routes or forms

### Idempotency Rules
- POST /transactions and POST /transactions/transfer reject duplicate business events with HTTP 409 Conflict using deterministic ref_id hashing.
- POST /import silently skips duplicates and returns import counts plus error_details for parse problems.
- DELETE /accounts/{id} and DELETE /transactions/{id} are idempotent; retrying the same delete returns HTTP 204 instead of 404.
- Balance snapshots intentionally allow duplicate timestamps for historical audit records; latest-balance logic remains stable by ordering by recorded_at DESC, id DESC.
- All retry-safe behavior must preserve user isolation: every write must still be scoped to the authenticated user_id.

---

## Data Models

### Key Relationships
User (1) ──── (many) Account
User (1) ──── (many) Transaction
User (1) ──── (many) Balance
Account (1) ── (many) Transaction
Account (1) ── (many) Balance
Account (1) ── (many) Account (self-ref: parent → pockets)
Transaction (1) ── (1) TransferPair (as from_transaction)
Transaction (1) ── (1) TransferPair (as to_transaction)
Transaction (1) ── (1) TransferPair (as fee_transaction, optional)

### Money Fields
```python
# DB model
amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))

# Pydantic schema
amount: Decimal

# TypeScript type
amount: string  # API returns "12500000.00" as string
```

### Multi-Currency & Tracking Fields
- `Account.currency`: CurrencyEnum (IDR, USD)
- `Transaction.currency`: CurrencyEnum (IDR, USD)
- `Transaction.original_amount`: Decimal | None
- `Transaction.original_currency`: CurrencyEnum | None
- `Transaction.ref_id`: str | None (deterministic hash)
- `Transaction.direction`: TransferDirectionEnum | None (OUT, IN)
- `TransferPair.fee_transaction_id`: int | None (links BI-FAST or transfer fee)

### user_id Required On
- accounts.user_id
- transactions.user_id
- balances.user_id
- transfer_pairs — derived from linked transactions

---

## Auth Flow

- POST /api/v1/auth/register → strictly requires X-Admin-Key header (ADMIN_SECRET_KEY)
- POST /api/v1/auth/login → form-data, returns JWT token
- POST /api/v1/auth/refresh → requires valid JWT, returns new token
- POST /api/v1/auth/logout → stateless, returns success message
- GET /api/v1/auth/me → returns current user info
- PATCH /api/v1/auth/me → updates current user's display name
- POST /api/v1/auth/change-password → updates password after validating current password

All protected API endpoints require:
```
Authorization: Bearer <access_token>
```

The service root, `/health`, `/docs`, and `/redoc` are public. Login is public; registration requires `X-Admin-Key`.

---

## Bank Statement Parsers

### Supported
**Currently Production-Ready:**
- BCA → PDF only (bca_pdf.py) — coordinate-based word extraction

**Coming Later:**
- Mandiri → PDF (CSV support deferred)
- Bank Jago → PDF
- Seabank → PDF

### Auto-categorization
- Keyword matching in `base_parser.auto_categorize()`
- Default: `CategoryEnum.OTHER`
- Categories are assigned during import; there is no preview or confirmation step

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

**Auth:**
- POST /auth/register (requires X-Admin-Key)
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- GET /auth/me
- PATCH /auth/me
- POST /auth/change-password

**Accounts:**
- GET/POST /accounts
- GET/PATCH/DELETE /accounts/{id}
- GET /accounts/{id}/transactions

**Transactions:**
- GET/POST /transactions
- GET/PATCH/DELETE /transactions/{id}
- POST /transactions/transfer

**Balances:**
- GET/POST /balances (optional `account_id`, `limit`, and `offset` on GET)
- GET /balances/{account_id}/latest

**Analytics:**
- GET /analytics/networth
- GET /analytics/monthly
- GET /analytics/categories
- GET /analytics/accounts

**Exchange Rate:**
- GET /exchange-rate/USD
- GET /exchange-rate/{from_currency}?to_currency=IDR&force_refresh=false (24h latest-pair cache + fallback)
- POST /exchange-rate/clear-cache (admin only)

**Import:**
- POST /import (BCA PDF support)

**Service:**
- GET / and GET /health (public; health checks database connectivity)

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./finku.db
SECRET_KEY=...
JWT_SECRET_KEY=...
ADMIN_SECRET_KEY=...
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=["http://localhost:5173"]
ACCOUNTS_RATE_LIMIT=100/minute
API_RATE_LIMIT=100/minute
TRANSACTIONS_RATE_LIMIT=100/minute
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Testing

```bash
cd backend
uv run pytest tests/ -v                 # run backend tests (currently 94 collected)
uv run pytest tests/test_accounts.py -v # run specific file
uv run pytest tests/ -v -k "transfer"   # run tests matching keyword
```

Test DB is separate SQLite in-memory / temporary test database — never touches finku.db.
All fixtures defined in `tests/conftest.py`.

Frontend amount-visibility tests:
```bash
cd frontend
npm test
```

---

## Current Status (November 2026)

### Done ✅
- **Phase 0 architecture integrity fixes complete**: atomic account/baseline creation, live database health check, protected transfer fee deletion, transaction direction contract, and production seed guard
- Backend: complete CRUD for accounts, transactions, balances, and analytics
- Backend: balance snapshot endpoints (`POST /api/v1/balances` and `GET /api/v1/balances`) fully restored, dynamic balance calculation (`compute_current_balance`) verified
- Backend: complete test suite passing (94/94 tests green)
- Backend: JWT auth, strict admin-only user onboarding via `X-Admin-Key`, user isolation, and rate limiting active
- Backend: multi-currency transaction/account support (IDR and USD) with cached exchange rate endpoint
- Backend: negative-balance rejection, insufficient-funds validation, and transfer fee linkage
- Backend: BCA PDF import flow with duplicate detection
- Frontend: Dashboard, Transactions (with search, bank/type filters, pagination, edit sheet, delete dialog), Analytics, Import, and Settings
- Frontend: Settings page supports display name update, password change, and account management dialogs; no separate Appearance section
- Frontend: Dark mode fully supported with the AppShell header toggle, `useDarkMode` hook, and localStorage persistence
- Frontend: Dashboard global amount visibility clears section overrides; section-level visibility can be customized afterward
- Frontend: Global `CurrencyContext` with display currency switching across all components
- Frontend: Admin user provisioning page at `/admin/create-user` using `ADMIN_SECRET_KEY`
- Frontend: PWA foundation with install manifest, generated icons, shell-only service-worker precache, and user-confirmed updates
- OpenSpec: all core capabilities (`accounts-rate-limiting`, `api-idempotency`, `bank-statement-import`, `multi-currency-transactions`, `balance-snapshots`, `local-admin-auth`, `database-health`, `seed-environment-guard`, `pwa-foundation`, `dashboard-display-controls`) documented and validated

### In Progress / Deferred ⏳
- Backend: remaining bank statement parsers (Mandiri, Jago, Seabank) deferred
- Backend: CSV import support deferred
- Frontend: PWA Phase 2 offline UX (offline UI, install banner, network-error vs. 401 handling, and logout cleanup) deferred
- Deployment: Docker compose and home server configuration deferred

### Next Backlog 🎯
1. PWA Phase 2 — Offline UX
   - Offline UI state and install banner
   - Distinguish network errors from authentication failures and clear local session state on logout
2. Home Server Deployment
   - Docker Compose setup for backend + frontend static hosting
3. Statement Parser Expansion
   - Mandiri, Bank Jago, and Seabank PDF parsers
