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
    rig.setLocalEulerAngles(finalPitch, finalYaw, 0);
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
  };
}
