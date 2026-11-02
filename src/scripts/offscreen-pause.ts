// Pauses CSS animations in page sections that are off screen. Infinite loops
// (lettering tracks, process visuals, strokes) otherwise keep ticking style and
// paint work on phones while nobody can see them.
export function initOffscreenPause() {
  if (!("IntersectionObserver" in window)) return () => {};
  const targets = document.querySelectorAll<HTMLElement>("main > :not(script), .site-footer");
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.classList.toggle("offscreen-paused", !entry.isIntersecting);
  }, { rootMargin: "200px 0px" });
  targets.forEach((el) => observer.observe(el));
  return () => {
    observer.disconnect();
    targets.forEach((el) => el.classList.remove("offscreen-paused"));
  };
}
