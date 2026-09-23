# Density Rules

> Rules for how much information to show per viewport. Do not simplify operational screens.
> All rules grounded in observed v1–v5 screens.

---

## D1. Density Correlates With User Mode, Not Aesthetic Preference  [HIGH]

Density is set by the archetype (see `page-archetypes.md`), not by a desire for elegance or minimalism.

| Archetype | Density Level | Viewport Content Units |
|---|---|---|
| HERO-ANNOUNCE | Very Low | 1–3 |
| FEATURE-SHOWCASE | Low–Medium | 3–6 |
| TASK-FLOW | Medium | 4–8 (one task + context) |
| RESULT-SURFACE | High | 8–20+ (data grid) |
| MANAGEMENT-OPERATIONAL | Very High | 15–40+ (table rows) |

IF you are generating an Archetype D or E screen
THEN start with high density and reduce only if specific items have no data to show
DO NOT default to a clean/airy layout because it feels more polished

---

## D2. Whitespace Is Structural in Low-Density Screens  [HIGH]

In HERO-ANNOUNCE and FEATURE-SHOWCASE screens, whitespace is not empty space — it is a structural element that creates reading rhythm and prevents visual noise.

Observed in v1 landing, v2-j01-top, v3 cover:
- Minimum section gap: ~80–120px between major content blocks
- Paragraph line-height: loose (observed `leading-relaxed` or equivalent)
- Card padding in feature rows: ~32–48px internal

IF generating a low-density screen with tight spacing
THEN increase section gaps. Tight spacing reads as incomplete rather than efficient in this context.

---

## D3. Cards in High-Density Screens Have Compact Padding  [HIGH]

Result cards and management cards (Archetypes D and E) use minimal internal padding.

Observed in v4/v5 result panels and plugin output grids:
- Card internal padding: 12–16px (not 24–32px as in showcase cards)
- Content within card is top-aligned, no vertical centering
- Card border: `1px solid border-subtle` or `border-default`
- Card height: determined by content, no fixed min-height on operational cards

IF a result card is being designed with generous padding
THEN reduce. Dense result grids need visual consistency, not breathing room.

---

## D4. Metadata Exposure Rules by Archetype  [HIGH]

**HERO-ANNOUNCE**: No metadata.
**FEATURE-SHOWCASE**: Feature labels only (names, 1-line descriptions). No counts, IDs, dates.
**TASK-FLOW**: Step number + step title only. No unrelated metadata visible.
**RESULT-SURFACE**: Full metadata visible — token names, values, categories, types, counts.
**MANAGEMENT-OPERATIONAL**: Maximum metadata in table columns — ID, date, status, owner, action counts.

IF metadata is showing on a HERO or FEATURE screen
THEN remove it unless it is a product-specific number used for credibility (e.g., "2,400+ components extracted" as a social proof stat)

---

## D5. Actions Per Viewport  [HIGH]

| Archetype | Max Simultaneous Actions Visible |
|---|---|
| HERO-ANNOUNCE | 1 (single CTA) |
| FEATURE-SHOWCASE | 1–2 (section CTA + optional secondary) |
| TASK-FLOW | 2 (primary + back) |
| RESULT-SURFACE | 2–4 (primary export + secondary per-item actions) |
| MANAGEMENT-OPERATIONAL | Per-row: 2–3 icon actions. Page-level: 1 primary add |

IF more actions are present than the archetype allows
THEN group secondary actions into a `...` overflow menu or remove them from the primary view

---

## D6. Decoration-to-Function Ratio  [HIGH]

Observed distinction across v1–v5:

- v1–v3 showcase screens: decoration is intentional — subtle grid overlays, gradient washes, abstract shapes at ~10–20% opacity serve as visual grounding
- v4–v5 operational screens: zero decorative elements. Every pixel is data or structural.

IF the screen is Archetype D or E
THEN remove all decorative background elements
THEN use surface elevation (`surface-raised`) as the only visual layering tool

IF the screen is Archetype A or B
THEN one subtle background treatment is acceptable — but it must not compete with text readability

---

## D7. Table vs Card Grid Selection for Dense Content  [HIGH]

This is one of the most consequential density decisions.

**Use Table when**:
- Items have 4+ comparable attributes
- Users need to scan and compare rows (management, history, audit)
- Items are not individually "presented" — they are records
- Archetype E

**Use Card Grid when**:
- Items have a primary identity (name/title) that dominates
- Items are discrete outputs that can be previewed, selected, or exported
- Items have 2–4 attributes (not 4+)
- Archetype D (Result-Surface)

**Observed evidence**:
- v5 management panel: table layout with fixed columns
- v4/v5 result screens: card grid 2–3 columns
- Never observed: card grid used for management/history data
- Never observed: table used for design token result preview

---

## D8. One-Per-Row vs Grid: Column Count Decision  [MEDIUM]

Observed column counts across screens:

- Feature showcase (Archetype B): 2 or 3 columns equal-weight
- Result card grid (Archetype D): 2–3 columns responsive
- Management table (Archetype E): single-row per record, multi-column attributes

IF content items are homogeneous (same type, same attribute set)
THEN grid, 2–3 columns
IF content items are heterogeneous records
THEN table, 1 row per record

---

## D9. Long Screens: Section Pacing  [MEDIUM]

For HERO-ANNOUNCE and FEATURE-SHOWCASE screens that scroll vertically (observed in v1, v2, v3 full-page layouts):

- Dense section followed by breathing section (alternating rhythm)
- Never two high-density sections adjacent without a visual break
- Section transitions: either whitespace gap (80px+) or a full-width divider block

IF generating a long showcase page
THEN plan section pairs: heavy content → light content → heavy content
This pattern is observed across v1-left, v2-a/b, v3 multi-section layouts

---

## D10. Split-Pane Layout Is Mandatory for REVIEW-INSPECTOR  [HIGH]

Archetype F (REVIEW-INSPECTOR) must use a two-pane horizontal split. A single-column or full-table layout collapses the review workflow into a linear scan, losing the ability to edit without losing list context.

**Left pane (list)**: ~35–40% width. Compact row height (40–48px per item). Status icon right-aligned.
**Right pane (detail)**: ~60–65% width. Full detail of the selected item. Inline editable fields.

IF generating a review/inspection screen as a single-column list
THEN convert to split-pane. The detail pane is not optional.

IF the right pane is empty (no item selected)
THEN show an empty-state prompt ("항목을 선택하세요") — not a blank white area.

---

## D11. Category Tabs Are Always Visible in REVIEW-INSPECTOR  [HIGH]

Category tabs (Color / Spacing / Typography / …) must remain visible at all times during review. They are orientation anchors — hiding or collapsing them forces the reviewer to lose context when switching items.

Observed in v1. 심사 페이지 and v1. 최종 심사 페이지:
- Tab bar is horizontal, full-width, above the split pane
- Active tab uses `text-accent` underline or filled indicator
- Inactive tabs use `text-secondary`
- Tab count badge (e.g. "Color (12)") is acceptable and recommended for orientation

IF tabs are hidden behind a dropdown or collapsed menu
THEN surface them as a visible tab bar. Dropdown navigation is not permitted for this archetype.

---

## D12. Inline Editing Scope: Detail Pane Only  [HIGH]

Editable value fields appear exclusively in the right detail pane. The left list pane is read-only (status icon + name + value preview only).

This separation prevents accidental edits during list scanning and keeps the list rows compact.

IF an editable input is placed inside a list row
THEN move it to the detail pane. List rows show the current value as read-only text.

**Edited state marker**: when a value in the detail pane diverges from the extracted original, the corresponding list item gains an ✎ `text-accent` indicator and the detail pane shows a diff ("원본: N → 수정: M").

---

## D13. Fixed Bottom Action Bar for Review Completion  [HIGH]

The bottom action bar in REVIEW-INSPECTOR is always fixed (not scrollable with content). It contains two actions maximum: a secondary action (내보내기/Export) left-aligned or subdued, and a primary action (적용/Apply) right-aligned.

Observed delta between v1 심사 페이지 and v1 최종 심사 페이지:
- v1 (initial): action may be inline or loosely positioned at bottom
- v1-final: action bar is explicitly fixed, always visible regardless of list scroll position

IF the action bar scrolls with the list
THEN make it fixed. The reviewer must be able to apply without scrolling to the bottom.

Primary action state rules:
- Disabled: when pending items remain above threshold
- Enabled: when review threshold is met (all reviewed, or user-defined minimum)
- DO NOT auto-apply on close or navigation — always require explicit tap

---

## D14. Status Indicator Density in Review Lists  [MEDIUM]

Every list row in REVIEW-INSPECTOR must carry a visible status indicator. Blank rows without status create ambiguity about whether an item has been reviewed.

| Status | Indicator | Color token |
|---|---|---|
| Pending | ● filled circle | `text-disabled` or neutral |
| Approved | ✓ checkmark | `status-success-s` |
| Rejected | ✗ cross | `text-disabled` (muted, not alarming) |
| Edited (diverged) | ✎ pencil | `text-accent` |

Status icons are right-aligned within the list row, 16×16px, consistent vertical center.

IF a list row has no status indicator
THEN add one. Unmarked rows are indistinguishable from unloaded or errored items.
