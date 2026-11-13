## ADDED Requirements

### Requirement: PWA icons use the Finku mark and maskable safe area
The frontend SHALL serve 192x192, 512x512, and 180x180 PNG icons with a centered white `金` mark on `#C0392B`. The 512x512 maskable icon SHALL have a full-bleed red background and keep the mark within the centered 80% safe zone.

#### Scenario: Standard and Apple icons are available
- **WHEN** an install surface requests a configured PWA icon
- **THEN** the 192x192, 512x512, and 180x180 PNG assets load with the centered Finku mark

#### Scenario: Maskable icon survives launcher cropping
- **WHEN** a platform crops the maskable icon to its safe zone
- **THEN** the full-bleed background remains red and the complete `金` mark remains visible
