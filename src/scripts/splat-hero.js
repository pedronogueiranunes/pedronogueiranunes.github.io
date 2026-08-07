// Gaussian splat hero portrait — static pose, drag with the mouse to rotate. Self-illuminated so no lights needed.
// Loaded only on the page that has #splat-canvas, via a dynamic import (see hero markup) so PlayCanvas
// never ships to pages without it.
export function initSplat() {
  const canvas = document.getElementById('splat-canvas');
  const viewport = document.getElementById('splat-viewport');
  if (!canvas || !window.pc) return;

  const app = new pc.Application(canvas, {
    graphicsDeviceOptions: { alpha: true, antialias: true }
  });
  app.graphicsDevice.maxPixelRatio = window.devicePixelRatio || 1;
  // Application defaults to filling the whole window — opt out so resizeCanvas below actually controls the size.
  app.setCanvasFillMode(pc.FILLMODE_NONE);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  function resize() {
    const rect = viewport.getBoundingClientRect();
    app.resizeCanvas(rect.width, rect.height);
  }
  new ResizeObserver(resize).observe(viewport);
  resize();

  const camera = new pc.Entity('camera');
  camera.addComponent('camera', { clearColor: new pc.Color(0, 0, 0, 0) });
  app.root.addChild(camera);

  // SOG is ~40% smaller than compressed PLY at the same SH bands — try it first, fall back to
  // PLY if the browser/engine build can't load the .sog zip bundle for any reason.
  const sogAsset = new pc.Asset('pedro-head-sog', 'gsplat', { url: '/assets/pedro-head.sog' });
  app.assets.add(sogAsset);
  sogAsset.on('load', () => attachSplat(sogAsset));
  sogAsset.on('error', () => {
    console.warn('SOG splat failed to load, falling back to compressed PLY');
    const plyAsset = new pc.Asset('pedro-head-ply', 'gsplat', { url: '/assets/pedro-head.splat.ply' });
    app.assets.add(plyAsset);
    plyAsset.on('load', () => attachSplat(plyAsset));
    app.assets.load(plyAsset);
  });
  app.assets.load(sogAsset);

  function attachSplat(asset) {
    const rig = new pc.Entity('splat-rig');
    const splat = new pc.Entity('splat');
    splat.addComponent('gsplat', { asset });
    // ponytail: this capture's up-axis comes in flipped and faces away by default — 180/180 sets it upright and facing the camera, matching the original photo.
    rig.setLocalEulerAngles(180, 0, 0);
    rig.addChild(splat);
    app.root.addChild(rig);

    // customAabb isn't populated until the gsplat instance exists, which needs one frame — so frame the camera on the next update rather than right after addComponent.
    app.once('update', () => {
      const aabb = splat.gsplat.customAabb;
      const center = aabb ? aabb.center : new pc.Vec3(0, 0, 0);
      const radius = aabb ? aabb.halfExtents.length() : 1;
      splat.setLocalPosition(-center.x, -center.y, -center.z);
      camera.setPosition(0, 0, radius * 1.66);
      camera.lookAt(0, 0, 0);
      document.getElementById('splat-loader')?.classList.add('is-hidden');
    });

    // Drag to rotate — model stays put otherwise. Horizontal drag only: yaw is the only axis the
    // user can control, pitch stays fixed at the base pose.
    let dragging = false;
    let lastX = 0;
    let yaw = 0;
    const sensitivity = 0.3;

    // Auto-play: slow eased turn from profile to a more front-facing angle, back and forth,
    // so a first-time visitor notices this is a real 3D model and not a static photo. sin() gives
    // a free ease-in/out at both ends of the swing — no tween library needed. Stops for good the
    // moment the user drags, handing off from wherever the swing was to avoid a visual jump.
    let autoPlaying = true;
    // Verified directly (froze rotation at fixed yaw values and screenshotted each) rather than
    // guessed: yaw=0 is close to front-facing and yaw=60 is genuine profile — the old 0-30 range
    // never swung far enough to read as "profile" at either end.
    const AUTO_CENTER = 30;
    const AUTO_AMPLITUDE = 30;
    const AUTO_SPEED = 0.25;
    // sin(time*speed) is 0 at time=0, i.e. yaw=CENTER (mid-swing) — offset the starting phase so
    // the loop instead opens on the profile pose at yaw=CENTER+AMPLITUDE (sin=+1).
    let time = Math.PI / 2 / AUTO_SPEED;

    app.on('update', (dt) => {
      if (!autoPlaying) return;
      time += dt;
      yaw = AUTO_CENTER + Math.sin(time * AUTO_SPEED) * AUTO_AMPLITUDE;
      rig.setLocalEulerAngles(180, yaw, 0);
    });

    // Custom "drag me" cursor that follows the pointer while it's over the canvas.
    const dragCursor = document.createElement('div');
    dragCursor.className = 'drag-cursor';
    dragCursor.textContent = 'drag me';
    document.body.appendChild(dragCursor);
    const bubble = document.getElementById('splat-bubble');

    canvas.style.cursor = 'none';
    canvas.addEventListener('pointerenter', () => dragCursor.classList.add('is-visible'));
    canvas.addEventListener('pointerleave', () => dragCursor.classList.remove('is-visible'));
    canvas.addEventListener('pointermove', (e) => {
      dragCursor.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
    });

    canvas.addEventListener('pointerdown', (e) => {
      autoPlaying = false;
      if (bubble) bubble.classList.add('is-hidden');
      dragging = true;
      lastX = e.clientX;
      dragCursor.textContent = 'dragging';
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      yaw += (e.clientX - lastX) * sensitivity;
      lastX = e.clientX;
      rig.setLocalEulerAngles(180, yaw, 0);
    });
    canvas.addEventListener('pointerup', (e) => {
      dragging = false;
      dragCursor.textContent = 'drag me';
      canvas.releasePointerCapture(e.pointerId);
    });
  }

  app.start();
  resize();
}
