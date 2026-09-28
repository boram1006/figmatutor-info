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

## 4. Surface and outline grammar is mandatory for information grouping

The product does **not** rely on whitespace alone to group functional information.

### Page background

Current functional participant screens commonly use:
- page/background = `background-subtle-2`

### Outer functional group

Repeated evidence:
- white/`text-inverse` surface
- thin neutral outline: commonly `border-disabled` or the current family-equivalent neutral border
- radius **16**
- padding **24** for entity/status cards
- padding **32** for larger form/workspace containers

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

If not, the layout is missing a surface, outline, divider, or spacing boundary.

**Forbidden default:** many white child blocks floating on a light page background with no parent grouping.

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

