// Some project videos have an AV1 copy (name.av1.mp4) next to the H.264 file (name.mp4);
// scripts/encode-videos.sh writes the list. Browsers that report AV1 support get the smaller
// copy; the rest, or any AV1 load error, get H.264. Level 4.1 covers the 1920x1200 at 60 fps files.
import av1Videos from "../data/av1-videos.json";

const hasAv1 = new Set<string>(av1Videos);
const AV1 = typeof document !== "undefined" &&
  document.createElement("video").canPlayType('video/mp4; codecs="av01.0.09M.08"') === "probably";

/** Loads the first playable URL, trying each one's AV1 copy first when it exists. `onSwap` runs after a fallback. */
export function loadVideo(video: HTMLVideoElement, urls: string[], onSwap?: () => void) {
  const list = urls.flatMap((url) => AV1 && hasAv1.has(url) ? [url.replace(/\.mp4$/, ".av1.mp4"), url] : [url]);
  let index = 0;
  const onError = () => {
    if (++index >= list.length) return video.removeEventListener("error", onError);
    video.src = list[index];
    video.load();
    onSwap?.();
  };
  video.addEventListener("error", onError);
  video.src = list[0];
  video.load();
}
