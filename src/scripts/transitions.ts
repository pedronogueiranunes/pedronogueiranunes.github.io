import type { TransitionBeforeSwapEvent, TransitionBeforePreparationEvent } from "astro:transitions/client";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const number = (name: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
let themeTransition: ViewTransition | undefined;
let navigationTransition: ViewTransition | undefined;
let navigating = false;
let moved = false;

// Row-by-row raster contour: every edge lands on a square cell boundary.
// Discrete keyframes avoid interpolating hundreds of points each frame.
function pixelCircle(x: number, y: number, radius: number, cell: number) {
  const right: string[] = [], left: string[] = [];
  for (let top = 0; top < innerHeight; top += cell) {
    const dy = top + cell / 2 - y;
    const half = Math.sqrt(Math.max(0, radius * radius - dy * dy));
    const a = Math.max(0, Math.floor((x - half) / cell) * cell);
    const b = Math.min(innerWidth, Math.ceil((x + half) / cell) * cell);
    const low = Math.min(top + cell, innerHeight);
    const visible = Math.abs(dy) <= radius;
    const l = visible ? a : Math.round(x / cell) * cell;
    const r = visible ? b : l;
    right.push(`${r}px ${top}px`, `${r}px ${low}px`);
    left.unshift(`${l}px ${low}px`, `${l}px ${top}px`);
  }
  return `polygon(${[...right, ...left].join(",")})`;
}

export function changeTheme(theme: string, control: HTMLElement, sync: () => void) {
  if (navigating) { sync(); return; }
  const previous = document.querySelector<HTMLElement>(".theme-segments input:checked + span .theme-icon");
  if (!reduced()) previous?.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-3px)" }], { duration: 90, easing: "steps(3, end)" });
  const flipTheme = () => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch {}
    sync();
  };
  themeTransition?.skipTransition();
  if (!document.startViewTransition || reduced()) { flipTheme(); return; }
  const rect = control.getBoundingClientRect();
  const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
  const root = document.documentElement;
  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.dataset.transition = "theme";
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + number("--theme-cell-size");
  const steps = number("--theme-steps");
  const cell = number("--theme-cell-size");
  const frames = Array.from({ length: steps + 1 }, (_, i) => ({
    clipPath: i === 0 ? `circle(0px at ${x}px ${y}px)` : i === steps ? "inset(0)" : pixelCircle(x, y, radius * i / steps, cell),
    offset: i / steps, easing: "steps(1, end)",
  }));
  const transition = document.startViewTransition(flipTheme);
  themeTransition = transition;
  let animation: Animation | undefined;
  transition.ready.then(() => {
    animation = root.animate(frames, {
      duration: number("--theme-duration"), easing: "linear", fill: "both",
      pseudoElement: "::view-transition-new(root)",
    });
  }).catch(() => {});
  // Promise identity prevents a superseded transition resetting the next one's mode.
  transition.finished.catch(() => {}).then(() => {
    animation?.cancel();
    if (themeTransition !== transition) return;
    themeTransition = undefined;
    delete root.dataset.transition;
  });
}

function curtainBand(progress: number, backward: boolean) {
  const cell = number("--curtain-cell-size");
  const cols = Math.ceil(innerWidth / cell), rows = Math.ceil(innerHeight / cell);
  const extent = cols + rows;
  const front = Math.min(1, progress / 0.45) * extent;
  const tail = Math.max(0, (progress - 0.55) / 0.45) * extent;
  const right: string[] = [], left: string[] = [];
  // Percentages of the snapshot's own box: the band always spans the whole curtain,
  // even when the transition layer's size differs from innerWidth/innerHeight.
  const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`;
  const point = (x: number, y: number) => `${pct(backward ? innerWidth - x : x, innerWidth)} ${pct(y, innerHeight)}`;
  for (let row = 0; row < rows; row++) {
    const top = row * cell, bottom = Math.min(innerHeight, top + cell);
    const a = Math.min(innerWidth, Math.max(0, Math.floor(tail - row) * cell));
    const b = Math.min(innerWidth, Math.max(0, Math.floor(front - row) * cell));
    right.push(point(b, top), point(b, bottom));
    left.unshift(point(a, bottom), point(a, top));
  }
  return `polygon(${[...right, ...left].join(",")})`;
}

document.addEventListener("astro:before-preparation", (event) => {
  const e = event as TransitionBeforePreparationEvent;
  // Hash-only changes retain Astro's native anchor and history behavior.
  moved = e.from.pathname !== e.to.pathname || e.from.search !== e.to.search;
  themeTransition?.skipTransition();
  document.querySelector<HTMLDialogElement>("#mobile-menu")?.close();
});
document.addEventListener("astro:before-swap", (event) => {
  const e = event as TransitionBeforeSwapEvent;
  const root = document.documentElement;
  e.newDocument.documentElement.dataset.theme = root.dataset.theme || "auto";
  delete e.newDocument.documentElement.dataset.transition;
  delete e.newDocument.documentElement.dataset.pageArrival;
  if (!document.startViewTransition || !e.viewTransition) {
    navigating = false;
    navigationTransition = undefined;
    return;
  }
  navigating = moved;
  themeTransition?.skipTransition();
  navigationTransition = e.viewTransition;
  const transition = e.viewTransition;
  let animation: Animation | undefined;
  const curtain = e.newDocument.querySelector<HTMLElement>("#pixel-curtain");
  const animate = !!document.startViewTransition && !reduced() && moved;
  if (curtain && animate) {
    curtain.style.visibility = "visible";
    e.newDocument.documentElement.dataset.pageArrival = "pending";
  }
  transition.ready.then(() => {
    if (!animate) return;
    const steps = number("--curtain-steps");
    animation = root.animate(Array.from({ length: steps + 1 }, (_, i) => ({
      clipPath: curtainBand(i / steps, e.direction === "back"), offset: i / steps, easing: "steps(1, end)",
    })), {
      pseudoElement: "::view-transition-new(pixel-curtain)",
      duration: number("--curtain-duration"), delay: number("--curtain-delay"),
      easing: "linear", fill: "both",
    });
  }).catch(() => {});
  transition.finished.catch(() => {}).then(() => {
    animation?.cancel();
    if (navigationTransition === transition) {
      document.getElementById("pixel-curtain")?.style.setProperty("visibility", "hidden");
      navigationTransition = undefined; navigating = false;
      delete document.documentElement.dataset.pageArrival;
      document.dispatchEvent(new Event("portfolio:page-arrival"));
    }
  });
});
document.addEventListener("astro:page-load", () => {
  if (!moved) return;
  moved = false;
  // preventScroll preserves both restored history positions and destination hashes.
  const target = document.querySelector<HTMLElement>("main h1") || document.querySelector<HTMLElement>("main");
  target?.setAttribute("tabindex", "-1");
  target?.focus({ preventScroll: true });
});
