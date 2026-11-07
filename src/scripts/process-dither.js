// Process card visuals appear in pixel blocks when they enter the screen, with the
// same diagonal staircase as the page curtain. The cover canvas is removed afterwards.
const CELL = 12; // block size in CSS pixels
const REVEAL_MS = 750;

const solidBackground = (el) => {
  for (let node = el; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color && !/rgba\(.*,\s*0\)$|transparent/.test(color)) return color;
  }
  return '#fff';
};

export function initProcessDither() {
  const visuals = [...document.querySelectorAll('.process-visual')];
  if (!visuals.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const frames = new Set();
  const items = visuals.map((visual) => {
    const card = visual.closest('.process-card') ?? visual;
    const canvas = document.createElement('canvas');
    canvas.className = 'process-fx';
    canvas.setAttribute('aria-hidden', 'true');
    visual.append(canvas);
    const { width, height } = visual.getBoundingClientRect();
    const cols = Math.ceil(width / CELL), rows = Math.ceil(height / CELL);
    canvas.width = cols;
    canvas.height = rows;
    // Each block's reveal threshold: a diagonal sweep with a little noise.
    const order = Array.from({ length: cols * rows }, (_, i) =>
      (((i % cols) + Math.floor(i / cols)) / Math.max(1, cols + rows - 2)) * 0.8 + Math.random() * 0.2);
    const ctx = canvas.getContext('2d');
    const paint = (progress) => {
      ctx.clearRect(0, 0, cols, rows);
      ctx.fillStyle = solidBackground(card);
      order.forEach((t, i) => { if (t >= progress) ctx.fillRect(i % cols, Math.floor(i / cols), 1, 1); });
    };
    paint(0); // covered until it scrolls in
    return { card, canvas, paint };
  });

  const reveal = (item) => {
    const start = performance.now();
    const step = (now) => {
      frames.delete(frame);
      const progress = (now - start) / REVEAL_MS;
      if (progress >= 1) { item.canvas.remove(); return; }
      item.paint(progress);
      frame = requestAnimationFrame(step);
      frames.add(frame);
    };
    let frame = requestAnimationFrame(step);
    frames.add(frame);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      const item = items.find((it) => it.card === target);
      if (item) reveal(item);
    });
  }, { threshold: 0.3 });
  items.forEach((item) => observer.observe(item.card));

  return () => {
    observer.disconnect();
    frames.forEach(cancelAnimationFrame);
    items.forEach((item) => item.canvas.remove());
  };
}
