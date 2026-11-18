## 1. Shared Theme Control

- [x] 1.1 Move the existing dark-mode control and hook from the sidebar to the app-shell header immediately after the currency toggle; preserve its behavior and styling.
- [x] 1.2 Verify the control appears once in the shared header and remains usable at narrow and wide viewport sizes.
- [x] 1.3 Remove the full Appearance section, including its heading and content, from `frontend/src/pages/settings/index.tsx`.
- [x] 1.4 Verify the Appearance section is absent on mobile and desktop while the app-shell theme toggle remains available.

## 2. Amount Visibility Behavior

- [x] 2.1 Update the global visibility transition to clear section overrides while applying the new global value through the existing persistence mechanism.
- [x] 2.2 Add regression coverage for global toggles overriding prior section settings and for section overrides applied after a global toggle.

## 3. Verification

- [x] 3.1 Run the frontend TypeScript check, production build, and lint; resolve regressions caused by this change.
- [x] 3.2 Verify both global visibility directions and subsequent per-section overrides against the dashboard display-controls scenarios.
