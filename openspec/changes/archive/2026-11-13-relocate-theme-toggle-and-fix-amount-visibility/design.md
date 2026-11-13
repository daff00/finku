## Context

See `proposal.md` for motivation and `specs/dashboard-display-controls/spec.md` for the user-visible contract. The current theme control is attached to the sidebar, while the app shell owns the shared header and currency control. Amount visibility combines a global value with optional per-section overrides; section overrides currently take precedence.

## Goals / Non-Goals

**Goals:**
- Keep the existing theme hook and control behavior while relocating its UI ownership to the shared app shell.
- Remove the redundant Settings Appearance section because the shared header theme control is available on all viewports.
- Make global amount visibility a decisive setting by removing stale section overrides when it changes.
- Keep section-level customization available after a global change and preserve the existing storage mechanism.

**Non-Goals:**
- Change theme persistence, styling, or toggle semantics.
- Change which amount sections exist or add new visibility controls.
- Change storage scope or introduce a new persistence mechanism.

## Decisions

- **Render the existing theme control adjacent to the currency control in the app-shell header.** Reuse the existing control and dark-mode hook rather than creating a second theme implementation. Remove the sidebar-owned control so there is one shared control; this also keeps the control available wherever the app shell header is rendered. An alternative is to keep a duplicate in the sidebar, but that would expose redundant controls and risk inconsistent layouts.
- **Remove the full Settings Appearance section.** The app-shell header provides the theme toggle on mobile and desktop, so retaining the section heading or container would be redundant. Remove the section rather than applying responsive visibility rules to its toggle; the shared control remains the single theme entry point.
- **Clear section overrides when global visibility changes.** Set the global value to its inverse and reset the overrides to an empty map in the same state transition. This ensures every section immediately follows the newly selected global value. Retaining overrides would contradict the global action; recalculating individual overrides would add state without benefit. Section controls can create overrides again afterward.
- **Preserve existing persistence and state shape.** Store the updated global value and cleared overrides through the current mechanism, avoiding a migration and keeping current session behavior.

## Risks / Trade-offs

- [Existing section preferences are cleared when the global control is used] → This is intentional: using the global control means all sections should follow the newly chosen state. Users can restore individual preferences afterward.
- [Moving the control may affect narrow-header spacing] → Keep the existing app-shell header layout and verify the control remains usable at supported viewport sizes.
- [Removing the section could affect Settings page spacing] → Verify the surrounding sections render correctly after its removal at mobile and desktop widths.

## Migration Plan

No data migration is required. Existing stored overrides remain until the user next changes the global visibility control; that action clears them as part of applying the global setting. Rollback consists of restoring the control to the sidebar and the prior global-toggle behavior.
