# Follow-up corrections — 2026-10-26

## Navbar and theme

- Figma hover variants: Projects 31:59; About 32:132; Experiments 32:198; Thoughts 32:262. Prototype reactions specify Smart Animate, ease-in-out, 400 ms; motion-context has no keyframe tracks.
- Actual 1440px computed panels: Projects 760×480, About 453×527, Experiments 453×503, Thoughts 453×478. All begin at x438.5/y113, matching the exports.
- Projects rows use Manrope 700 24/30; compact rows 700 20/28; numbering uses Silkscreen 12/16. Mobile rows use Manrope 700 18/27, summaries 700 32/38.
- Light/Dark/Auto exercised through visible text labels. Light produces rgb(255,255,255), Dark rgb(30,30,30), selection remains open, and Light survives reload. Mobile Dark→Light label clicks also pass.
- ArrowDown focuses the first row; Escape closes and restores the parent link. Closed panels are inert and only one panel opens at once. A 44px invisible target preserves the visual pill.
- At the user's 1135px width, Projects spans x286–1046 without page overflow. Mobile page and dialog fit390px; focused Light row uses rgb(182,54,10), preserving contrast.
- Hover event bindings and 400ms CSS transitions are inspected in source; static captures do not measure pointer frame pacing. Reduced-motion rules disable navigation transitions.

## Single travelling portrait

- One existing PlayCanvas canvas moves from the hero into the About slot. The separate About image is removed. No duplicate renderer, asset or portrait image is introduced.
- Scroll movement interpolates position, width and height from stable layout slots. The model rotates from yaw−60 (left-facing profile) to yaw30, then remains fixed facing the copy. Drag and keyboard offsets fade away on arrival.
- Actual desktop final stage equals destination: x40/y25, 663×634; pose1 and renderer ready. Reverse scrolling changes pose1→0.4269→0; stage at0 equals origin (560×720).
- At390px, final stage equals destination (339×395), pose1, with no horizontal page overflow. The loaded 3D model reflows correctly.
- Desktop Light/Dark and mobile rendered screenshots verified. Mobile engagement-based loading is preserved. Source inspection confirms reduced motion uses two still placements and the existing fallback remains available on load failure; those environment variants were not re-emulated during this follow-up.

## Checks and evidence

- Production build:14routes, pass.
- Astro check:35files,0errors,0warnings,0hints (cached checker).
- Navigation detector:0findings; git diff --check passes.
- Captures: `.impeccable/review/nav/` and `.impeccable/review/portrait/`.
- Independent scoped review: `docs/corrections-review.md`; prior navbar findings retained in `docs/nav-review.md`, both resolved by the final review.

## Later hero refinements

User requested the supplied left-facing profile as the starting pose and a 90% reduction of Dark hero lettering opacity. HERO_YAW is −60°, BIO_YAW remains30°. Actual initial capture confirms renderer ready/scrollPose0 and lettering computed opacity0.1. Light remains1; Auto-dark uses0.1 through its theme media query. Build14routes passes; scoped independent review:ship. Capture: `.impeccable/review/portrait/hero-profile-dark.png`.

## Portrait size and foreground text — supersedes earlier stage dimensions

User reported that the travelling model covered the About heading and requested the published site's scale. Read the actual public page with the browser: at1280×720 its viewport/canvas are640×480; at390 its transformed mobile bounds are416×324.67. The local desktop origin now matches640×480. Its destination is capped at640×480 (or narrower column width), centered within the existing portrait slot. Mobile uses a width that fits the viewport and325pxheight.

Actual ready3D destination: desktop640×480 atx51.5/y104 in663×634slot; at1135 width498×480; at390 width339×325. Captures show readable separate copy and no horizontal overflow. Text stacking: portrait1, hero heading/body/actions2, background lettering2, Aboutcopy2. Pose−60→30, reverse movement andDarklettering10% remain intact. Browser errors:none; production build14routespasses.

Evidence: `.impeccable/review/portrait/smaller-bio-desktop.png`, `smaller-travel-desktop.png`, `smaller-bio-1135.png`, `smaller-bio-mobile.png`. User issue image: `/Users/apple/Desktop/Screenshot 2026-10-26 at 12.41.44.png`.

## Lettering, aspect and stable rendering — supersedes prior layer/interpolation notes

The final order is decorative lettering0, travelling model1, content copy2. Hero lettering uses bottom anchoring with a−0.165em descent trim instead of a fixed top offset; desktop and mobile captures show its painted glyphs touching the clipped panel bottom. Dark opacity remains0.1.

The stage now has fixed source width/height and uses translate plus UNIFORM scale. It fits and centers in the About slot without changing the original aspect. The WebGL buffer uses RESOLUTION_FIXED and observes the static origin, rather than the moving/resizing stage. Initial fallback is retained until postrender.

Actual 1135px browser sequence:10 forward/return states, GPU buffer640×480 throughout, ready=true throughout, visual ratio4/3 throughout; final498×373.5 instead of independently resized498×480. Mobile:buffer350×325; intermediate pose0.522 and final pose1 retain350/325ratio; final339×314.786. One buffer reallocation on a real responsive breakpoint change is expected. Browser errors:none. Build14routespasses; detector0findings.

Evidence: `.impeccable/review/motion-stability/measurements.json`, `mobile-measurements.json`, forward0/2/5 captures, return, final-desktop, dark-edge-desktop, travel-mobile, final-mobile. This confirms constant buffer dimensions and aspect at sampled real scroll states; still images do not measure frame pacing on all hardware.
