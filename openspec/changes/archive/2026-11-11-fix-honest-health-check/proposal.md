## Why

The health endpoint currently reports the database as connected without contacting it. This can cause deployment health checks to keep an instance marked healthy while its database is unavailable.

## What Changes

- Execute a real `SELECT 1` database probe before reporting healthy.
- Return HTTP 503 with an unhealthy database status when the probe raises a SQLAlchemy database error.
- Test both healthy and unavailable database responses.

## Capabilities

### New Capabilities

- `database-health`: Define liveness reporting that verifies database connectivity.

### Modified Capabilities

None.

## Impact

- `backend/app/main.py`
- Backend health-check tests
- Deployment health-check consumers
