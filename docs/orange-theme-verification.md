# Figma orange correction — 2026-10-26

## Authority and final behavior

User supplied two CTA screenshots:13.02.18 shows the rejected rust shade;13.03.43 shows the desired Figma orange. Fresh Figma reads confirm Foundations `color/accent/primary` (VariableID:2:7) is #FF5A1F in both Dark (2:0) and Light (2:1). Node488:7974 CTA also uses #FF5A1F with white text. Theme surfaces change; the authoritative primary orange is shared across modes.

`--accent-ink` and `--action-bg` now alias `--accent`. Fixed rust and peach UI accent overrides were replaced with shared tokens across logo, nav features, icons, headings, project overlays, featured badges, filters, offer links, CTA panels and choice pills. Semantic error/success colors and exported artwork are retained.

Hover uses88%accent+12%white, active uses88%accent+12%#232625. These are implementation interaction derivations, not claims of separately authored Figma variants. Secondary buttons and the intentionally dark sidebar button retain local fill roles; disabled controls skip hover/active styling.

## Verification

- Actual rendered Home header/hero CTA and logo:rgb(255,90,31).
- Contact Light/Dark/Auto: header CTA, form CTA and logo allrgb(255,90,31); surfaces switch correctly. Auto followed the host's Dark scheme in this run.
- Native pointer hover confirmed `:hover=true`, settled `color(srgb 1 0.430588 0.22698)` (derived hover). A native held click sampled `:active=true`; recorded colors were during the transition, not a settled active-state assertion.
- Services eyebrow, offer link and header CTA; Projects featured badge and CTA panel; mobile Home CTA and logo use the shared orange.
- Production build14routes passes; detector0findings; gitdiffcheck passes. Scoped independent review:ship (`docs/orange-theme-review.md`).

Captures and observations: `.impeccable/review/orange/`. The native hover capture contains browser focus/selection decoration; base-color authority is the computed CSS and normal Light captures.

## Earlier contrast reports

The prior contrast-specific rust/peach policy is superseded by the user's explicit exact-Figma-color request. Earlier Lighthouse/axe/contrast results are historical evidence, not a fresh accessibility certification for these replacement colors. This correction reports visual fidelity and state consistency.
