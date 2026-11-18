## Context

See proposal.md for the motivation. Backend logging always installs a console sink and can optionally install a rotating file sink; the file sink setup currently may raise `PermissionError`.

## Goals / Non-Goals

**Goals:**
- Keep the console sink active when file logging setup fails.
- Make the fallback observable without hiding the filesystem error.

**Non-Goals:**
- Changing normal logging formats, rotation policy, or request logging.

## Decisions

- Catch filesystem `OSError` only around file-sink setup and emit a warning through the already-configured console logger. Do not catch failures adding the console sink itself.
- Test an unwritable log directory by simulating `PermissionError` from directory creation and verify setup returns with only the console sink.

## Risks / Trade-offs

- [File logs may be absent when permissions are wrong] → Emit a warning and preserve application operation via the existing console sink.
