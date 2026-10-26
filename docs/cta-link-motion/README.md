# Pixel CTA, link motion and native cursors

The CTA arrow travels once through a clipped, two-copy slot. A stepped fill reveals behind the existing label. Mouse leave reverses the transitions from the current position, including interrupted hovers. Keyboard focus uses the same treatment and a contrasting outline. Press scales to 0.97 and nudges the icon slot 2px.

Text links draw a 2px dashed pixel underline and move the arrow 5px in three steps. The horizontal and -45-degree options were captured in `link-horizontal.png` and `link-rotated-comparison.png`; horizontal is retained because the small arrow stays clearer and matches the label's reading direction. Unclassed paragraph/list/blockquote links use a lighter solid 2px underline reveal.

The existing iconless Send an email button stays iconless and receives the secondary wipe and orange border. No label nudge or trail was added: the arrow and fill carry the feedback while transitions remain reversible. The optional terminal block cursor was omitted; pixel hand is the default. No portrait scripts changed.

## Tuning

The custom properties at the beginning of the new block in `src/styles/global.css` control:

| Property | Default |
| --- | --- |
| `--motion-in` | 420ms |
| `--motion-out` | 250ms |
| `--motion-steps` | 5 |
| `--link-steps` | 3 |
| `--link-travel` | 5px |
| `--arrow-travel` | 200% of the icon slot |
| `--press-scale` | 0.97 |
| `--press-arrow` | 2px |

## Cursors

`public/assets/cursors/` contains crisp SVG, 32px PNG fallback and 64px @2x reference exports. CSS uses the SVG then 32px PNG so the loaded cursor stays within the browser's size limit. Hotspots: arrow (3,2), hand (10,2), I-beam (12,12). Only hover-capable fine pointers receive these cursors. Existing inline `cursor:none` on the portrait canvas takes precedence. Reduced motion retains the static cursors.

## Evidence

- `hover-states.webm` / `hover-states.gif`: primary, secondary and text link hover, leave, interruption and focus attempts.
- `cursor-states.gif`: enlarged asset preview on light/dark surfaces. Browser video capture excludes the OS cursor; computed cursor selection is recorded in `accessibility.json`.
- `*-hover.png`: settled hover states. `home-*-*.png`: viewport samples after scrolling through controls, including the footer.
- `verification.json`: 30 route/viewport/theme combinations: Home, About, Projects, Contact and Services at 1440px, 1024px and 390px in light/dark. Every visible action/text link was hovered; width/height stayed stable. No page errors were captured.
- `accessibility.json`: focus-visible outline, reduced-motion transforms and zero wipe duration, native cursor URLs, portrait canvas cursor and input cursor.
- Production build: 14 routes passed. `git diff --check` passed.

Verification used installed Chrome. Safari/Firefox and a physical Retina cursor check remain unverified. The reduced-motion wipe resolves instantly to its final color; no movement plays. Touch retains native cursors.
