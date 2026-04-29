---
description: "Use when editing UI, layout, styling, Tailwind classes, design tokens, accessibility, responsive behavior, or component visuals."
applyTo:
  - "frontend/src/app/**/*.tsx"
  - "frontend/src/components/**/*.tsx"
---

# Design System Rules

- Follow `docs/design/design-tokens.md` and `docs/design/component-specs.md`.
- Do not introduce new ad hoc colors when a token already exists.
- Keep spacing aligned with the documented scale.
- Preserve focus styles, keyboard support, and readable contrast.
- Use mobile-first layouts and verify responsive breakpoints.
- If a component changes behavior or state, update the design spec too.
