---
title: "Motion design for corporate websites"
excerpt: "When animation helps, and when it hurts conversion."
tag: "MOTION"
category: "motion"
date: 2026-01-18
image: "/assets/post-visual-3.svg"
cover: "/assets/figma/488-7471-imgCover2.webp"
mock: true
---

<!-- TODO: mock content for layout testing. Replace with Pedro's article before publishing. -->

Motion can make a corporate site feel alive, or it can slow visitors down on the way to the one thing the page exists for. This mock article is a checklist for telling the two apart.

## Every animation needs a job

Before adding motion, name what it does for the visitor. Good jobs include showing that something changed, guiding the eye to the next step, and explaining how two states relate. "It looks nice" is not a job on a page that has a conversion goal.

## Keep the path to the CTA fast

The hero and the main call to action should be readable the moment the page loads. Entrance animations that hide the headline or the button until they finish playing make the page feel slower than it is.

- Show the primary content immediately, then add motion around it
- Keep entrance animations short
- Never block a click while something animates

## Respect reduced motion

Some visitors ask their system for less movement. Honour it with a simple media query and a calmer fallback, not a broken layout.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Animate cheap properties

Transforms and opacity are cheap for the browser to animate. Layout properties like width, height and top are expensive and cause jank on slower phones. If an effect needs them, find another way to fake it.

> Motion should feel like the interface responding, not like the interface performing.

## Test it against the goal

Treat a new animation like any other change to the page. Ship it to part of your traffic, compare the result with the version without it, and keep it only if the page does its job at least as well.

## A short checklist

1. Does it have a job?
2. Is the CTA readable without waiting?
3. Does it respect reduced motion?
4. Does it only animate transform and opacity?
5. Did we measure it?
