// Gaussian splat hero portrait — scrolls into the bio, drag with the mouse to rotate. Self-illuminated so no lights needed.
// Loaded only on the page that has #splat-canvas, via a dynamic import (see hero markup) so PlayCanvas
// never ships to pages without it.
export function initSplat() {
  const canvas = document.getElementById("splat-canvas");
  const viewport = document.getElementById("splat-viewport");
  let viewportVisible = true;
  if (!canvas || !window.pc) return;

  const app = new pc.Application(canvas, {
    graphicsDeviceOptions: { alpha: true, antialias: true },
  });
  app.graphicsDevice.maxPixelRatio = Math.min(
    window.devicePixelRatio || 1,
    1.5,
  );
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
        document
          .getElementById("splat-fallback")
          ?.setAttribute("aria-hidden", "true");
      });
    });

    // Drag to rotate — model stays put otherwise. Horizontal drag only: yaw is the only axis the
    // user can control, pitch stays fixed at the base pose.
    let dragging = false;
    let lastX = 0;
    let yaw = 0;
    const sensitivity = 0.3;

    // The final three-quarter pose faces the bio copy. Scrolling owns the
    // baseline; drag/keyboard offset fades out as the portrait reaches its slot.
    const HERO_YAW = -60;
    const BIO_YAW = 30;
    let pose = Number(viewport.dataset.scrollPose || 0);
    let manualYaw = 0;
    let dragCursor;
    function applyPose() {
      yaw = HERO_YAW + (BIO_YAW - HERO_YAW) * pose + manualYaw * (1 - pose);
      rig.setLocalEulerAngles(180, yaw, 0);
      // The stage only scales uniformly; its aspect and GPU buffer stay fixed.
      app.renderNextFrame = true;
      const settled = pose >= 0.999;
      canvas.style.cursor = settled ? "default" : "none";
      canvas.tabIndex = settled ? -1 : 0;
      canvas.setAttribute(
        "aria-label",
        settled
          ? "3D portrait of Pedro in the About me pose."
          : "3D portrait of Pedro. Drag or use the left and right arrow keys to rotate.",
      );
      if (settled) dragCursor?.classList.remove("is-visible");
    }
    viewport.addEventListener("portraitpose", (event) => {
      pose = event.detail;
      applyPose();
    });
    applyPose();

    // Custom "drag me" cursor that follows the pointer while it's over the canvas.
    dragCursor = document.createElement("div");
    dragCursor.className = "drag-cursor";
    dragCursor.textContent = "drag me";
    document.body.appendChild(dragCursor);
    const bubble = document.getElementById("splat-bubble");

    applyPose();
    canvas.addEventListener("keydown", (event) => {
      if (
        pose >= 0.999 ||
        !["ArrowLeft", "ArrowRight", "Home"].includes(event.key)
      )
        return;
      event.preventDefault();
      manualYaw =
        event.key === "Home"
          ? 0
          : manualYaw + (event.key === "ArrowLeft" ? -10 : 10);
      applyPose();
    });
    canvas.addEventListener("pointercancel", () => {
      dragging = false;
      dragCursor.textContent = "drag me";
      dragCursor.classList.remove("is-visible");
    });
    canvas.addEventListener("pointerenter", () => {
      if (pose < 0.999) dragCursor.classList.add("is-visible");
    });
    canvas.addEventListener("pointerleave", () =>
      dragCursor.classList.remove("is-visible"),
    );
    canvas.addEventListener("pointermove", (e) => {
      dragCursor.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
    });

    canvas.addEventListener("pointerdown", (e) => {
      if (pose >= 0.999) return;
      if (bubble) bubble.classList.add("is-hidden");
      dragging = true;
      lastX = e.clientX;
      dragCursor.textContent = "dragging";
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      manualYaw += (e.clientX - lastX) * sensitivity;
      lastX = e.clientX;
      applyPose();
    });
    canvas.addEventListener("pointerup", (e) => {
      dragging = false;
      dragCursor.textContent = "drag me";
      if (canvas.hasPointerCapture(e.pointerId))
        canvas.releasePointerCapture(e.pointerId);
    });
  }

  const visibility = new IntersectionObserver(([entry]) => {
    viewportVisible = entry.isIntersecting;
    app.autoRender = entry.isIntersecting && !document.hidden;
  });
  visibility.observe(viewport);
  document.addEventListener("visibilitychange", () => {
    app.autoRender = !document.hidden && viewportVisible;
  });
  app.start();
  resize();
}
