# Portrait size and layer review

Disposition: ship

## persistence
Reviewed the user's `/Users/apple/Desktop/Screenshot 2026-10-26 at 12.41.44.png` first. It demonstrates the actual failure: an oversized portrait obscures the About heading and body. That evidence overrides earlier acceptance. Read the craft floor, portrait CSS, `portrait-travel.js`, and `splat-hero.js`. Opened all four required current captures: `smaller-bio-desktop`, `smaller-travel-desktop`, `smaller-bio-1135`, and `smaller-bio-mobile`.

## fidelity
The current captures resolve the reported failure: the desktop portrait remains in its left column, travel leaves the visible About copy readable, the 1135-wide composition fits, and mobile places the portrait above unobscured text. The supplied measured desktop stage is 640×480, matching the published reference; it is centered in the larger destination slot instead of expanding to fill it. Narrow destinations constrain width (498×480 at 1135; 339×325 on mobile). CSS places portrait at z-index 1 and hero text, lettering, and About copy at 2.

## ceiling
Ship for the requested size and layering correction. The published mobile transformed rectangle is 416×324.67; the current 339×325 destination deliberately fits the available column while retaining the reference height. This is appropriate responsive containment, not a claim of identical mobile width. Browser measurements, clean logs, and the 14-route build result were supplied by the implementing agent; this review independently inspected the source and saved images, without browser execution.

## material_fixes
None remaining within this review's scope. Keep the desktop 640×480 ceiling and centered destination calculation; reverting to full-slot dimensions would reproduce the user's complaint. Do not reopen unrelated page styling or substitute a Figma target for the user's published-site size instruction.

## keep
Preserve fallback imagery, current layout, and lazy loading. Preserve the left-profile hero yaw (-60), fixed final About yaw (30), reversible scroll pose, and dark lettering opacity 0.1. Preserve foreground copy layering during travel.
