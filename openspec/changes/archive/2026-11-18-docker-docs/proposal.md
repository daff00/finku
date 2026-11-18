## Why

The deployment is now implemented, but the project guides still describe Docker Compose as deferred or unavailable. Operators need accurate setup, secret, first-user, backup, restore, update, and remote-access instructions.

## What Changes

- Add a Docker run guide to README with environment setup, first-user provisioning, backups/restores, updates, and the destructive-volume warning.
- Add a root `.env.example` for Compose interpolation with required secret values left blank.
- Move Docker Compose deployment from deferred to done in CLAUDE.md and include run commands.
- Document the single-instance SQLite architecture, migration service, nginx proxy, non-root backend, external secrets, and HTTPS/Tailscale guidance in architecture.md.
- Correct the earlier claim that Compose is not provided.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change only updates documentation and does not change runtime behavior; `skip_specs: true` is set in the change metadata.

## Impact

- `README.md`
- `CLAUDE.md`
- `architecture.md`
- `.env.example`
