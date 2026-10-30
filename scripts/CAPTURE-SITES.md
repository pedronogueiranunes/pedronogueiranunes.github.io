# High-quality site recordings

Prerequisites: Node.js, FFmpeg/FFprobe on PATH, `npm install`, then `npx playwright install chromium`. Uses Chromium's experimental native `Page.startScreenRecording` API; keep the pinned Playwright browser revision. Unsupported browsers fail explicitly rather than falling back to the low-frame-rate recorder.

Run `npm run capture:sites` for all configured URLs, or `npm run capture:sites -- green-nation-collective` for one. `npm run capture:sites -- --resume` reuses existing HQ exports and regenerates covers, recording missing outputs. `CAPTURE_BROWSER` optionally selects a compatible installed Chromium executable.

Configuration: `scripts/capture-sites.json`. Standard viewport 1920 × 1200 at device scale 1, light theme, English locale, animations enabled, native recording capped at 60 fps. Actual source frame rate is measured in the report; constant-rate exports do not invent missing motion. No optical-flow interpolation is used.

Waits for page load, fonts and initial images, then another three seconds. Scroll runs at 320 CSS px/s with 1.5-second holds before/after. The 240-second safety limit protects against infinite pages; incomplete scrolls retain the master but fail the full export instead of labelling a partial capture complete. Per-site options: `loadWaitMs`, `maxSeconds`, `dismissSelector` for an explicit cookie-banner control. Consent is not clicked automatically without a configured selector.

Outputs under ignored `captures-hq/<site-id>/`:

- `master.webm`: native full-resolution recording, no intermediate Playwright video compression or navigation/loading frames.
- `full.mp4`: complete scroll, 1920 × 1200, 60 fps output, H.264 CRF 18, silent, fast start. Intended for the browser frame in project details. This is deliberately larger than a thumbnail.
- `preview.mp4`: first 12 seconds, 960 × 600, 30 fps, H.264 CRF 23.
- `poster.webp` and `poster.png`: frame at 0.5 seconds.

`captures-hq/report.json` records successes, failures, scroll completion, source codec/resolution/frame rates and file sizes. HTTP errors are rejected. A failed site does not stop the rest. Check the actual rendered site too: an HTTP 200 response can still contain an error message, consent overlay, or unavailable embedded content.

Keep masters locally. Publish only optimized derivatives and a poster; load full project videos when the visitor approaches the browser frame, and pause offscreen. Do not preload every full recording on the project list. Existing project-card assets are not replaced automatically.

The earlier baseline recordings remain in `captures/` for comparison. They use Playwright's limited video recorder and are superseded by the HQ exports.

URLs were read from Pedro's public Quickfolio:
https://pedronogueira.notion.site/Pedro-s-Quickfolio-1d298c91db038029b5c7fadbf1f54ba1

## Site-specific capture adjustments

`hideSelectors` suppresses only explicitly identified overlay layers in the local capture session, including elements inserted after recording begins. It does not alter the live site or submit cookie consent. Waipono hides its cookie notice and preference panel; PineLake hides the identified newsletter popup and its backdrop.

`scrollEasing` optionally configures a smoothstep velocity ramp (`rampMs`), slower hero traversal (`heroDistance`, `heroSpeedFactor`), and a soft finish (`endDistance`). BSA uses this mode; other sites keep constant scroll speed. Reports include any frames where a targeted overlay remained visible.

Multiple IDs can be supplied: `npm run capture:sites -- waipono-farms pinelake-broken-bow bsa-legal`. Other sites' reports and exports are preserved.
