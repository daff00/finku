## Context

See `proposal.md` for motivation. The service worker plugin already emits a starter manifest, and the HTML currently links to the SVG favicon.

## Goals / Non-Goals

**Goals:**
- Keep install identity in the plugin-generated manifest and platform-specific metadata in the document head.

**Non-Goals:**
- Generating or rasterizing icon assets, which is the next PWA step.

## Decisions

- Keep the requested values centralized in the PWA plugin `manifest` option so the emitted manifest is the source of truth.
- Point the Apple touch icon link at the requested PNG path; the following icon step provides the file.
- Retain the existing favicon link and use the exact theme value in both manifest and HTML metadata.

## Risks / Trade-offs

- [Manifest icon files are produced by the next step] → Keep icon URLs stable and complete the files before final verification.
