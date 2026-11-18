## Context

See `proposal.md` for motivation. The frontend is built as a static Vite bundle with a generated service worker and manifest.

## Goals / Non-Goals

**Goals:**
- Check output artifacts and browser-observable service-worker behavior in production preview.
- Report any environment-limited checks as manual rather than claiming success.
- Correct a build-plugin precache mismatch only when needed to satisfy the existing static-only policy.

**Non-Goals:**
- Changing service-worker caching, API behavior, or app UI.
- Testing backend endpoints or handling offline UI.

## Decisions

- Use the production preview, not the Vite development server, because the service worker is part of the production build.
- Use browser automation for page, cache, service-worker, and update-flow checks; reserve Chrome DevTools-specific installability details for manual verification if unavailable.
- Change a visible label only for the update-flow test and restore it before final verification.
- If the PWA plugin adds its generated web manifest to the precache beyond the configured extension allowlist, filter that entry through its manifest-entry extension hook.

## Risks / Trade-offs

- [Browser automation may not expose DevTools' installability diagnostics] → Report those exact checks as manual instead of inferring them from a valid manifest.

## Manual Verification Needed

Use Chrome DevTools > Application to confirm the browser reports installability with no manifest diagnostics. Browser automation confirmed that the manifest parses and each manifest icon loads, but does not expose the DevTools installability panel.
