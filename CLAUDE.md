# Finku — Personal Finance Tracker

## What Is This?
Personal finance PWA for tracking Indonesian bank accounts.
Solo developer. Privacy-first — all data on local machine / home server.
No cloud, no third party services.

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

### Frontend
- React 19 + TypeScript 6
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
├── ARCHITECTURE.md
├── .gitignore
├── README.md
├── backend/
│ ├── app/
│ │ ├── api/
│ │ │ └── routes/
│ │ │ ├── accounts.py
│ │ │ ├── analytics.py
│ │ │ ├── auth.py
│ │ │ ├── balances.py
│ │ │ ├── imports.py
│ │ │ └── transactions.py
│ │ ├── core/
│ │ │ ├── auth_utils.py # bcrypt + JWT helpers
│ │ │ ├── config.py # pydantic settings
│ │ │ ├── database.py # SQLAlchemy engine + session
│ │ │ ├── dependencies.py # CurrentUser, DbSession aliases
│ │ │ ├── exceptions.py # custom exception handlers
│ │ │ └── logging.py # loguru setup + middleware
│ │ ├── models/
│ │ │ └── models.py # all SQLAlchemy models + enums
│ │ ├── parsers/
│ │ │ ├── base_parser.py # shared parser logic
│ │ │ ├── bca_pdf.py # BCA PDF parser
│ │ │ ├── mandiri_pdf.py # Mandiri PDF parser
│ │ │ ├── jago_pdf.py # Bank Jago PDF parser
│ │ │ └── seabank_pdf.py # Seabank PDF parser
│ │ ├── schemas/
│ │ │ └── schemas.py # all Pydantic schemas
│ │ └── main.py # FastAPI app entry point
│ ├── migrations/ # Alembic migration files
│ ├── tests/
│ │ ├── conftest.py # pytest fixtures
│ │ ├── test_accounts.py
│ │ ├── test_analytics.py
│ │ ├── test_balances.py
│ │ └── test_transactions.py
│ ├── .env # local secrets (gitignored)
│ ├── .env.example # template (committed)
│ ├── pyproject.toml # uv dependencies
│ ├── seed.py # seed database with test data
│ └── alembic.ini
└── frontend/
├── src/
│ ├── components/
│ │ ├── layout/ # AppShell, Sidebar, BottomNav, TopBar
│ │ ├── shared/ # reusable across pages
│ │ └── ui/ # shadcn auto-generated
│ ├── hooks/ # TanStack Query hooks
│ │ ├── useAccounts.ts
│ │ ├── useAnalytics.ts
│ │ ├── useBalances.ts
│ │ ├── useTransactions.ts
│ │ └── index.ts
│ ├── lib/
│ │ ├── constants.ts # bank colors, labels, nav items
│ │ ├── formatters.ts # formatIDR, formatDate, etc
│ │ └── utils.ts # cn(), getBankColor(), etc
│ ├── pages/
│ │ ├── dashboard/
│ │ ├── transactions/
│ │ ├── analytics/
│ │ ├── import/
│ │ └── settings/
│ ├── services/ # all axios API calls
│ │ ├── api.ts # axios instance + interceptors
│ │ ├── accountService.ts
│ │ ├── analyticsService.ts
│ │ ├── balanceService.ts
│ │ ├── transactionService.ts
│ │ └── index.ts
│ ├── types/
│ │ └── index.ts # TypeScript types mirroring backend schemas
│ ├── App.tsx # routes
│ └── main.tsx # providers (QueryClient, Router)
├── .env.local # local env vars (gitignored)
├── .env.example
├── package.json
└── vite.config.ts
```

---

## Critical Rules — READ BEFORE CHANGING ANYTHING

### Backend Rules
NEVER use Float for money → always Decimal / Numeric(18,2)
NEVER return data without user_id filter → data isolation is critical
NEVER use old SQLAlchemy Column style → always use Mapped + mapped_column
NEVER use pip → always use uv add / uv remove
NEVER use passlib → use bcrypt directly
ALL SQLite FK migrations → must use batch mode (op.batch_alter_table)
ALL routes except /auth/login and /auth/register → require CurrentUser
ALL money calculations → use Decimal, never float arithmetic

### Frontend Rules
NEVER call axios directly in components → always use services/
NEVER use useState + useEffect for server data → always TanStack Query
NEVER store money as number → always string
NEVER use raw hex colors → always use BANK_COLORS from constants.ts
NEVER import from @/services/accountService → import from @/services
ALL currency display → use formatIDR() or formatIDRShort()
ALL date display → use formatDate() or formatDateShort()

### Idempotency Rules
- POST /transactions and POST /transactions/transfer reject duplicate business events with HTTP 409 Conflict using deterministic ref_id hashing.
- POST /import silently skips duplicates and returns import counts plus error_details for parse problems.
- DELETE /accounts/{id} and DELETE /transactions/{id} are idempotent; retrying the same delete returns HTTP 204 instead of 404.
- Balance snapshots intentionally allow duplicate timestamps for historical audit records; latest-balance logic remains stable by ordering the snapshot list deterministically.
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


### Money Fields
```python
# DB model
amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))

# Pydantic schema
amount: Decimal

# TypeScript type
amount: string  # API returns "12500000.00" as string
```

### user_id Required On

✅ accounts.user_id
✅ transactions.user_id
✅ balances.user_id
❌ transfer_pairs — user derived from linked transactions


---

## Auth Flow

POST /api/v1/auth/register → requires X-Admin-Key header (ADMIN_SECRET_KEY) <br>
POST /api/v1/auth/login → form-data, returns JWT token <br>
POST /api/v1/auth/refresh → requires valid JWT, returns new token <br>
POST /api/v1/auth/logout → stateless, returns success message <br>
GET /api/v1/auth/me → returns current user info

All other endpoints require:

```
Authorization: Bearer <access_token>
```

---

## Bank Statement Parsers

### Supported

**Currently Production-Ready:**
- BCA → PDF only (bca_pdf.py) — coordinate-based word extraction

**Coming Later:**
- Mandiri → PDF (CSV support deferred)
- Bank Jago → PDF
- Seabank → PDF

### Parser Pattern
```python
class BankNameParser(BaseParser):
    source = SourceEnum.PDF

    def parse(self, file_bytes: bytes) -> list[ParsedTransaction]:
        # 1. extract words with coordinates
        # 2. group by Y position → rows
        # 3. assign columns by X position
        # 4. parse date, amount, description
        # 5. return list[ParsedTransaction]
```

### Auto-categorization
- Keyword matching in `base_parser.auto_categorize()`
- Default: `CategoryEnum.OTHER`
- User can override in import preview UI before confirming

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

**Auth:** POST /auth/register, /auth/login, /auth/logout, /auth/refresh
GET /auth/me

**Accounts:** GET/POST /accounts
GET/PATCH/DELETE /accounts/{id}
GET /accounts/{id}/transactions

**Transactions:** GET/POST /transactions
GET/PATCH/DELETE /transactions/{id}
POST /transactions/transfer

**Balances:** GET/POST /balances
GET /balances/{account_id}/latest

**Analytics:** GET /analytics/networth
GET /analytics/monthly
GET /analytics/categories
GET /analytics/accounts

**Import:** POST /import
- Single unified endpoint (see `/api/v1/docs` for schema)
- Accepts: account_id, bank, file (PDF)
- Currently supports BCA only; other banks will be added as parsers are implemented


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
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Testing

```bash
cd backend
pytest tests/ -v                    # run all tests
pytest tests/test_accounts.py -v    # run specific file
pytest tests/ -v -k "transfer"      # run tests matching keyword
```

Test DB is separate SQLite in-memory — never touches finku.db.
All fixtures defined in tests/conftest.py.

---

## Current Status (September 2026)

### Done ✅
- Backend: complete CRUD for accounts, transactions, balances, and analytics
- Backend: JWT auth, user isolation, and rate limiting are in place
- Backend: loguru logging and custom exception handling are active
- Backend: Alembic migrations are present and SQLite batch mode is used correctly
- Backend: BCA PDF import flow and unified import endpoint are working
- Backend: idempotency fixes for duplicate transaction, transfer, and import retries are implemented and tested
- Backend: targeted regression suite for accounts, transactions, and import flows is passing
- Frontend: app shell, routing, providers, and shared UI foundations are in place
- Frontend: services layer, TanStack Query hooks, and currency helpers exist
- Frontend: dashboard and import flows are functional
- Frontend: theme variables and dark-mode CSS block exist, but not fully wired as a complete feature yet

### In Progress ⏳
- Frontend: transactions page still needs final polish and full business flow cleanup
- Frontend: analytics page remains partial and not fully production-ready
- Frontend: settings page still incomplete
- Backend: remaining bank statement parsers (Mandiri, Jago, Seabank) are deferred
- Backend: CSV import support is still deferred
- Frontend: PWA setup and deployment work are still not started

### Known Bugs / Gaps ⚠️
- USD transaction support is not fully implemented: the app has a currency toggle and exchange-rate hook, but the transaction model and most flows are still effectively IDR-first; no enforced multi-currency transaction schema is in place yet.
- Dark mode is only partially implemented: CSS variables exist for a dark theme, but the app does not yet have a complete user-facing theme toggle, persisted preference handling, and full UI verification across all pages.
- Transactions page is still a partial feature; table/detail UX and edge-case polish are unfinished.
- Analytics page is not complete enough to be considered production-ready.
- Settings page is still a stub and not connected to real configuration/UX flows.
- Import support is still BCA-only for production use; other banks remain intentionally deferred.
- Some frontend state and formatting assumptions still assume IDR as the default display path, which will need cleanup when multi-currency features are implemented.

### Next Backlog 🎯
1. USD transaction support
   - add explicit currency support to transaction/account data model and API contracts
   - normalize IDR/USD conversions and display formatting across the app
   - decide whether conversion happens at the backend, frontend, or both

2. Dark mode
   - add a real theme toggle and persisted preference
   - audit all pages/components for contrast and color-token consistency
   - ensure the app behaves correctly in both light and dark modes with no hardcoded colors left behind

### Project Health
- Core backend reliability is in a good state for the current scope.
- The main remaining work is product-level completeness and UX polish, not critical API correctness for the implemented change set.