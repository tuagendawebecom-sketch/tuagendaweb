---
name: Organic Professionalism
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0edea'
  surface-container-high: '#ebe8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#404847'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ed'
  outline: '#717977'
  outline-variant: '#c0c8c6'
  surface-tint: '#3d6562'
  primary: '#002624'
  on-primary: '#ffffff'
  primary-container: '#123d3a'
  on-primary-container: '#7ea8a3'
  inverse-primary: '#a4cfca'
  secondary: '#006b5c'
  on-secondary: '#ffffff'
  secondary-container: '#94f4de'
  on-secondary-container: '#007262'
  tertiary: '#2e1f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#493300'
  on-tertiary-container: '#c5993e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0ebe6'
  primary-fixed-dim: '#a4cfca'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#254d4a'
  secondary-fixed: '#94f4de'
  secondary-fixed-dim: '#78d7c3'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005045'
  tertiary-fixed: '#ffdea4'
  tertiary-fixed-dim: '#efbf61'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#5d4200'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 32px
  gutter: 24px
  section-gap: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

This design system is built to evoke a sense of **organized calm and personalized service**. It rejects the cold, sterile aesthetics of traditional enterprise software in favor of a "human-first" digital environment. The brand personality is professional yet warm, high-end yet accessible.

The visual style is a blend of **Modern Minimalism** and **Tactile warmth**. It relies on generous white space (breathing room), sophisticated color blocking, and soft, organic shapes to create a premium experience. The goal is to make the user feel like they are interacting with a boutique concierge service rather than a complex database.

## Colors

The palette is anchored in an earthy, warm foundation to ensure the interface feels inviting.

- **Background & Surfaces:** Use `#F7F4EE` as the primary canvas. This off-white "parchment" tone reduces eye strain and feels more premium than pure white. Use `#DDEBE6` for secondary panels and card backgrounds to create subtle grouping.
- **Brand & Depth:** `#123D3A` (Dark Teal) is reserved for high-authority elements: headers, navigation sidebars, and premium section backgrounds. When used as a background, text must shift to the warm background color for legibility.
- **Action & Intent:** `#1F8A78` (Seafoam Green) is the primary interactive color. Use it for "Create" or "Confirm" actions.
- **Emphasis:** `#E7B85A` (Mustard Gold) is used sparingly for accents, active states, or highlighting specific "VIP" data points.
- **Typography:** All primary reading text uses `#1E1E1C` to maintain high contrast against the warm backgrounds.

## Typography

The typography system balances character with utility. 

**Plus Jakarta Sans** (serving as a contemporary alternative to Poppins with better UI legibility) is used for all headlines. Its semi-bold weight and open counters feel welcoming and modern. 

**Inter** is used for all functional text, body copy, and UI labels. Its neutral, highly legible structure ensures that even dense scheduling information remains easy to parse. 

- Use **tight tracking** for large headlines to maintain a "designed" editorial feel.
- Use **generous line-height** (1.6) for body text to promote readability and "breathing room."
- Use **uppercase labels** for small metadata to differentiate it from body content without increasing font size.

## Layout & Spacing

This design system employs a **Fluid Grid** with fixed maximum widths for content readability. The layout relies on an 8px base unit.

- **Margins:** Large margins (32px+) are preferred to create a "boutique" feel. Avoid edge-to-edge layouts on desktop.
- **Grid:** Use a 12-column grid for desktop with 24px gutters. For mobile, shift to a 4-column grid with 16px margins.
- **Vertical Rhythm:** Use larger gaps (`section-gap`) between unrelated content blocks to reinforce the sense of "generous whitespace."
- **Alignment:** Content should be logically grouped into cards or soft panels, using `stack-md` for internal spacing to maintain a clean, organized hierarchy.

## Elevation & Depth

To maintain a "human" and warm feel, avoid harsh, heavy shadows. This design system uses **Tonal Layers** and **Ambient Softness**:

- **Primary Depth:** Depth is primarily communicated through color shifts (e.g., a `#DDEBE6` card on a `#F7F4EE` background).
- **Shadows:** When necessary for interactive elements (like an active dropdown or a floating action button), use highly diffused, low-opacity shadows tinted with the primary teal color: `box-shadow: 0 10px 30px -10px rgba(18, 61, 58, 0.15)`.
- **Borders:** Use thin, low-contrast borders (`1px solid rgba(30, 30, 28, 0.08)`) instead of shadows for card outlines to keep the interface crisp.

## Shapes

The shape language is **distinctly rounded** to emphasize the friendly, personalized nature of the service. 

- **Cards & Primary Containers:** Use `rounded-xl` (1.5rem / 24px) to create a soft, inviting frame for content.
- **Buttons & Inputs:** Use `rounded-lg` (1rem / 16px) for a substantial, tactile feel.
- **Icons:** Icons should feature rounded caps and corners, avoiding sharp 90-degree angles to match the UI's softness.

## Components

### Buttons
- **Primary Action:** Background `#1F8A78` with white text. High-contrast, rounded-lg.
- **Secondary Action:** Ghost style with `#123D3A` border and text.
- **Premium Action:** Background `#123D3A` with `#F7F4EE` text for high-impact sections.

### Cards
Cards are the core of the experience. Use a white or `#DDEBE6` background with `rounded-xl` corners. Padding within cards should be a minimum of 24px to ensure content never feels cramped.

### Input Fields
Inputs use the background color `#F7F4EE` with a subtle border. On focus, the border should transition to the Seafoam Green (`#1F8A78`) with a soft outer glow.

### Chips & Badges
Use the Mustard Gold (`#E7B85A`) for high-priority status indicators and the Soft Support Mint (`#DDEBE6`) for neutral tags. All chips should be fully pill-shaped.

### Lists
List items should have generous vertical padding and be separated by subtle dividers. In scheduling views, use rounded time-block indicators to maintain the organic aesthetic.