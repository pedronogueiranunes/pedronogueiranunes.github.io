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
