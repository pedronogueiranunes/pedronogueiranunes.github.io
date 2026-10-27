/** Each initializer owns its resources until the next swap (including persisted DOM). */
export function onPageLoad(init: (scope: PageScope) => void) {
  let dispose: (() => void) | undefined;
  document.addEventListener("astro:page-load", () => {
    dispose?.();
    const controller = new AbortController();
    const cleanups: (() => void)[] = [];
    const scope: PageScope = {
      signal: controller.signal,
      cleanup: (fn) => cleanups.push(fn),
      timeout: (fn, delay) => {
        const id = window.setTimeout(() => { if (!controller.signal.aborted) fn(); }, delay);
        cleanups.push(() => clearTimeout(id));
        return id;
      },
      frame: (fn) => {
        const id = requestAnimationFrame((time) => { if (!controller.signal.aborted) fn(time); });
        cleanups.push(() => cancelAnimationFrame(id));
        return id;
      },
      idle: (fn) => {
        const id = window.requestIdleCallback(() => { if (!controller.signal.aborted) fn(); }, { timeout: 4000 });
        cleanups.push(() => window.cancelIdleCallback(id));
      },
    };
    dispose = () => {
      controller.abort();
      cleanups.reverse().forEach((fn) => fn());
      dispose = undefined;
    };
    init(scope);
  });
  document.addEventListener("astro:before-swap", () => dispose?.());
}
export interface PageScope {
  signal: AbortSignal;
  cleanup: (fn: () => void) => void;
  timeout: (fn: () => void, delay: number) => number;
  frame: (fn: FrameRequestCallback) => number;
  idle: (fn: () => void) => void;
}
