---
name: Recruitment Intelligence System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  score-display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for an AI-powered recruitment environment where precision, speed, and reliability are paramount. The brand personality is **authoritative yet unobtrusive**, positioning the AI as a high-performance tool that empowers human decision-making rather than replacing it.

The visual style follows a **Modern Corporate** aesthetic with a heavy emphasis on **Data-Driven Clarity**. It utilizes a structured, card-based layout to organize dense information—such as candidate profiles, match scores, and skill matrices—into digestible modules. The emotional response should be one of confidence and efficiency, achieved through generous white space, a cold-to-neutral color temperature, and a systematic approach to hierarchy.

## Colors
The palette is rooted in professional stability and analytical clarity.

- **Primary (Deep Navy):** Used for global navigation, primary headings, and high-level structural elements to establish authority.
- **Secondary (Professional Blue):** Reserved for primary actions, interactive states, and highlighting key AI insights.
- **Success (Match Green):** Specifically designated for "Match Scores" and "Approved" statuses, providing an immediate positive visual cue for high-quality candidates.
- **Neutral (Slate Grays):** A multi-step scale used for secondary text, borders, and background layering to maintain a low-noise environment.
- **Background:** A very light cool gray (`#F8FAFC`) to reduce eye strain during long periods of data review.

## Typography
This design system utilizes **Inter** for its exceptional legibility and systematic feel. The type scale is optimized for information density.

- **Headlines:** Use tighter letter-spacing and heavier weights to anchor sections.
- **Body Text:** Set at 14px and 16px to ensure readability for long-form resumes and analysis notes.
- **Data Labels:** Small-caps or heavy weights at 12px are used for metadata and skill tags to differentiate them from prose.
- **Score Display:** A specialized role for percentage-based match scores, using a heavy weight and negative tracking to feel like a singular, impactful metric.

## Layout & Spacing
The layout employs a **12-column fixed grid** on desktop (max 1440px) to ensure data visualization remains centered and readable. 

- **Grid Logic:** A 24px gutter provides enough breathing room between candidate cards and sidebars.
- **Modular Sections:** Inputs (search filters, job descriptions) are typically placed in a left-hand rail or a top-weighted section, while analysis results (candidate lists, match details) occupy the primary right-hand or center-stage area.
- **Mobile Adaptivity:** On mobile, the layout collapses into a single-column stack. Margins reduce to 16px, and horizontal padding within cards is minimized to maximize content real estate.

## Elevation & Depth
Depth is used functionally to indicate the layers of AI processing.

- **Surface Layer:** The main application background is flat.
- **Card Layer:** Analysis results and candidate profiles are housed in white cards with a very subtle 1px border (`#E2E8F0`) and a soft, low-blur shadow (0px 4px 6px rgba(0,0,0,0.05)).
- **Active Layer:** Elements being interacted with (e.g., a selected candidate) receive a slightly more pronounced shadow and a 2px secondary-blue left-border accent.
- **Overlays:** Modals and tooltips use a "high elevation" shadow with a 12px blur to separate them clearly from the underlying data grid.

## Shapes
The shape language balances modern approachable design with professional structure.

- **Standard Radius:** 8px (`0.5rem`) for cards, buttons, and input fields.
- **Large Radius:** 16px (`1rem`) for large container modules or featured AI insight panels.
- **Pill Shapes:** Used exclusively for status indicators, skill tags, and "Match Score" badges to distinguish them from actionable buttons.

## Components
- **Buttons:** Primary buttons are solid Navy or Blue with white text. Secondary buttons use a ghost style with a subtle border.
- **Match Score Rings:** Circular progress indicators using the Success Green. The stroke width should be thin (2-3px) for a sophisticated, technical feel.
- **Skill Tags:** Small, pill-shaped badges with a light-blue background and dark-blue text. On hover, these should show a "remove" icon or "view more" state.
- **Data Cards:** Content is divided into a header (name/role), body (skills/experience), and footer (action links).
- **Status Badges:** Compact, high-contrast indicators (e.g., "New," "Interviewing," "Hired") using distinct semantic colors (Blue, Yellow, Green).
- **Input Fields:** Clean, outlined boxes with clear 12px labels positioned above the field. Error states must use a dedicated red (`#EF4444`) with descriptive helper text.
