// Hover treatment for project cards: the screenshot expands to fill the square
// media frame, then pans from the top of the capture to the bottom in a loop.
// On pointer/focus exit the screenshot returns to its resting inset position.
// The CSS handles the zoom; this module only drives the vertical travel.
const PAN_RATIO = 0.8; // matches the 1.8 image scale in CSS
const HALF_CYCLE = 4500; // ms per direction, so a full loop takes 9s
const ZOOM_MS = 450; // keep in sync with the shot transition
const RETURN_MS = 320;

export function initProjectMediaScroll() {
  const hover = matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const mediaLinks = [...document.querySelectorAll(".project-media")];
  const cleanups = [];
  if (!mediaLinks.length) return () => {};

  for (const media of mediaLinks) {
    const shot = media.querySelector(".project-media-shot");
    const image = shot?.querySelector("img");
    if (!shot || !image) continue;
    let frame = 0;
    let openedAt = 0;
    let offset = 0;

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const easeOut = (t) => 1 - (1 - t) ** 3;

    const pan = (now) => {
      // Holding still for the zoom keeps the first movement from looking jumpy,
      // and the pan distance is measured against the final frame height.
      const elapsed = Math.max(0, now - openedAt - ZOOM_MS);
      const cycle = HALF_CYCLE * 2;
      const t = elapsed % cycle;
      const progress = t <= HALF_CYCLE ? t / HALF_CYCLE : (cycle - t) / HALF_CYCLE;
      offset = progress * PAN_RATIO * shot.clientHeight;
      image.style.translate = `0 ${(-offset).toFixed(1)}px`;
      frame = requestAnimationFrame(pan);
    };

    const open = () => {
      if (!hover.matches || reduced.matches) return;
      stop();
      media.classList.add("is-open");
      openedAt = performance.now();
      frame = requestAnimationFrame(pan);
    };

    const close = () => {
      stop();
      media.classList.remove("is-open");
      if (!offset) {
        image.style.translate = "";
        return;
      }
      const from = offset;
      offset = 0;
      const startedAt = performance.now();
      const back = (now) => {
        const t = Math.min(1, (now - startedAt) / RETURN_MS);
        image.style.translate = `0 ${(-from * (1 - easeOut(t))).toFixed(1)}px`;
        if (t < 1) frame = requestAnimationFrame(back);
        else {
          frame = 0;
          image.style.translate = "";
        }
      };
      frame = requestAnimationFrame(back);
    };

    const onMotionChange = () => { if (reduced.matches) close(); };
    const onHoverChange = () => { if (!hover.matches) close(); };

    media.addEventListener("pointerenter", open);
    media.addEventListener("pointerleave", close);
    media.addEventListener("focusin", open);
    media.addEventListener("focusout", close);
    reduced.addEventListener("change", onMotionChange);
    hover.addEventListener("change", onHoverChange);

    cleanups.push(() => {
      stop();
      media.classList.remove("is-open");
      image.style.translate = "";
      media.removeEventListener("pointerenter", open);
      media.removeEventListener("pointerleave", close);
      media.removeEventListener("focusin", open);
      media.removeEventListener("focusout", close);
      reduced.removeEventListener("change", onMotionChange);
      hover.removeEventListener("change", onHoverChange);
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
