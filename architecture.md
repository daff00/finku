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

## 5. Single Admin Registration

**Decision:** No public registration. Only admin (via X-Admin-Key header) can create users.

**Why:**
- Privacy-first — don't want strangers registering
- Personal tool for family/friends only
- Simple — no registration flow, no email verification
- ADMIN_SECRET_KEY in `.env` — you control who gets access

---

## 6. user_id On Every Table

**Decision:** `user_id` FK on `accounts`, `transactions`, `balances`.

**Why not just on `accounts`:**
- Simpler queries — no JOIN needed to check ownership
- Safer — if you forget to JOIN, you leak data vs if you forget user_id filter
- More explicit — ownership visible directly on every model

**Why NOT on `transfer_pairs`:**
- TransferPair is a linking table — just connects two transactions
- Ownership derived from linked transactions
- Adding user_id would be redundant

---

## 7. Balance Snapshot Pattern

**Decision:** Periodic balance snapshots + delta calculation for net worth.

**Why not sum all transactions:**

Problem: User has 5 years of BCA history before Finku existed.
Summing transactions from day 1 = wrong (missing history).
OVO/GoPay = no CSV export = can't import history.


**How it works:**

Net worth = latest_snapshot + income_after - expense_after

Example:
BCA snapshot Jul 1 = Rp 30jt

salary Jul 25 = Rp 12.5jt
expenses Jul = Rp 2jt
= BCA balance = Rp 40.5jt ✅

**Trade-off:**
- User must manually update snapshots periodically
- More accurate than summing all transactions

---

## 8. PDF-First Import

**Decision:** Parse bank statements as PDF, not CSV.

**Why:**
- Most Indonesian banks only provide PDF (BCA, Jago, Seabank, OVO, GoPay)
- Mandiri provides both — we support both
- pdfplumber handles text-based PDFs well
- BCA PDFs are text-based (not scanned) — confirmed copyable

**Parsing strategy:**
- `extract_table()` — tried first, fails on BCA's complex layout
- `extract_words()` with X/Y coordinates — works for BCA
- Each bank has its own parser class inheriting from `BaseParser`

**Known limitation:**
- BCA truncates merchant names (e.g. "INDOMA" = Indomaret)
- This is BCA's data, not our bug
- User can re-categorize in import preview UI

---

## 9. Jago Pockets — All Independent

**Decision:** Each Jago pocket is a separate `Account` with `type=POCKET`.
No `parent_id` relationship — all pockets are top-level accounts.

**Why:**
- Jago's "MyAssets" = sum of ALL pockets
- Each pocket has independent balance and transactions
- Net worth includes ALL pockets independently
- Transfers between pockets = internal transfer (TRANSFER type)

**Trade-off:**
- Can't show "Jago total" easily — must sum all JAGO accounts
- Acceptable since user knows which accounts are Jago pockets

---

## 10. React + TanStack Query (no Redux/Zustand)

**Decision:** TanStack Query for all server state. No global state manager.

**Why:**
- Finance data is server state — TanStack Query handles it perfectly
- Auto caching, refetching, loading/error states built-in
- No need for Redux/Zustand for this use case
- Less code, less complexity

**The only "global" state needed:**
- Auth token → stored in localStorage
- Theme (dark/light) → CSS variable / localStorage

---

## 11. Design Language — Japanese Minimalism + Dark Mode

**Decision:** Japanese Minimalism as primary design language, with dark mode support.

**Philosophy:**
- Ma (間) — deliberate negative space
- Wabi-sabi — honest, nothing unnecessary
- Numbers are the hero — typography must make figures immediately readable

**Colors:**
- Light: `#FAFAF8` background (washi paper tone)
- Dark: `#0F0D0B` background (sumi ink tone)
- Accent: `#C0392B` (torii gate red)
- Bank colors as left-border accents only — never full backgrounds

---

## 12. Privacy-First Deployment

**Target:** Home server (Raspberry Pi / old PC / NAS)

**Access options:**
- Local WiFi only → `192.168.x.x`
- Anywhere via Tailscale VPN → zero-config, free, encrypted

**Why not cloud:**
- Financial data is sensitive
- No subscription cost
- Full control over data
- Tailscale makes home server accessible anywhere securely

**Future V2:**
- Docker Compose for easy deployment
- PostgreSQL instead of SQLite
- HTTPS via Caddy or nginx
- Rate limiting via slowapi