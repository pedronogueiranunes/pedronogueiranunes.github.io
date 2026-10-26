# Navbar finish review

Disposition: **fix**. The requested desktop correction is faithful; one shared hover rule causes a mobile Light-theme contrast regression.

## persistence

Reviewed Navbar.astro, Preferences.astro, relevant global CSS, PRODUCT.md, DESIGN.md, craft-floor.md, supplied Figma exports and all seven required navbar screenshots. No browser used. Live interaction results supplied by the implementing agent cover visible Light-label activation, Dark/Auto, persisted reload, mobile theme selection, ArrowDown and Escape. Source supports those results: label focus no longer prematurely dismisses preferences, radios synchronize, and storage access is guarded.

## fidelity

The desktop correction restores Manrope 700 rows at 24/30 in Projects and 20/28 in compact menus, with Silkscreen 12/16 numbers. Projects is 760×480; About, Experiments and Thoughts retain their distinct 453px-wide vertical compositions and measured 527/503/478 heights. Screenshots show no clipping at 1440 or 1135 and a readable mobile stack at 390. CSS follows the supplied authoritative hover variant's 400ms ease-in-out timing and removes transitions for reduced motion. Static captures cannot independently establish animation quality. Orange focus outlines in these captures are keyboard states, not unexpected borders.

## ceiling

The pinned Current Figma is the visual ceiling for this correction. No new concept, layout, feature imagery or copy is warranted. Intentional placeholder thumbnails/text and unavailable CV remain editorial limitations. This review does not certify the rest of the site or hidden Figma content.

## material_fixes

- **P2 — Mobile Light hover/focus contrast:** `.nav-row:hover, .nav-row:focus-visible` applies desktop peach `#ff8c66` to mobile rows on cream `#f5f1ea`, about **2.03:1**. At mobile row size 18px/700 this fails 4.5:1. Add a scoped mobile hover/focus override using `var(--accent-ink)`; retain peach on dark desktop panels. Verify the mobile Light focused row after the change.
- Desktop `.nav-link` now has a 16px resting height, replacing the prior 44px target. Preserve the exact visible Figma pill while extending the link's invisible hit region to meet the recorded 44px target constraint. Ensure adjacent hit regions do not overlap.

## keep

Keep exact menu dimensions, compact vertical order, font roles, per-menu feature composition, authored arrow asset, contrast-adjusted desktop peach, mutually exclusive panel state, `inert` closed content, visible focus, Escape/ArrowDown access, guarded theme persistence and reduced-motion handling. No rebuild or wholesale recapture is needed; capture the affected mobile focus state after the small fixes.
