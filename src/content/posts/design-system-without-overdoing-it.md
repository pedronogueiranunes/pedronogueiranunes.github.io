---
title: "How to structure a design system without overdoing it"
excerpt: "A practical guide to starting small and scaling with intent."
tag: "DESIGN"
category: "design"
date: 2026-03-12
image: "/assets/post-visual-1.svg"
cover: "/assets/figma/488-7471-imgCover.webp"
mock: true
---

<!-- TODO: mock content for layout testing. Replace with Pedro's article before publishing. -->

Most teams do not need a design system on day one. They need a handful of decisions written down, a few components that stop being rebuilt every sprint, and a clear owner. This mock article walks through a lean structure you can grow later.

## Start with the decisions, not the components

A component library is the visible part of a system, but the value lives in the decisions behind it. Before drawing a single button, write down the answers to a few questions:

- Which colours carry meaning, and which are decoration?
- How many type sizes does the product really use?
- What spacing steps exist, and who is allowed to add one?

Keep these answers in one short page. If the page grows past a screen, you are documenting too early.

## Tokens are the contract

Tokens turn those decisions into names that both design and code share. Name them by role, not by value, so a rebrand changes one file instead of a hundred screens.

```css
:root {
  --color-accent: #ff5a1f;
  --color-text: #232625;
  --space-2: 8px;
  --radius-card: 16px;
}
```

A small, well named set beats a large one nobody remembers. Add a token when the same value shows up in three places, not before.

## Build the five components you rebuild most

Look at the last few projects and count what got rebuilt. For most marketing sites the list is short: button, card, form field, section heading and navigation. Build those well, with states and accessibility handled, and stop there for now.

> A design system is a product with users. If nobody asks for a component, it does not belong in the library yet.

## Document where people already work

Documentation that lives in a separate tool goes stale. Put usage notes next to the component in the design file and in the codebase, and keep a single page that links to both.

## Decide who says yes

Systems fail less from bad components than from unclear ownership. Name one person who approves additions, and give everyone else a simple way to ask.

## When to grow it

Grow the system when a real need shows up twice: a second product, a second team, a second brand. Until then, a lean system that people trust is worth more than a complete one they work around.
