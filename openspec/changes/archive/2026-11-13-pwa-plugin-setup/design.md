## Context

The frontend is a React SPA built by Vite. Its configured API URL is supplied by `VITE_API_URL`; the service worker must not be used as a data cache.

## Goals / Non-Goals

**Goals:**
- Generate a service worker with a narrow, build-time asset allowlist and SPA navigation fallback.
- Retain prompt-based update behavior rather than auto-reloading active forms.

**Non-Goals:**
- Runtime caching, offline financial data, Background Sync, or mutation queuing.
- User-facing update controls, which are delivered by the separate update-prompt step.

## Decisions

- Use `vite-plugin-pwa` with `registerType: 'prompt'`; auto-update could reload a page while a transaction is being edited.
- Restrict Workbox precaching with explicit asset extensions and configure no runtime caching. This avoids broad network strategies accidentally caching API data.
- Use `/index.html` as the navigation fallback and deny `/api` paths so deep links work without rewriting API navigation.
- Define a minimal manifest alongside plugin setup so the build emits `manifest.webmanifest`; its full product metadata and icon list are completed in the manifest step.

## Risks / Trade-offs

- [An asset extension allowlist can omit future static formats] → Keep the list explicit and extend only for reviewed app-shell assets.
- [Deployments below a URL subpath may require a different scope] → This phase targets root-hosted deployment as specified.
