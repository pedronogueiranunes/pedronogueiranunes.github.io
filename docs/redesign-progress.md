# Portfolio redesign 2026

Branch: redesign-2026. Do not push main or merge the PR.
Figma: AzHguwIajTGe7nhB5L21pQ. Current desktop and mobile frames are authoritative.

## Plan
1. Repository, baseline build and migration schema.
2. Tokens, self-hosted fonts and global CSS.
3. Navbar, Preferences, buttons, pixel icons, chips, project cards, footer.
4. Home.
5. Services.
6. Projects and case template.
7. About.
8. Contact.
9. Responsive, accessibility and performance checks.
10. PR with content TODOs and desktop/mobile screenshots.

## Proposed project schema
Keep existing fields during migration. Add summary: string, metrics: {value: string, label: string}[], tools: string[], cover: string, tint: string, location: string, caseSlug: string.
Every mock metric and price must carry `TODO: confirm real number` in its source.

## Verification
- Stage 1: npm run build passed; 4 routes generated.
- Stage 2: foundation tokens, local fonts, browser surfaces and theme initialization implemented. npm run build passed; 4 routes. Full component theme migration remains stage 3 onward.

## Pending decisions
- Web3Forms approved. Activation still needs the key tied to Pedro's email.
- User confirmed: follow the exact visible Figma Home; keep reel and old method hidden. Previous source preserved at docs/legacy/home-before-redesign.astro.txt.

## Existing dependency findings
npm ci reports 13 advisories (1 low, 1 moderate, 10 high, 1 critical). Assess during quality stage; no forced dependency upgrade performed.

## Reference updates
Mobile-Design-Handoff.md in the parent workspace supersedes the brief's statement that mobile is not designed.
Dark theme values from Foundations, mode 2:0: bg #0d0d0d, secondary #161616, text #f5f3ef, secondary text #9c9890, border #2a2a2a, surface #1e1e1e. Accent/palette/chip values are shared between modes.

- Stage 3: base components implemented; npm run build passed (4 routes). Theme and menu keyboard tests passed in Chrome, no JS errors.

- Stage 4: Home implemented from visible Figma sections, six project cards migrated. npm run build passed. Chrome captures at 1440 and 390: no JS errors, no broken images, document width matches viewport. Visual fidelity review still pending the final batch.

- Stage 5: Services implemented from current Figma; build passed (5 routes). Chrome desktop/mobile: no JS errors, broken images or page overflow.
- Stage 6: Projects filters and all six case routes implemented; build passed (12 routes). BSA Legal has the authored template copy; the other five cases need individual strategy narratives. Figma gallery, baseline, domain and quote placeholders retained.

- Stage 7: About completed; build passed (13 routes), desktop/mobile images and overflow checks passed.
- Stage 8: Contact completed; build passed (14 routes), validation/back/multiple choice/missing-key/error/success tested with mocked API responses. No real messages sent.
- Stage 9: All 24 route/viewport combinations (6 routes x 1440/1024/768/390) have no document overflow or nav overlap. Astro check: 0 errors, warnings or hints. Detector: []. Normal-motion 3D activation, keyboard controls, reduced-motion and fallback passed. Source provenance embedded in raster assets.
- Independent visual review: nine material findings; seven resolved in first fix batch, remaining portrait reflection/fade and FAQ icon specificity corrected in second batch. Final scoped verdict: all nine findings resolved after recapture.
- npm audit fix applied compatible fixes; five advisories remain (1 low, 3 high, 1 critical). Reported remediation requires a major Astro upgrade; Astro 5 retained as requested.
- Final Lighthouse mobile: Home99, Services100, Projects100, BSA99, About97, Contact100, Thoughts99 performance; all100 accessibility. Light/dark axe checks have zero violations.
