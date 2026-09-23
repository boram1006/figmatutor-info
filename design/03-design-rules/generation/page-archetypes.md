# Page Archetypes

> Defines the 5 screen types observed across v1–v5. Use these to determine the starting structural template when generating a new screen.

---

## Archetype A: HERO-ANNOUNCE

**What it is**: A screen whose primary job is to communicate the product's existence, value proposition, or a major capability — before any interaction occurs.

**Observed in**: v1 landing overview, v2 intro screen, v3 splash/cover, v2-j01-top (splash panel)

**When to use**:
- Entry point of the product (first screen a new user sees)
- Major feature announcement or version reveal
- Presentation/pitch context (발표 화면)

**Information density**: Very low. 1–3 content units per viewport.

**Base structure**:
```
[Full-viewport dark background]
  [Centered or left-dominant text block]
    [Eyebrow label — caption, gold or muted white]
    [Primary headline — display or heading-xl, text-primary]
    [Subheadline or descriptor — body-lg, text-secondary]
  [Single CTA or none]
  [Optional: background decoration — subtle gradient, faint grid, or abstract shape at low opacity]
```

**Primary hierarchy**: headline > subheadline > CTA > everything else

**Appropriate components**: Large typographic stack, single primary button, optional icon/logo mark

**Avoid**:
- Cards with metadata
- Lists or tables
- Multiple CTAs
- Secondary navigation within the viewport
- Gold used on more than one element

---

## Archetype B: FEATURE-SHOWCASE

**What it is**: A screen that demonstrates how a specific feature or workflow works — still persuasive in tone but includes product UI previews, flow diagrams, or feature breakdowns.

**Observed in**: v1-prd-a/b, v2-prd-a/b, v3-prd-a/b/c, v2-j02-1/2, v2-a1/a2, v2-b1/b2/b3

**When to use**:
- Feature introduction sections in a landing flow
- Onboarding explainer screens
- Capability comparison or breakdown

**Information density**: Medium. 3–6 content units. Whitespace remains generous.

**Base structure**:
```
[Section heading block — left-aligned or centered]
  [Section label — caption, gold]
  [Section title — heading-lg or heading-xl]
  [Section description — body, text-secondary, max ~2 lines]
[Feature content area — one of:]
  Option A: 2-column text+visual split
  Option B: 3-column card row (equal weight features)
  Option C: Numbered/stepped vertical list with icons
[Optional: secondary CTA at section bottom]
```

**Primary hierarchy**: section-label > section-title > feature-content > description > CTA

**Appropriate components**: Feature card (icon + heading + body), 2–3 column grid, step indicator (if sequence matters), icon set

**Avoid**:
- Tables
- Status indicators (no items have operational state)
- Dense metadata
- More than 3 feature items in a single row

---

## Archetype C: TASK-FLOW

**What it is**: A screen where the user performs a sequential action — input, confirmation, configuration, or step-by-step process inside the plugin.

**Observed in**: v4 plugin screens, v5-s1/s2/s5 (plugin UI flow), v2-j03-1 (step UI)

**When to use**:
- Plugin panel screens
- Multi-step wizard or configuration flow
- Form input with validation
- Upload / file-picker flows

**Information density**: Medium. One primary task per viewport. No unrelated content.

**Base structure**:
```
[Step indicator — top or left sidebar, shows current position]
[Main task area]
  [Task title — heading-sm or heading-md]
  [Optional instruction — body, text-secondary, 1–2 lines]
  [Input/action area — centered or full-width]
[Action footer]
  [Primary CTA — right-aligned or full-width]
  [Optional: Back/Skip — left-aligned, text button]
```

**Primary hierarchy**: step-position > task-title > input > primary-CTA

**Appropriate components**: Step indicator, text input, file-drop zone, toggle/radio group, primary button, back button (text variant)

**Avoid**:
- Showing multiple steps simultaneously
- Metadata or unrelated content in the task area
- Decorative gold accents (gold used only for active step indicator)
- Tables or card grids inside the task area

---

## Archetype D: RESULT-SURFACE

**What it is**: A screen that presents the output of a process — generated design tokens, extracted components, AI analysis results, or completed job data.

**Observed in**: v4 result screens, v5 generation result, screens.json `result-*` entries, rebind-v5 snapshot output screens

**When to use**:
- After a generation/extraction process completes
- Token or component preview after plugin run
- Download/export confirmation screen

**Information density**: High. Multiple data points visible simultaneously.

**Base structure**:
```
[Status header — completion state, title, optional timestamp]
[Result content — one of:]
  Option A: Card grid (when items are discrete, selectable, or exportable)
  Option B: Split-pane (code/preview on right, controls on left)
  Option C: Grouped sections (tokens grouped by type: color/spacing/typography)
[Action bar — fixed bottom or top-right: primary export/use action, secondary copy/download]
```

**Primary hierarchy**: status > result-title > result-content > action-bar

**Appropriate components**: Result card, status badge, code block/token preview, export button, group header with count

**Avoid**:
- Reducing result density to appear simpler (violates P8)
- Hiding categories that the user will need to scan
- Large empty whitespace areas within the result grid

---

## Archetype E: MANAGEMENT-OPERATIONAL

**What it is**: A screen for ongoing monitoring, browsing, or managing a collection of items — jobs, projects, files, history, settings.

**Observed in**: v4/v5 job list screens, v5-s5 (management panel), operations snapshot management views

**When to use**:
- Listing saved projects, jobs, or exports
- Settings / configuration management
- History or audit log view

**Information density**: High. Maximum data per viewport. Every row is information-bearing.

**Base structure**:
```
[Page header — title + optional status summary + primary add/create action]
[Filter/search bar — full-width or right-aligned filters]
[Content table or list]
  [Column headers — fixed, sortable where applicable]
  [Data rows — alternating or unified surface, expandable]
  [Per-row actions — icon buttons, right-aligned or revealed on hover]
[Pagination or infinite scroll indicator]
```

**Primary hierarchy**: filter-state > row-primary-id > row-status > row-metadata > row-actions

**Appropriate components**: Data table, status badge, action icon button, filter chip, pagination, empty state (P9)

**Avoid**:
- Card grid layout for tabular data (cards are for Archetype D: Result-Surface)
- Inline editing without explicit edit mode trigger
- Dense decorative elements — this is pure functional territory
- Gold accents except for status indicators (active/current item)

---

## Archetype F: REVIEW-INSPECTOR

**What it is**: A screen for reviewing, validating, and optionally editing the output of an automated extraction or generation process — tokens, components, or structured data — before applying or exporting it.

**Observed in**: v1. 심사 페이지 (inspection flow), v1. 최종 심사 페이지 (finalized review with action bar)

**When to use**:
- Post-extraction review of design tokens (colors, spacing, typography)
- Component catalog review before applying to a file
- Any "confirm before apply" step in a plugin or tool flow
- Auditing AI-generated or auto-detected values

**Information density**: High. Left pane: dense list with status indicators. Right pane: full detail of selected item.

**Base structure**:
```
[Page/panel header]
  [Title — heading-sm, e.g. "추출 결과 심사"]
  [Status summary — badge row: total count, reviewed count, pending count]
[Category tab bar — full-width, horizontal scroll if needed]
  [Tab items: Color | Spacing | Typography | … ]
  [Active tab: underline or filled indicator, text-accent]
[Two-pane split layout]
  [Left pane — list, ~35–40% width, scrollable]
    [List item row]
      [Token/component name — body-sm, text-primary]
      [Value preview — caption, text-secondary (hex / px / font-size)]
      [Review status icon — right-aligned: ✓ approved / ✗ rejected / ● pending]
  [Right pane — detail, ~60–65% width]
    [Detail header]
      [Token name — heading-sm]
      [Category label — caption, text-secondary]
    [Value field(s) — inline editable]
      [Label — caption, text-tertiary]
      [Value — body-sm, editable input or display]
      [Edit trigger — pencil icon or click-to-edit pattern]
    [Usage preview — where this token is applied (swatch / sample text / spacing demo)]
    [Per-item action row]
      [Approve button — icon or text, status-success-s]
      [Reject button — icon or text, text-disabled or status-error]
      [Reset to extracted — text link, text-tertiary]
[Bottom action bar — fixed, full-width]
  [Left: summary label — "N개 승인됨 / M개 보류"]
  [Right: secondary action (내보내기/Export) + primary action (적용/Apply)]
```

**Primary hierarchy**: category-tab > list-item-status > detail-value > action-bar

**Appropriate components**: Category tab (horizontal nav), list row with status icon, inline editable field, value swatch/preview, approve/reject icon button, fixed bottom action bar

**State variants**:
| State | List item | Detail pane | Action bar primary |
|---|---|---|---|
| Pending (default) | ● neutral indicator | Editable fields active | "적용" — disabled or enabled by threshold |
| Approved | ✓ `status-success-s` indicator | Fields read-only, edit toggle available | Enabled when all reviewed |
| Rejected | ✗ `text-disabled` indicator | Fields dimmed, optional reason label | — |
| Edited (diverged) | ✎ `text-accent` indicator | Shows "원본 값 N → 수정값 M" diff | "적용" re-enabled |

**v1 → v1-final delta** (최종 심사 페이지 additions):
- Status summary row added to header (total / reviewed / pending counts)
- Bottom action bar made fixed (not inline) with explicit export + apply split
- Per-item status indicators strengthened (clearer approved/rejected/edited distinction)
- Edited state marker added to list items that diverge from extracted value

**Avoid**:
- Full-page table layout (split-pane is required — list for scanning, detail for editing)
- Inline editing directly in the list pane (edits happen in the right detail pane only)
- Decorative elements — zero decoration, this is a functional review tool
- Collapsing or hiding category tabs (all categories must be visible for the reviewer to orient)
- Applying without a confirmed action bar tap (no auto-apply on close)
