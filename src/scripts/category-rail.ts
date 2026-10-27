import { onPageLoad } from "./page-lifecycle";

onPageLoad(({ signal, cleanup }) => {
  const rail = document.querySelector<HTMLElement>(".category-filters");
  if (!rail) return;
  let pointerId: number | null = null;
  let originX = 0;
  let originScroll = 0;
  let dragged = false;
  let suppressClick = false;
  let direction = 0;
  let frame = 0;
  let previousTime = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    direction = 0;
    previousTime = 0;
  };
  const tick = (time: number) => {
    frame = 0;
    const elapsed = previousTime ? Math.min(time - previousTime, 40) : 16;
    previousTime = time;
    const before = rail.scrollLeft;
    rail.scrollLeft += direction * elapsed * 0.24;
    if (Math.abs(rail.scrollLeft - before) < 0.1) { stop(); return; }
    frame = requestAnimationFrame(tick);
  };
  const followEdge = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || pointerId !== null) return;
    const bounds = rail.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const edge = Math.min(48, bounds.width / 5);
    const max = rail.scrollWidth - rail.clientWidth;
    const next = x < edge && rail.scrollLeft > 1 ? -(1 - x / edge)
      : x > bounds.width - edge && rail.scrollLeft < max - 1 ? (x - bounds.width + edge) / edge : 0;
    if (!next) { stop(); return; }
    direction = Math.max(-1, Math.min(1, next));
    if (!frame) frame = requestAnimationFrame(tick);
  };
  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    stop();
    pointerId = event.pointerId;
    originX = event.clientX;
    originScroll = rail.scrollLeft;
    dragged = false;
    suppressClick = false;
  }, { signal });
  rail.addEventListener("pointermove", (event) => {
    if (pointerId === event.pointerId) {
      if (!dragged && Math.abs(event.clientX - originX) > 6) {
        dragged = true;
        rail.setPointerCapture(event.pointerId);
        rail.classList.add("is-dragging");
      }
      if (dragged) {
        event.preventDefault();
        rail.scrollLeft = originScroll - (event.clientX - originX);
      }
    } else followEdge(event);
  }, { signal });
  const release = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    suppressClick = dragged;
    pointerId = null;
    dragged = false;
    rail.classList.remove("is-dragging");
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    stop();
  };
  window.addEventListener("pointerup", release, { signal });
  window.addEventListener("pointercancel", release, { signal });
  rail.addEventListener("lostpointercapture", release, { signal });
  rail.addEventListener("click", (event) => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, { capture: true, signal });
  rail.addEventListener("pointerleave", stop, { signal });
  rail.addEventListener("dragstart", (event) => event.preventDefault(), { signal });
  window.addEventListener("blur", () => {
    pointerId = null;
    rail.classList.remove("is-dragging");
    stop();
  }, { signal });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); }, { signal });
  cleanup(stop);
});
