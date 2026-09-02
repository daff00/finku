## Context

See `proposal.md` for the motivation. The backend already has authenticated account routes, a centralized FastAPI app entry point, shared logging middleware, and a global exception handler. That gives us one clean place to install a limiter and then apply it to the accounts router first.

## Goals / Non-Goals

**Goals:**
- Add backend rate limiting with `slowapi` in a way that fits the existing FastAPI structure.
- Scope accounts limits to authenticated users.
- Return consistent 429 responses through the existing API error style.
- Keep the limiter backend-only for this change.

**Non-Goals:**
- Adding rate limits to analytics, transactions, balances, or imports in this change.
- Changing the frontend to react to rate limiting in this change.
- Adding Redis or any other shared external rate-limit store now.
- Redesigning auth, account ownership, or API payloads.

## Decisions

- Use `slowapi` for endpoint-level throttling.
  - It is a lightweight fit for FastAPI and supports route decorators and shared limits.
  - Alternative considered: a custom in-house limiter. Rejected because it would reimplement standard rate-limiting behavior and add maintenance overhead.

- Keep storage in-process for now.
  - The project is still a single backend deployment, so a shared external store is unnecessary at this stage.
  - Alternative considered: Redis-backed storage. Rejected for now because it adds infrastructure that the current scale does not need.

- Key accounts limits by authenticated user.
  - Accounts routes already require `CurrentUser`, so the limiter should follow the same identity boundary.
  - Alternative considered: IP-based limiting only. Rejected because it is less precise for authenticated routes and can unfairly combine multiple users behind one network address.

- Apply the limiter only to the accounts router in this change.
  - This keeps the rollout easy to reason about and lets us validate the limiter behavior on one route family before expanding it.
  - Alternative considered: blanket application across all protected routes. Rejected because it would broaden the blast radius before the limiter pattern is proven in the codebase.

- Surface limit violations through the API’s existing JSON error shape.
  - Clients already receive structured JSON errors; 429s should fit that pattern.
  - Alternative considered: raw framework default errors. Rejected because they would be inconsistent with the rest of the backend.

## Risks / Trade-offs

- [Risk] In-process storage resets on restart → Mitigation: accept this for now because the app is single-instance and the limits are a protective layer, not a billing-grade quota system.
- [Risk] Limits may be too strict or too loose at first → Mitigation: start with conservative accounts limits and tune them after observing real usage.
- [Risk] Multiple workers would not share counters → Mitigation: keep deployment single-process for now and revisit shared storage only if the deployment model changes.

## Migration Plan

1. Add the limiter dependency and backend initialization.
2. Wire 429 handling into the existing exception path.
3. Apply rate limiting to the accounts router only.
4. Add tests covering normal usage and over-limit responses.
5. Roll out and observe request patterns before extending the pattern to other endpoint groups.

## Open Questions

- What exact request thresholds should be used for each accounts endpoint group on day one? This can be tuned during implementation without changing the architecture.
