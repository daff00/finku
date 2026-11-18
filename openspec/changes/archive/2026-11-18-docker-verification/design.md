## Context

See proposal.md for the motivation. The deployment is a three-service Compose project with a single backend instance, one named SQLite volume, and nginx as the only published service.

## Goals / Non-Goals

**Goals:**
- Verify acceptance behavior on fresh, uniquely named test volumes without touching the operator's data.
- Use an actual browser for service-worker registration and Cache Storage inspection where the environment permits.
- Report each required check with evidence and mark unavailable checks as manual.

**Non-Goals:**
- Change runtime code or alter the deployment specification.
- Remove test volumes or containers belonging to another Compose project.

## Decisions

- Use a unique Compose project name and non-default host port for all test stacks; inspect the named test volumes before starting and never use `down -v` on an existing project.
- Use HTTP requests through nginx for auth, routing, and health checks, and Docker inspection for service counts, port publication, identities, and image contents.
- Use the browser automation tools for PWA behavior; if browser access is unavailable, report the exact browser check as manual rather than inferring it from build output.
- Reuse the repository's backend and frontend commands for test/build evidence and include the backend test count.

## Risks / Trade-offs

- [A host port may already be occupied] → Select a separate test port and abort rather than stopping another process.
- [A browser may retain an earlier origin's worker/cache] → Use the isolated test origin and inspect registrations and Cache Storage there.
- [Image metadata or logs could contain runtime secrets] → Do not print container environment values; inspect only build history and filesystem presence for sensitive files.
