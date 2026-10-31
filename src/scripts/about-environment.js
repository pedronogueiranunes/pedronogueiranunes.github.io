// Local 3D accents shared by About and the home portrait reveal.
// revealOnPose: on the home page the accents appear only once the portrait has fully
// landed in the About section (pose 1) and shrink away when scrolling back up.
import { createAmbientClock } from "./ambient-cadence.js";

export const ABOUT_MOBILE_SCALE = 1.2;

export function setupAboutEnvironment(app, viewport, radius, { revealOnPose = false } = {}) {
  const pc = window.pc;
  const root = new pc.Entity("about-digital-environment");
  app.root.addChild(root);
  // Icon-only lighting layer: the self-illuminated splat and quiet ring stay in World.
  const iconLayer = new pc.Layer({ name: "Satin orbit" });
  const worldIndex = app.scene.layers.getOpaqueIndex(app.scene.layers.getLayerById(pc.LAYERID_WORLD));
  app.scene.layers.insertOpaque(iconLayer, worldIndex + 1);
  const camera = app.root.findByName("camera").camera;
  camera.layers = [...camera.layers, iconLayer.id];
  const lights = new pc.Entity("orbit-lights");
  app.root.addChild(lights);
  const light = (name, color, intensity, angles) => {
    const entity = new pc.Entity(name);
    entity.addComponent("light", { type: "directional", color: new pc.Color(...color), intensity,
      castShadows: false, layers: [iconLayer.id] });
    entity.setLocalEulerAngles(...angles);
    lights.addChild(entity);
  };
  light("soft upper-left key", [1, 0.94, 0.86], 1.05, [55, -35, 0]);
  light("broad cool fill", [0.86, 0.92, 1], 0.42, [15, 140, 0]);
  light("soft edge light", [1, 0.78, 0.58], 0.3, [-25, -145, 0]);
  const meshes = [];
  // Rounded cuboid: project a subdivided box onto a smaller box plus a small
  // sphere. Analytic normals keep the broad faces flat and the edge highlights soft.
  const roundedStroke = (size) => {
    const half = size.map(v => v * radius / 2);
    const bevel = Math.min(...half) * 0.28;
    const core = half.map(v => v - bevel);
    const positions = [], normals = [], indices = [];
    for (let axis = 0; axis < 3; axis++) for (const sign of [-1, 1]) {
      const u = (axis + 1) % 3, v = (axis + 2) % 3;
      const start = positions.length / 3;
      const coordinates = a => [-half[a], -core[a], 0, core[a], half[a]];
      const us = coordinates(u), vs = coordinates(v);
      for (const y of vs) for (const x of us) {
        const point = [0, 0, 0];
        point[axis] = sign * half[axis]; point[u] = x; point[v] = y;
        const center = point.map((n, i) => Math.max(-core[i], Math.min(core[i], n)));
        const normal = point.map((n, i) => n - center[i]);
        const length = Math.hypot(...normal);
        normals.push(...normal.map(n => n / length));
        positions.push(...center.map((n, i) => n + normal[i] / length * bevel));
      }
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        const a = start + y * 5 + x, b = a + 1, c = a + 5, d = c + 1;
        indices.push(...(sign > 0 ? [a, b, c, b, d, c] : [a, c, b, b, c, d]));
      }
    }
    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.setPositions(positions); mesh.setNormals(normals); mesh.setIndices(indices); mesh.update();
    meshes.push(mesh);
    return mesh;
  };
  // Continuous extrusions remove overlapping-stroke seams from the cursor,
  // brackets and chevrons. Contours run counterclockwise.
  const beveledIcon = (corners, depth, bevel) => {
    // Keep the pixel silhouette, but ease each contour corner with a short
    // quadratic arc. The corner radius stays below a quarter of a pixel step.
    const outline = corners.flatMap((p, i) => {
      const prev = corners[(i + corners.length - 1) % corners.length], next = corners[(i + 1) % corners.length];
      const a = [prev[0] - p[0], prev[1] - p[1]], b = [next[0] - p[0], next[1] - p[1]];
      const trim = Math.min(bevel * 1.8, Math.hypot(...a) * 0.24, Math.hypot(...b) * 0.24);
      const start = p.map((n, j) => n + a[j] / Math.hypot(...a) * trim);
      const end = p.map((n, j) => n + b[j] / Math.hypot(...b) * trim);
      return Array.from({ length: 5 }, (_, step) => {
        const t = step / 4;
        return p.map((n, j) => (1 - t) ** 2 * start[j] + 2 * (1 - t) * t * n + t ** 2 * end[j]);
      });
    });
    const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const inset = outline.map((p, i) => {
      const a = outline[(i + outline.length - 1) % outline.length], b = outline[(i + 1) % outline.length];
      const edgeA = [p[0] - a[0], p[1] - a[1]], edgeB = [b[0] - p[0], b[1] - p[1]];
      const na = [-edgeA[1] / Math.hypot(...edgeA), edgeA[0] / Math.hypot(...edgeA)];
      const nb = [-edgeB[1] / Math.hypot(...edgeB), edgeB[0] / Math.hypot(...edgeB)];
      const divisor = 1 + na[0] * nb[0] + na[1] * nb[1];
      return [p[0] + bevel * (na[0] + nb[0]) / divisor, p[1] + bevel * (na[1] + nb[1]) / divisor];
    });
    const positions = [], indices = [];
    const triangle = (a, b, c) => {
      const offset = positions.length / 3;
      positions.push(...a.map(v => v * radius), ...b.map(v => v * radius), ...c.map(v => v * radius));
      indices.push(offset, offset + 1, offset + 2);
    };
    // Ear clipping handles the concave pixel steps without a triangulation dependency.
    const remaining = inset.map((_, i) => i);
    while (remaining.length > 2) {
      let clipped = false;
      for (let i = 0; i < remaining.length; i++) {
        const ids = [remaining[(i + remaining.length - 1) % remaining.length], remaining[i], remaining[(i + 1) % remaining.length]];
        const [a, b, c] = ids.map(id => inset[id]);
        if (cross(a, b, c) <= 1e-10) continue;
        if (remaining.some(id => !ids.includes(id) && cross(a, b, inset[id]) >= 0 && cross(b, c, inset[id]) >= 0 && cross(c, a, inset[id]) >= 0)) continue;
        triangle([...a, depth / 2], [...b, depth / 2], [...c, depth / 2]);
        triangle([...c, -depth / 2], [...b, -depth / 2], [...a, -depth / 2]);
        remaining.splice(i, 1); clipped = true; break;
      }
      if (!clipped) throw new Error("Invalid orbit glyph outline");
    }
    // Six bevel bands keep a continuous satin highlight without softening the pixel steps.
    const profiles = [];
    for (const sign of [-1, 1]) {
      const angles = Array.from({ length: 7 }, (_, i) => (sign < 0 ? i : 6 - i) * Math.PI / 12);
      for (const angle of angles) {
        const contour = inset.map((p, i) => p.map((n, j) => n + (outline[i][j] - n) * Math.sin(angle)));
        profiles.push([contour, sign * (depth / 2 - bevel + Math.cos(angle) * bevel)]);
      }
    }
    // Share vertices across bevel bands so adjacent facets interpolate their
    // normals and catch a continuous highlight instead of a faceted seam.
    const bandStart = positions.length / 3;
    for (const [contour, z] of profiles) {
      for (const point of contour) positions.push(point[0] * radius, point[1] * radius, z * radius);
    }
    for (let band = 0; band < profiles.length - 1; band++) {
      for (let i = 0; i < outline.length; i++) {
        const j = (i + 1) % outline.length;
        const a = bandStart + band * outline.length + i;
        const b = bandStart + band * outline.length + j;
        const c = bandStart + (band + 1) * outline.length + i;
        const d = bandStart + (band + 1) * outline.length + j;
        indices.push(a, b, c, b, d, c);
      }
    }
    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.setPositions(positions); mesh.setNormals(pc.calculateNormals(positions, indices)); mesh.setIndices(indices); mesh.update();
    meshes.push(mesh);
    return mesh;
  };
  const materials = [];
  const material = (color, opacity = 1, lit = false) => {
    const value = new pc.StandardMaterial();
    value.diffuse = new pc.Color(...color);
    value.emissive = new pc.Color(...color.map(v => v * (lit ? 0.08 : 1)));
    // Constant spherical-harmonic ambient is local to this material, not the scene.
    if (lit) {
      value.ambientSH = new Float32Array(27);
      value.ambientSH.set([0.35, 0.35, 0.35]);
    }
    value.useLighting = lit;
    value.useMetalness = true;
    value.metalness = 0;
    value.shininess = 42;
    value.specular = new pc.Color(0.3, 0.3, 0.3);
    // Opacity is shared by the icon coverage fade and the unlit ring.
    value.opacity = opacity;
    // Screen-door opacity keeps the icons in the opaque depth pass. Splats then
    // composite in front/behind per pixel, rather than sorting a whole glyph over a head.
    value.blendType = pc.BLEND_NONE;
    value.opacityDither = pc.DITHER_BAYER;
    // Stable screen-space coverage needs no frame jitter or noise texture. An
    // explicit uniform also keeps opacity available in this engine's opaque pass.
    value.getShaderChunks(pc.SHADERLANGUAGE_GLSL).set("opacityDitherPS", `
      uniform float orbitOpacity;
      void opacityDither(float alpha, float id) {
        float noise = fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(0.06711056, 0.00583715))));
        if (orbitOpacity < noise) discard;
      }
    `);
    value.setParameter("orbitOpacity", opacity);
    value.depthWrite = opacity >= 1;
    value.update();
    materials.push({ value, opacity });
    return value;
  };
  // Small code/design glyphs made from actual 3D strokes and pixel blocks.
  const glyphOrange = material([1, 90 / 255, 31 / 255], 1, true);
  const glyphGreen = material([0.39, 0.45, 0.38], 1, true);
  const ringGray = material([0.82, 0.82, 0.8]);
  const glyphs = [];
  const glyph = (name, phase) => {
    const group = new pc.Entity(name);
    root.addChild(group);
    glyphs.push({ group, phase });
    return group;
  };
  const stroke = (group, size, position, mat, angle = 0) => {
    const part = new pc.Entity("glyph-stroke");
    part.addComponent("render", { meshInstances: [new pc.MeshInstance(roundedStroke(size), mat, part)],
      layers: [iconLayer.id], castShadows: false, receiveShadows: false });
    part.setLocalPosition(...position.map(v => v * radius));
    part.setLocalEulerAngles(0, 0, angle);
    group.addChild(part);
  };
  const solidGlyph = (group, name, outline, depth, bevel, mat) => {
    const part = new pc.Entity(name);
    part.addComponent("render", { meshInstances: [new pc.MeshInstance(beveledIcon(outline, depth, bevel), mat, part)],
      layers: [iconLayer.id], castShadows: false, receiveShadows: false });
    group.addChild(part);
  };
  const brackets = glyph("code-brackets", 0);
  const bracketOutline = [[-0.071, -0.066], [-0.025, -0.066], [-0.025, -0.054], [-0.059, -0.054],
    [-0.059, 0.054], [-0.025, 0.054], [-0.025, 0.066], [-0.071, 0.066]];
  solidGlyph(brackets, "left-bracket", bracketOutline, 0.038, 0.002, glyphOrange);
  solidGlyph(brackets, "right-bracket", bracketOutline.map(([x, y]) => [-x, y]).reverse(), 0.038, 0.002, glyphOrange);
  const cursor = glyph("pixel-cursor", Math.PI / 2);
  // One connected pointer and stem, with slightly deeper satin acrylic edges.
  const outline = [[-0.045, -0.056], [-0.013, -0.056], [-0.004, -0.04],
    [0.025, -0.092], [0.045, -0.08], [0.015, -0.028], [0.051, -0.024], [0.051, -0.008],
    [0.035, -0.008], [0.035, 0.008], [0.019, 0.008], [0.019, 0.024],
    [0.003, 0.024], [0.003, 0.04], [-0.013, 0.04], [-0.013, 0.056],
    [-0.029, 0.056], [-0.029, 0.072], [-0.045, 0.072]];
  solidGlyph(cursor, "beveled-pixel-pointer", outline, 0.046, 0.003, glyphOrange);
  const design = glyph("design-selection-frame", Math.PI);
  // Hollow resize handles read as selection controls rather than solid toy blocks.
  // One shared mesh, still one draw submission per handle.
  const handlePositions = [], handleNormals = [], handleIndices = [];
  const outer = 0.014, inner = 0.007, halfDepth = 0.009;
  const corners = (r, z) => [[-r, -r, z], [r, -r, z], [r, r, z], [-r, r, z]];
  const frontOuter = corners(outer, halfDepth), frontInner = corners(inner, halfDepth);
  const backOuter = corners(outer, -halfDepth), backInner = corners(inner, -halfDepth);
  const quad = (points, normal) => {
    const start = handlePositions.length / 3;
    points.forEach(point => { handlePositions.push(...point.map(v => v * radius)); handleNormals.push(...normal); });
    handleIndices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  };
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    quad([frontOuter[i], frontOuter[j], frontInner[j], frontInner[i]], [0, 0, 1]);
    quad([backOuter[j], backOuter[i], backInner[i], backInner[j]], [0, 0, -1]);
    const normal = [[0, -1, 0], [1, 0, 0], [0, 1, 0], [-1, 0, 0]][i];
    quad([backOuter[i], backOuter[j], frontOuter[j], frontOuter[i]], normal);
    quad([backInner[j], backInner[i], frontInner[i], frontInner[j]], normal.map(v => -v));
  }
  const handleMesh = new pc.Mesh(app.graphicsDevice);
  handleMesh.setPositions(handlePositions); handleMesh.setNormals(handleNormals);
  handleMesh.setIndices(handleIndices); handleMesh.update();
  meshes.push(handleMesh);
  for (const side of [-1, 1]) {
    // End the rails beneath each handle's rim, leaving its centre genuinely open.
    stroke(design, [0.129, 0.007, 0.016], [0, side * 0.055, 0], glyphGreen);
    stroke(design, [0.007, 0.089, 0.016], [side * 0.075, 0, 0], glyphGreen);
    for (const y of [-1, 1]) {
      const handle = new pc.Entity("selection-resize-handle");
      handle.addComponent("render", {
        meshInstances: [new pc.MeshInstance(handleMesh, glyphOrange, handle)],
        layers: [iconLayer.id], castShadows: false, receiveShadows: false,
      });
      handle.setLocalPosition(side * 0.075 * radius, y * 0.055 * radius, 0.005 * radius);
      design.addChild(handle);
    }
  }
  const slash = glyph("code-slash", Math.PI * 1.5);
  stroke(slash, [0.011, 0.118, 0.022], [0, 0, 0], glyphGreen, -20);
  const chevron = [[-0.09, 0], [-0.043, -0.046], [-0.036, -0.039], [-0.076, 0], [-0.036, 0.039], [-0.043, 0.046]];
  solidGlyph(slash, "left-chevron", chevron, 0.024, 0.0015, glyphOrange);
  solidGlyph(slash, "right-chevron", chevron.map(([x, y]) => [-x, y]).reverse(), 0.024, 0.0015, glyphOrange);
  // Dotted ring at shoulder height, spinning with the portrait (12°/s, same as model-interaction).
  // The 96 dots used to be 96 render entities. Baking them into one merged mesh keeps the
  // same silhouette and saves 95 scene nodes and draw submissions for sub-pixel geometry.
  const ring = new pc.Entity("shoulder-ring");
  root.addChild(ring);
  const RING_Y = -0.22, RING_R = 0.58, DOTS = 96;
  {
    const half = 0.003 * radius; // the previous 0.006 * radius box, from centre to face
    // Faces list their four corners counter-clockwise as seen from outside, so the
    // merged cube keeps the engine's default back-face culling.
    const faces = [
      { normal: [1, 0, 0], corners: [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]] },
      { normal: [-1, 0, 0], corners: [[-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, -1, -1]] },
      { normal: [0, 1, 0], corners: [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]] },
      { normal: [0, -1, 0], corners: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]] },
      { normal: [0, 0, 1], corners: [[1, -1, 1], [1, 1, 1], [-1, 1, 1], [-1, -1, 1]] },
      { normal: [0, 0, -1], corners: [[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1]] },
    ];
    const positions = [], normals = [], indices = [];
    for (let i = 0; i < DOTS; i++) {
      const a = (i / DOTS) * Math.PI * 2;
      const yaw = Math.PI / 2 - a; // same orientation each dot had before
      const cos = Math.cos(yaw), sin = Math.sin(yaw);
      const cx = Math.cos(a) * RING_R * radius, cz = Math.sin(a) * RING_R * radius;
      for (const { normal, corners } of faces) {
        const offset = positions.length / 3;
        for (const corner of corners) {
          const x = corner[0] * half, y = corner[1] * half, z = corner[2] * half;
          positions.push(cx + x * cos + z * sin, y, cz - x * sin + z * cos);
          const nx = normal[0], ny = normal[1], nz = normal[2];
          normals.push(nx * cos + nz * sin, ny, -nx * sin + nz * cos);
        }
        indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
      }
    }
    const ringMesh = new pc.Mesh(app.graphicsDevice);
    ringMesh.setPositions(positions);
    ringMesh.setNormals(normals);
    ringMesh.setIndices(indices);
    ringMesh.update();
    meshes.push(ringMesh);
    ring.addComponent("render", {
      meshInstances: [new pc.MeshInstance(ringMesh, ringGray, ring)],
      layers: [iconLayer.id], castShadows: false, receiveShadows: false,
    });
  }
  ring.setLocalPosition(0, RING_Y * radius, 0);
  let ringYaw = 0;
  let time = 0;
  let visible = true;
  const ambientStep = createAmbientClock();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 768px)");
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  observer.observe(viewport);
  // Reuse the capped orbit tick: no extra animation loop or render pass.
  const pointer = { x: 0, y: 0, active: false };
  const hover = matchMedia("(hover: hover) and (pointer: fine)");
  const projected = new pc.Vec3();
  const offsets = glyphs.map(() => ({ x: 0, y: 0 }));
  let entrance = 0;
  const onPointerMove = (event) => {
    if (!hover.matches || motion.matches || !visible || !root.enabled) return;
    const box = viewport.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
    pointer.active = true;
  };
  const onPointerLeave = () => { pointer.active = false; };
  viewport.addEventListener("pointermove", onPointerMove, { passive: true });
  viewport.addEventListener("pointerleave", onPointerLeave);
  const positionGlyphs = (step = 0) => {
    const box = viewport.getBoundingClientRect();
    const canvas = app.graphicsDevice.canvas;
    const blend = 1 - Math.exp(-step * 9);

    glyphs.forEach(({ group, phase }, index) => {
      const progress = motion.matches ? 1 : Math.max(0, Math.min(1, (entrance - index * 0.13) / 0.7));
      const settle = 1 - (1 - progress) ** 3;
      const scale = 1.06 * (0.55 + 0.45 * settle);
      group.enabled = progress > 0;
      group.setLocalScale(scale, scale, scale);
      let pushX = 0, pushY = 0;
      if (pointer.active && progress >= 1) {
        camera.worldToScreen(group.getPosition(), projected);
        const dx = projected.x * box.width / canvas.clientWidth - pointer.x;
        const dy = projected.y * box.height / canvas.clientHeight - pointer.y;
        const distance = Math.hypot(dx, dy);
        const reach = Math.min(box.width, box.height) * 0.3;
        const force = Math.max(0, 1 - distance / reach) ** 2 * radius * 0.13;
        pushX = dx / Math.max(distance, 1) * force;
        pushY = -dy / Math.max(distance, 1) * force;
      }
      const offset = offsets[index];
      offset.x += (pushX - offset.x) * blend;
      offset.y += (pushY - offset.y) * blend;
      // Counter-rotate around the head, at chin height.
      // A deep orbit keeps front/back passes clear of the rotating splat.
      const angle = time * 0.35 + phase; // portrait yaw is +Y; +angle traces the opposite way
      group.setLocalPosition(
        Math.cos(angle) * radius * 0.52 + offset.x,
        ([0.13, -0.04, 0.22, 0.04][index] + Math.sin(time * (0.18 + index * 0.05) + phase * 1.7) * 0.05) * radius + offset.y - (1 - settle) * radius * 0.1, // staggered arrival and slow drift
        Math.sin(angle) * radius * 0.65,
      );
      // Face the viewer while gently tilting, so glyphs stay readable.
      group.setLocalEulerAngles(
        -8 + (1 - settle) * 25 + Math.sin(time * (0.28 + index * 0.035) + phase) * 6,
        [18, -22, 20, -12][index] + Math.sin(time * (0.3 + index * 0.045) + phase) * 10,
        Math.sin(time * (0.4 + index * 0.03) + phase) * (index % 2 ? 9 : 5),
      );
    });
  };
  positionGlyphs();
  const REVEAL_AT = 0.7; // reveal as the portrait is settling into About, not after it lands
  let shown = revealOnPose ? 0 : 1;
  let target = shown;
  const applyReveal = () => {
    root.enabled = shown > 0.001;
    // Smoothstep fade with a slight settle in scale, so the orbit eases in rather than popping.
    const k = shown * shown * (3 - 2 * shown);
    // Follow the enlarged mobile About portrait without changing relative orbit
    // dimensions, the individual glyph scale, or the Home reveal scale.
    const mobileScale = compact.matches && viewport.dataset.autoRotate === "true" ? ABOUT_MOBILE_SCALE : 1;
    const scale = (0.9 + 0.1 * k) * mobileScale;
    root.setLocalScale(scale, scale, scale);
    materials.forEach(({ value, opacity }) => {
      value.opacity = opacity * k;
      value.setParameter("orbitOpacity", opacity * k);
      value.depthWrite = true;
      value.update();
    });
  };
  const onPose = (e) => {
    target = e.detail >= REVEAL_AT ? 1 : 0;
    if (motion.matches) { shown = target; applyReveal(); }
    app.renderNextFrame = true;
  };
  if (revealOnPose) {
    target = Number(viewport.dataset.scrollPose || 0) >= REVEAL_AT ? 1 : 0;
    viewport.addEventListener("portraitpose", onPose);
  }
  applyReveal();
  compact.addEventListener("change", applyReveal);
  const update = (dt) => {
    if (!visible || document.hidden) return;
    if (shown !== target) {
      const delta = Math.min(dt, 0.05) / 0.9; // ~0.9s fade
      shown = motion.matches ? target : target > shown ? Math.min(target, shown + delta) : Math.max(target, shown - delta);
      applyReveal();
      app.renderNextFrame = true;
    }
    if (!root.enabled) {
      entrance = 0;
      pointer.active = false;
      return;
    }
    if (motion.matches) { positionGlyphs(); return; }
    // The orbit never stops while it is on screen, so redraw it on the shared
    // capped ambient cadence instead of on every display frame. The drift is slow
    // enough that 30 Hz is indistinguishable from 60/120 Hz, while the reveal fade
    // above and any interaction keep running at the display refresh rate.
    const step = ambientStep();
    if (!step) return;
    time += step;
    entrance = Math.min(1.2, entrance + step);
    ringYaw = (ringYaw + step * 12) % 360;
    ring.setLocalEulerAngles(0, ringYaw, 0);
    positionGlyphs(step);
    app.renderNextFrame = true;
  };
  app.on("update", update);
  return () => {
    observer.disconnect();
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerleave", onPointerLeave);
    compact.removeEventListener("change", applyReveal);
    viewport.removeEventListener("portraitpose", onPose);
    app.off("update", update);
    root.destroy();
    lights.destroy();
    camera.layers = camera.layers.filter(id => id !== iconLayer.id);
    app.scene.layers.remove(iconLayer);
    meshes.forEach(mesh => mesh.destroy());
    materials.forEach(({ value }) => value.destroy());
  };
}
