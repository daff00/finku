## Context

See proposal.md for the motivation. The frontend is a Vite-built React SPA with a root-scoped PWA service worker and `/api/v1` service paths. Vite 8 supports Node 20.19+ and Node 22.12+; the project does not currently pin a Node version.

## Goals / Non-Goals

**Goals:**
- Keep the browser on one origin for static app, API, and health requests.
- Use an unprivileged static server with explicit cache handling for service-worker-controlled content.

**Non-Goals:**
- Building an API runtime into the frontend image or changing frontend API/service-worker behavior.

## Decisions

- Use `node:22-alpine` for the build stage. Node 22 satisfies Vite 8's supported engine range and is the stable LTS line; avoid inheriting the workstation's Node 25 version.
- Use `nginxinc/nginx-unprivileged:alpine`, listening on its non-root port 8080, with the dist output copied to the stock static root.
- Use exact no-cache locations for app-shell/PWA metadata and a filename-hash regex for immutable asset caching. Avoid blanket caching under `/assets/`.
- Proxy `/api/` and exact `/health` paths to the Compose backend service. Do not configure a general SPA fallback for either backend path.
- Use `/api/v1` as the default `VITE_API_URL` while allowing build-time override.

## Risks / Trade-offs

- [Fingerprint matching could miss a future asset naming convention] → Keep the immutable location restricted to hashed names and test it against actual Vite output.
