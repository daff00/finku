# Finku — Architecture Decisions

## Why These Choices Were Made
This document explains the reasoning behind key architectural decisions.
Written so future-me (or AI agents) understand the WHY, not just the WHAT.

---

## 1. Monorepo — One Repo, Two Apps

**Decision:** Single git repo with `/frontend` and `/backend` folders.

**Why:**
- Solo developer — no need for independent deployment pipelines
- One `git clone` for the entire project
- `docker-compose up` spins up everything at once
- Easier context switching between frontend and backend

**Trade-off:**
- If the project grows to a team, splitting repos is straightforward

---

## 2. SQLite → PostgreSQL-Ready

**Decision:** SQLite for now, PostgreSQL later via Alembic + SQLAlchemy.

**Why SQLite:**
- Zero setup — just a file
- Perfect for 1-10 users
- Privacy-first — data stays on your machine
- SQLAlchemy abstracts the DB so switching is painless

**Migration path:**
- Change `DATABASE_URL` in `.env` to PostgreSQL connection string
- Run `alembic upgrade head` — all migrations apply automatically
- No code changes needed

**Why not PostgreSQL now:**
- Overkill for personal use
- Requires a running DB server
- More complex local setup

---

## 3. FastAPI over Django/Flask

**Decision:** FastAPI for the backend.

**Why:**
- Auto-generates Swagger UI at `/docs` — zero extra work
- Pydantic validation built-in — no manual request validation
- Async support out of the box
- Python type hints = self-documenting code
- Fast to build with, fast to run

**Why not Django:**
- Too much magic, too much boilerplate for an API
- ORM is less flexible than SQLAlchemy

**Why not Flask:**
- No built-in validation
- More manual wiring needed

---

## 4. JWT Auth — Stateless

**Decision:** JWT tokens, no server-side sessions.

**Why:**
- Stateless — no session storage needed
- Works well with SQLite (no Redis needed)
- Simple to implement with python-jose
- Future-ready for mobile app (same token works everywhere)

**Trade-off:**
- Can't invalidate tokens server-side without a blocklist
- Logout is "soft" — token stays valid until expiry
- Acceptable for personal use, fix in V2 if needed

---

## 5. Single Admin Registration (Strictly Invite-Only)

**Decision:** No public registration. Only admin (via `X-Admin-Key` header matching `ADMIN_SECRET_KEY`) can create users.

**Why:**
- Privacy-first — personal tool for family/friends only; strangers should not register
- Simple — no public registration flow, no email verification complexity
- The admin provisions users either directly via API or through the dedicated `/admin/create-user` UI with their secret key
- `ADMIN_SECRET_KEY` in `.env` guarantees you maintain full access control

---

## 6. user_id On Every Table

**Decision:** `user_id` FK on `accounts`, `transactions`, `balances`.

**Why not just on `accounts`:**
- Simpler queries — no JOIN needed to check ownership
- Safer — forgetting a JOIN leaks data vs explicit user_id filter
- More explicit — ownership visible directly on every model

**Why NOT on `transfer_pairs`:**
- `TransferPair` is a linking table connecting `from_transaction_id`, `to_transaction_id`, and optional `fee_transaction_id`
- Ownership is derived from linked transactions
- `Transaction.direction` (`OUT` / `IN`) identifies the sender vs receiver leg

---

## 7. Balance Snapshot & Dynamic Balance Calculation

**Decision:** Periodic balance snapshots + live transaction effect calculation.

**Why not pure transaction sums from day 1:**
- User has years of bank history before FinKu existed; summing from day 1 would be inaccurate
- E-wallets (OVO/GoPay) lack automated history export

**How it works:**
- When an account is created, an initial zero baseline snapshot is seeded (timestamped at epoch).
- When real balance snapshots are recorded (`POST /api/v1/balances`), they establish new reference points.
- `compute_current_balance` live-calculates:
  `latest_snapshot + income_after - expense_after + transfers_in_after - transfers_out_after`
- Multi-currency reporting (`USD` and `IDR`) converts amounts to base currency (`IDR`) using cached exchange rates (`GET /api/v1/exchange-rate`) before aggregation.

---

## 8. PDF-Only Import (No CSV)

**Decision:** Parse bank statements as PDF only; skip CSV import for now.

**Why PDF-only:**
- Most Indonesian banks provide PDF as primary format (BCA, Jago, Seabank, OVO, GoPay)
- pdfplumber handles text-based PDFs reliably with coordinate-based word grouping
- Single format reduces parser complexity during MVP phase

**Current implementation:**
- BCA PDF parser is production-ready (`bca_pdf.py`)
- Unified `POST /import` endpoint dispatches to the correct parser via bank enum
- Other bank parsers (Mandiri, Jago, Seabank) deferred until post-MVP

---

## 9. Jago Pockets — All Independent

**Decision:** Each Jago pocket is a separate `Account` with `type=POCKET`. Top-level accounts with optional `parent_id` hierarchy.

**Why:**
- Jago's "MyAssets" = sum of ALL pockets
- Each pocket has independent balance and transactions
- Net worth includes ALL pockets independently
- Transfers between pockets = internal transfer (`TRANSFER` type)

---

## 10. React + TanStack Query & Context State

**Decision:** TanStack Query for server state. Lightweight React Context for app-wide UI preferences. No Redux/Zustand.

**Why:**
- Finance data is server state — TanStack Query handles caching, refetching, and loading states seamlessly
- Only minimal client-side state is required:
  - Auth token → stored in localStorage
  - Theme (dark/light) → `useDarkMode` with CSS variables & localStorage
  - Display Currency → `CurrencyContext` (`IDR` vs `USD` toggle)

---

## 11. Design Language — Japanese Minimalism + Dark Mode

**Decision:** Japanese Minimalism as primary design language, with full dark mode support.

**Philosophy:**
- Ma (間) — deliberate negative space
- Wabi-sabi — honest, nothing unnecessary
- Numbers are the hero — clean typography makes figures immediately readable

**Colors:**
- Light: `#FAFAF8` background (washi paper tone)
- Dark: `#0F0D0B` background (sumi ink tone)
- Accent: `#C0392B` (torii gate red)
- Bank colors as subtle accents only

**Implementation:**
- Theme toggle in Settings with instant transition and persistence
- Clean responsive layout for both desktop and mobile viewports

---

## 12. Privacy-First Deployment

**Target:** Home server (Raspberry Pi / mini PC / NAS) or local network.

**Access options:**
- Local WiFi only → `192.168.x.x`
- Secure remote access via Tailscale VPN (zero-config, encrypted, private)

**Security guardrails:**
- Rate limiting via slowapi (user-based and IP-based limiters)
- Negative-balance and insufficient-funds validation on transactions/transfers
- Deterministic idempotency hashes (`ref_id`) on writes to prevent duplicate events
