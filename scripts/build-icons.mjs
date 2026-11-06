// Renders the favicon and iOS icon: the logo's "P" in Silkscreen, extruded and tilted like the navbar logo.
// Usage: node scripts/build-icons.mjs [orange|white] [outDir]   (defaults: orange, public)
import { chromium } from "playwright";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const variant = process.argv[2] ?? "orange";
const outDir = process.argv[3] ?? fileURLToPath(new URL("../public", import.meta.url));
const ACCENT = "#FF5A1F";
const [bg, face, depthMix] = variant === "white" ? ["#FFFFFF", ACCENT, "#FFFFFF"] : [ACCENT, "#FFFFFF", ACCENT];
const font = (await readFile(new URL("../public/assets/fonts/silkscreen-latin-400-normal.woff2", import.meta.url))).toString("base64");

// Same recipe as .site-logo__model: stacked copies pushed back in Z, fading into the background.
const LAYERS = 40;
const layers = Array.from({ length: LAYERS }, (_, d) =>
  `<span style="transform:translateZ(${-d * 3}px);color:${d ? `color-mix(in srgb, ${face} ${Math.max(18, 62 - d * 1.2)}%, ${depthMix})` : face}">P</span>`
).join("");

const html = `<!doctype html><style>
@font-face { font-family: Silk; src: url(data:font/woff2;base64,${font}) format("woff2"); }
html, body { margin: 0; width: 512px; height: 512px; background: ${bg}; overflow: hidden; }
.stage { width: 512px; height: 512px; display: grid; place-items: center; perspective: 2000px; }
.model { display: grid; transform-style: preserve-3d; transform: translate(34px, -6px) rotateX(16deg) rotateY(24deg);
  font: 400 540px/0.78 Silk; }
.model > span { grid-area: 1 / 1; }
</style><div class="stage"><div class="model">${layers}</div></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const master = await page.screenshot({ type: "png" });
await browser.close();

await mkdir(outDir, { recursive: true });
const png = (size) => sharp(master).resize(size, size, { kernel: "lanczos3" }).png().toBuffer();
// ponytail: no web manifest, so no 192/512 icons; add them with a manifest if the site becomes installable.
const [p16, p32, p180] = await Promise.all([16, 32, 180].map(png));
await writeFile(`${outDir}/favicon-32.png`, p32);
await writeFile(`${outDir}/apple-touch-icon.png`, p180);

// ICO that wraps PNGs (supported everywhere since Vista): 6-byte header, 16-byte entry per image, then data.
const images = [[16, p16], [32, p32]];
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach(([size, buf], i) => {
  const e = 6 + i * 16;
  header.writeUInt8(size, e); header.writeUInt8(size, e + 1);
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(buf.length, e + 8); header.writeUInt32LE(offset, e + 12);
  offset += buf.length;
});
await writeFile(`${outDir}/favicon.ico`, Buffer.concat([header, ...images.map(([, b]) => b)]));
console.log(`Icons (${variant}) written to ${outDir}`);
