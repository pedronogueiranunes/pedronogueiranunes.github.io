// Local 3D accents; only the About portrait creates these entities.
export function setupAboutEnvironment(app, viewport, radius) {
  const pc = window.pc;
  const root = new pc.Entity("about-digital-environment");
  app.root.addChild(root);
  const materials = [];
  const material = (color, opacity = 1, lit = false) => {
    const value = new pc.StandardMaterial();
    value.diffuse = new pc.Color(...color);
    value.emissive = new pc.Color(...color.map(v => v * (lit ? 0.18 : 1)));
    value.useLighting = lit;
    value.shininess = 65;
    if (opacity < 1) {
      value.opacity = opacity;
      value.blendType = pc.BLEND_NORMAL;
      value.depthWrite = false;
    }
    value.update();
    materials.push(value);
    return value;
  };
  // Small code/design glyphs made from actual 3D strokes and pixel blocks.
  const glyphOrange = material([1, 0.353, 0.122]);
  const glyphGreen = material([0.39, 0.45, 0.38]);
  const glyphs = [];
  const glyph = (name, phase) => {
    const group = new pc.Entity(name);
    root.addChild(group);
    glyphs.push({ group, phase });
    return group;
  };
  const stroke = (group, size, position, mat, angle = 0) => {
    const part = new pc.Entity("glyph-stroke");
    part.addComponent("render", { type: "box" });
    part.render.material = mat;
    part.setLocalScale(...size.map(v => v * radius));
    part.setLocalPosition(...position.map(v => v * radius));
    part.setLocalEulerAngles(0, 0, angle);
    group.addChild(part);
  };
  const brackets = glyph("code-brackets", 0);
  for (const side of [-1, 1]) {
    stroke(brackets, [0.012, 0.13, 0.018], [side * 0.065, 0, 0], glyphOrange);
    for (const y of [-1, 1]) stroke(brackets, [0.045, 0.012, 0.018], [side * 0.048, y * 0.06, 0], glyphOrange);
  }
  const cursor = glyph("pixel-cursor", Math.PI / 2);
  // A stepped pointer silhouette, with a separate diagonal stem.
  [1, 2, 3, 4, 5, 6, 3, 2].forEach((length, row) => {
    stroke(cursor, [length * 0.016, 0.016, 0.022], [length * 0.008 - 0.045, 0.064 - row * 0.016, 0], glyphOrange);
  });
  stroke(cursor, [0.022, 0.07, 0.022], [0.022, -0.07, 0], glyphOrange, 28);
  const design = glyph("design-selection-frame", Math.PI);
  for (const side of [-1, 1]) {
    stroke(design, [0.15, 0.006, 0.012], [0, side * 0.055, 0], glyphGreen);
    stroke(design, [0.006, 0.11, 0.012], [side * 0.075, 0, 0], glyphGreen);
    for (const y of [-1, 1]) stroke(design, [0.025, 0.025, 0.018], [side * 0.075, y * 0.055, 0.005], glyphOrange);
  }
  const slash = glyph("code-slash", Math.PI * 1.5);
  stroke(slash, [0.012, 0.13, 0.016], [0, 0, 0], glyphGreen, -25);
  for (const side of [-1, 1]) {
    stroke(slash, [0.06, 0.01, 0.016], [side * 0.063, 0.022, 0], glyphOrange, side * -40);
    stroke(slash, [0.06, 0.01, 0.016], [side * 0.063, -0.022, 0], glyphOrange, side * 40);
  }
  let time = 0;
  let visible = true;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  observer.observe(viewport);
  const positionGlyphs = () => {
    glyphs.forEach(({ group, phase }, index) => {
      // Counter-rotate around the full torso envelope, below the shoulders.
      // A deep orbit keeps front/back passes clear of the rotating splat.
      const angle = time * 0.35 + phase; // portrait yaw is +Y; +angle traces the opposite way
      group.setLocalPosition(
        Math.cos(angle) * radius * 0.52,
        ([-0.16, -0.25, -0.36, -0.3][index] + Math.sin(time * (0.45 + index * 0.06) + phase) * 0.018) * radius,
        Math.sin(angle) * radius * 0.65,
      );
      // Face the viewer while gently tilting, so glyphs stay readable.
      group.setLocalEulerAngles(
        Math.sin(time * (0.28 + index * 0.035) + phase) * (index % 2 ? 12 : 6),
        Math.sin(time * (0.3 + index * 0.045) + phase) * (index % 2 ? 22 : 14),
        Math.sin(time * (0.4 + index * 0.03) + phase) * (index % 2 ? 9 : 5),
      );
    });
  };
  positionGlyphs();
  const update = (dt) => {
    if (!visible || document.hidden || motion.matches) return;
    time += Math.min(dt, 0.05);
    positionGlyphs();
    app.renderNextFrame = true;
  };
  app.on("update", update);
  return () => {
    observer.disconnect();
    app.off("update", update);
    root.destroy();
    materials.forEach(value => value.destroy());
  };
}
