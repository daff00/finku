## Purpose

Defines the production container and deployment behavior required to run Finku privately on a home server with SQLite data kept outside the image.

## ADDED Requirements

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
