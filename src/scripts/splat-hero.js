// Gaussian splat hero portrait — scrolls into the bio, drag with the mouse to rotate. Self-illuminated so no lights needed.
// Loaded only on the page that has #splat-canvas, via a dynamic import (see hero markup) so PlayCanvas
// never ships to pages without it.
import { setupModelInteractions } from "./model-interaction.js";

export function initSplat() {
  const canvas = document.getElementById("splat-canvas");
  const viewport = document.getElementById("splat-viewport");
  if (!canvas || !window.pc) {
    if (viewport) viewport.dataset.failed = "true";
    return;
  }

  let app;
  try {
    app = new pc.Application(canvas, {
      graphicsDeviceOptions: { alpha: true, antialias: true },
    });
    if (!app.graphicsDevice) {
      viewport.dataset.failed = "true";
      return;
    }
  } catch {
    viewport.dataset.failed = "true";
    return;
  }
  app.graphicsDevice.maxPixelRatio = Math.min(
    window.devicePixelRatio || 1,
    1.5,
  );
  // Render on demand to prevent battery/GPU drain when idle
  app.autoRender = false;

  // Keep the GPU drawing buffer stable while CSS moves/resizes the stage.
  // Resizing it during scroll clears the WebGL surface between rendered frames.
  app.setCanvasFillMode(pc.FILLMODE_NONE);
  const origin = document.getElementById("portrait-origin") || viewport;
  let renderWidth = 0;
  let renderHeight = 0;
  function resize() {
    const width = Math.round(origin.clientWidth);
    const height = Math.round(origin.clientHeight);
    if (width === renderWidth && height === renderHeight) return;
    renderWidth = width;
    renderHeight = height;
    app.setCanvasResolution(pc.RESOLUTION_FIXED, width, height);
    app.renderNextFrame = true;
  }
  new ResizeObserver(resize).observe(origin);
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
      app.destroy();
    });
    app.assets.load(plyAsset);
  });
  app.assets.load(sogAsset);

  function attachSplat(asset) {
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
      camera.setPosition(0, 0, radius * 1.66);
      camera.lookAt(0, 0, 0);
      // Keep the fallback until the first rendered frame has reached the canvas.
      app.once("postrender", () => {
        viewport.dataset.ready = "true";
        canvas.removeAttribute("aria-hidden");
        const silhouette = viewport.querySelector(".portrait-silhouette");
        if (silhouette) {
          silhouette.setAttribute("aria-hidden", "true");
          silhouette.addEventListener(
            "transitionend",
            () => {
              silhouette.style.visibility = "hidden";
            },
            { once: true },
          );
          setTimeout(() => {
            silhouette.style.visibility = "hidden";
          }, 600);
        }
        document
          .getElementById("splat-fallback")
          ?.setAttribute("aria-hidden", "true");
      });
      app.renderNextFrame = true;
    });

    setupModelInteractions({ app, rig, canvas, viewport });
    app.renderNextFrame = true;
  }

  app.start();
  app.renderNextFrame = true;
  resize();
}
