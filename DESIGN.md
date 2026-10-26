---
name: Pedro Nogueira Portfolio 2026
description: An expressive work-led portfolio with pixel details and warm editorial typography.
colors:
  accent: "#FF5A1F"
  accent-ink: "#B6360A"
  action-bg: "#C74316"
  action-deep: "#B73B10"
  action-hover: "#CF3E0B"
  accent-secondary: "#D4FF4F"
  bg: "#F5F1EA"
  bg-secondary: "#EDE7DC"
  surface: "#FFFFFF"
  text: "#111111"
  text-secondary: "#6B6660"
  border: "#DDD6C8"
  chip-bg: "#F6EAE6"
  chip-ink: "#93330E"
  dark: "#232625"
  green: "#647362"
  olive: "#D2D9B8"
  section-tint: "#F4F7F4"
  footer-bg: "#EEF2ED"
  positive-ink: "#53634F"
  specimen-bg: "#EEF0EE"
  dark-bg: "#0D0D0D"
  dark-bg-secondary: "#161616"
  dark-surface: "#1E1E1E"
  dark-text: "#F5F3EF"
  dark-text-secondary: "#9C9890"
  dark-border: "#2A2A2A"
  dark-accent-ink: "#FF956F"
  dark-section-tint: "#172017"
  dark-positive-ink: "#AFC2A8"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Silkscreen, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.2
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.06em"
  lettering:
    fontFamily: "Pixelify Sans, sans-serif"
    fontSize: "42px"
    fontWeight: 400
    lineHeight: 1.1
rounded:
  sm: "8px"
  card: "16px"
  project: "20px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "64px"
  2xl: "96px"
  3xl: "140px"
  mobile-gutter: "20px"
components:
  button-primary:
    backgroundColor: "{colors.action-bg}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    typography: "{typography.label}"
  tool-chip:
    backgroundColor: "{colors.chip-bg}"
    textColor: "{colors.chip-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 10px"
    typography: "{typography.mono}"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "10px"
    padding: "12px 14px"
    typography: "{typography.body}"
  section-eyebrow:
    textColor: "{colors.accent-ink}"
    typography: "{typography.label}"
  navigation-pill:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    typography: "{typography.label}"
  project-media:
    backgroundColor: "{colors.olive}"
    rounded: "{rounded.project}"
    height: "236px"
---

# Design System: Pedro Nogueira Portfolio 2026

## Overview

**Creative North Star: "The Pixel Workshop"**

This is an expressive portfolio in which project imagery, Pedro's portrait and authored illustrations carry the identity. Rounded organic surfaces and warm editorial type are punctuated by precise pixel lettering, small technical labels and orange SVG marks. The phrase above describes the implemented world; it is not a new public tagline.

The approved Current Figma frames govern composition. Pixel orange eyebrows, project cards, illustrated offer cards and oversized footer lettering are intentional parts of that world. White page surfaces, pale green sections and cream secondary surfaces leave room for the work. Preserve this identity when extending it; do not replace it with a generic dashboard or a different visual metaphor.

**Key Characteristics:**
- Work imagery and a preserved Gaussian splat portrait lead the experience.
- White page surfaces alternate with cream and pale green support surfaces.
- Manrope and Hanken Grotesk provide readable hierarchy around pixel accents.
- Pill controls, rounded media and orange pixel SVGs recur across pages.
- Desktop compositions adapt deliberately to one-column mobile reading.

## Colors

Warm orange and restrained green accents sit against light editorial surfaces. Frontmatter values are normative; names follow existing CSS roles.

### Primary

- **Brand orange** (`accent`): exact identity color for decoration, selection, focus and small visual accents.
- **Readable orange ink** (`accent-ink`): orange text, links and section labels adapted for AA contrast on light surfaces.
- **Action orange** (`action-bg`): white-label primary buttons. **Deep action orange** (`action-deep`) supports card overlays, featured labels and orange CTA panels. **Hover orange** (`action-hover`) is the implemented button hover shade.
- **Bright pink wash** (`chip-bg`) and **chip ink** (`chip-ink`): warm tool-label surfaces and readable labels.

### Secondary

- **Lime signal** (`accent-secondary`): availability and selected emphasis.
- **Sage** (`green`) and **olive** (`olive`): navigation, project tint fallback and restrained support imagery.
- **Positive ink** (`positive-ink`): readable positive result values.

### Neutral

- **White surface** (`surface`): the final light-mode page canvas and primary surfaces. **Warm cream** (`bg`) remains a secondary/control surface; it is not the page background.
- **Deeper cream** (`bg-secondary`): grouped controls and secondary surfaces.
- **Near-black** (`text`), **warm muted ink** (`text-secondary`) and **warm rule** (`border`): primary copy, supporting copy and dividers.
- **Charcoal** (`dark`): featured service cards and inverse treatments.
- **Pale section green** (`section-tint`), **footer green** (`footer-bg`) and **specimen gray** (`specimen-bg`): large supporting areas, footer and case specimen backdrops.
- **Dark counterparts** (`dark-*`): map background, secondary background, surface, text, secondary text, border, orange ink, section tint and positive ink to dark mode. Dark action buttons use deep action orange; dark footer uses dark section tint; dark specimen backgrounds use dark secondary background. Shared brand orange, lime, chip colors and identity greens remain available.

**The Brand and Contrast Rule.** Preserve exact brand orange. Use the existing readable ink and action shades when text contrast requires them; do not collapse the separate roles into one orange.

**The Surface Rule.** The page canvas uses surface in both themes. Cream background tokens remain for secondary surfaces and controls.

## Typography

**Display Font:** Manrope, sans-serif. **Body Font:** Hanken Grotesk, sans-serif. **Label Font:** Silkscreen, monospace. **Technical Font:** Geist Mono, monospace. **Lettering Font:** Pixelify Sans, sans-serif.

All five families are self-hosted WOFF2 with swap behavior. Manrope bold and Hanken regular are preloaded. Manrope and Hanken also have medium files; Geist Mono uses medium and the two pixel families use regular.

### Hierarchy

- **Display:** the frontmatter role captures the Home desktop heading. The foundation scale also declares Display XL (96px), Display L (64px), H1 (48px), H2 (32px), H3 (24px), H4 (20px), H5 (18px) and H6 (16px, medium). A declared scale is not a mandate to make every page heading identical.
- **Headline:** shared section headings use the observed headline role. At mobile they become (28px/1.15). Home's heading becomes (40px/1.15); Contact also uses a current frame-specific (40px) mobile heading.
- **Title:** project titles use (20px/28px); metric values use (24px/30px). Offer titles use the title role. Preserve semantic heading levels separately from visual size.
- **Body:** standard copy uses the frontmatter body role. Supporting copy may use (14px); larger descriptive roles use (18px) or (22px). Mobile body remains (16px). Long FAQ answers are limited to the centered FAQ container; post reading is constrained to an (800px) wrapper.
- **Label:** section eyebrows, navigation and buttons use uppercase Silkscreen. Metadata uses (12px/16px) with slight tracking. Do not set long prose in this face.
- **Mono:** uppercase technical labels and tools use Geist Mono. Medium chips use (12px); default chips and compact technical text use (11px).
- **Lettering:** Pixelify is used for expressive large numbers and oversized hero/footer words, with size determined by the approved composition. The frontmatter lettering role captures recurring case/service numerals, not all lettering sizes.

**The Five Voices Rule.** Keep titles in Manrope, prose in Hanken, interface labels in Silkscreen, technical details in Geist Mono and expressive lettering in Pixelify.

## Layout

The main section container is centered with a maximum width of (1440px), desktop padding of (96px 64px), tablet horizontal padding of (40px) at or below (1024px), and mobile padding of (64px 20px) at or below (768px). The shared spacing scale is in frontmatter; page-specific compositions retain their Figma spacing.

Design and verification widths are (1440px), (1024px), (768px) and (390px). A (1200px) intermediate adjustment reduces pressure on navigation and multi-column layouts. Above (1441px) the main layout stays centered. Do not turn the reference width of (390px) into a fixed viewport width.

At desktop the project archive defaults to three columns, with explicit two-column, three-column and list view controls. At mobile all archive views resolve to one column. Category filters become a vertical set of wrapping labels on mobile. Home project rails remain horizontal scroll areas with scroll snapping, (24px) gaps and (224px) mobile cards so a following card peeks into view. Desktop rail cards use (380px). Comparison tables become stacked criterion cards. Long case pages use a desktop sticky snapshot sidebar and collapse it into document flow on mobile.

Navigation changes to a full-screen menu at or below (1024px). Mobile keeps the pixel logo, compact Book a call and menu control. Primary actions in mobile page flows fill their available width; the compact header action is intentionally smaller. Minimum interactive targets are (44px).

## Elevation & Depth

The system combines tonal layers with selective, soft shadows. It is not flat-only: navigation has inset depth, popovers float, project screenshots lift, the Contact form has a diffuse warm shadow, and illustrations may overlap their containers. Keep these roles distinct instead of adding a shadow to every white surface.

### Shadow Vocabulary

- **Navigation inset:** `inset -2px -2px 12px #6473620f` on the desktop shell; the green inner pill uses `inset -2px -2px 8px #84a480`.
- **Menu float:** `0 14px 32px #2326251a` for the desktop megamenu.
- **Preferences float:** `0 12px 30px #23262512` for the preferences popover.
- **Project screenshot:** `0 10px 28px -6px #1f1a1429` for the inset project image.
- **Contact form:** `0 20px 48px #66331a1f` on the outer form wrapper; the nested form has no extra shadow.

**The Selective Depth Rule.** Use shadows for floating controls, inset media and established feature surfaces. Use borders and tone for ordinary grouping.

## Shapes

The frontmatter radius scale covers small elements, cards, project media and pills. Project and offer cards use the project radius; inputs use gently rounded (10px) corners. Larger compositions retain individual radii: desktop hero (42px), footer upper corners (60px), footer CTA (32px), and Contact wrapper (34px desktop, 24px mobile).

Clipped project media contains a browser image anchored near its top. Portrait masks, oversized pixel words and cropped illustrations are intentional framing devices, not generic card decorations. Pixel icons are actual SVG assets with currentColor. Tool logos use the exported monochrome assets with orange/white treatment and meaningful size; do not substitute text glyphs for icons.

## Components

### Buttons

Confident pill actions with pixel labels and SVG arrows. Primary uses action orange and white; secondary uses a transparent fill, warm border and theme text. Padding is in frontmatter, minimum height is (44px), gap is (10px), and the label uses (14px/16px). Primary hover shifts to hover orange with a small upward move (2px); secondary hover uses secondary background. Global focus uses a (3px) brand-orange outline with (4px) offset. Reduced motion removes the movement. Preserve real disabled/busy semantics where a control cannot act.

### Chips

Small technical pills use the frontmatter tool-chip treatment. The medium variant has (10px 14px) padding and a (12px) label; logos are (12px) small or (16px) medium. Chips wrap in groups. About's Skills rows intentionally use cream fill and theme text instead of the warm pink chip variant.

### Cards / Containers

Project cards are a media-first pattern: tinted landscape cover, category/year/location, title, two-line summary, divider, two metric blocks and an uppercase tools line truncated with an ellipsis. Default media height is (236px). The inset screenshot has rounded upper corners and rises (8px) on hover or keyboard focus while the View case study pill appears. Reduced motion suppresses that rise. Tints belong to project data.

Offer cards have illustrated tops; the middle offer is charcoal. The project archive includes the authored orange Your turn card. These are specific approved variants, not a reason to use orange or dark cards indiscriminately. Card data may contain mock metrics and prices; visual documentation does not verify them.

### Inputs / Fields

Inputs use cream fill, warm border, theme text, (10px) corners, (12px 14px) padding and at least (48px) height. Textareas resize vertically. Labels sit above inputs; messages sit beneath and are associated with invalid fields. Orange focus and caret remain visible. Native checkboxes/radios are visually represented by pills with (44px) minimum height; checked choices use the warm chip surface and readable ink, with an explicit focus ring.

The Contact form has two steps, a progress indicator, back control and polite status output. Preserve data on back navigation and failure. Sending disables duplicate submission; success reflects a real accepted response. Missing service activation is a real state with an email alternative, not success styling.

### Navigation

A light rounded outer shell contains the pixel logo, green central link pill, preferences and Book a call. Silkscreen links are white on green; megamenus pair linked rows with a supporting feature panel. Hover and keyboard access must both work. The mobile full-screen dialog includes grouped links and inline preferences, with focus management, Escape dismissal and return to the opener.

Preferences combine language radios with Light/Dark/Auto segments in a floating panel. Opening focuses the checked option; Escape returns focus, and outside click or focus departure closes it. Theme choice synchronizes both preference instances and persists with try/catch. Auto follows prefers-color-scheme. Untranslated language choices currently route to English Home.

### Section Eyebrow

An orange pixel chevron and uppercase Silkscreen label introduce sections, with a (12px) gap and (16px) bottom spacing. The glyph is decorative to assistive technology. This repeated orange pixel motif is explicitly required by the user.

### FAQ

Native details/summary rows live in a bordered, rounded (20px) container with a maximum width of (820px). The first item starts open. Closed rows show a plus inside a pale circular state marker; open rows show minus on a deep-orange circle and gain a pale section-green fill. Labels and answers use Hanken (16px). Preserve the state-specific icon visibility selectors.

### Portrait and Footer

Keep the original 3D head with its static image fallback. Large screens load after paint/idle when appropriate; mobile/tablet loads on portrait engagement. Reduced motion keeps the still image. Once active, dragging and keyboard controls provide access to the model; movement pauses when offscreen or hidden. Home's separate bio portrait is mirrored, slightly rotated and faded at the bottom to match its approved composition.

The footer combines an illustrated CTA, navigation/platform columns, a lime availability pill, legal links and oversized Pixelify lettering. At mobile the lettering becomes smaller, wrapping and left-aligned. Missing URLs and download assets must remain honest unavailable states.

## Do's and Don'ts

### Do:
- **Do** use the approved Current desktop/mobile Figma frames as visual authority.
- **Do** preserve pixel orange eyebrows, image-led project cards and the original splat portrait.
- **Do** separate exact brand orange from readable ink and action shades.
- **Do** use white page surfaces and reserve cream for secondary surfaces and controls.
- **Do** keep all five type families in their established roles and self-host their files.
- **Do** provide visible keyboard focus, accessible native controls and reduced-motion fallbacks.
- **Do** adapt layouts at the established widths and keep mobile side gutters at 20px.

### Don't:
- **Don't** substitute Unicode arrows or checks for exported SVG icons.
- **Don't** turn unconfirmed metrics, quotes, prices or availability into verified product claims.
- **Don't** fill missing case narratives or gallery assets with invented content.
- **Don't** canonize legacy CSS aliases, duplicated cascade rules or hidden old sections as new design patterns.
- **Don't** apply decorative pixel fonts to long body copy or replace established font roles.
- **Don't** remove the static portrait fallback or force motion when reduced motion is requested.
- **Don't** present unavailable links, downloads or an unconfigured form as working destinations.
