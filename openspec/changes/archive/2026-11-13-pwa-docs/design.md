## Context

See `proposal.md` for motivation. The PWA shell, icon assets, and update prompt are implemented; production browser checks verified the service worker and cache boundary, while Chrome DevTools' installability diagnostics remain manual.

## Goals / Non-Goals

**Goals:**
- Keep completed foundation work distinct from deferred offline UX.
- State the cache restrictions and reason for user-confirmed updates clearly.

**Non-Goals:**
- Claim that offline financial data, install banners, or DevTools installability checks have been completed.

## Decisions

- Mark the service worker foundation as verified because the production worker activated, cached only shell/static resources, and applied an update only after user action.
- Retain offline UI, install banner, network-versus-auth handling, and logout cleanup as Phase 2 backlog items.

## Risks / Trade-offs

- [The Chrome DevTools installability panel was unavailable to the browser automation] → Keep that check explicitly marked manual.
