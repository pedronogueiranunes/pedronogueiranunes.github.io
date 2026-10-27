# Pixel page and theme transitions

## Behavior and files

- `src/layouts/Base.astro`: Astro ClientRouter (`fallback="swap"`), named main region, before-paint theme script and curtain snapshot source. Astro's route announcer remains enabled.
- `src/scripts/transitions.ts`: native theme transition, precomputed square-cell contours, diagonal curtain, reverse sweep on history back, theme preservation before swap and focus without changing restored scroll.
- `src/styles/global.css`: transition tokens near the existing root theme variables; transition rules at the end. Native group resizing animations are disabled. Only clip-path, opacity and transform animate.
- `Navbar.astro` / `Footer.astro`: persisted chrome. Header, logo and navigation snapshots sit above the curtain; the mobile dialog also persists and closes on navigation.
- `Preferences.astro`: existing Light / Dark / Auto choices and localStorage key retained, with small pixel icons and three-step feedback.
- `page-lifecycle.ts`: initializers run on `astro:page-load`; AbortSignals, observers, animation frames, idle tasks and timers are cleaned on `astro:before-swap`. Applied to preferences, menu, carousel, projects filters, contact form and home portrait. Native FAQ details and CSS lettering animations need no JS initializer.
- `playcanvas-loader.ts`: loads the existing vendor once per browser session. Late imports cannot initialize a detached portrait.
- `splat-hero.js` / `portrait-travel.js`: return teardown functions, call existing interaction cleanup (which removes the drag cursor), release assets, destroy the app and explicitly release its native WebGL context. Portrait rendering, framing, rotation and scroll parameters are unchanged.
- `astro.config.mjs`: hover prefetch for internal links. The curtain starts only after the destination has been fetched and prepared.

There was no home content reveal initializer in the starting revision, so new main content uses the requested short entrance. No new animation dependency was added; the pre-existing navigation GSAP behavior remains in place.

## Tunable values

All are CSS custom properties in `src/styles/global.css`. Values consumed by JavaScript are unitless milliseconds or pixels.

| Property | Default | Purpose |
| --- | --- | --- |
| `--theme-duration` | 550 | Theme milliseconds |
| `--theme-steps` | 12 | Discrete reveal frames |
| `--theme-cell-size` | 24 | Bloom grid pixels |
| `--page-exit-duration` | 160ms | Old content exit |
| `--page-enter-duration` | 240ms | New content entrance |
| `--page-enter-delay` | 160ms | Entrance start |
| `--page-transition-duration` | 400ms | Snapshot lifetime |
| `--curtain-duration` | 300 | Curtain milliseconds |
| `--curtain-delay` | 80 | Curtain start offset |
| `--curtain-steps` | 18 | Discrete curtain frames |
| `--curtain-cell-size` | 48 | Curtain grid pixels |
| `--curtain-color` | #FF5A1F | Curtain fill |

The bloom is a genuine stepped contour built from grid rows, precomputed once per click. It does not use the smooth-circle fallback. `--theme-x` and `--theme-y` are set from the activated theme label's center. Reduced motion swaps instantly with no wipe or mask. Browsers without `document.startViewTransition` also swap instantly.

## Validation (26 October 2026)

- Production build: 14 routes; passed. TypeScript check of the new typed script modules: passed. `git diff --check`: passed.
- [Browser matrix](browser-matrix.json): 108 route/viewport/theme checks across Chrome, Firefox 153 and WebKit 26.5, at 1440×900 and 390×900, light and dark. Covers Projects, About, Contact, Services, a case, a thought, Experiments, Home and the Thoughts anchor. Header DOM identity persisted; no horizontal overflow, theme state resets or stuck curtain; no JavaScript page errors.
- Each engine also exercised forced API absence and reduced motion, plus theme changes through desktop preferences and the mobile dialog. All three tested engines expose the native API and receive the full effect. Unsupported versions receive instant swaps.
- [Interaction checks](interaction-checks.json): Back restored scroll from 700px to exactly 700px; hover requested the contact page; contact initialization worked after two round trips without submitting anything; project filtering worked; first-visit Auto followed a dark system and updated when the system changed to light.
- [Leak check](leak-check.json): Chrome DevTools protocol with forced GC, global listener inventories, DOM counters and heap measurements, plus three Home → About → Home round trips. Every home visit had exactly **one app, one canvas, one drag cursor and one live WebGL context**. Every away sample had **zero** of each. Window/document listener counts matched the baseline on all three returns. No JavaScript errors or excessive-active-context warnings.
- Heap was 10.3MB at the initial home sample and 12.6MB after the third return as image caches warmed. The inspected final heap contained 2 HTML documents and 18 XML/SVG image documents; the larger native document count includes cached SVG resources. Raw memory and DOM counts are retained in the leak report rather than claiming a perfectly flat heap.
- Mid-transition visual inspection confirmed the portrait on both theme snapshots with its transparent background; square edges, forward/back direction and the stationary header were inspected in the included PNGs.
- Firefox reports expected context-lost messages when contexts are deliberately released, plus existing PlayCanvas renderer-info deprecation / texture-upload warnings. There were no JavaScript errors. These vendor warnings are recorded in the matrix.

**Native Safari remains unverified.** Its WebDriver refused the session because Settings → Developer → Allow remote automation is disabled. WebKit testing is complementary engine coverage and is not a claim of testing the Safari application. A native Safari pass is the remaining manual check before approval.

## Recordings and visual evidence

- [Theme switch, both directions](theme.webm)
- [Navigation forward and back](navigation.webm)
- [Bloom toward dark](theme-to-dark-mid.png) / [toward light](theme-to-light-mid.png)
- [Forward curtain](curtain-forward-mid.png) / [back curtain](curtain-back-mid.png)
- Settled desktop/mobile screenshots for all three engines are included beside this document.

Work started from `d062101` in an isolated checkout. The original checkout and its CSS were left unchanged. This branch is for review only; do not merge until Pedro approves.
