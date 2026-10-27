// Home-only progressive enhancement. The hero and portrait remain untouched.
// Runs on every astro:page-load (ClientRouter); returns a cleanup for before-swap.
export function initReveal() {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const targets = new Set();
  const groups = document.querySelectorAll("main > section:not(.home-hero) .section-heading > div, .home-bio > div:last-child, .section-heading, .problem-grid, .process-grid, .article-grid, .project-rail, .bio-facts, .toolkit > .chips");
  for (const group of groups) {
    [...group.children].forEach((element, index) => {
      if (element.matches(".section-eyebrow, h2, p, a, .actions, article, .bio-facts, .tool-chip")) {
        element.dataset.reveal = "";
        element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 400)}ms`);
        targets.add(element);
      }
    });
  }
  for (const element of document.querySelectorAll("main .section-eyebrow, main .toolkit")) {
    element.dataset.reveal = "";
    targets.add(element);
  }
  const typing = new Map();
  function typeLabel(element) {
    if (!element.matches(".section-eyebrow") || motion.matches) return;
    const full = document.createElement("span");
    const icon = element.querySelector("svg");
    for (const node of [...element.childNodes]) {
      if (node !== icon) full.append(node);
    }
    full.className = "eyebrow-reserved";
    const visual = document.createElement("span");
    visual.className = "eyebrow-typed";
    visual.setAttribute("aria-hidden", "true");
    const wrap = document.createElement("span");
    wrap.className = "eyebrow-terminal";
    wrap.append(full, visual);
    element.append(wrap);
    const text = full.textContent.trim();
    let index = 0;
    const tick = () => {
      visual.textContent = text.slice(0, ++index);
      if (index < text.length) typing.set(element, setTimeout(tick, 35));
      else {
        typing.delete(element);
        visual.classList.add("is-complete");
      }
    };
    tick();
  }
  function show(element, animate = true) {
    element.classList.add("is-visible");
    if (animate) typeLabel(element);
  }
  if (motion.matches || !("IntersectionObserver" in window)) return () => {};
  {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        show(entry.target);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
    // Only hide after setup succeeds. In-view content skips the entrance.
    for (const element of targets) {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < innerHeight && bounds.bottom > 0) show(element, false);
      else observer.observe(element);
    }
    document.documentElement.classList.add("home-reveal-ready");
    const onMotionChange = () => {
      if (!motion.matches) return;
      observer.disconnect();
      for (const timer of typing.values()) clearTimeout(timer);
      typing.clear();
      document.documentElement.classList.remove("home-reveal-ready");
      for (const element of targets) show(element, false);
    };
    motion.addEventListener("change", onMotionChange);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotionChange);
      for (const timer of typing.values()) clearTimeout(timer);
      typing.clear();
      document.documentElement.classList.remove("home-reveal-ready");
    };
  }
}
