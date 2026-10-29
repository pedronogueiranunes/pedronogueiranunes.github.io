# Pedro Nogueira's Portfolio

## Product

A personal portfolio for Pedro Nogueira's web design, development, illustration and motion work. Visitors can inspect projects and case studies, learn about services and working methods, read Thoughts, and contact Pedro about a project. Prospective direct clients and agencies are addressed in the supplied content. The work and its imagery lead the experience.

## Authority and scope

The approved visual source is the visible Current page in Figma file `AzHguwIajTGe7nhB5L21pQ` (Pedro-Portfolio-2026), including current desktop and mobile frames. Hidden layers and `OLD ·` sections are legacy. The parent workspace's `Mobile-Design-Handoff.md` supersedes the initial brief's claim that mobile designs were unavailable. Root `DESIGN.md` records the implemented reusable visual system; it does not approve commercial claims.

Public routes are `/`, `/projects`, `/work/[slug]`, `/about`, `/services`, `/contact`, and `/thoughts/[slug]`. Six project cases and three existing posts produce 14 static routes. Keep existing post content. The user approved following the visible Figma Home with the previous reel and method hidden; the former Home is preserved at `docs/legacy/home-before-redesign.astro.txt`.

## Platform and durable constraints

- Astro 5 with custom CSS and GSAP 3; no UI framework or Tailwind. Preserve the existing stack and avoid adding heavy dependencies without the user's agreement.
- Static GitHub Pages site at `https://pedronogueiranunes.github.io/`. GitHub Actions deploys pushes to main. Work belongs on `redesign-2026` and a pull request; only Pedro merges. A push to main or merge is not authorized.
- Four languages: English (unprefixed), Brazilian Portuguese (`/pt-br`), Spanish (`/es`) and French (`/fr`). All 14 existing routes are generated per language, including cases and the existing article titles/metadata. Translations are maintained in `src/i18n/translations.tsv` and compiled before dev/build. Middleware translates rendered HTML at build time; a small client enhancement handles dynamic messages. Language selection preserves page, query and anchor and saves the preference locally. Existing article bodies are empty and remain empty.
- Preserve Pedro's original Gaussian splat source under `docs/source-assets/portrait/`. Pedro approved the 92,371-splat SH1 runtime (`public/assets/pedro-head-92k.sog`, 1.77 MB) on 2026-10-29; both Home and About share it, with the original framing retained. Keep a static first view and failure fallback; reduced motion stays static. On mobile/tablet the visitor activates 3D by engaging the portrait. Large screens may load it after the first paint and idle time, respecting Save-Data.
- Support Light, Dark and Auto. Auto follows system preference; manual preference persists with guarded localStorage access.
- Keep semantic HTML, visible keyboard focus, AA contrast and at least 44px touch targets. Respect reduced motion. Performance and accessibility Lighthouse scores above 95 are the requested targets. Local production measurements are recorded in docs/validation.md; they are not a general certification.
- Match approved English copy. Do not invent metrics, testimonials, client claims, case narratives or commitments. Avoid em dashes in public copy.

## Content and editable sources

Projects live in `src/content/projects/*.md`. The schema in `src/content/config.ts` retains existing title/category/year/image/order fields and adds summary, metrics (`value`, `label`), tools, cover, tint, location and caseSlug. Posts retain their collection schema.

`src/data/site.ts` owns contact destinations, project URLs, downloads, legal links and availability. `src/data/services.ts` owns offers, sample prices, durations and FAQ. `src/data/about.ts` owns stats, timeline and skills. `src/data/cases.ts` owns case template copy and result data; `src/data/contact.ts` owns choices and contact copy. Keep mock numbers visibly marked in source with `TODO: confirm real number`.

The current Figma offer figures in source supersede the older figures in the initial brief, but remain unconfirmed examples. About statistics, project lifts, ratings, timelines, support promises and availability require confirmation. BSA Legal retains Figma placeholders for baseline/results, domain, gallery and quote. The other five cases still need individual narratives. These omissions are editorial work, not an invitation to generate facts.

## Contact and activation

Web3Forms was approved. The form gathers identity and contact details first, then needs, platform, budget, timing and a message. Preserve responses across steps and failures, validate fields and choice groups, announce real errors/success, and prevent duplicate submission while sending. Never report success without an accepted response.

Activation requires `PUBLIC_WEB3FORMS_ACCESS_KEY`, tied to Pedro's confirmed email, in the local environment and the GitHub Actions variable for deployment. It is a public service key, not an email password. Without it the form preserves answers and explains the email alternative. Booking falls back to arranging a time by email; missing social/legal URLs render as text; downloads remain unavailable until configured.

## Open work and verification boundaries

Use `docs/itens-para-preencher.md` as the handoff checklist for missing activation details, links, downloads, legal content, verified statistics, authorized testimonials and project assets. No false destination or invented claim should fill these gaps.

At delivery the build produced 14 routes, Astro check reported zero errors/warnings/hints, and the recorded 24 route/viewport checks passed. The independent review closed its nine material findings after two fix rounds. Final local Lighthouse mobile results were 97–100 performance and 100 accessibility across seven representative routes. These checks do not certify complete pixel parity, live form delivery, commercial copy or complete security remediation. Remaining dependency advisories require separate review; the requested Astro 5 stack is retained.
