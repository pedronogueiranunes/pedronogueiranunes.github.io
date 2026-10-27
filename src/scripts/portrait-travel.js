// A single canvas (or its fallback) travels between two stable layout slots.
let currentGeometry = null;
let currentPose = 0;

// Tunables for the scroll travel feel.
// POSE_FOLLOW: how fast the portrait catches up with the scroll position each
// frame (0..1). Lower = softer, more trailing ease. 1 = locked to scroll.
const POSE_FOLLOW = 0.12;
// A short, time-based catch-up on touch screens, independent of refresh rate.
const MOBILE_FOLLOW_MS = 70;

export function getPortraitGeometry() {
  const stage = document.getElementById("splat-viewport");
  return {
    geometry: currentGeometry || stage?._portraitGeometry || null,
    pose: currentPose,
  };
}

export function getPortraitCenter(offset = { x: 0, y: 0 }) {
  const stage = document.getElementById("splat-viewport");
  if (!stage) return null;
  const geom = currentGeometry || stage._portraitGeometry;
  if (!geom) {
    const rect = stage.getBoundingClientRect();
    return {
      x: rect.left + rect.width * (0.5 + offset.x),
      y: rect.top + rect.height * (0.5 + offset.y),
    };
  }
  const scale = 1 + (geom.targetScale - 1) * currentPose;
  const stageWidth = geom.fromWidth * scale;
  const stageHeight = geom.fromHeight * scale;
  const screenLeft = geom.fromPageX + geom.dx * currentPose - window.scrollX;
  const screenTop = geom.fromPageY + geom.dy * currentPose - window.scrollY;
  return {
    x: screenLeft + stageWidth * (0.5 + offset.x),
    y: screenTop + stageHeight * (0.5 + offset.y),
  };
}

export function initPortraitTravel() {
  const origin = document.getElementById("portrait-origin");
  const stage = document.getElementById("splat-viewport");
  const destination = document.getElementById("portrait-destination");
  if (!origin || !stage || !destination) return;
  const mobile = matchMedia("(max-width: 768px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let disposed = false;
  let measuredViewportWidth = innerWidth;
  let measuredViewportHeight = innerHeight;
  let lastFrameTime = 0;
  function measure() {
    if (disposed) return;
    const from = origin.getBoundingClientRect();
    const to = destination.getBoundingClientRect();
    const viewportHeight = mobile.matches ? measuredViewportHeight : innerHeight;
    const start = Math.max(0, from.top + scrollY - viewportHeight * 0.35);
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
    currentGeometry = {
      fromPageX: from.left + window.scrollX,
      fromPageY: from.top + window.scrollY,
      fromWidth: from.width,
      fromHeight: from.height,
      dx: to.left + (to.width - targetWidth) / 2 - from.left,
      dy: to.top + (to.height - targetHeight) / 2 - from.top,
      targetScale,
      start,
      end: Math.max(
        start + 1,
        to.top + scrollY - Math.max(80, (viewportHeight - to.height) / 2),
      ),
    };
    stage._portraitGeometry = currentGeometry;
    cancelAnimationFrame(frame);
    frame = 0;
    update(true);
  }
  let targetPose = 0;
  let displayPose = 0;
  function computeTarget() {
    const g = currentGeometry;
    const progress = Math.max(
      0,
      Math.min(1, (scrollY - g.start) / (g.end - g.start)),
    );
    // Reduced motion uses two still placements instead of interpolated travel.
    if (reducedMotion.matches) return Number(progress >= 0.5);
    if (mobile.matches) return progress;
    // easeInOutCubic: softer start and landing than smoothstep.
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }
  function apply(pose) {
    const g = currentGeometry;
    currentPose = pose;
    stage.style.setProperty("--portrait-x", `${g.dx * pose}px`);
    stage.style.setProperty("--portrait-y", `${g.dy * pose}px`);
    stage.style.setProperty(
      "--portrait-scale",
      String(1 + (g.targetScale - 1) * pose),
    );
    stage.dataset.scrollPose = String(pose);
    stage._portraitPose = pose;
    stage.dispatchEvent(new CustomEvent("portraitpose", { detail: pose }));
  }
  function update(instant = false, now = performance.now()) {
    frame = 0;
    if (disposed || !currentGeometry) return;
    targetPose = computeTarget();
    const elapsed = lastFrameTime ? Math.min(32, Math.max(0, now - lastFrameTime)) : 1000 / 60;
    const follow = instant || reducedMotion.matches
      ? 1
      : mobile.matches ? 1 - Math.exp(-elapsed / MOBILE_FOLLOW_MS) : POSE_FOLLOW;
    lastFrameTime = now;
    displayPose += (targetPose - displayPose) * follow;
    if (Math.abs(targetPose - displayPose) < 0.0005) displayPose = targetPose;
    apply(displayPose);
    // Keep easing toward the scroll position after scrolling stops.
    if (displayPose !== targetPose) frame = requestAnimationFrame((time) => update(false, time));
    else lastFrameTime = 0;
  }
  function schedule() {
    if (!disposed && !frame) frame = requestAnimationFrame((time) => update(false, time));
  }
  function onResize() {
    // Mobile browser chrome changes viewport height while scrolling. It must not
    // change the path or force an instant pose update in the middle of a swipe.
    if (mobile.matches && innerWidth === measuredViewportWidth) return;
    measuredViewportWidth = innerWidth;
    measuredViewportHeight = innerHeight;
    measure();
  }
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", onResize);
  reducedMotion.addEventListener("change", measure);
  const observer = new ResizeObserver(measure);
  observer.observe(destination);
  document.fonts.ready.then(measure);
  measure();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    removeEventListener("scroll", schedule);
    removeEventListener("resize", onResize);
    reducedMotion.removeEventListener("change", measure);
    currentGeometry = null;
    currentPose = 0;
  };
}
