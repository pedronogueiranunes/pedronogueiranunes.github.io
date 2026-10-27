# Footer notices and browser storage

Legal and Privacy use native dialogs with labelled headings, keyboard focus containment, Escape and backdrop dismissal, and focus restoration. The persistent dialog host is outside the persisted footer. Dialogs close before Astro swaps. Content is in `src/components/LegalModals.astro`; keep it aligned with the actual services and processing used by the site. These notices describe the current implementation, not a legal compliance certification.

Cookie choices uses the self-hosted `vanilla-cookieconsent` 3.1.0 library (MIT), configured in `src/scripts/legal-modals.ts`. It initializes when a visitor opens Cookie choices. No external consent service or CDN is contacted.

Current inventory:
- `theme`: browser local storage, retained until the browser/user clears it. Used for the user's requested appearance.
- `portfolio_cookie_choices`: first-party cookie, expires after 182 days. Created when choices are saved.
- No optional analytics or advertising scripts were found in this implementation. Only the essential category is shown. An automatic consent banner is disabled because no optional categories currently exist.
- GitHub Pages provides hosting. When enabled, the contact form sends user-supplied inquiry details to Web3Forms. Provider privacy policies are linked in the notice.

Before adding optional trackers, add truthful categories and cookie details, enable the consent banner, increment the consent revision, and gate each script via CookieConsent's `type="text/plain" data-category="..."` mechanism or an equivalent `acceptedCategory` gate. Register cookie cleanup for withdrawal and test that no optional requests occur before acceptance. Do not simply add an ungated tracking script.

Validation: Home checked in 390px and 1440px viewports with Light/Dark themes; legal Escape and focus return; privacy-to-cookie panel transition; saved first-party cookie; one cookie UI instance after navigation; no browser errors. Production build and diff checks pass.
