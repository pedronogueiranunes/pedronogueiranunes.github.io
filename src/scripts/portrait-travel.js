// A single canvas (or its fallback) travels between two stable layout slots.
export function initPortraitTravel() {
  const origin = document.getElementById("portrait-origin");
  const stage = document.getElementById("splat-viewport");
  const destination = document.getElementById("portrait-destination");
  if (!origin || !stage || !destination) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let geometry;
  let frame = 0;
  function measure() {
    const from = origin.getBoundingClientRect();
    const to = destination.getBoundingClientRect();
    const start = Math.max(0, from.top + scrollY - innerHeight * 0.35);
    // Match the published portrait's 640×480 desktop stage, fitting narrow columns.
    const targetScale = Math.min(
      1,
      to.width / from.width,
      to.height / from.height,
    );
    const targetWidth = from.width * targetScale;
    const targetHeight = from.height * targetScale;
    stage.style.setProperty("--portrait-width", `${from.width}px`);
    stage.style.setProperty("--portrait-height", `${from.height}px`);
    geometry = {
      dx: to.left + (to.width - targetWidth) / 2 - from.left,
      dy: to.top + (to.height - targetHeight) / 2 - from.top,
      targetScale,
      start,
      end: Math.max(
        start + 1,
        to.top + scrollY - Math.max(80, (innerHeight - to.height) / 2),
      ),
    };
    update();
  }
  function update() {
    frame = 0;
    if (!geometry) return;
    const g = geometry;
    const progress = Math.max(
      0,
      Math.min(1, (scrollY - g.start) / (g.end - g.start)),
    );
    // Reduced motion uses two still placements instead of interpolated travel.
    const pose = reducedMotion.matches
      ? Number(progress >= 0.5)
      : progress * progress * (3 - 2 * progress);
    stage.style.setProperty("--portrait-x", `${g.dx * pose}px`);
    stage.style.setProperty("--portrait-y", `${g.dy * pose}px`);
    stage.style.setProperty(
      "--portrait-scale",
      String(1 + (g.targetScale - 1) * pose),
    );
    stage.dataset.scrollPose = String(pose);
    stage.dispatchEvent(new CustomEvent("portraitpose", { detail: pose }));
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", measure);
  reducedMotion.addEventListener("change", measure);
  new ResizeObserver(measure).observe(destination);
  document.fonts.ready.then(measure);
  measure();
}
