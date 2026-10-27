# Satin orbit refinement · 2026-10-27

Procedural rounded strokes and a continuous beveled cursor replace the flat box glyphs. The exact orange and muted green remain material base colors. An icon-only layer receives a warm upper-left key, soft cool fill and material-local ambient SH; the self-illuminated portrait and unlit dotted ring receive no new lighting. No model, reflection texture, shadow pass or dependency was added.

Icons and ring write depth before splat compositing. Stable screen-space opacity coverage preserves per-pixel occlusion through the home fade, without treating a transparent glyph as one sortable surface. Fade duration, slight scale, counter-orbit, heights, drift, tilt and reduced-motion behavior are preserved. Fine-pointer desktops with at least eight reported hardware threads and no Save-Data can use DPR 2; touch/mobile and other clients retain the 1.5 cap. This is a conservative device heuristic, not a hardware benchmark.

Mobile About top padding is now 20px, matching its side gutters (user review follow-up); desktop stays 57px.

Verified in local Chrome against the production build:

- Direct `/about` load and Home → About through the nav menu: portrait visible, one PlayCanvas app.
- Home About reveal and return-to-top hide; opacity reaches 1/0 as expected.
- Portrait auto-rotation and dragging, offscreen orbit pausing, on-demand rendering.
- Reduced motion: still orbit and synchronous show/hide; touch rendering capped at DPR 1.5.
- Icon lights on/off with frozen portrait and hidden decorations: identical screenshot bytes.
- Light/dark visual review; mobile 3D activation; 390/540/768px spacing and unchanged 1440px spacing.
- Production build: 56 routes. `git diff --check` passes. Existing Vite public-asset placeholder warnings remain.

Matched comparison captures below freeze the same portrait angle and orbit pose. The before captures substitute the environment from main (`e735de2`); after uses this branch. Images are review evidence only and are not site assets.

| Light before | Light after |
| --- | --- |
| ![Before, light](before-light.webp) | ![After, light](after-light.webp) |

| Dark before | Dark after |
| --- | --- |
| ![Before, dark](before-dark.webp) | ![After, dark](after-dark.webp) |

![Mobile after: matching top and side padding](mobile-after.webp)
