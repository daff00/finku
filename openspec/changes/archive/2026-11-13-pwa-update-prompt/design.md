## Context

See `proposal.md` for motivation. The app already uses a single root component for all routes, and `vite-plugin-pwa` is configured with prompt registration.

## Goals / Non-Goals

**Goals:**
- Surface a waiting worker as a small, dismissible, accessible notice outside route-specific pages.
- Call the plugin update API only from the user's explicit update action.

**Non-Goals:**
- Showing an offline-ready notification or adding offline UX.
- Automatically applying updates or changing API/data caching behavior.

## Decisions

- Use the React integration hook from the PWA plugin so update readiness follows the plugin's registration lifecycle.
- Mount the prompt once in the app root, not in an individual page or route.
- Use existing surface, border, typography, and accent tokens with a hairline border and no shadow; dismissing only clears the notice state.

## Risks / Trade-offs

- [The browser may keep a waiting worker after dismissal] → Keep the worker waiting until the user explicitly selects the update action.
