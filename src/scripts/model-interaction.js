import { getPortraitCenter } from "./portrait-travel.js";
import { createAmbientClock } from "./ambient-cadence.js";

// =============================================================================
// TUNABLE INTERACTION CONSTANTS
// =============================================================================

// Base poses (in degrees)
export const HERO_YAW = -60;
export const BIO_YAW = 30;

// Magnetic mouse attraction
export const MAGNETIC_RADIUS = 350; // Proximity threshold in pixels around model center
export const MAGNETIC_MAX_YAW = 14; // Max deflection on Y axis (left/right, in degrees)
export const MAGNETIC_MAX_PITCH = 7; // Max deflection on X axis (up/down, in degrees)
export const MAGNETIC_LERP = 0.08; // Spring/damping factor for magnetic look (higher = faster, lower = floatier)
export const MAGNETIC_BLEND_RATE = 0.05; // Rate at which magnetic effect blends back in after drag release
export const MAGNETIC_CENTER_OFFSET = { x: 0, y: -0.1 }; // Fraction offset to center of face (x: [-0.5, 0.5], y: [-0.5, 0.5])
export const YAW_SIGN = 1; // 1 = look toward cursor on X; -1 = invert
export const PITCH_SIGN = 1; // 1 = look up when cursor above, down when cursor below; -1 = invert

// Drag rotation
export const DRAG_SENSITIVITY = 0.3; // Pixels to degrees ratio for horizontal drag
export const DRAG_MAX_YAW = 60; // Max allowed drag angle offset in degrees (+/- from resting pose)
export const DRAG_RETURN_LERP = 0.06; // Spring/damping factor when easing back to resting pose on release
export const DRAG_THRESHOLD = 8; // Pixels pointer must move horizontally before claiming drag (prevents blocking touch scroll)

/**
 * Attaches magnetic mouse proximity and touch-friendly drag interactions to the 3D model rig.
 *
 * @param {Object} options
 * @param {pc.Application} options.app - The PlayCanvas application instance
 * @param {pc.Entity} options.rig - The rig Entity controlling yaw and pitch
 * @param {HTMLCanvasElement} options.canvas - The WebGL canvas element
 * @param {HTMLElement} options.viewport - The viewport container (#splat-viewport)
 * @returns {Function} cleanup - Function to detach listeners and clean up
 */
export function setupModelInteractions({ app, rig, canvas, viewport }) {
  // Media queries
  const hoverQuery = matchMedia("(hover: hover) and (pointer: fine)");
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");

  // State
  let pose = Number(viewport.dataset.scrollPose || 0);
  let lastAppliedPose = -1;
  const autoRotate = viewport.dataset.autoRotate === "true";
  let orbitYaw = 0;
  let viewportVisible = true;
  const ambientStep = createAmbientClock();

  // Drag state
  let isDragging = false;
  let pointerDown = false;
  let gestureDecided = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let dragYaw = 0; // Offset in degrees relative to baseYaw

  // Magnetic state
  let pointerX = -99999;
  let pointerY = -99999;
  let pointerActive = false;
  let magYaw = 0;
  let magPitch = 0;
  let targetMagYaw = 0;
  let targetMagPitch = 0;
  let magneticBlend = 1.0; // 0 while dragging, smoothly blends to 1 after release

  // A short burst of rapid back-and-forth drags triggers a temporary orbit.
  const dizzy = document.createElement("div");
  dizzy.className = "portrait-dizzy";
  dizzy.setAttribute("aria-hidden", "true");
  const star = `<i><svg viewBox="0 0 24 24" shape-rendering="crispEdges"><path fill="#a33b17" d="M10 2h5v5h3v3h4v5h-4v3h-3v4h-5v-4H7v-3H3v-5h4V7h3z"/><path fill="#ff5a1f" d="M9 1h5v5h3v3h4v4h-4v3h-3v4H9v-4H6v-3H2V9h4V6h3z"/><path fill="#ffb18b" d="M9 2h3v4H9zM6 7h3v2H6zM3 9h3v2H3z"/></svg></i>`;
  dizzy.innerHTML = `<div class="portrait-dizzy__orbit">${star.repeat(5)}</div>`;
  dizzy.classList.add("portrait-dizzy--front");
  const dizzyBack = dizzy.cloneNode(true);
  dizzyBack.classList.replace("portrait-dizzy--front", "portrait-dizzy--back");
  // Speech bubble shown with the stars.
  const hey = document.createElement("div");
  hey.className = "portrait-hey";
  hey.setAttribute("aria-hidden", "true");
  hey.textContent = "HEY!";
  // Orange pixel X over each eye while dizzy, projected from the model every frame.
  const eyes = document.createElement("div");
  eyes.className = "portrait-eyes";
  eyes.setAttribute("aria-hidden", "true");
  const eyeX = `<i><svg viewBox="0 0 7 7" shape-rendering="crispEdges"><path fill="#ff5a1f" d="M0 0h2v1h1v1h1V1h1V0h2v2H6v1H5v1h1v1h1v2H5V6H4V5H3v1H2v1H0V5h1V4h1V3H1V2H0z"/></svg></i>`;
  eyes.innerHTML = eyeX + eyeX;
  const eyeEls = [...eyes.children];
  viewport.append(dizzyBack, dizzy, hey, eyes);
  const camera = app.root.findByName("camera");
  // Eye anchors in rig space, calibrated for the two portrait framings.
  // z is negative: the rig is flipped 180deg on X, so the face looks down -z in rig space.
  const EYE_ANCHORS = [new pc.Vec3(-0.03, -0.103, -0.13), new pc.Vec3(0.028, -0.103, -0.13)];
  const eyeWorld = new pc.Vec3(), eyeScreen = new pc.Vec3(), headWorld = new pc.Vec3(), headLocal = new pc.Vec3(0.005, -0.103, 0);
  function placeEyes() {
    if (!camera) return;
    const transform = rig.getWorldTransform();
    const box = canvas.getBoundingClientRect(), host = viewport.getBoundingClientRect();
    // The travelling stage is CSS-scaled between Home and About. Convert the
    // screen projection back to its local CSS pixels before placing the overlay.
    const localX = viewport.clientWidth / host.width;
    const localY = viewport.clientHeight / host.height;
    const camPos = camera.getPosition();
    transform.transformPoint(headLocal, headWorld);
    const headDistance = camPos.distance(headWorld);
    let facing = true;
    // Preserve the Home calibration and blend the vertical correction with the
    // same pose that drives the camera framing, including intermediate scroll states.
    const eyeHeight = -0.103 + 0.016 * Math.max(0, Math.min(1, pose));
    EYE_ANCHORS.forEach((anchor, index) => {
      anchor.y = eyeHeight;
      transform.transformPoint(anchor, eyeWorld);
      // Eyes only show while they are on the camera side of the head.
      if (camPos.distance(eyeWorld) > headDistance - 0.06) facing = false;
      camera.camera.worldToScreen(eyeWorld, eyeScreen);
      eyeEls[index].style.left = `${(box.left - host.left + eyeScreen.x * box.width / canvas.clientWidth) * localX}px`;
      eyeEls[index].style.top = `${(box.top - host.top + eyeScreen.y * box.height / canvas.clientHeight) * localY}px`;
    });
    eyes.classList.toggle("is-visible", facing);
  }
  let movements = [], lastDirection = 0, dizzyTimer = 0;
  // Dizzy wobble: the model rocks side to side, fading out over the dizzy spell.
  let dizzyStart = 0, wobble = 0;
  const DIZZY_MS = 4200;

  // Custom drag cursor
  const dragCursor = document.createElement("div");
  dragCursor.className = "drag-cursor";
  dragCursor.textContent = "drag me";
  document.body.appendChild(dragCursor);

  const bubble = document.getElementById("splat-bubble");

  // Canvas configuration
  canvas.tabIndex = 0;
  canvas.style.touchAction = "pan-y";
  canvas.setAttribute(
    "aria-label",
    "3D portrait of Pedro. Drag or use arrow keys to rotate.",
  );
  if (hoverQuery.matches) {
    canvas.style.cursor = "none";
  }

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Request next frame render from PlayCanvas (on-demand rendering)
  function requestRender() {
    app.renderNextFrame = true;
  }

  // Calculate base yaw for current scroll pose
  function getBaseYaw() {
    return HERO_YAW + (BIO_YAW - HERO_YAW) * pose + orbitYaw;
  }

  // Orientation apply function
  function applyOrientation() {
    const baseYaw = getBaseYaw();
    const finalYaw = baseYaw + dragYaw + magYaw * magneticBlend;
    const finalPitch = 180 + magPitch * magneticBlend;
    rig.setLocalEulerAngles(finalPitch, finalYaw, wobble);
    requestRender();
  }

  // Pointer position tracking
  function onWindowPointerMove(e) {
    if (e.pointerType === "mouse") {
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerActive = true;
    }

    if (dragCursor && hoverQuery.matches) {
      dragCursor.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
    }

    if (pointerDown) {
      if (!isDragging && !gestureDecided) {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);

        if (dx >= DRAG_THRESHOLD && dx > dy) {
          // Horizontal drag confirmed
          gestureDecided = true;
          isDragging = true;
          magneticBlend = 0; // Disable magnetic effect while dragging
          lastX = e.clientX;
          lastY = e.clientY;
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch {}
          if (dragCursor) dragCursor.textContent = "dragging";
          if (bubble) bubble.classList.add("is-hidden");
          requestRender();
        } else if (dy >= DRAG_THRESHOLD && dy >= dx) {
          // Vertical swipe confirmed -> scroll takes over, do not drag
          gestureDecided = true;
          pointerDown = false;
        }
      } else if (isDragging) {
        const deltaX = e.clientX - lastX;
        lastX = e.clientX;
        lastY = e.clientY;

        if (!motionQuery.matches && Math.abs(deltaX) > 1) {
          const now = performance.now();
          const direction = Math.sign(deltaX);
          movements.push({ time: now, distance: Math.abs(deltaX), turn: lastDirection && direction !== lastDirection ? 1 : 0 });
          lastDirection = direction;
          movements = movements.filter((entry) => now - entry.time < 2200);
          if (movements.reduce((sum, entry) => sum + entry.distance, 0) > 440 && movements.reduce((sum, entry) => sum + entry.turn, 0) >= 4) {
            dizzy.classList.add("is-visible");
            dizzyBack.classList.add("is-visible");
            hey.classList.add("is-visible");
            dizzyStart = performance.now();
            clearTimeout(dizzyTimer);
            dizzyTimer = window.setTimeout(() => { dizzy.classList.remove("is-visible"); dizzyBack.classList.remove("is-visible"); hey.classList.remove("is-visible"); }, DIZZY_MS);
            movements = [];
          }
        }
        dragYaw += deltaX * DRAG_SENSITIVITY;
        dragYaw = Math.max(-DRAG_MAX_YAW, Math.min(DRAG_MAX_YAW, dragYaw));
        requestRender();
      }
    }
  }

  function onPointerDown(e) {
    pointerDown = true;
    gestureDecided = false;
    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;

    if (e.pointerType === "mouse") {
      // For mouse, we can lock in immediately on click
      gestureDecided = true;
      isDragging = true;
      magneticBlend = 0;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
      if (dragCursor) dragCursor.textContent = "dragging";
      if (bubble) bubble.classList.add("is-hidden");
      requestRender();
    }
  }

  function onPointerUp(e) {
    if (isDragging) {
      isDragging = false;
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {}
      if (dragCursor) dragCursor.textContent = "drag me";
      try {
        if (!canvas.matches(":hover")) {
          dragCursor?.classList.remove("is-visible");
        }
      } catch {}
      requestRender();
    }
    pointerDown = false;
    gestureDecided = false;
  }

  function onPointerEnter() {
    if (hoverQuery.matches) {
      dragCursor?.classList.add("is-visible");
      canvas.style.cursor = "none";
    }
  }

  function onPointerLeave() {
    if (!isDragging) {
      dragCursor?.classList.remove("is-visible");
    }
  }

  function onWindowPointerLeave() {
    pointerActive = false;
  }

  function onKeyDown(e) {
    if (!["ArrowLeft", "ArrowRight", "Home"].includes(e.key)) return;
    e.preventDefault();
    magneticBlend = 0;
    if (e.key === "Home") {
      dragYaw = 0;
    } else {
      const delta = e.key === "ArrowLeft" ? -10 : 10;
      dragYaw = Math.max(-DRAG_MAX_YAW, Math.min(DRAG_MAX_YAW, dragYaw + delta));
    }
    requestRender();
  }

  // Portrait pose event from portrait-travel.js
  function onPortraitPose(e) {
    pose = e.detail;
    requestRender();
  }

  // Animation frame physics update
  function updatePhysics(dt) {
    if (!viewportVisible || document.hidden) return;
    let active = false;
    if (autoRotate && !isDragging && !motionQuery.matches) {
      // The auto-rotation redraws the whole splat scene, so it shares the capped
      // ambient cadence with the orbital accents (see ambient-cadence.js). Drag,
      // magnetic look and pose/scroll updates below still run at display rate.
      const ambient = ambientStep();
      if (ambient) {
        orbitYaw = (orbitYaw + ambient * 12) % 360;
        active = true;
      }
    }

    // Dizzy wobble: ~1.5Hz roll, 7deg at first, easing out by the end of the spell.
    if (dizzyStart) {
      const t = (performance.now() - dizzyStart) / DIZZY_MS;
      if (t >= 1 || motionQuery.matches) { dizzyStart = 0; wobble = 0; eyes.classList.remove("is-visible"); }
      else { wobble = Math.sin(t * DIZZY_MS / 1000 * Math.PI * 3) * 7 * (1 - t); }
      active = true;
    }

    // 1. Check pose change
    if (pose !== lastAppliedPose) {
      lastAppliedPose = pose;
      active = true;
    }

    // 2. Drag return lerp (easing back to resting pose when user releases drag)
    if (!isDragging && Math.abs(dragYaw) > 0.001) {
      dragYaw = lerp(dragYaw, 0, DRAG_RETURN_LERP);
      if (Math.abs(dragYaw) <= 0.001) dragYaw = 0;
      active = true;
    }

    // 3. Magnetic target computation
    const canMagnet =
      viewportVisible &&
      pointerActive &&
      hoverQuery.matches &&
      !motionQuery.matches;

    if (canMagnet && !isDragging) {
      const rect = autoRotate ? viewport.getBoundingClientRect() : null;
      const center = rect ? { x: rect.left + rect.width * (0.5 + MAGNETIC_CENTER_OFFSET.x), y: rect.top + rect.height * (0.5 + MAGNETIC_CENTER_OFFSET.y) } : getPortraitCenter(MAGNETIC_CENTER_OFFSET);
      if (center) {
        const dx = pointerX - center.x;
        const dy = pointerY - center.y;
        const dist = Math.hypot(dx, dy);

        if (dist < MAGNETIC_RADIUS) {
          const distRatio = dist / MAGNETIC_RADIUS;
          // Cosine falloff: 1 at center, smoothly 0 at edge
          const strength = 0.5 * (1 + Math.cos(Math.PI * distRatio));
          // Normalized direction vector, gently fading right at exact dead-center (< 15px)
          const deadZoneFactor = Math.min(1, dist / 15);
          const dirX = dist > 0.001 ? (dx / dist) * deadZoneFactor : 0;
          const dirY = dist > 0.001 ? (dy / dist) * deadZoneFactor : 0;

          targetMagYaw = dirX * strength * MAGNETIC_MAX_YAW * YAW_SIGN;
          targetMagPitch = -dirY * strength * MAGNETIC_MAX_PITCH * PITCH_SIGN;
        } else {
          targetMagYaw = 0;
          targetMagPitch = 0;
        }
      }
    } else {
      targetMagYaw = 0;
      targetMagPitch = 0;
    }

    // 4. Magnetic smoothing (lerp/damping)
    if (
      Math.abs(magYaw - targetMagYaw) > 0.001 ||
      Math.abs(magPitch - targetMagPitch) > 0.001
    ) {
      magYaw = lerp(magYaw, targetMagYaw, MAGNETIC_LERP);
      magPitch = lerp(magPitch, targetMagPitch, MAGNETIC_LERP);
      if (Math.abs(magYaw - targetMagYaw) <= 0.001) magYaw = targetMagYaw;
      if (Math.abs(magPitch - targetMagPitch) <= 0.001) magPitch = targetMagPitch;
      active = true;
    }

    // 5. Magnetic blend recovery after drag release
    if (isDragging) {
      magneticBlend = 0;
    } else if (magneticBlend < 1.0) {
      magneticBlend = lerp(magneticBlend, 1.0, MAGNETIC_BLEND_RATE);
      if (magneticBlend >= 0.999) magneticBlend = 1.0;
      active = true;
    }

    if (isDragging) {
      active = true;
    }

    // 6. Apply rotation and request frame if active
    if (active) {
      applyOrientation();
      if (dizzyStart) placeEyes();
    }
  }

  // Register on PlayCanvas app update loop
  app.on("update", updatePhysics);

  // Attach DOM listeners
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerenter", onPointerEnter);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("keydown", onKeyDown);

  window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  document.addEventListener("mouseleave", onWindowPointerLeave);

  viewport.addEventListener("portraitpose", onPortraitPose);

  // Viewport visibility via IntersectionObserver
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    viewportVisible = entry.isIntersecting;
    if (viewportVisible) {
      requestRender();
    }
  });
  visibilityObserver.observe(viewport);

  // Initial apply
  applyOrientation();

  // Return cleanup
  return function cleanup() {
    app.off("update", updatePhysics);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerenter", onPointerEnter);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("keydown", onKeyDown);

    window.removeEventListener("pointermove", onWindowPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    document.removeEventListener("mouseleave", onWindowPointerLeave);

    viewport.removeEventListener("portraitpose", onPortraitPose);
    visibilityObserver.disconnect();
    dragCursor?.remove?.();
    clearTimeout(dizzyTimer);
    dizzy.remove();
    dizzyBack.remove();
    hey.remove();
    eyes.remove();
  };
}
