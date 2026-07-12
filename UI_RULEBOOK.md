# TransitOps Design Rulebook
## Gold, Cream, & Charcoal Industrial Aesthetic

This design system ensures a consistent premium, industrial-luxury UI for TransitOps across all devices.

---

### 1. Brand Color Palette

Use these exact hex colors or CSS custom properties to maintain visual hierarchy.

| Role | Color Name | Hex Code | Tailwind / CSS variable | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Primary BG** | Cream Sand | `#EBE9E1` | `var(--background)` | Main application background (clean, light, tactile) |
| **Contrast BG** | Textured Charcoal | `#1A1A1A` | `var(--sidebar)` | Header bars, sidebars, contrast card panels |
| **Accent Primary** | Ochre Gold | `#C59B27` | `var(--primary)` | Action buttons, active statuses, key brand lines, hover states |
| **Accent Light** | Dull Gold | `#C5A059` | `var(--primary-container)` | Border highlights, secondary icons, rating stars |
| **Text Dark** | Dark Ash | `#1F1F1F` | `var(--foreground)` | Body text, titles, prominent text on cream background |
| **Text Light** | Off-White | `#F5F5F7` | `var(--primary-foreground)` | Text on dark/charcoal cards or headers |
| **Borders** | Muted Clay | `#D1CFC7` | `var(--border)` | Separation lines, grid borders, card borders |

---

### 2. Typography Guidelines

Use modern, sharp sans-serif fonts such as **Outfit**, **Inter**, or **Montserrat**.

- **App Titles & Headers**: Bold, uppercase, letter-spacing expanded.
  - *Tailwind Example*: `font-sans uppercase tracking-wider font-extrabold text-foreground`
- **Sub-headers / Section Titles**: Semi-bold, medium size.
  - *Tailwind Example*: `font-sans font-semibold tracking-tight text-foreground/90`
- **Labels**: Very small, uppercase, muted color, wide letter-spacing.
  - *Tailwind Example*: `text-[10px] font-bold uppercase tracking-widest text-muted-foreground`

---

### 3. UI Elements & Layout Patterns

#### A. Buttons
Primary action buttons should have a flat, solid look in Ochre Gold with white or dark text, accompanied by an icon or right-pointing arrow (`→`).
- **Base Style**: Ochre Gold background, uppercase text, bold weight, medium height, no border, slight right arrow animation on hover.
- **Hover/Active State**: Accent Primary shifts slightly lighter/darker, translation effect to the right for the arrow.

#### B. Cards & Grid Panels
- **Light Cards**: Pure white (`#FFFFFF`) with a very thin `1px` border of Muted Clay (`#D1CFC7`). Minimal box-shadow or completely flat.
- **Contrast Cards**: Deep Charcoal (`#1A1A1A`) background. Great for summaries, maps, or highlighted statistics.
- **Design Signature**: Include a vertical gold stripe (`3px` width) on the left side of active cards or step indicators to guide the user's eye.

#### C. Forms
- **Input Fields**: Soft, cream-white background (`#F4F2EB`) with a thin border. When focused, the border turns gold.
- **Checkboxes**: Square, solid dark ash or gold borders with a gold checkmark.

#### D. Navigation Bar & Sidebar
- **Sidebar**: Dark Charcoal background, with navigation items using light text. The active navigation item must have a gold background highlight or left gold indicator.
- **Header**: Transparent or matching the background with a soft backdrop-blur, keeping details simple (e.g., small search bar, notifications icon, user avatar).
