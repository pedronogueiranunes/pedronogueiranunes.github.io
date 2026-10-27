export function initProcessMotion() {
  const cards = [...document.querySelectorAll('.process-card')];
  if (!cards.length) return () => {};
  const visible = new Set();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => cards.forEach(card => card.classList.toggle('is-motion-running',
    visible.has(card) && !document.hidden && !motion.matches));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) visible.add(target);
      else visible.delete(target);
    });
    sync();
  }, { threshold: 0.15 });
  cards.forEach(card => observer.observe(card));
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
    cards.forEach(card => card.classList.remove('is-motion-running'));
  };
}
