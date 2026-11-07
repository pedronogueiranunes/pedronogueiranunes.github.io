// Renders docs/cv/cv-en.html to the CV PDF the site links to.
// Usage: node scripts/build-cv.mjs
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const src = new URL("../docs/cv/cv-en.html", import.meta.url);
const out = fileURLToPath(new URL("../public/assets/Pedro_Nogueira_CV_2026_EN.pdf", import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(src.href);
if ((await page.content()).includes("{{")) throw new Error("cv-en.html still has {{placeholders}}");
await page.pdf({ path: out, format: "Letter", preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`CV written to ${out}`);
