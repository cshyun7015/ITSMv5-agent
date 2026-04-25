# ITSM v5 Enterprise UI Standards (Gold Standard)

This document serves as the absolute source of truth for UI design. Any code changes MUST adhere to these standards to prevent UI regressions.

## 1. Design Tokens (Core Aesthetics)
- **Background**: Deep slate/dark blue (`#0f172a`) with subtle radial gradients.
- **Glassmorphism**: Use `backdrop-filter: blur(12px)` and `rgba(255, 255, 255, 0.05)` borders for panels and modals.
- **Primary Color**: High-vibrancy Blue (`#3b82f6`) with glow effects (`box-shadow`).
- **Typography**: 'Inter' sans-serif, bold weights (700/800) for headers.

## 2. Component Standards
### 📊 Data Tables (Request List)
- **Density**: High density (compact padding: `8px 12px` for headers, `12px 16px` for cells).
- **ID Display**: Prefixed with `#` and styled with `JetBrains Mono` or similar monospace.
- **Title Tooltips**: Long titles must be truncated with ellipsis and show the full text on hover using the `title` attribute.
- **Status Badges**: Must be **Pill-shaped** (`border-radius: 99px`) with subtle background transparency and specific colors (Blue for Open, Green for Resolved/Closed, Purple for Pending).

### 🖼️ Modals (Forms)
- **Positioning**: Always centered using fixed overlay with dark blur.
- **Structure**: Clear Header (title + close button), Scrollable Body (max-height 90vh), and Sticky Footer (actions).
- **Visuals**: Rounded corners (`24px`), glass borders, and scale-up animations.

### 🔘 Buttons & Icons
- **Icons**: Always use `lucide-react` icons (e.g., `ArrowLeft`, `Edit2`, `Trash2`).
- **Styles**:
  - `btn-primary`: Blue gradient with glow.
  - `btn-back`: Ghost style with arrow icon.
  - `btn-icon`: Transparent background with hover lift effect.
- **Standard Heights**: Primary buttons at `42px`, Action Hub buttons at `48px`.

## 3. Interaction Patterns
- **Feedback**: Every CRUD operation MUST trigger a **Toast Notification** (via `useToast`).
- **Loading**: Use "Accessing Mission Log..." or similar themed loading states instead of generic spinners.
- **Action Control**: Disable or hide buttons based on business logic (e.g., no "Assign" on Drafts) to prevent server-side errors.

---

**CRITICAL RULE**: Before editing any `.tsx` or `.css` file, read the existing styles to ensure these standards are maintained. Never revert to browser defaults or simple MVP styles.
