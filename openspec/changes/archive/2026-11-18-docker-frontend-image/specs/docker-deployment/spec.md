## ADDED Requirements

### Requirement: Frontend production image serves the SPA through an unprivileged web server
The frontend production image SHALL serve the built application using an unprivileged web server and SHALL support client-side deep links without returning the SPA shell for API or health routes.

#### Scenario: Root and client-side routes load
- **WHEN** a browser requests `/` or refreshes a frontend route such as `/transactions`
- **THEN** the built application loads successfully

#### Scenario: Frontend image uses an unprivileged server
- **WHEN** the frontend production container serves requests
- **THEN** the web server runs as a non-root user and serves the production build, not a development server

#### Scenario: API and health requests are not SPA fallbacks
- **WHEN** a request targets `/api/` or `/health`
- **THEN** the request is proxied to the backend rather than receiving `index.html`

### Requirement: Frontend nginx proxies API requests with correct headers
The frontend web server SHALL proxy `/api/` requests to the backend service, preserve host and forwarded client/protocol headers, and mark API responses `Cache-Control: no-store`.

#### Scenario: API request reaches backend
- **WHEN** a client sends a request under `/api/`
- **THEN** nginx forwards it to the backend with `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto` headers and does not cache the response

#### Scenario: Health check reaches backend
- **WHEN** a client requests `/health` through the frontend port
- **THEN** nginx proxies that exact path to the backend health endpoint

### Requirement: Frontend static assets use safe cache policies
The frontend web server SHALL prevent stale app-shell, service-worker, manifest, and API responses and SHALL apply long immutable caching only to fingerprinted assets.

#### Scenario: App shell and service worker are revalidated
- **WHEN** a client requests `index.html`, `sw.js`, or `manifest.webmanifest`
- **THEN** the response uses `Cache-Control: no-cache`

#### Scenario: Fingerprinted build assets are cached immutably
- **WHEN** a client requests a fingerprinted asset under `/assets/`
- **THEN** the response uses long-lived immutable caching

#### Scenario: Non-fingerprinted assets are not immutable
- **WHEN** a client requests an asset without a fingerprinted filename
- **THEN** the response does not receive long-lived immutable caching
