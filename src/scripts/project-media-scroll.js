// Scroll-on-hover previews for project cards and case-study browser windows.
// The media track glides from the top of the capture to the bottom and back in
// a loop; leaving the pointer or focus returns it to the top.
const CARD_HALF_CYCLE = 4500; // 9s loop for the short card previews
const BROWSER_HALF_CYCLE = 5500; // 11s loop for the larger case browser
const CARD_ZOOM_MS = 450; // keep in sync with the media frame transition
const RETURN_MS = 320;

export function initScrollPreviews() {
  const hover = matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const cleanups = [];

  const setup = ({ trigger, frame, track, toggleClass, delay, halfCycle }) => {
    if (!trigger || !frame || !track) return;
    let frameId = 0;
    let openedAt = 0;
    let offset = 0;
    const stop = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };
    const easeOut = (t) => 1 - (1 - t) ** 3;
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

    const pan = (now) => {
      const elapsed = Math.max(0, now - openedAt - delay);
      const cycle = halfCycle * 2;
      const t = elapsed % cycle;
      const progress = t <= halfCycle ? t / halfCycle : (cycle - t) / halfCycle;
      const distance = Math.max(0, track.offsetHeight - frame.clientHeight);
      offset = easeInOut(progress) * distance;
      track.style.translate = `0 ${(-offset).toFixed(1)}px`;
      frameId = requestAnimationFrame(pan);
    };

    const open = () => {
      if (!hover.matches || reduced.matches) return;
      stop();
      toggleClass?.(true);
      openedAt = performance.now();
      frameId = requestAnimationFrame(pan);
    };

    const close = () => {
      stop();
      toggleClass?.(false);
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
        if (t < 1) frameId = requestAnimationFrame(back);
        else {
          frameId = 0;
          track.style.translate = "";
        }
      };
      frameId = requestAnimationFrame(back);
    };

    const onMotionChange = () => { if (reduced.matches) close(); };
    const onHoverChange = () => { if (!hover.matches) close(); };

    trigger.addEventListener("pointerenter", open);
    trigger.addEventListener("pointerleave", close);
    trigger.addEventListener("focusin", open);
    trigger.addEventListener("focusout", close);
    reduced.addEventListener("change", onMotionChange);
    hover.addEventListener("change", onHoverChange);

    cleanups.push(() => {
      stop();
      toggleClass?.(false);
      track.style.translate = "";
      trigger.removeEventListener("pointerenter", open);
      trigger.removeEventListener("pointerleave", close);
      trigger.removeEventListener("focusin", open);
      trigger.removeEventListener("focusout", close);
      reduced.removeEventListener("change", onMotionChange);
      hover.removeEventListener("change", onHoverChange);
    });
  };

  document.querySelectorAll(".project-media").forEach((media) => {
    setup({
      trigger: media.closest(".project-card") ?? media,
      frame: media,
      track: media.querySelector(".project-media-track"),
      toggleClass: (on) => media.classList.toggle("is-open", on),
      delay: CARD_ZOOM_MS,
      halfCycle: CARD_HALF_CYCLE,
    });
  });

  document.querySelectorAll(".browser-mockup").forEach((mockup) => {
    setup({
      trigger: mockup,
      frame: mockup.querySelector(".browser-mockup-viewport"),
      track: mockup.querySelector(".browser-mockup-track"),
      delay: 0,
      halfCycle: BROWSER_HALF_CYCLE,
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
