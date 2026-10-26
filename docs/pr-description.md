Replaces the single-page portfolio with the current Figma desktop/mobile design across Home, Services, Projects, six case routes, About, Contact and the existing three posts. Keeps Astro 5, custom CSS, i18n routing and the original Gaussian splat, with a lightweight mobile first load.

This is a **draft for Pedro’s review**. Content/activation items below remain open; merging and publishing are Pedro’s decision.

## What changed

- Self-hosted Manrope, Hanken Grotesk, Silkscreen, Geist Mono and Pixelify; Light/Dark/Auto preferences and accessible desktop/mobile navigation.
- Reusable pixel icons, 19 original tool logos, project cards, filters/view controls, comparison, process, FAQ and footer.
- Two-step Web3Forms contact flow with validation and error/success states; no real submission was made during tests. Public key is configured through a repository variable.
- Responsive WebP assets; deferred 3D with static fallback and keyboard control. Existing hidden/OLD sections remain hidden and their source is archived.
- PR build workflow; Pages deployment remains on main. No merge or direct main push.

## Validation

- Build: 14 static routes. Astro check: 0 errors/warnings/hints.
- 24 viewport/page checks at 1440/1024/768/390 passed; no broken internal links or images.
- Form, filters, carousel, menu/theme and real 3D/fallback tests passed.
- Axe light/dark: no violations on seven representative pages.
- Lighthouse mobile performance **97–100**, accessibility **100** across seven representative pages.
- Independent review: all nine reported material discrepancies resolved; this is not a claim of complete pixel parity.

[Validation details](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/validation.md) · [All page screenshots](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots.md)

## Content and activation TODOs

- Confirm all mock project metrics, Services prices ($1,000 / $7,000 / $4,000 per month), About stats, sample baselines and business commitments. Sources carry `TODO: confirm real number`.
- Supply Web3Forms public key; booking, social, CV, proposal, project and legal URLs.
- Replace Figma quote/domain/gallery/specimen placeholders and author the five individual case narratives beyond BSA Legal.
- Review the five remaining dependency advisories. Resolving them as suggested by npm requires a major Astro upgrade; this change preserves Astro 5.

[Fill-later checklist](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/itens-para-preencher.md)

## Main page captures

| Page | Desktop | Mobile |
|---|---|---|
| Home | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/home-desktop.png) | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/home-mobile.png) |
| Services | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/services-desktop.png) | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/services-mobile.png) |
| Projects | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/projects-desktop.png) | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/projects-mobile.png) |
| BSA case | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/work-bsa-legal-desktop.png) | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/work-bsa-legal-mobile.png) |
| About | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/about-desktop.png) | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/about-mobile.png) |
| Contact | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/contact-desktop.png) | [Image](https://github.com/pedronogueiranunes/pedronogueiranunes.github.io/blob/redesign-2026/docs/screenshots/contact-mobile.png) |


### Browser corrections

The four megamenus now match their Figma compositions, fonts, active pills and 400ms transitions. Visible Light-label clicks apply the theme without premature dismissal; keyboard access, 44px targets and mobile focus contrast are preserved.

Home uses one portrait canvas travelling from a left-facing hero profile into the About column, where it stops facing the copy. Its desktop source stage matches the published 640×480 reference; uniform scaling fits narrower columns without flattening the model. Reverse scrolling returns it to the hero. The WebGL buffer remains fixed during travel, and the fallback stays visible until the first rendered frame. Mobile lazy activation and reduced-motion alternatives remain available.

Decorative lettering touches the hero panel's bottom, stays behind the model and uses 10% opacity in Dark. Content headings, paragraphs and actions remain in front of the portrait.

Validation: 14-route build; Astro check: 35 files with 0 errors/warnings/hints; measured Figma panel dimensions; visible theme-label clicks and reload; sampled desktop/mobile forward and return states preserve aspect and buffer dimensions; scoped independent visual reviews. Evidence: docs/corrections-verification.md and docs/portrait-motion-review.md. Static captures verify composition and sampled persistence, not frame pacing on every device.
