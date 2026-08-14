---
description: Public site design rules for Graphite + Lime overhaul. Applied to all public-facing pages and components.
globs: ["src/app/[lang]/**", "src/components/**", "src/templates/**", "!src/app/admin/**", "!src/components/admin/**"]
---

# Public Site Design System — Graphite + Lime

## Active Configuration (taste-skill adapted)
- DESIGN_VARIANCE: 9 (asymmetric grids, fractional columns, masonry)
- MOTION_INTENSITY: 9 (pinned scroll, horizontal hijack, sticky-stack, kinetic type)
- VISUAL_DENSITY: 4 (airy composition, py-24 to py-40)

## Palette Lock — Cold Graphite + Acid Lime
- Light: cold off-white surfaces, steel grays, graphite ink. NO warm paper (#F9F8F6, #F4F2EE, #EFEAE0).
- Dark: graphite off-black (no pure #000000), layered surfaces, same lime accent.
- ONE accent color (acid lime) across the entire page. No section-level accent drift.
- Shape: sharp metrology language. `--radius-control: 0`, `--radius-card: 0`, `--radius-overlay: 2px`. No pill radius.

## Page Theme Lock (mandatory)
- ONE theme per page: light, dark, or system. No section flips mid-scroll.
- NEVER force `public-dark` / `theme-dark` on subtrees (header, hero, CTA, footer) while page is in light mode.
- Depth via `--surface-2/3` and hairlines, not theme inversion.

## Motion Library Boundary
- **GSAP** owns: scroll choreography, pin, scrub, horizontal pan, kinetic typography, WebGL scroll bridge.
- **framer-motion** owns: component state transitions, layoutId, modal/nav/filter AnimatePresence.
- NEVER mix GSAP and framer-motion in the same component file.
- BANNED: `window.addEventListener('scroll')`, `window.scrollY` in React state, RAF loops touching React state.

## Eyebrow Budget
- Max 1 eyebrow per 3 sections. Count `uppercase tracking` micro-labels above headlines.
- NO section-number eyebrows (001, 002). NO scroll cues. NO decorative status dots.

## Typography
- Display + UI: Archivo (variable). Technical/numeric: JetBrains Mono.
- NO Barlow, NO Geist Sans as primary. NO Fraunces, NO Instrument Serif.

## Banned Patterns (taste-skill Section 9)
- Em-dash (`—`) and en-dash separator (`–`) in ALL visible strings. Use hyphen `-` only.
- BlueprintGrid, hex-grid, eyebrow-tag utilities.
- Div-based fake screenshots. Warm paper palette. AI purple gradients.
- Three equal feature cards. Zigzag image+text more than 2 consecutive sections.
- Marquee: max 1 per page.

## Component Architecture
- All public pages use PageShell + Section + PageHeader.
- Templates: Home, Portfolio, PortfolioDetail, Services, NewsList, NewsDetail, Videos, Contact, Auth, Account, Status.
- GSAP components: isolated leaf with `'use client'`, `useGsapContext` cleanup mandatory.
- WebGL: dynamic import ssr:false, poster fallback for reduced-motion and mobile.

## Accessibility
- WCAG AA contrast on all CTAs, forms, placeholders.
- `prefers-reduced-motion`: no pin, no transform animations, WebGL poster only.
- Hero: max 2 headline lines, max 20 words subtext, CTA visible without scroll.

## Pre-Flight (run before shipping)
- [ ] Page Theme Lock verified in both modes
- [ ] Zero em-dashes in visible copy
- [ ] Eyebrow count ≤ ceil(sectionCount / 3)
- [ ] One accent color, one radius scale
- [ ] GSAP/Motion boundary respected per file
- [ ] Reduced-motion fallback works
