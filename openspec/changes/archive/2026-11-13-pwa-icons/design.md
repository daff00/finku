## Context

See `proposal.md` for motivation. The manifest now references three PWA icon files and the HTML references the Apple touch icon.

## Goals / Non-Goals

**Goals:**
- Keep SVG as the source of truth and produce exact-size PNG files from a checked-in script.
- Verify actual raster output, especially the kanji and maskable safe zone.

**Non-Goals:**
- Changing app colors, manifest metadata, or update behavior.

## Decisions

- Use Sharp to rasterize a shared SVG mark into the requested PNG dimensions.
- Use a CJK-capable system font in the SVG source, then inspect the generated pixels visually. If the glyph is absent or substituted, replace the text with an SVG path before accepting the assets.
- Keep the mark small enough to fit inside the centered 80% maskable zone while retaining a full-bleed background.

## Risks / Trade-offs

- [The SVG font fallback can differ by machine] → Use a CJK-capable font family first and visually verify the generated asset in the target environment.
