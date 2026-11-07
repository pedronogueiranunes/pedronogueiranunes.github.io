// Process card visuals: a pixel-block reveal when they enter the screen (the same
// diagonal staircase as the page curtain) and dithered ripples that follow the cursor.
const DOT = 2; // CSS pixels per dither dot, the grain used across the site
const CELL = 6; // reveal block size, in dots (12px)
const REVEAL_MS = 750;
const RIPPLE_MS = 1000;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const solidBackground = (el) => {
  for (let node = el; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color && !/rgba\(.*,\s*0\)$|transparent/.test(color)) return color.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
  }
  return [255, 255, 255];
};

export function initProcessDither() {
  const visuals = [...document.querySelectorAll('.process-visual')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!visuals.length || reduced.matches) return () => {};
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const abort = new AbortController();
  const sizes = new ResizeObserver((entries) => entries.forEach(({ target }) => {
    const item = items.find((it) => it.visual === target);
    if (item) { resize(item); wake(item); }
  }));
  const items = visuals.map((visual) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'process-fx';
    canvas.setAttribute('aria-hidden', 'true');
    visual.append(canvas);
    return { visual, card: visual.closest('.process-card') ?? visual, canvas, ctx: canvas.getContext('2d'),
      w: 0, h: 0, order: null, cover: [255, 255, 255], revealStart: 0, revealed: false,
      ripples: [], pointer: null, lastRipple: 0, frame: 0 };
  });

  const resize = (item) => {
    const { width, height } = item.visual.getBoundingClientRect();
    item.w = Math.max(1, Math.ceil(width / DOT));
    item.h = Math.max(1, Math.ceil(height / DOT));
    item.canvas.width = item.w;
    item.canvas.height = item.h;
    item.image = item.ctx.createImageData(item.w, item.h);
    // Each block's reveal threshold: a diagonal sweep with a little noise.
    const cols = Math.ceil(item.w / CELL), rows = Math.ceil(item.h / CELL);
    item.cols = cols;
    item.order = Float32Array.from({ length: cols * rows }, (_, i) => {
      const x = i % cols, y = Math.floor(i / cols);
      return ((x + y) / Math.max(1, cols + rows - 2)) * 0.8 + Math.random() * 0.2;
    });
  };

  const draw = (item, now) => {
    const { w, h, image, order, cols, cover, ripples, pointer } = item;
    const data = image.data;
    data.fill(0);
    const progress = item.revealed ? 1 : item.revealStart ? Math.min(1, (now - item.revealStart) / REVEAL_MS) : 0;
    const live = ripples.filter((r) => now - r.t < RIPPLE_MS);
    item.ripples = live;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (progress < 1 && order[Math.floor(y / CELL) * cols + Math.floor(x / CELL)] >= progress) {
          data[i] = cover[0]; data[i + 1] = cover[1]; data[i + 2] = cover[2]; data[i + 3] = 255;
          continue;
        }
        let ink = 0;
        // Expanding rings from recent cursor positions.
        for (const r of live) {
          const age = (now - r.t) / RIPPLE_MS;
          const ring = Math.hypot(x - r.x, y - r.y) - age * 60;
          ink += Math.exp(-(ring * ring) / 18) * (1 - age) * 0.9;
        }
        // A soft halo stays under the cursor.
        if (pointer) {
          const d = Math.hypot(x - pointer.x, y - pointer.y);
          ink += Math.exp(-(d * d) / 160) * 0.45;
        }
        if (ink > (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16) {
          data[i] = 255; data[i + 1] = 90; data[i + 2] = 31; data[i + 3] = 150;
        }
      }
    }
    item.ctx.putImageData(image, 0, 0);
    if (progress >= 1) item.revealed = true;
    return progress < 1 || live.length > 0;
  };

  const tick = (item) => (now) => {
    item.frame = 0;
    if (draw(item, now)) item.frame = requestAnimationFrame(tick(item));
  };
  const wake = (item) => { if (!item.frame) item.frame = requestAnimationFrame(tick(item)); };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      const item = items.find((it) => it.card === target);
      if (!item || !isIntersecting || item.revealStart) return;
      item.cover = solidBackground(item.card);
      item.revealStart = performance.now();
      wake(item);
    });
  }, { threshold: 0.3 });

  items.forEach((item) => {
    resize(item);
    item.cover = solidBackground(item.card);
    draw(item, performance.now()); // covered until it scrolls in
    observer.observe(item.card);
    sizes.observe(item.visual);
    const at = (event) => {
      const rect = item.visual.getBoundingClientRect();
      return { x: (event.clientX - rect.left) / DOT, y: (event.clientY - rect.top) / DOT };
    };
    item.card.addEventListener('pointermove', (event) => {
      if (!fine.matches || !item.revealed) return;
      item.pointer = at(event);
      const now = performance.now();
      if (now - item.lastRipple > 110) { item.ripples.push({ ...item.pointer, t: now }); item.lastRipple = now; }
      wake(item);
    }, { signal: abort.signal, passive: true });
    item.card.addEventListener('pointerleave', () => { item.pointer = null; wake(item); }, { signal: abort.signal });
  });

  return () => {
    abort.abort();
    observer.disconnect();
    sizes.disconnect();
    items.forEach((item) => { cancelAnimationFrame(item.frame); item.canvas.remove(); });
  };
}
