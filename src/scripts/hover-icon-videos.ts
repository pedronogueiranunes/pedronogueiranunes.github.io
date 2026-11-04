import { onPageLoad } from './page-lifecycle';

onPageLoad((scope) => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const narrow = matchMedia('(max-width: 768px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  // Animated WebP preserves transparency on WebKit, including iPhone browsers.
  const webkit = /Apple/.test(navigator.vendor) || /iPhone|iPad|iPod/.test(navigator.userAgent);
  const automatic = () => narrow.matches || !fine.matches;

  document.querySelectorAll<HTMLElement>('.home-dither-video, .offer-dither-video').forEach((art) => {
    const card = art.closest<HTMLElement>('.problem-card, .offer-card');
    const video = art.querySelector('video');
    const image = art.querySelector('img');
    if (!card || !video || !image) return;
    const poster = image.src;
    const source = video.dataset.hoverSrc!;
    const fallback = source.replace('-dither.webm', '-hover.webp');
    let hovered = false, focused = false, visible = false, version = 0, pending = false;
    const wanted = () => visible && (automatic() || hovered || focused)
      && !reduced.matches && !connection?.saveData && !document.hidden && !scope.signal.aborted;

    const stop = () => {
      version++;
      pending = false;
      video.pause();
      delete art.dataset.playing;
      if (video.readyState) video.currentTime = 0;
      if (image.src !== poster) image.src = poster;
    };
    const play = async () => {
      if (!wanted()) { stop(); return; }
      if (webkit) {
        if (image.src === poster) image.src = fallback;
        return;
      }
      if (!video.paused || pending) return;
      const request = ++version;
      pending = true;
      if (!video.src) video.src = source;
      try {
        await video.play();
        if (request !== version || !wanted()) {
          if (!wanted()) video.pause();
          return;
        }
        art.dataset.playing = '';
      } catch { /* Preserve the matching still if playback is unavailable. */ }
      finally { pending = false; }
    };
    const sync = () => { if (wanted()) void play(); else stop(); };
    video.addEventListener('error', stop, { signal: scope.signal });
    image.addEventListener('error', () => { if (image.src !== poster) image.src = poster; }, { signal: scope.signal });
    card.addEventListener('pointerenter', () => { hovered = fine.matches; sync(); }, { signal: scope.signal });
    card.addEventListener('pointerleave', () => { hovered = false; sync(); }, { signal: scope.signal });
    card.addEventListener('focusin', () => { focused = true; sync(); }, { signal: scope.signal });
    card.addEventListener('focusout', (event) => {
      if (!card.contains(event.relatedTarget as Node)) { focused = false; sync(); }
    }, { signal: scope.signal });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .01;
      sync();
    }, { threshold: .01 });
    observer.observe(card);
    reduced.addEventListener('change', sync, { signal: scope.signal });
    fine.addEventListener('change', sync, { signal: scope.signal });
    narrow.addEventListener('change', sync, { signal: scope.signal });
    document.addEventListener('visibilitychange', sync, { signal: scope.signal });
    scope.cleanup(() => { stop(); observer.disconnect(); video.removeAttribute('src'); video.load(); });
  });
});
