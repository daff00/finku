# docker-deployment Specification

## Purpose
Defines the production container and deployment behavior required to run Finku privately on a home server with SQLite data kept outside the image.

## Requirements

### Requirement: Backend production image runs safely
The backend production image SHALL run the API as a non-root user using the production ASGI server, expose the API on container port 8000, and provide a healthcheck against `/health`.

#### Scenario: Backend image starts
- **WHEN** the backend container starts with valid configuration
- **THEN** it serves the API on port 8000 without a development server or automatic reload

#### Scenario: Backend health is checked
- **WHEN** the backend healthcheck runs
- **THEN** it requests the local `/health` endpoint and reports healthy only when the endpoint succeeds

#### Scenario: Container identity is non-root
- **WHEN** the backend process runs in the production image
- **THEN** its effective user is not root and it can write to `/data`

### Requirement: Backend image keeps user data and secrets external
The backend image SHALL not contain the SQLite database, local environment secrets, or local development artifacts. Its default production logging SHALL write to stdout/stderr unless an explicit writable log file is configured.

#### Scenario: Database is mounted at runtime
- **WHEN** the backend runs with `/data` mounted
- **THEN** SQLite can be opened from the configured database URL without storing the database in the image

#### Scenario: Production logging defaults to container output
- **WHEN** production logging has no file path configured
- **THEN** application logs remain available through container output without attempting to write to the source directory

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

### Requirement: Compose runs one SQLite backend behind the frontend
The deployment SHALL run a single backend instance, keep its SQLite database on a named volume, and expose only the frontend service to the host.

#### Scenario: Stack starts with persistent SQLite storage
- **WHEN** the deployment starts
- **THEN** the backend uses the named `/data` volume for SQLite and the frontend is the only service published to the host

#### Scenario: Backend is not published to the host
- **WHEN** the stack is running
- **THEN** the backend port is reachable to internal services but not published as a host port

#### Scenario: Backend is not scaled beyond one instance
- **WHEN** the deployment is operated for SQLite
- **THEN** exactly one backend instance serves the database volume

### Requirement: Database migration gates backend startup
The deployment SHALL run schema migrations in a one-shot service before starting the API, and SHALL NOT start the API if migrations fail.

#### Scenario: Migrations complete successfully
- **WHEN** the migration service exits successfully
- **THEN** the backend service is allowed to start

#### Scenario: Migrations fail
- **WHEN** the migration service exits unsuccessfully
- **THEN** the backend service does not start

### Requirement: Production deployment requires strong secrets
The deployment SHALL fail fast when required secrets are unset, and the backend SHALL refuse production startup when any required secret is empty or a known placeholder.

#### Scenario: Compose secret is unset
- **WHEN** a required secret is unset during Compose configuration
- **THEN** Compose reports an explicit configuration error before starting the stack

#### Scenario: Production secret is empty or a placeholder
- **WHEN** the backend is configured for production with an empty or known-placeholder secret
- **THEN** settings validation fails and the API does not start

#### Scenario: Production secrets are configured
- **WHEN** all required production secrets are non-empty and non-placeholder
- **THEN** the backend can load its production settings

### Requirement: Proxy forwarding supports client-IP rate limits
The reverse proxy SHALL forward the originating client address to the backend, and the backend ASGI server SHALL trust proxy headers only as configured for the private proxy network.

#### Scenario: Request arrives through nginx without authentication
- **WHEN** an IP-limited request reaches the backend through nginx
- **THEN** its rate-limit key uses the forwarded client address instead of treating all users as the proxy

### Requirement: First user is provisioned through the protected registration API
The deployment instructions SHALL create the first user through the existing admin-key-protected registration endpoint and SHALL NOT seed production data.

#### Scenario: Administrator provisions the first user
- **WHEN** an administrator submits registration through the nginx-published origin with the configured admin key
- **THEN** the application creates the user without exposing the backend port or running seed data

### Requirement: SQLite backups are consistent and retained
The deployment SHALL create backups through SQLite's online backup API while the backend may be writing and SHALL retain timestamped backup files, keeping seven by default.

#### Scenario: Backup runs while the application is active
- **WHEN** an operator starts a backup using the deployment scripts
- **THEN** a timestamped consistent database copy is saved outside the container and only the newest seven are kept unless configured otherwise

### Requirement: Restore replaces SQLite data only while the backend is stopped
The deployment instructions SHALL require stopping the backend before restoring a database file into its persistent volume and SHALL describe restarting and verifying the restored service.

#### Scenario: Operator restores a backup
- **WHEN** an operator selects a backup to restore
- **THEN** the backend is stopped before the database file is replaced, and the service is restarted and checked afterward
