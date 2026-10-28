// Gaussian splat hero portrait — scrolls into the bio, drag with the mouse to rotate. Self-illuminated so no lights needed.
// Loaded only on the page that has #splat-canvas, via a dynamic import (see hero markup) so PlayCanvas
// never ships to pages without it.
import { ABOUT_MOBILE_SCALE, setupAboutEnvironment } from "./about-environment.js";
import { setupModelInteractions } from "./model-interaction.js";

export function initSplat() {
  const canvas = document.getElementById("splat-canvas");
  const viewport = document.getElementById("splat-viewport");
  if (!canvas || !window.pc) {
    if (viewport) viewport.dataset.failed = "true";
    return;
  }

  let app;
  let disposed = false;
  let stopInteractions;
  let stopEnvironment;
  let observer;
  const controller = new AbortController();
  const timers = new Set();
  const later = (fn, delay) => {
    const id = setTimeout(() => { timers.delete(id); if (!disposed) fn(); }, delay);
    timers.add(id);
  };
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    controller.abort();
    observer?.disconnect();
    timers.forEach(clearTimeout);
    stopInteractions?.();
    stopEnvironment?.();
    app?.assets.list().forEach((asset) => { asset.off(); asset.unload(); });
    const gl = app?.graphicsDevice?.gl;
    app?.destroy();
    // Release the native context too; app.destroy() releases GPU resources but
    // browsers may otherwise keep its context alive until a later GC cycle.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    if (import.meta.env.DEV) {
      window.__portraitApps = Math.max(0, (window.__portraitApps || 1) - 1);
      console.debug("[portrait] active apps", window.__portraitApps);
    }
  };
  try {
    app = new pc.Application(canvas, {
      graphicsDeviceOptions: { alpha: true, antialias: true },
    });
    if (!app.graphicsDevice) {
      viewport.dataset.failed = "true";
      destroy();
      return;
    }
  } catch {
    viewport.dataset.failed = "true";
    destroy();
    return;
  }
  app.graphicsDevice.maxPixelRatio = Math.min(
    window.devicePixelRatio || 1,
    // High-density desktops can afford the sharper bevels; constrain touch/mobile
    // GPUs and Save-Data clients to the previous budget.
    matchMedia("(pointer: fine) and (min-width: 1025px)").matches &&
      (navigator.hardwareConcurrency || 0) >= 8 && !navigator.connection?.saveData ? 2 : 1.5,
  );
  // Render on demand to prevent battery/GPU drain when idle
  app.autoRender = false;

  // Keep the GPU drawing buffer stable while CSS moves/resizes the stage.
  // Resizing it during scroll clears the WebGL surface between rendered frames.
  app.setCanvasFillMode(pc.FILLMODE_NONE);
  const origin = document.getElementById("portrait-origin") || viewport;
  let renderWidth = 0;
  let renderHeight = 0;
  let updateFraming;
  function resize() {
    const width = Math.round(origin.clientWidth);
    const height = Math.round(origin.clientHeight);
    if (width === renderWidth && height === renderHeight) return;
    renderWidth = width;
    renderHeight = height;
    app.setCanvasResolution(pc.RESOLUTION_FIXED, width, height);
    updateFraming?.();
    app.renderNextFrame = true;
  }
  observer = new ResizeObserver(resize);
  observer.observe(origin);
  resize();

  const camera = new pc.Entity("camera");
  camera.addComponent("camera", {
    clearColor: new pc.Color(0, 0, 0, 0),
  });
  app.root.addChild(camera);

  // SOG is ~40% smaller than compressed PLY at the same SH bands — try it first, fall back to
  // PLY if the browser/engine build can't load the .sog zip bundle for any reason.
  const sogAsset = new pc.Asset("pedro-head-sog", "gsplat", {
    url: "/assets/pedro-head.sog",
  });
  app.assets.add(sogAsset);
  sogAsset.on("load", () => attachSplat(sogAsset));
  sogAsset.on("error", () => {
    console.warn("SOG splat failed to load, falling back to compressed PLY");
    const plyAsset = new pc.Asset("pedro-head-ply", "gsplat", {
      url: "/assets/pedro-head.splat.ply",
    });
    app.assets.add(plyAsset);
    plyAsset.on("load", () => attachSplat(plyAsset));
    plyAsset.on("error", () => {
      viewport.dataset.failed = "true";
      destroy();
    });
    app.assets.load(plyAsset);
  });
  app.assets.load(sogAsset);

  function reveal() {
    viewport.dataset.ready = "true";
    canvas.removeAttribute("aria-hidden");
    const silhouette = viewport.querySelector(".portrait-silhouette");
    if (silhouette) {
      later(() => {
        silhouette.style.visibility = "hidden";
      }, 600);
    }
    document.getElementById("splat-fallback")?.setAttribute("aria-hidden", "true");
  }

  function attachSplat(asset) {
    if (disposed) return;
    const rig = new pc.Entity("splat-rig");
    const splat = new pc.Entity("splat");
    splat.addComponent("gsplat", { asset });
    // ponytail: this capture's up-axis comes in flipped and faces away by default — 180/180 sets it upright and facing the camera, matching the original photo.
    rig.setLocalEulerAngles(180, 0, 0);
    rig.addChild(splat);
    app.root.addChild(rig);

    // customAabb isn't populated until the gsplat instance exists, which needs one frame — so frame the camera on the next update rather than right after addComponent.
    app.once("update", () => {
      const aabb = splat.gsplat.customAabb;
      const center = aabb ? aabb.center : new pc.Vec3(0, 0, 0);
      const radius = aabb ? aabb.halfExtents.length() : 1;
      splat.setLocalPosition(-center.x, -center.y, -center.z);
      // Slight camera dolly-in as the portrait lands in the About section.
      // Done in 3D (not CSS scale) so the drawing buffer never resizes.
      const ZOOM_AT_BIO = 0.1; // 10% closer at pose 1
      // Pans the framing so the beanie is not clipped by the canvas top
      // once zoomed (fraction of the model radius).
      const PAN_UP_AT_BIO = 0.06;
      const baseDistance = radius * 1.66;
      const portraitFov = camera.camera.fov;
      const applyZoom = (pose) => {
        const isMobile = matchMedia("(max-width: 768px)").matches;
        // Mobile About review: enlarge the scene inside its square canvas.
        // The environment shares this factor; desktop/Home keep their framing.
        const modelScale = isMobile && viewport.dataset.autoRotate === "true" ? ABOUT_MOBILE_SCALE : 1;
        rig.setLocalScale(modelScale, modelScale, modelScale);
        // Give the wider final Home pose room inside the fixed mobile buffer.
        const mobileHome = isMobile && viewport.dataset.autoRotate !== "true";
        const sizeMultiplier = isMobile ? 1.15 - (mobileHome ? 0.10 * pose : 0) : 1;
        const canvasHeadroom = isMobile ? origin.clientHeight / 325 : 1;
        camera.camera.fov = 2 * Math.atan(Math.tan(portraitFov * Math.PI / 360) * canvasHeadroom / sizeMultiplier) * 180 / Math.PI;
        const distance = baseDistance * (1 - (mobileHome ? 0 : ZOOM_AT_BIO) * pose);
        // About page box: sit the portrait (and its orbit) 14% of the frame lower,
        // so the bottom edge of the model is cropped by the box.
        const frameHeight = 2 * distance * Math.tan(camera.camera.fov * Math.PI / 360);
        const lower = viewport.dataset.autoRotate === "true" ? frameHeight * 0.14 : 0;
        const y = radius * PAN_UP_AT_BIO * pose + lower;
        camera.setPosition(0, y, distance);
        camera.lookAt(0, y, 0);
        app.renderNextFrame = true;
      };
      updateFraming = () => applyZoom(Number(viewport.dataset.scrollPose || 0));
      updateFraming();
      viewport.addEventListener("portraitpose", (e) => applyZoom(e.detail), { signal: controller.signal });
      // The gsplat sort runs in a worker, so the first frames can be empty.
      // With on-demand rendering nothing redraws when the sort lands, which
      // left the canvas blank until the user scrolled. Render continuously
      // until the splat is actually on screen, then reveal.
      //
      // Readiness comes from the engine's own "gsplat:sorted" signal plus one
      // cheap framebuffer column readback. The previous probe read up to 25
      // single pixels on every rendered frame, and every GPU readback stalls
      // the pipeline.
      app.autoRender = true;
      const gl = app.graphicsDevice.gl;
      const started = performance.now();
      let revealed = false;
      let sorted = false;
      // First confirmation waits briefly for the sort signal; the fallback
      // cadence keeps the old reveal behaviour if an engine build never emits it.
      let nextProbe = started + 600;
      let lastProbe = -Infinity;
      const PROBE_MS = 250;
      const FALLBACK_PROBE_MS = 500;
      let column = new Uint8Array(4);
      const splatOnScreen = () => {
        if (!gl) return true;
        const w = gl.drawingBufferWidth;
        const h = gl.drawingBufferHeight;
        // PlayCanvas leaves its own framebuffer bound after rendering; read the
        // canvas backbuffer instead, then restore the engine's binding.
        const prev = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // One column down the middle covers the head and torso, so a single
        // readback replaces the old 5x5 sweep of single-pixel probes.
        if (column.length !== h * 4) column = new Uint8Array(h * 4);
        gl.readPixels((w / 2) | 0, 0, 1, h, gl.RGBA, gl.UNSIGNED_BYTE, column);
        gl.bindFramebuffer(gl.FRAMEBUFFER, prev);
        const length = h * 4;
        for (let i = 3; i < length; i += 4) if (column[i]) return true;
        return false;
      };
      const onSorted = () => {
        sorted = true;
        // Confirm promptly, but a repeated sort signal must not turn this back
        // into a per-frame probe.
        nextProbe = Math.min(nextProbe, lastProbe + PROBE_MS);
        app.renderNextFrame = true;
      };
      app.scene.on("gsplat:sorted", onSorted);
      const onPostRender = () => {
        if (revealed) return;
        const now = performance.now();
        if (now - started < 10000) {
          if (now < nextProbe) return;
          lastProbe = now;
          nextProbe = now + (sorted ? PROBE_MS : FALLBACK_PROBE_MS);
          if (!splatOnScreen()) return;
        }
        revealed = true;
        app.off("postrender", onPostRender);
        app.scene.off("gsplat:sorted", onSorted);
        reveal();
        // Add the orbit accents only after the splat itself has drawn. Created any
        // earlier, their opaque pixels satisfied the old pixel probe before the
        // splat sort landed, so the page revealed an empty portrait with just the
        // glyphs.
        if (!disposed) stopEnvironment = setupAboutEnvironment(app, viewport, radius, { revealOnPose: viewport.dataset.autoRotate !== "true" });
        // A few more frames so late sort updates land, then back to on-demand.
        later(() => {
          app.autoRender = false;
          app.renderNextFrame = true;
        }, 800);
      };
      app.on("postrender", onPostRender);
      app.renderNextFrame = true;
    });

    stopInteractions = setupModelInteractions({ app, rig, canvas, viewport });
    app.renderNextFrame = true;
  }

  if (import.meta.env.DEV) {
    window.__portraitApps = (window.__portraitApps || 0) + 1;
    console.debug("[portrait] active apps", window.__portraitApps);
  }
  app.start();
  app.renderNextFrame = true;
  resize();
  return destroy;
}
