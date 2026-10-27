let loading: Promise<void> | undefined;
export function loadPlayCanvas() {
  return loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/assets/vendor/playcanvas.min.js";
    script.onload = () => resolve();
    script.onerror = () => { loading = undefined; script.remove(); reject(new Error("PlayCanvas unavailable")); };
    document.head.appendChild(script);
  });
}
