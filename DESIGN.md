# RamKishan Siyaram — Design System

**Aesthetic:** minimal · premium · glassmorphism · **monochrome (v2)**
**Stack:** Tailwind CSS (v4, CSS-first `@theme` config) · class-based dark mode · mobile-first responsive

> **v2 (current):** the sage/cream palette was replaced by a strict **black & white monochrome** scheme in both themes; the display font is now **Geomini** (self-hosted, single weight); the page background is the animated **ShapeGrid** canvas (React Bits) — a slow diagonal square grid with a cursor hover-trail — rendered fixed behind all content and theme-aware. Product imagery renders `grayscale` and regains color on hover. Hierarchy comes from type scale, blur, and opacity — never hue.

Monochrome semantic tokens (light / dark): `--bg` `#fafafa` / `#0a0a0a` · `--text` `#111` / `#fafafa` · `--text-muted` `#6b6b6b` / `#a6a6a6` · `--accent` pure black / pure white (inverted CTA) · glass surfaces are white- or near-black-translucent with `rgb(0 0 0 / 0.08)` / `rgb(255 255 255 / 0.12)` borders. Status colors stay as heavily desaturated earth tones, tuned **per theme** for WCAG AA (light: `#3d5c3d` / `#8f4a3e` / `#7a5f2f` · dark: `#8fae8f` / `#c98d80` / `#c5a05e`) so functional meaning survives inside the mono scheme. Selection rings, the spinner, and the cart badge use pure `--accent` (black/white) — never the gray `--highlight`, which is reserved for passive tints. Typography: **Geomini** for all headings/display + big outlined marquee type (`-webkit-text-stroke`), **Inter** for body. Motion: staggered word-reveal hero, infinite marquees, `whileInView` section reveals, and 250 ms route transitions — all respecting `prefers-reduced-motion`.

The sections below document the original v1 (sage) system; layout, component, responsive, and glass rules still apply unchanged — only the color values and display font are superseded by the v2 tokens above.

---

## 1. Design Principles

1. **Glass over gradient.** Every elevated surface (navbar, cards, modals, drawers) is frosted glass sitting on a soft sage→cream gradient page background. Depth = blur + translucency, not drop shadows.
2. **Minimal, not empty.** Generous padding (products breathe), max 2 font families, one accent color role. If an element can be a border instead of a fill, use a border.
3. **Premium restraint.** No pure white, no pure black anywhere. Light mode lives between `cream` and `charcoal`; dark mode between deep charcoal and `frosted-mint`.
4. **Motion is subtle.** 150–300 ms ease-out transitions; hover = slight lift + border brighten; the navbar's active pill slides. Never bounce.
5. **Both themes are first-class.** Every component spec below defines its light and dark form. Test both before shipping a component.

---

## 2. Color System

### 2.1 Raw palette (brand scale)

The palette is used as a single brand ramp, named `sage` (50 = lightest cream → 900 = charcoal):

| Token | Hex | Original name |
|---|---|---|
| `sage-50` | `#EDF7D2` | frosted-mint |
| `sage-100` | `#EDF7C4` | cream |
| `sage-200` | `#EDF7B5` | cream-2 |
| `sage-300` | `#DBDCB9` | beige |
| `sage-400` | `#D2CFAC` | dry-sage-2 |
| `sage-500` | `#C9C19F` | dry-sage |
| `sage-600` | `#A39F8D` | khaki-beige |
| `sage-700` | `#7D7C7A` | grey |
| `sage-800` | `#6C6C6B` | dim-grey |
| `sage-900` | `#5B5B5B` | charcoal |

**Extended darks** (derived — the palette has no true dark surface colors, dark mode needs them):

| Token | Hex | Use |
|---|---|---|
| `sage-950` | `#3A3A38` | dark-mode elevated surfaces |
| `ink` | `#262624` | dark-mode page background |
| `ink-deep` | `#1C1C1A` | dark-mode footer / recessed areas |

### 2.2 Semantic tokens (what components actually use)

Components never reference raw hex — only these roles. This is what makes dark mode a pure token swap.

| Role | Light | Dark |
|---|---|---|
| `bg` (page base) | `sage-100` cream | `ink` |
| `bg-gradient` | `sage-50 → sage-300` (135°) | `ink-deep → sage-950` (135°) |
| `surface` (glass fill) | `sage-50` @ 55% opacity | `sage-950` @ 45% opacity |
| `surface-strong` (modals, navbar) | `sage-50` @ 75% | `sage-950` @ 70% |
| `border` (glass edge) | `sage-50` @ 80% (top-lit) | `sage-500` @ 15% |
| `text` (primary) | `sage-900` charcoal | `sage-50` frosted-mint |
| `text-muted` | `sage-700` grey | `sage-500` dry-sage |
| `accent` (CTA fill) | `sage-900` charcoal | `sage-50` frosted-mint |
| `accent-fg` (text on CTA) | `sage-50` | `ink` |
| `highlight` (badges, active pill) | `sage-500` dry-sage | `sage-600` khaki-beige |

**Functional colors** (outside palette, used sparingly — status only):
success `#6F8F5E` · error `#B0604F` · warning `#C29A5B` — all muted and desaturated so they don't break the earthy mood. Status text always pairs with a translucent tint of itself (10–15% bg).

### 2.3 Contrast rules (accessibility)

- `sage-900` on `sage-100`: ≈ 5.9:1 → **AA pass**, default body text.
- `sage-700` on `sage-100`: ≈ 3.4:1 → **large text / secondary only**, never for body copy.
- `sage-50` on `ink`: ≈ 12:1 → dark-mode body text.
- Text on glass must be checked against the *gradient behind the glass*, not the glass fill — keep body text `text`/`text-muted` only, never lighter.
- MRP strikethrough prices, placeholder text: `sage-600` minimum size 14 px.

---

## 3. Tailwind Setup

### 3.1 Tokens — `src/styles/theme.css` (Tailwind v4 `@theme`)

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* brand ramp */
  --color-sage-50:  #EDF7D2;
  --color-sage-100: #EDF7C4;
  --color-sage-200: #EDF7B5;
  --color-sage-300: #DBDCB9;
  --color-sage-400: #D2CFAC;
  --color-sage-500: #C9C19F;
  --color-sage-600: #A39F8D;
  --color-sage-700: #7D7C7A;
  --color-sage-800: #6C6C6B;
  --color-sage-900: #5B5B5B;
  --color-sage-950: #3A3A38;
  --color-ink:      #262624;
  --color-ink-deep: #1C1C1A;

  /* status */
  --color-success: #6F8F5E;
  --color-error:   #B0604F;
  --color-warning: #C29A5B;

  /* type */
  --font-display: "Marcellus", "Georgia", serif;
  --font-body: "Inter", "system-ui", sans-serif;

  /* radius — pill language everywhere */
  --radius-card: 1.25rem;   /* 20px — cards, modals */
  --radius-field: 0.875rem; /* 14px — inputs */
  --radius-pill: 9999px;    /* navbar, buttons, badges, size chips */

  /* glass shadows — soft, warm-tinted, never harsh */
  --shadow-glass: 0 8px 32px rgb(91 91 91 / 0.10);
  --shadow-glass-lg: 0 16px 48px rgb(91 91 91 / 0.14);
}
```

### 3.2 Semantic layer + glass recipes — same file

```css
:root {
  --bg: var(--color-sage-100);
  --bg-gradient: linear-gradient(135deg, #EDF7D2 0%, #EDF7C4 45%, #DBDCB9 100%);
  --surface: rgb(237 247 210 / 0.55);
  --surface-strong: rgb(237 247 210 / 0.75);
  --glass-border: rgb(237 247 210 / 0.8);
  --text: var(--color-sage-900);
  --text-muted: var(--color-sage-700);
  --accent: var(--color-sage-900);
  --accent-fg: var(--color-sage-50);
  --highlight: var(--color-sage-500);
}
.dark {
  --bg: var(--color-ink);
  --bg-gradient: linear-gradient(135deg, #1C1C1A 0%, #262624 55%, #3A3A38 100%);
  --surface: rgb(58 58 56 / 0.45);
  --surface-strong: rgb(58 58 56 / 0.70);
  --glass-border: rgb(201 193 159 / 0.15);
  --text: var(--color-sage-50);
  --text-muted: var(--color-sage-500);
  --accent: var(--color-sage-50);
  --accent-fg: var(--color-ink);
  --highlight: var(--color-sage-600);
}

body {
  background: var(--bg-gradient) fixed;
  color: var(--text);
  font-family: var(--font-body);
}

@layer components {
  /* THE core glassmorphism recipe — cards, tiles, panels */
  .glass {
    background: var(--surface);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-glass);
  }
  /* stronger version — navbar, modals, drawers (more opaque = more readable) */
  .glass-strong {
    background: var(--surface-strong);
    backdrop-filter: blur(24px) saturate(1.6);
    -webkit-backdrop-filter: blur(24px) saturate(1.6);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-glass-lg);
  }
  /* interactive glass — product cards, category tiles */
  .glass-hover {
    transition: transform 200ms ease-out, box-shadow 200ms ease-out,
                border-color 200ms ease-out;
  }
  .glass-hover:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-glass-lg);
    border-color: var(--highlight);
  }
}

/* graceful degradation — older browsers without backdrop-filter */
@supports not (backdrop-filter: blur(1px)) {
  .glass, .glass-strong { background: var(--bg); }
}
```

### 3.3 Dark mode toggle

- Strategy: `class` on `<html>` (`document.documentElement.classList.toggle('dark')`).
- Persist choice in `localStorage("theme")`; default to `prefers-color-scheme` on first visit.
- Inline script in `index.html` `<head>` applies the class **before** React mounts (no flash of wrong theme).
- Toggle control: sun/moon icon button inside the pill navbar (right cluster).

---

## 4. Typography

| Role | Font | Size / weight (mobile → laptop) |
|---|---|---|
| Brand wordmark "RamKishan Siyaram" | Marcellus | 20 px → 22 px, tracking `+0.02em` |
| H1 (hero) | Marcellus | 34 px → 56 px, weight 400, line-height 1.1 |
| H2 (section titles) | Marcellus | 24 px → 32 px |
| H3 (card/product names) | Inter 600 | 15 px → 16 px |
| Body | Inter 400 | 15 px → 16 px, line-height 1.6 |
| Price | Inter 600 | 16 px → 18 px; MRP strike: Inter 400 14 px `text-muted` |
| Caption / meta / badges | Inter 500 | 12–13 px, tracking `+0.04em`, uppercase for badges |

Serif (Marcellus) is *headings only* — that contrast against Inter is the premium signal. Load both via `@fontsource` (self-hosted, no CDN flash).

---

## 5. Component Specs

### 5.1 Pill Navbar (the signature element)

```
mobile (≤768px)                      laptop (≥1024px)
╭──────────────────────╮      ╭───────────────────────────────────────────────╮
│ RK Siyaram    ☾ 🛒 ☰ │      │ 🏵 RamKishan Siyaram   Home Products Categories ▾ │ 🔍 ☾ 🛒² 👤 │
╰──────────────────────╯      ╰───────────────────────────────────────────────╯
```

- Position: `fixed top-4 left-1/2 -translate-x-1/2 z-50`, width `min(92vw, 64rem)`.
- Style: `.glass-strong rounded-pill px-3 py-2` — the most blurred, most opaque glass in the app.
- Active link: filled pill `bg-[--accent] text-[--accent-fg] rounded-pill px-4 py-1.5`, slides between links via Framer Motion `layoutId="nav-pill"`. Inactive links: `text-muted hover:text-[--text]`.
- Cart badge: 18 px circle, `bg-[--highlight] text-[--text]`, top-right of cart icon.
- On scroll > 24 px: shrink `py-2 → py-1.5` and raise blur — nav feels lighter as content passes under it.
- Mobile menu: hamburger opens a `.glass-strong rounded-[--radius-card]` sheet dropping from below the pill; links stacked, full-width tap targets (48 px), theme toggle at the bottom.

### 5.2 Buttons

| Variant | Light | Dark | Notes |
|---|---|---|---|
| **Primary** (Add to cart, Pay) | `bg-sage-900 text-sage-50` | `bg-sage-50 text-ink` | `rounded-pill px-6 py-3`, hover: `opacity-90` + lift 1 px |
| **Secondary** | `.glass rounded-pill`, text `--text` | same recipe | border brightens to `--highlight` on hover |
| **Ghost** | text-only `text-muted hover:text-[--text]` | same | inline links, "View all →" |
| **Destructive** (admin) | `bg-error/10 text-error border-error/30` | same | never solid red — stays muted |

Disabled: `opacity-40 cursor-not-allowed`. Loading: inline spinner replaces label, width locked.

### 5.3 Product Card

- `.glass .glass-hover rounded-[--radius-card] overflow-hidden`.
- Image: 3:4 ratio, `object-cover`, plain (not glassed) — product photos need full fidelity; subtle zoom `scale-105` on hover.
- Body `p-4`: name (H3, 1-line clamp) → category caption (`text-muted`) → price row (price + MRP strike + `-33%` badge in `bg-[--highlight]/30 rounded-pill px-2`).
- Quick-add: circular `+` glass button, bottom-right over the image — appears on hover (laptop) / always visible (mobile).
- Skeleton state: same card shape, `animate-pulse` blocks in `sage-300/40` (light) / `sage-950/60` (dark).

### 5.4 Inputs & Forms

- Field: `.glass rounded-[--radius-field] px-4 py-3`, placeholder `text-muted`.
- Focus: `ring-2 ring-[--highlight] border-transparent` — the only "glow" in the app.
- Label above field, Inter 500 13 px; error message below in `text-error` 13 px + field border `border-error/50`.
- Size selector (product page): pill chips `rounded-pill border px-4 py-1.5`; selected = filled `bg-[--accent] text-[--accent-fg]`; out-of-stock = `opacity-40 line-through`.

### 5.5 Modals / Drawers / Toasts

- Overlay: `bg-ink/30 backdrop-blur-sm` (both themes).
- Modal: `.glass-strong rounded-[--radius-card] p-6 max-w-lg`, centered; mobile → bottom sheet (rounded top corners only, drag handle).
- Cart drawer (laptop): slides from right, `.glass-strong`, full-height, `w-[26rem]`.
- Toast: `.glass-strong rounded-pill px-5 py-3` top-center under the navbar; success/error tinted border.

### 5.6 Admin Panel

Same tokens, denser layout. Sidebar (laptop): fixed left `.glass-strong w-60 rounded-r-[--radius-card]`, nav items as pills; mobile: bottom tab bar instead. Stats cards: `.glass` with big Inter 700 number + caption. Tables: glass container, header row `text-muted uppercase 12px`, row hover `bg-[--highlight]/10`, zebra-free (borders `--glass-border` only). Charts: line/bar in `sage-600` with `sage-500/30` fill — no rainbow palettes.

---

## 6. Layout & Responsive Rules

**Breakpoints (Tailwind defaults):** design at `base` (mobile 360–430 px) and `lg` (laptop 1280–1440 px); `md` interpolates.

| Area | Mobile (base) | Laptop (lg) |
|---|---|---|
| Page container | `px-4`, full-width | `max-w-7xl mx-auto px-8` |
| Top offset (under fixed navbar) | `pt-24` | `pt-28` |
| Hero | stacked: text over image, H1 34 px, full-width CTA | split 50/50, H1 56 px |
| Category grid | 2 cols, `gap-3` | 4 cols, `gap-6` |
| Product grid | 2 cols `gap-3` | 4 cols `gap-6` (3 cols at `md`) |
| Filters | slide-up bottom sheet, opened by a "Filters" pill button | left sidebar `w-64`, sticky |
| Product detail | stacked: gallery → info; sticky bottom "Add to cart" glass bar | 2 cols: gallery 55% / info 45% |
| Cart | full page list | page list + sticky summary card right |
| Checkout | single column steps | 2 cols: form / order summary |
| Admin | bottom tab bar, cards stack 1-col, tables scroll horizontally in-place | sidebar + content, stats 4-up |
| Footer | accordion sections | 4-column grid |

**Grid gaps use the 4-pt spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Section vertical rhythm: `py-16` mobile, `py-24` laptop.

**Touch:** all interactive elements ≥ 44 px hit area on mobile; hover-revealed actions (quick-add) must have an always-visible mobile equivalent.

---

## 7. Motion

| Interaction | Spec |
|---|---|
| Hover lift (cards, buttons) | `translateY(-2~3px)`, 200 ms ease-out |
| Navbar active pill | Framer Motion `layoutId`, spring (stiffness 400, damping 30) |
| Page transitions | fade + 8 px rise, 250 ms |
| Modal / drawer | scale 0.97→1 + fade / slide, 250 ms ease-out |
| Add-to-cart feedback | cart icon badge pulses once; toast slides down |
| Skeletons | `animate-pulse`, never spinners for content areas |
| Reduced motion | respect `prefers-reduced-motion`: disable lifts/slides, keep fades |

---

## 8. Imagery & Iconography

- Product photography: warm, natural light, neutral backdrops (matches palette). Consistent 3:4 crop.
- Icons: `lucide-react`, `stroke-width: 1.5` (thin = premium), sized 20 px in navbar, 16 px inline. Color follows `currentColor`.
- Hero/banner imagery may sit *behind* glass panels — that's where glassmorphism earns its keep visually.
- Empty states: single thin-stroke icon + one line of copy + one CTA — no illustrations that fight the palette.

---

## 9. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Depth via blur + translucency | Heavy black drop shadows |
| `sage-900`/`sage-50` as the only "solid" fills | Saturated blues/reds for CTAs |
| One glass level per stacking context | Glass on glass on glass (blur stacking kills readability + perf) |
| `text` / `text-muted` tokens for all copy | Light sage text on glass (fails contrast) |
| Pill radius for interactive, card radius for containers | Mixed radii on siblings |
| Test every component in both themes | Designing light-only and inverting later |

**Performance note:** `backdrop-filter` is GPU-costly — keep glass surfaces to ~5–8 per viewport (navbar + visible cards), never on elements inside a scrolling list *and* animated simultaneously; the `@supports` fallback covers old browsers.
