// Hover treatment for project cards: the screenshot expands to the full width
// of the media frame, then the track scrolls from the top of the capture to the
// bottom in a loop. On pointer/focus exit it returns to the resting inset.
// The CSS handles the expansion; this module only drives the vertical travel.
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
    const track = shot?.querySelector(".project-media-track");
    // The preview belongs to the whole card, not only to the media tile.
    const card = media.closest(".project-card") ?? media;
    if (!shot || !track) continue;
    let frame = 0;
    let openedAt = 0;
    let offset = 0;

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const easeOut = (t) => 1 - (1 - t) ** 3;

    const pan = (now) => {
      // The screenshot itself is static while the frame expands; the track's
      // travel is whatever page length it has minus the visible viewport.
      const elapsed = Math.max(0, now - openedAt - ZOOM_MS);
      const cycle = HALF_CYCLE * 2;
      const t = elapsed % cycle;
      const progress = t <= HALF_CYCLE ? t / HALF_CYCLE : (cycle - t) / HALF_CYCLE;
      const distance = Math.max(0, track.offsetHeight - media.clientHeight);
      offset = progress * distance;
      track.style.translate = `0 ${(-offset).toFixed(1)}px`;
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
        track.style.translate = "";
        return;
      }
      const from = offset;
      offset = 0;
      const startedAt = performance.now();
      const back = (now) => {
        const t = Math.min(1, (now - startedAt) / RETURN_MS);
        track.style.translate = `0 ${(-from * (1 - easeOut(t))).toFixed(1)}px`;
        if (t < 1) frame = requestAnimationFrame(back);
        else {
          frame = 0;
          track.style.translate = "";
        }
      };
      frame = requestAnimationFrame(back);
    };

    const onMotionChange = () => { if (reduced.matches) close(); };
    const onHoverChange = () => { if (!hover.matches) close(); };

    card.addEventListener("pointerenter", open);
    card.addEventListener("pointerleave", close);
    card.addEventListener("focusin", open);
    card.addEventListener("focusout", close);
    reduced.addEventListener("change", onMotionChange);
    hover.addEventListener("change", onHoverChange);

    cleanups.push(() => {
      stop();
      media.classList.remove("is-open");
      track.style.translate = "";
      card.removeEventListener("pointerenter", open);
      card.removeEventListener("pointerleave", close);
      card.removeEventListener("focusin", open);
      card.removeEventListener("focusout", close);
      reduced.removeEventListener("change", onMotionChange);
      hover.removeEventListener("change", onHoverChange);
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
