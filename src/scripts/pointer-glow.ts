import { onPageLoad } from "./page-lifecycle";

onPageLoad(({ signal, cleanup }) => {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  document.querySelectorAll<HTMLElement>(
    '.action:not(.action--secondary):not(.case-sidebar-cta .action), .project-media-frame',
  ).forEach((button) => {
    let frame = 0;
    let x = 50;
    let y = 50;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      button.style.removeProperty("--glow-x");
      button.style.removeProperty("--glow-y");
      button.style.removeProperty("--glow-strength");
    };
    button.addEventListener("pointermove", (event) => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType === "touch") return;
      const rect = button.getBoundingClientRect();
      x = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
      y = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        button.style.setProperty("--glow-strength", "1");
        button.style.setProperty("--glow-x", `${x}%`);
        button.style.setProperty("--glow-y", `${y}%`);
        frame = 0;
      });
    }, { signal, passive: true });
    button.addEventListener("pointerleave", reset, { signal });
    button.addEventListener("pointercancel", reset, { signal });
    cleanup(reset);
  });
});
