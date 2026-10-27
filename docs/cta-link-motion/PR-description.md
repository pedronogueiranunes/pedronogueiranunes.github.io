# Add stepped CTA and link motion with native pixel cursors

Adds pixel-stepped CTA feedback and lighter text-link motion while preserving resting copy, layout and colors. Native pixel arrow, hand and I-beam cursors are limited to fine hover pointers. Portrait scripts remain untouched.

Files: Button.astro (two arrow copies and label wrapper), global.css (appended motion/cursor rules), public/assets/cursors/ (SVG, PNG and @2x exports), docs/cta-link-motion/ (evidence and notes).

Tuning: 420ms entrance, 250ms exit, five steps; link arrow 5px in three steps; press scale 0.97 and arrow nudge 2px. All values are CSS custom properties at the start of the new block.

Decisions: retained horizontal text arrows after comparing a -45-degree rotation; kept Send an email iconless; omitted optional trail, label nudge and terminal cursor. Pixel hand remains default.

Validation: production build passes 14 routes. Thirty combinations across five routes, three requested widths and both themes keep control dimensions stable with no captured page errors. Chrome checks cover focus-visible, reduced-motion transforms and zero wipe duration, native cursor selection and portrait canvas cursor. Safari/Firefox and physical Retina cursor rendering remain unverified.

![Hover states](https://raw.githubusercontent.com/pedronogueiranunes/pedronogueiranunes.github.io/feat/cta-link-motion/docs/cta-link-motion/hover-states.gif)

![Cursor asset previews](https://raw.githubusercontent.com/pedronogueiranunes/pedronogueiranunes.github.io/feat/cta-link-motion/docs/cta-link-motion/cursor-states.gif)

Browser recordings exclude OS cursors; the cursor GIF previews the actual assets on light/dark surfaces, with computed selection recorded in accessibility.json. Full WebM and decisions are in docs/cta-link-motion/.

Do not merge until Pedro approves.
