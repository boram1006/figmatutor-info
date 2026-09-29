# Kiro External Reference → Figma Workflow

> Purpose: generate a new Figma screen from user-selected external references (Stitch captures / HTML-CSS / optional Figma-copy code) while preserving product UX, Design System bindings and existing visual grammar.
>
> This workflow is the canonical Kiro path when the user says things such as:
> - "이 캡처의 히어로가 좋다"
> - "다른 화면의 카드 영역을 섞고 싶다"
> - "Stitch 코드 기준으로 다시 만들어라"
> - "이미지는 구조 참고, 스타일은 우리 Figma 기준으로"

## 0. Non-negotiable rules

- Figma MCP is not used.
- Figma mutation/extract/screenshot runs through the existing Design Flow Harness plugin JSON.
- Always start from latest `main`.
- Never guess nodeId / component / variant / token names.
- Once a real nodeId is known, mutation/extract uses nodeId rather than display name.
- External references are not product truth.
- Product features, policies, numbers, dates, rewards and actions must come from locked PRD / approved scope.
- Existing product Figma assets and `product-visual-grammar.md` are the visual truth.
- Plugin execution success is not completion. Extract + screenshot + visual inspection still follow.

---

## 1. Task folder

For a task such as `v6-judging-result`, store external evidence under:

```
design/operations/<task>/
  external/
    captures/
      capture-01.png
      capture-02.png
      ...
    code/
      source-01.html
      source-02.html
      ...
    figma-copy/
      source-01.txt
      ...
  external-source-map.md
  external-code-analysis.md
  composition-plan.json
  spec-create-*.json
  result.json
  snapshot-*.json
  screenshot-*.png
```

Only create folders for evidence that actually exists.

### What the user puts where

**captures/**
- the exact cropped/full screenshots the user selected
- one file per independently selectable source
- file naming is stable: `capture-01.png`, `capture-02.png`, ...

**code/**
- Stitch HTML/CSS corresponding to the selected source
- prefer the original HTML/CSS source over reconstructed code

**figma-copy/**
- optional appendix
- code copied after Stitch → Figma conversion
- do not require this by default

**external-source-map.md**
- this is where the user preference is made explicit:
  - which region uses which capture/code
  - what is good about it
  - what must NOT be copied
  - what content is unsupported/product-candidate

The source map is the human-readable selection contract.

---

## 2. Evidence precedence

Use external material in this order.

### A. Capture = selection anchor

The capture answers:

> "Which part did the user choose?"

Preserve:
- grouping
- section order
- relative emphasis
- density intent
- recognizable visual relationship between elements

Do not derive exact implementation values from pixels when code exists.

### B. HTML/CSS = primary external composition evidence

HTML/CSS answers:

> "How is the selected composition actually constructed?"

Extract:
- parent/child grouping
- flex/grid direction
- width/max-width
- column proportions
- justify/alignment relationships
- wrapping behavior
- nested padding/gap relationships
- which element is HUG-like vs stretch/fill
- section/card hierarchy

Do **not** copy as product truth:
- raw colors
- external font family
- arbitrary radius
- external shadow recipes
- navigation shell
- component styling
- unsupported literal content

### C. Existing Figma + product grammar = visual truth

Translate the composition through:
- `design/03-design-rules/generation/product-visual-grammar.md`
- `design/03-design-rules/generation/page-archetypes.md`
- current family Figma snapshots
- actual DS tokens/components

This layer decides:
- typography style
- spacing token
- radius token
- surface/background treatment
- border usage
- semantic colors
- component instance
- navigation context

### D. Figma-copy code = appendix evidence

Use only when:
- HTML/CSS + capture still leave exact nested geometry ambiguous
- the generated Figma result repeatedly diverges from the selected composition
- Stitch → Figma conversion exposes useful auto-layout/geometry relationships not recoverable from HTML/CSS

Figma-copy code is not automatically higher priority than product Figma.
It is geometry/composition evidence, not visual truth.

---

## 3. Region-level source selection

Never require one external screen to be the source for the whole page.

A page may be composed as:

```
hero              <- capture-01 + source-01.html
key-highlights    <- capture-02 + source-02.html
panel-review      <- capture-03 + source-02.html
follow-up         <- capture-04 + source-01.html
```

For each region record:

- `region`
- `selectedSource`
- `whySelected`
- `keep`
- `translate`
- `doNotCopy`
- `contentStatus`

Use `external-source-map.md` template.

---

## 4. Code analysis before generation

If HTML/CSS is available, Kiro must inspect it **before** writing a Figma create spec.

Write:

`design/operations/<task>/external-code-analysis.md`

For each selected region extract:

1. **navigation/context**
   - hub vs child/detail
   - immediate parent
   - back/breadcrumb behavior
   - whether sidebar remains valid at this depth

2. **rail geometry**
   - viewport width
   - content/max width
   - centering relationship
   - full-width vs split shell

3. **layout structure**
   - flex/grid direction
   - columns
   - relative widths
   - alignment
   - wrapping
   - same-row equal-height intent

4. **information hierarchy**
   - title/lead relationship
   - hero left/right hierarchy
   - card internal hierarchy
   - aggregate vs supporting content

5. **external-only style**
   - colors
   - gradients
   - shadows
   - radii
   - font values
   - decorative effects

For item 5, record the role/intention but translate through product grammar.

---

## 5. UX/navigation audit before shell reuse

Do not copy a predecessor shell mechanically.

Classify the new screen first:

- hub/list
- entity detail
- child result
- workflow step
- review workspace
- finalization

Example:

`My Page → 내 지원 현황 → selected application → 심사 결과`

The result page is a **child/detail**.
If persistent My Page sidebar actions would skip the selected-application depth, remove the sidebar and provide the immediate-parent return route.

Composition plan schema v3 must include:

```json
"navigationContext": {
  "depth": "child-detail",
  "immediateParent": "...",
  "returnPath": "...",
  "localNavigationDecision": "..."
}
```

---

## 6. Composition translation rules

External code controls composition intent; product grammar controls implementation styling.

### Layout wrapper
- transparent by default
- no border merely because it is a FRAME
- no white fill merely because it is a FRAME

### Semantic card
- explicit product surface
- use established product card outline when the entity needs a discrete boundary
- ordinary baseline: `background-primary + border-default`
- use product radius/spacing tokens with real Figma variable bindings

### Hero / celebration / notice
- can use intentional semantic tint/gradient/elevation
- expressive treatment is bounded to the semantic region
- use product/award semantic colors, never imported raw Stitch colors

### Text
- long copy is bounded and wraps vertically
- HUG microcopy may remain `WIDTH_AND_HEIGHT`
- text may not overflow its owning content box

### Centered rails
- preserve width **and centering relationship**
- a numeric width alone is not sufficient

### Horizontal peer cards
When same-level cards are placed side by side:
- row/grid may HUG the tallest card
- each peer card uses vertical FILL/STRETCH
- all peer card heights resolve equally
- internal copy can HUG
- use SPACE_BETWEEN/flexible structure when footers/tags must align

### Token binding
If an existing token matches a value, binding is mandatory.

Examples:
- padding 24 -> `space-24`
- gap 16 -> `space-16`
- radius 16 -> `radius-16`

A matching raw number without binding is not complete.

---

## 7. Product-content gate

External code often contains invented content.

Classify literal external content as:

- `LOCKED_CORE`
- `APPROVED`
- `CANDIDATE_PRODUCT`
- `UNSUPPORTED_DETAIL`
- `CONFLICT`
- `MOCK_FOR_VISUAL_EXPLORATION`

Do not silently promote:
- prize amounts
- dates/locations
- score formulas
- panel counts
- benefits
- download/share actions
- new routes

A useful external structure can still be used while its literal content is replaced with confirmed product content.

---

## 8. Composition plan

Create `composition-plan.json` from the template and validate it.

Required schema v3 decision blocks:
- `navigationContext`
- `alignmentEvidence`
- `surfacePolicy`
- region-level evidence

Then run:

```sh
npm run composition:validate -- --plan design/operations/<task>/composition-plan.json
```

Do not write the final create spec while the plan fails.

---

## 9. Figma spec generation

Reuse priority remains:

1. `INSTANCE_REUSE`
2. `CLONE_COMPOSE`
3. `NEW_CONSTRUCTION`

Additional external-code rules:

- external HTML element does not automatically become a Figma FRAME with white fill
- layout-only FRAME has no fill unless explicitly required
- width-only evidence must be preserved in the spec
- auto-layout alignment must be explicit when composition depends on it
- long text must use bounded width + height-growing wrap
- peer horizontal cards use equal-height FILL/STRETCH
- exact spacing/radius token bindings must be present
- hero gradient uses semantic token stops only

---

## 10. User/plugin round trip

Kiro produces the create spec.

User:
1. pulls latest main
2. opens Design Flow Harness plugin
3. pastes the create spec
4. runs it
5. saves/pushes result JSON

Kiro then:
1. reads result
2. resolves created node IDs
3. creates scoped extract spec
4. user runs extract
5. Kiro updates snapshot
6. creates screenshot spec
7. user runs screenshot
8. Kiro compares generated visual against:
   - selected capture composition
   - code-derived structure
   - product visual grammar
   - PRD/product scope

Do not compensate for a plugin-runtime bug by changing design rules.
If the whole layout collapses or spec properties appear ignored, inspect plugin create property support first.

---

## 11. Visual review checklist

Before calling the draft acceptable:

- navigation depth is correct
- immediate parent is reachable
- centered rail is actually centered
- wrapper frames are transparent
- semantic cards use product surface/border treatment
- hero expression is appropriate for the state
- no external raw visual styling leaked in
- text wraps and does not overflow
- peer horizontal cards have equal height
- padding/gap/radius use token bindings
- DS components are instances where available
- no unapproved external product content slipped in
- density is comparable to the selected external composition

If the result feels visibly looser than the selected source, inspect:
- parent/child grouping
- max/content width
- internal hierarchy
- relative emphasis
- stretch/fill behavior

Do not immediately add more borders or more cards.

---

## 12. When to request Figma-copy appendix

Request/export Figma-copy code only if at least one is true:

- HTML/CSS structure is ambiguous after inspection
- repeated generation preserves semantics but not geometry
- complex auto-layout nesting is difficult to infer
- exact converted proportions/alignment would materially reduce iteration

Do **not** request it merely because it exists.

If supplied, store under:

`external/figma-copy/source-XX.txt`

and add a section in `external-code-analysis.md`:

```
Appendix evidence:
- geometry learned:
- auto-layout learned:
- values intentionally ignored:
```

---

## 13. Reference implementation

A-40 experiment is the first proven reference for this workflow.

Relevant files:
- `design/operations/v6-judging-result/external-region-source-map-v3.md`
- `design/operations/v6-judging-result/STITCH-CODE-ANALYSIS-v4.md`
- `design/operations/v6-judging-result/composition-plan-code-informed-v4.json`
- `design/operations/v6-judging-result/spec-create-a40-code-informed-v4.json`

Lessons incorporated from that experiment:
- code evidence outperformed screenshot-only composition reconstruction
- shell continuity must not override navigation depth
- default Figma frame fill must not leak into layout wrappers
- product card outline treatment must be distinguished from layout containers
- width/alignment support in the plugin must match the JSON contract
- long-copy wrap and HUG microcopy require different handling
- semantic-token gradients are useful for bounded celebration regions
- matching token values require actual variable binding
- horizontal peer cards require equal-height behavior


## 14. Large-file write strategy

Kiro must not try to write a very large spec/analysis file in one generation when the file is long enough to risk truncation, timeout, or editor failure.

Use incremental construction:

1. create a valid skeleton first
2. append/patch one logical section at a time
3. keep each write small enough to complete reliably
4. after every major section, re-read the file tail/structure before continuing
5. after the final section:
   - parse JSON if JSON
   - run the relevant validator
   - confirm no duplicate/missing braces or truncated arrays
6. only then commit/push

Recommended order for a large Figma create spec:
- header + root screen + shared shell
- breadcrumb / project context
- hero/result block
- each major content section one by one
- follow-up/footer
- final JSON parse + token/layout validation

Do not reduce design fidelity merely to make the file shorter. Split the write operation, not the intended structure.

### State-variant generation

When creating another state of an existing screen (for example `AWARDED_RANK → NOT_AWARDED`):

- inherit the approved information architecture and locked product scope
- change only state-dependent content/visual treatment
- do not invent new follow-up policies, delivery channels, dates, rewards, benefits, actions, or routes
- if the baseline contains exploratory/mock content, either keep it explicitly mock or replace it with neutral wording; never upgrade it into factual product policy
- run spec preflight again even when the variant was derived from an already validated spec
