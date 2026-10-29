# Graphics performance audit · 2026-10-29

Only the active v1 repository was used. Baseline HEAD: 68b632b, branch main. No tracked modifications existed initially; all seven untracked fonts/PDF files were preserved. Local changes only; no commit, push or deployment.

## Implemented and verified

1. DitherIcon caches source alpha and tone in Float64 arrays when the source is sampled. The draw loop retains all original equations, resolution, palette, cadence, pointer response, reduced-motion logic and visibility lifecycle. Double precision avoids threshold changes. Seven alternating warmed Node runs, 200 frames each, 256×256 synthetic RGBA input: median 0.6374 → 0.4610 ms/frame (27.7% less CPU calculation). Forty combinations of tone flags and phase yielded byte-identical RGBA buffers. This is a kernel benchmark, not a browser/GPU or whole-page speedup. Additional memory is 16 bytes per source pixel (1 MiB at 256×256), plus setup work; a deliberate bounded CPU/memory tradeoff.
2. Home's dither source PNG was recompressed with sharp, palette:false, compressionLevel:9, adaptiveFiltering:true. Original retained. 1,281,943 → 1,055,606 bytes, saving 226,337 bytes (17.7%). All decoded RGBA bytes match. Chrome canvas resampling at 128/196/240/256/400 square pixels also matches byte-for-byte. WebP and quantized PNG experiments were rejected after canvas differences; neither is referenced or shipped.

## Current-state audit

- Footer planet: existing precomputed unit vectors and colors, 30 Hz target, DPR capped at 2, visibility threshold 0.4 and hidden-tab/reduced-motion stopping. Preserved; no measured reason to lower density or cadence. Main-thread footer samples below are ~89–234 ms of task time per 1.5 seconds in baseline. These include all page work, not just the planet.
- Portrait and orbit: PlayCanvas loads on Home and About only in the seven tested routes. The SOG head is 2,682,618 bytes; engine 574,977 bytes. Home total observed encoded resources ~5.04 MB desktop/~4.83 MB mobile. Shared 45 Hz ambient clock, on-demand render requests, viewport gates, fixed origin-sized drawing buffer and cleanup already exist. Preserved original splat, orbit and drag behavior. Actual current source eagerly schedules the portrait at idle on mobile too; engagement-only behavior described in PRODUCT.md is not the current implementation. Changing it was left for a separate decision.
- CategoryGlyph: Projects only, 256² canvas, target 32 Hz, readback context, visibility/hidden/reduced-motion guards and fallback. Baseline Projects top samples show stable display RAF. Preserved geometry, dithering and transition.
- DitherIcon: Home, Projects, Services, About; image-derived arithmetic was repeating per active frame. This is the only rendering algorithm changed.
- IconWaves: hover/focus effects and mobile growth auto-animation already gated by visibility and motion preferences. Unchanged.
- ResearchRobot and BlueprintPixels: Services only, 96² robot render surface in tested viewport, capped loops with visibility/hidden/reduced-motion guards. Unchanged.
- PixelTrail: separate static dots canvas and transient trail; loop ends when cells expire. Unchanged.
- Project previews: responsive lazy WebP covers already used; full original case imagery is not assumed to be transferred on list pages. The largest Home-specific ancillary image was the dither PNG actually present in the resource list, now recompressed.
- CSS/GSAP: pointer glows, scroll previews, reveal/travel and lifecycle cleanup inspected. No blanket will-change, resolution reductions or removal of effects introduced.

## Measurements

Production Astro preview, Chrome headless, desktop 1440×1000 DPR1 and mobile emulation 390×844 DPR3/touch. Seven representative English routes, fresh context per page. Wait 2.5s after navigation, sample 1.5s at top; scroll footer into view, wait 0.5s, sample 1.5s. CDP Performance TaskDuration is main-thread task time, not CPU percentage. RAF intervals >25ms are a missed-frame proxy, not actual GPU dropped-frame counters. Resource sizes are encodedBodySize at the initial sample; lazy images loaded after scrolling are not included. Local server is not production network/CDN and no throttling was applied.

Before/after-cache task ms per sample and count of RAF intervals >25ms:

| Route | Viewport | Top before / after | Footer before / after | >25ms before / after |
|---|---|---:|---:|---:|
| / | 1440×1000 | 255.8 / 110.8 | 230.5 / 136.7 | 1 / 0 |
| /about | 1440×1000 | 151.0 / 84.4 | 89.3 / 88.3 | 0 / 0 |
| /projects | 1440×1000 | 195.7 / 150.5 | 147.9 / 132.4 | 0 / 0 |
| /services | 1440×1000 | 100.8 / 105.1 | 105.8 / 105.1 | 1 / 0 |
| /contact | 1440×1000 | 58.5 / 89.8 | 110.5 / 113.3 | 0 / 0 |
| /work/bsa-legal | 1440×1000 | 109.4 / 122.8 | 128.8 / 128.1 | 0 / 0 |
| /thoughts/design-system-without-overdoing-it | 1440×1000 | 106.2 / 86.3 | 119.6 / 91.4 | 0 / 0 |
| / | 390×844 | 201.4 / 281.3 | 234.0 / 168.8 | 0 / 1 |
| /about | 390×844 | 104.2 / 112.4 | 151.9 / 150.7 | 0 / 0 |
| /projects | 390×844 | 84.7 / 61.9 | 154.6 / 145.5 | 0 / 0 |
| /services | 390×844 | 155.1 / 170.6 | 176.9 / 176.6 | 0 / 0 |
| /contact | 390×844 | 63.2 / 64.1 | 152.9 / 113.9 | 0 / 1 |
| /work/bsa-legal | 390×844 | 75.6 / 75.7 | 82.2 / 126.7 | 0 / 0 |
| /thoughts/design-system-without-overdoing-it | 390×844 | 46.1 / 34.8 | 144.6 / 141.0 | 0 / 0 |

Both passes mostly delivered 90–92 RAF callbacks per ~1.5s. Zero JS page errors in all 28 page visits. Page-wide task timing is noisy, moves both ways, and does not establish a causal CPU improvement. The early after-cache pass overlapped visual captures, adding another confound. No whole-site FPS improvement is claimed. The reliable gains are the isolated arithmetic reduction and the exact asset byte saving.

## Visual and behavior validation

Full-page reduced-motion Chrome captures of Services and About were pixel-identical before/after in both sizes. Projects differences were confined to the first project preview image (desktop bounds x92–456/y891–1141; mobile x40–349/y846–1054); visual inspection shows the same cover and composition. That region is outside the changed code. Do not claim complete screenshot equality for Projects. Source image comparisons and kernel equality provide stronger evidence for the exact modified effects than these timed page captures. Capture code is available in the associated session; no full animated perceptual certification is claimed.

Build: 56 routes. i18n check: 42 translated routes. TypeScript --noEmit and git diff --check passed. No content, controls, focus semantics or motion gates changed.

## Limits and deferred options

No physical low-end Android/iPhone, Safari run, battery/power measurement, GPU hardware counters, interaction latency/INP, field CWV or repeatable throttled load-time/LCP comparison was collected. The RAF proxy cannot certify WebGL's internal render rate. No claims about Lighthouse score improvement or universal fidelity follow from these samples. Canvas input is identical at tested sizes; motion and antialiasing across all hardware remain outside this check.

Potential perceptible tradeoffs, not implemented: reduce portrait/orbit cadence or DPR; reduce planet point density; substitute static imagery; require engagement before mobile 3D. Each changes the experience and requires user choice. Preserve the existing effects unless real-device traces justify those tradeoffs.

Reproduction scripts use the session's installed Playwright/Chrome paths and preview port 4322; update those paths if moving machines. Run benchmark-dither.cjs for exact RGBA parity and warmed timings; measure-pages.cjs with a label for page samples; compare-image.cjs for actual browser PNG resampling parity.

## Final Home resource verification

After the final PNG build: desktop 5,041,307 → 4,815,030 encoded bytes; mobile 4,830,852 → 4,604,575. Net saving 226,277 bytes per sampled visit (asset saves 226,337; JS increases 60 bytes). Request counts unchanged at 51/42. Final Home samples: 91 RAF callbacks in each top/footer window, no >25ms intervals, no JS page errors. Main-thread task time did not show a reliable whole-page reduction. See final-home.json.
