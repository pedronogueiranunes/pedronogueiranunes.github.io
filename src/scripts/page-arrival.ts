import { onPageLoad } from "./page-lifecycle";

const DURATION = 360;
const STAGGER = 24;
const MAX_DELAY = 192;
const SELECTOR = [
  "h1", "h2", "h3", "p", "nav", ".actions", ".chips", "form",
  "article", ".case-identity-group", ".case-external-actions", ".case-result-card",
  ".browser-mockup", ".project-card", ".featured-project-card", ".projects-filters",
  ".about-stats", ".bio-facts", ".contact-form",
].join(",");

onPageLoad(scope => {
  const root = document.documentElement;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const animations: Animation[] = [];
  const targets: HTMLElement[] = [];
  let started = false;
  const finish = () => {
    animations.forEach(animation => animation.cancel());
    targets.forEach(element => element.removeAttribute("data-page-enter"));
    delete root.dataset.pageArrival;
  };
  const start = () => {
    if (started) return;
    started = true;
    if (motion.matches) { finish(); return; }
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(`main :is(${SELECTOR})`))
      .filter(element => {
        if (element.closest("[hidden], dialog, [aria-hidden='true']")) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0 && getComputedStyle(element).visibility !== "hidden";
      });
    // Animate coherent groups once, rather than transforming their children twice.
    const topLevel = candidates.filter(element => !candidates.some(parent => parent !== element && parent.contains(element)));
    const ordered = topLevel.map(element => ({element, rect: element.getBoundingClientRect()}))
      .sort((a,b) => Math.abs(a.rect.top-b.rect.top) < 32 ? a.rect.left-b.rect.left : a.rect.top-b.rect.top)
      .slice(0, 16);
    try {
      ordered.forEach(({element}, index) => {
        element.setAttribute("data-page-enter", "");
        targets.push(element);
        const animation = element.animate([
          { opacity: 0, translate: "0 28px", scale: ".985", offset: 0, easing: "cubic-bezier(.16,1,.3,1)" },
          { opacity: 1, translate: "0 -4px", scale: "1.003", offset: .62, easing: "ease-out" },
          { opacity: 1, translate: "0 1px", scale: "1", offset: .84, easing: "ease-out" },
          { opacity: 1, translate: "0 0", scale: "1", offset: 1 },
        ], {duration:DURATION, delay:Math.min(index*STAGGER,MAX_DELAY), fill:"both"});
        animations.push(animation);
        animation.finished.then(() => {
          animation.cancel();
          element.removeAttribute("data-page-enter");
        }).catch(() => {});
      });
    } catch {
      finish();
    } finally {
      // No hidden content remains if animation setup fails or finds no targets.
      delete root.dataset.pageArrival;
    }
  };
  document.addEventListener("portfolio:page-arrival", start, {signal:scope.signal});
  const onMotion = () => { if(motion.matches) finish(); };
  motion.addEventListener("change", onMotion, {signal:scope.signal});
  // New navigations cancel active landings even before the next DOM swap.
  document.addEventListener("astro:before-preparation", finish, {signal:scope.signal});
  if(root.dataset.pageArrival !== "pending") start();
  else scope.timeout(start, 1200); // Reveal safely if a skipped transition never finishes.
  scope.cleanup(finish);
});
