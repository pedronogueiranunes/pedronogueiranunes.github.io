# Portrait motion finish review

Disposition: **ship**

Scope: decorative lettering depth and lower edge, portrait blinking during travel, and final portrait proportions. Reviewed the craft floor, both motion scripts, relevant CSS, all eight new motion-stability captures, both measurement files, and prior smaller-bio desktop captures. No browser was operated for this review.

## persistence

The portrait is present in every supplied forward, return, desktop, and mobile capture. Desktop measurements retain a 640×480 GPU buffer and ready=true in all ten sampled states. Source now resizes that buffer only from the static origin, eliminating the scroll-driven surface reset mechanism. Initial fallback survives until postrender. These facts support the fix; sampled stills cannot establish that every temporal frame is blink-free.

## fidelity

Decorative lettering visibly passes behind the model in forward-0, return, dark-edge-desktop, and travel-mobile. CSS puts lettering at 0, model at 1, and content at 2. Visible letter strokes reach the panel’s lower edge in desktop and mobile captures; the descent trim applies at both sizes. Final desktop portrait has natural face and torso proportions; final mobile also reads naturally. The older larger portrait is not a requirement to restore its size.

## ceiling

The original 640×480 desktop stage remains the rendering ceiling. Uniform scale preserves 4:3 across every sampled desktop pose, ending at 498×373.5. Mobile preserves its own 350:325 origin ratio in transit and at 339×314.786 final size. Neither path independently squeezes width and height. The settled model is smaller than the prior captures, but is visibly proportionate and clear beside the About copy.

## material_fixes

No further scoped correction is required by the supplied evidence. The material changes address the actual failure mechanisms: layer order; painted-glyph lower-edge anchoring; fixed drawing buffer and postrender readiness; uniform stage scaling; compositor stabilization. Build, error, and detector results were reported by the implementation agent and were not independently rerun here. Avoid claiming universal frame-by-frame temporal proof from this review.

## keep

Keep the single traveling canvas, reversible travel, −60°→30° yaw, existing dark lettering opacity, bottom fade, fallback/lazy-load behavior, and foreground content priority. Preserve the incumbent page outside these four requested corrections.
