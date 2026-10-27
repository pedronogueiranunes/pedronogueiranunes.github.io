# Mobile Safari corrections

- Comparison illustrations now occupy their own flow space at the end of each mobile comparison card. Their right/bottom crop is retained, but extra text, translated copy and text wrapping can no longer extend underneath an absolutely positioned icon.
- The footer no longer clips overflow on its outer container. Safari was clipping the raised CTA illustration against the footer edge. The actual-width lettering wrapper still clips the marquee internally; page-level horizontal containment remains intact.
- Touch opening the mobile dialog focuses the dialog container instead of Safari's automatically selected first logo link. Keyboard opening focuses the close button; actionable elements retain visible keyboard focus. The menu starts at its top and closing restores the trigger without scrolling the underlying page.
- Mobile menu height uses `100dvh`; bottom and navigation side padding account for safe-area insets.

Verification used Playwright WebKit 26.5 (Safari engine, not a physical iPhone) and Chromium with touch-enabled 390px viewports. All seven comparison cards had at least 12px between their text blocks and icon boxes. CTA artwork was visible above the footer. Touch menu opening focused the dialog, not the logo; menu closing reset its expanded state. Screenshots were checked for the comparison, footer and menu.

A broader WebKit pass checked 48 combinations: 320px/390px/430px, Light/Dark, English Home/Projects/About/Services/Contact and French Home/Projects/Contact. No horizontal page overflow, offscreen navigation, sub-16px visible contact inputs or browser exceptions were found. Privacy-to-cookie modal navigation also passed. French comparison layout was inspected separately.
