# Product Visual Grammar — whole-service evidence

> Source: `design/04-screens/snapshot.json` (captured 2026-09-26, 19 extracted sections, 16,011 nodes).
> Purpose: preserve cross-page visual consistency when a new screen is composed from an external composition source such as Stitch.
> This file defines product visual grammar from the user's existing Figma assets. External HTML/image references never override these rules.

## 0. Source precedence

For new product screens, use sources in this order:

1. **Product truth** — locked PRD / approved product candidates.
2. **Whole-service visual grammar** — this file, derived across existing screens.
3. **Current screen-family baseline** — closest current screens for the same user mode/workflow.
4. **Immediate predecessor shell** — header/sidebar/content geometry and navigation continuity.
5. **External composition source** — Stitch HTML/CSS/image for information architecture, section hierarchy, relative emphasis, and composition ideas.
6. Generic UI convention.

Do not copy Stitch CSS values directly when the same semantic role already exists in the product. Translate the role into the product's typography, spacing, surface, border and component rules.

---

## 1. Page families must stay visually related without being averaged together

The snapshot contains several intentional modes:

- public/read pages (notice, FAQ, team-building)
- participant application / My Page workflow
- reviewer / evaluation workspaces
- admin AI-review workspaces
- campaign / celebration pages

Global consistency comes from shared typography, token language, borders, surfaces and spacing cadence. Exact shell geometry may differ by family.

**Do not average legacy/public/admin geometry into one universal shell.** Select the current family first, then inherit its geometry.

### Current participant workflow evidence

Across v3–v5 participant workflow screens:

- screen width: 1440
- functional background: `background-subtle-2`
- current application header: 72px, white surface, bottom border, horizontal padding 120
- v5 work area uses 1200–1280 content region depending workflow
- My Page/status layout evidence: 280px sidebar + 32px gap + task body
- long form/package screens use a left workflow rail + right outlined workspace

Public v1/v4 pages use an older 81–84px header and different title treatment. Do not import that header geometry into current A-series participant screens.

---

## 2. Typography is role-based; never infer font values from an external reference

Use existing `Text/*` styles. Current token definitions:

| Semantic role | Preferred existing style | Size / line-height |
|---|---|---|
| Functional page/workspace title | `Text/h2` | 24 / 36 |
| Strong section heading | `Text/h3-bold` | 20 / 28 |
| Normal section heading | `Text/h3-medium` or `Text/h3` | 20 / 28 |
| Card heading | `Text/h4` or `Text/body-lg-bold` | 18 / 28 or 16 / 24 |
| Main body | `Text/body-lg` / `Text/body` | 16 / 24 or 15 / 20 |
| Compact functional copy | `Text/body-sm(-medium/-semibold)` | 14 / 20 |
| Metadata / helper / breadcrumb | `Text/caption(-medium)` | 12 / 16 |

`Text/title` (54/60) and `Text/h1` (40/48) belong to public/hero presentation contexts and must not be used as default functional page titles.

### Title + lead relationship

Evidence in current application/package screens:
- functional page title uses `Text/h2`
- explanatory lead immediately below is usually `Text/body-sm-medium` / `Text/body-sm`
- page-title → lead gap is compact; A-32 shows 8px between the 36px title line and the lead
- compact panel title → helper can be 4px

Rule:
- functional page title + direct lead: **8px**
- compact panel heading + helper: **4px**
- do not insert 16–32px between a title and the sentence that explains that title

### Letter spacing

Current canonical `Text/*` tokens do not define an additional letter-spacing value. Do not invent tracking to mimic Stitch/image references. Use the text style as-is.

---

## 3. Spacing cadence comes from the product, not from external CSS

Across the full snapshot, the dominant spacing values are:
`4, 8, 12, 16, 20, 24, 32`, with 48/80/120 used for larger section or page spacing.

Use them semantically:

- **4**: title-helper micro gap, compact label grouping
- **8**: metadata chips, badge internals, title-lead, compact sub-elements
- **12**: card row rhythm, status/notice content
- **16**: normal group internals, sibling controls
- **20**: nested card padding / medium internal grouping
- **24**: primary card padding and major sibling gap
- **32**: major workspace/card padding, pane separation
- **48+**: page/section separation only

Do not choose spacing because the external reference uses that px value. Identify the semantic relationship first, then select the matching existing cadence.

---

## 4. Grouping grammar: boundary is mandatory, outline is not

A functional group must be perceptible, but **a border is only one possible boundary cue**.
Use the lightest cue that preserves grouping: spacing, surface contrast, divider, outline, or true elevation/shadow.
Do not add an outline merely because the element is a card-like rectangle.

### Page background

Current functional participant screens commonly use:
- page/background = `background-subtle-2`

### Outer functional group

Repeated evidence:
- white/`text-inverse` or family-appropriate raised surface
- radius **16** is common for major grouped surfaces
- padding **24** for entity/status cards
- padding **32** for larger form/workspace containers
- neutral outline is common where entity boundaries would otherwise disappear, but is **not mandatory** when surface contrast, spacing/divider, or legitimate elevation already establishes the group

Examples:
- A-30 status cards: radius 16, padding 24, outline
- A-31 workspace: radius 16, padding 32, outline
- A-32 package workspace: radius 16, padding 32, outline

### Nested group inside an outer surface

Repeated evidence:
- radius **12**
- padding around **20** (or 12–16 for smaller notices/inputs)
- `background-subtle-2` or another subtle semantic surface
- thin border when a discrete sub-entity must remain identifiable

A-32 package items are the clearest current example: nested items use subtle fill + border + radius 12 inside one larger outlined workspace.

### Sidebar / navigation grouping

My Page navigation is not a loose set of floating rows.

Current evidence:
- A-01 and A-30 use a **single 280px outer surface**
- radius **16**
- padding **16**
- navigation rows live inside this shared surface
- active row is then expressed locally within that group

Therefore:
- when a My Page sidebar exists, clone/reuse the whole sidebar surface
- never place its navigation rows directly on the page background as independent floating items

### Mandatory grouping check

Before finalizing any generated functional screen, ask:

> If the labels were removed, can a viewer still see which elements belong to the same information group?

If not, add the minimum necessary grouping cue: stronger spacing, surface contrast, divider, outline, or legitimate elevation.

**Forbidden default:** many white child blocks floating on a light page background with no parent grouping.

---



### Layout wrapper vs semantic surface

Generated FRAME does not automatically mean "card".

- **layout wrapper / row / grid / section container** → transparent by default
- **semantic card / entity card / review card / project meta card** → explicit product surface
- **hero / semantic notice / campaign band** → explicit state-appropriate surface

For ordinary peer cards in this product, the preferred baseline is:
- `background-primary`
- neutral outline such as `border-default`
- radius 16 for the card
- product spacing cadence
- no shadow unless the card genuinely needs elevation

This prevents external HTML's common `white + shadow` treatment from silently becoming the product card style.
The earlier rule "outline is not mandatory" still applies to wrappers, bands, hero regions and groups whose boundary is already clear; it does **not** mean product card entities should lose their established outline treatment.

---

## 5. Border, background and nested-surface hierarchy

Use visual levels consistently:

1. **Page canvas** — `background-subtle-2`
2. **Primary functional group** — white surface + neutral outline
3. **Nested sub-group** — subtle fill and/or smaller-radius outline
4. **Semantic notice/state** — semantic tinted surface + semantic border/text
5. **Overlay/modal** — stronger depth/shadow allowed

Do not use background color and outline randomly. They express hierarchy:
- outline = boundary of an entity/functional group
- subtle fill = secondary level inside a group
- tinted fill = semantic emphasis/state
- shadow = actual depth/overlay, not routine card decoration

---

## 6. Radius hierarchy

Observed repeated radii:
- 4: compact state/status pieces
- 8: buttons, inputs, notices, small controls
- 12: nested content cards/fields
- 16: major cards, sidebars, primary grouped surfaces
- 24: large empty-state/hero-like functional surfaces
- 999/pill: tags/chips only

Rule:
- child surfaces should not visually compete with their parent; use a smaller/equal semantic radius level
- do not use pill radius for ordinary headings or arbitrary decorative labels

---

## 7. Badge / tag grammar

Badges are semantic, not decorative.

Use badges/tags for:
- state/status
- category/track
- step/count
- award/rank
- compact metadata that benefits from scanning

Do not turn normal section labels into badges merely to add visual interest.

Repeated geometry:
- compact status: padding 4/8
- status pieces often 21–25px tall
- small state radius can be 4/8
- category/tag components often use pill radius

Prefer existing Tag/component instances where available. If a status treatment is screen-family-specific and already exists as a composite pattern, clone that pattern rather than reconstructing it.

---

## 8. Information blocks: parent grouping before child cards

When an external composition source proposes several related blocks:

1. determine their shared semantic parent
2. find an existing product pattern for that parent role
3. create/reuse the **outer group first**
4. place child items inside using the product's nested-surface hierarchy

Examples:
- evaluation summary = one evaluation section containing AI/human sub-groups
- submission package = one package surface containing package items
- My Page navigation = one sidebar surface containing nav rows

Do not translate every HTML `div` into an independent Figma card.

---

## 9. External composition translation contract

When Stitch HTML/CSS or an image is used:

### Keep from Stitch
- content ordering
- section hierarchy
- sibling relationships
- relative emphasis
- dense vs sparse composition intent
- novel product candidates for review
- useful new functional blocks approved by the user

### Translate using product assets
- font sizes / weights / line heights
- letter spacing
- spacing values
- border / outline treatment
- surface/background hierarchy
- radius
- buttons, tags, inputs and other components
- shell/header/sidebar
- status colors

### Never copy blindly
- Tailwind spacing values
- Stitch font scale
- Stitch border radius
- Stitch color system
- Stitch card background strategy
- Stitch navigation shell

The target is **Stitch composition expressed in the user's product visual language**.

---

## 10. Generation gate for new screens

Before create spec:

1. Read the whole-service grammar.
2. Classify the screen family.
3. Retrieve at least **two existing product sources** for the needed visual roles when possible:
   - shell/navigation source
   - content-group/surface source
4. If a predecessor exists, inherit its shell.
5. If using Stitch, parse semantic blocks before selecting Figma primitives/components.
6. Map each block to:
   - INSTANCE_REUSE
   - CLONE_COMPOSE
   - NEW_CONSTRUCTION
7. NEW_CONSTRUCTION must cite an existing visual role/evidence for:
   - typography
   - spacing
   - surface/outline
   - radius
8. Run a grouping audit before plugin execution.

### Grouping audit fail conditions

Fail the spec if:
- sidebar/navigation rows are floating without the existing sidebar surface
- a major functional section has multiple child items but no visible parent boundary where comparable existing screens use one
- title/lead typography is invented instead of using an existing text style
- external CSS px values are copied without mapping to product tokens/observed geometry
- white-on-light blocks lose visual grouping because both border and surface contrast are absent

---

## 11. Evidence notes

This grammar intentionally uses the **whole screen snapshot**, then narrows to current-family evidence.

Representative current evidence:
- A-01 application list: grouped My Page sidebar (280, r16, p16) + outlined status cards (r16, p24)
- A-30 my report status: same My Page grouping concept, 280 sidebar + 32 gap + 855 task body
- A-31 report form: large outlined workspace, r16, p32
- A-32 submission package: large outlined workspace (r16, p32) with nested subtle outlined items (r12, p20)
- v3 status/list screens: status cards r16/p24 and compact badges p4/8
- notice/FAQ/team-building pages: broader public-page shell, showing that public-page typography and spacing must not be averaged into participant workflow screens

The evidence is cross-page. A-30 is only the immediate shell source for A-40; it is not the sole source of the product visual grammar.



---

## 12. Cross-screen evidence refresh — 2026-09-29

Representative evidence was rechecked per archetype rather than extrapolated from A-30 alone:

| Archetype | Representative evidence | Confirmed composition behavior |
|---|---|---|
| A1 | `N-01_notice-list` / `1:11206` | centered hero + flat list/table + pagination; do not force card layout |
| A2 | `H-02_first-round-result_H2` / `1:22713` | expressive hero + result cards + follow-up/countdown |
| A3 | `TB-01_team-list__recruiting_H2` / `1:21543` | hero + summary + 3-column browse cards |
| A4 | A-30 current evidence | sidebar + status/work body |
| A5 | A-31 current evidence | large editing/work surface |
| A6 | `J-01_ai-review-dashboard` / `1:14166` | KPI summary + controls/template + dense table |
| A7 | `RV-02_final-review-unfolded` / `1:6567` | split/high-density review workspace; centered rail is not mandatory |
| A8 | `RV-01_first-review-finalize` / `1:3666` | finalization table + persistent action region; `1:3126` is incomplete-state variation |
| A9 | A-32 current evidence | package/readiness workspace with nested artifact blocks |

### Stable grammar after cross-screen comparison

Repeated evidence supports the following as cross-screen grammar:
- surface hierarchy: page/workspace → primary surface → nested subtle surface
- standard 1440 content pages often use a 1200px rail / 120px sides
- primary card/surface padding commonly 24px
- primary card radius commonly 16px
- nested block radius commonly 12px
- compact controls commonly radius 8px
- tags/status commonly 4px 8px padding
- major sibling rhythm commonly 20–24px, with 32–48px for larger semantic separation

These are **role-based defaults**, not mandatory geometry for every archetype.
A7/A8 and other dense workspaces may widen the content region because task continuity and data density take priority.

### Critical anti-overfitting rule

Do not use A-30's sidebar/body geometry as a product-wide template.
A-30 is valid evidence for A4/current participant shell only.
The product-wide invariant is the surface/grouping language; the page composition must come from the target archetype/current family.

### Stitch translation decision

When Stitch proposes a useful block, preserve:
- semantic parent/child grouping
- section ordering
- relative emphasis
- density intent
- useful information architecture

Then select the closest target-archetype composition and rebuild the visual treatment with current Figma evidence.
Stitch spacing/type/radius/color/shell values are never promoted into product Visual DNA.


---

## 13. Navigation depth before shell reuse

Do not clone a predecessor sidebar merely because the target screen is reached from that predecessor.

Before inheriting local navigation, classify the target depth:

- **hub/list screen**: persistent My Page navigation may remain if it represents the current level.
- **entity detail / child result screen**: preserve the selected entity context and provide an explicit return path to the immediate parent.
- If a sidebar action would jump over the immediate parent level, the sidebar is not valid local navigation for that child screen.

For a child such as:
`My Page → 내 지원 현황 → selected application → 심사 결과`

the minimum navigation context is:
1. explicit back/breadcrumb to **내 지원 현황** or the selected application context,
2. current screen label,
3. global navigation as appropriate.

Do not force the My Page sidebar into the child screen unless the real product flow proves that it remains persistent.

External evidence may reveal this information architecture even when its visual styling is not reused.

---

## 14. Text containment and wrapping is a generation invariant

Text must not exceed the content box that owns it.

For every generated non-chip text block:
- give it a bounded content width through parent FILL/fixed width,
- use height-growing wrap behavior rather than width-growing behavior,
- long Korean/English mixed copy must wrap inside the parent,
- verify the generated text bounding box against the parent content box after creation.

Do not leave body/title text as unconstrained `WIDTH_AND_HEIGHT` auto-resize inside a fixed-width card.
A visually correct screenshot with clipped/overflowing text is a generation failure.

---

## 15. Centering and rail geometry must be preserved explicitly

A width value alone does not preserve a centered rail.

When evidence shows a centered content rail:
- preserve both the rail width **and** its centering relationship to the viewport,
- root/page auto-layout alignment must explicitly center the rail or reproduce measured left/right margins,
- after generation verify left and right viewport margins are equal within tolerance.

Do not reconstruct `width:1200` and assume Figma will center it automatically.

---

## 16. Celebration surfaces may use bounded expressive color

Result/award states are allowed to carry more visual expression than ordinary functional cards.

For A2 or A4+A2 result screens:
- a hero may use product-semantic accent gradients, tinted layers, or soft ambient shapes,
- accent treatment must remain inside a bounded celebration region rather than recoloring the whole functional shell,
- use existing semantic/brand colors as endpoints; external raw colors are reference only,
- shadow may support a hero/honors object when it represents actual elevation or celebration emphasis,
- surrounding functional sections return to normal product surfaces.

Therefore `external color cannot be copied` does **not** mean `generated result screens must be colorless`.
