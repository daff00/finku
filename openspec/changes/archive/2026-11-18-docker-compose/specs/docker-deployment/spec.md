## ADDED Requirements

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
