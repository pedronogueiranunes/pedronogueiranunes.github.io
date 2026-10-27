// Small, scroll-linked counter-motion for the mobile comparison illustrations.
export function initComparisonParallax() {
  const cards = [...document.querySelectorAll('.comparison-row')]
    .map(card => ({ card, image: card.querySelector('.comparison-illustration img') }))
    .filter(({ image }) => image);
  if (!cards.length) return () => {};

  const media = matchMedia('(max-width: 768px) and (prefers-reduced-motion: no-preference)');
  let stop = () => {};
  const configure = () => {
    stop();
    if (!media.matches) return;
    const visible = new Set();
    let frame = 0;
    const update = () => {
      frame = 0;
      if (document.hidden) return;
      // Read all card bounds before updating transforms. Layout stays unchanged.
      const positions = [...visible].map(item => {
        const bounds = item.card.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / (innerHeight + bounds.height)));
        return [item.image, 8 - progress * 40];
      });
      positions.forEach(([image, y]) => { image.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`; });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const items = new Map(cards.map(item => [item.card, item]));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const item = items.get(entry.target);
        if (entry.isIntersecting) visible.add(item);
        else visible.delete(item);
      });
      schedule();
    });
    cards.forEach(({ card }) => observer.observe(card));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    stop = () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
      cards.forEach(({ image }) => image.style.removeProperty('transform'));
      stop = () => {};
    };
  };
  configure();
  media.addEventListener('change', configure);
  return () => {
    media.removeEventListener('change', configure);
    stop();
  };
}
