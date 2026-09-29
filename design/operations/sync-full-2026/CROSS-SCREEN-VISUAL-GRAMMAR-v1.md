# Cross-Screen Visual Grammar v1

Evidence screens:
- A1: N-01_notice-list / 1:11206
- A2: H-02_first-round-result_H2 / 1:22713
- A3: TB-01_team-list__recruiting_H2 / 1:21543
- A4: A-30 evidence
- A5: A-31 evidence
- A6: J-01_ai-review-dashboard / 1:14166
- A7: RV-02_final-review-unfolded / 1:6567
- A8: RV-01_first-review-finalize / 1:3666
- A9: A-32 evidence

## Stable cross-screen rules

### 1. Surface hierarchy
The strongest common rule is not "use cards everywhere".
It is:
1. page / workspace background
2. primary white or raised surface
3. nested subtle surface where secondary grouping is needed

### 2. Desktop rail
For standard 1440 content pages, 120px side margins / 1200px content rail recur frequently.
Exceptions exist for workspace archetypes (A7/A8) where task density requires wider layouts.

### 3. Radius hierarchy
Common hierarchy:
- primary card/surface: 16px
- internal block / CTA: 12px
- compact control: 8px
- status/chip/pill: 8px or full radius
- special large operational table containers may use ~24px

### 4. Padding hierarchy
Common scales:
- primary cards: 24px
- internal blocks: 12–20px
- compact tags: 4px 8px
- section gaps: 20–24px
- larger semantic section separation: 32–48px+

### 5. Typography hierarchy
- campaign/hero titles may scale to 40–54px
- standard page title typically 22–24px
- card/subsection headings commonly 18–20px
- body 14–16px
- compact metadata/status 11–12px

### 6. Archetype composition must stay separate
Do not force one layout onto every screen:
- A1: hero + flat list/table
- A2: expressive hero + result cards + promotional/supporting section
- A3: browse hero + summary + grid cards
- A4: sidebar + body/status
- A5: editing surface
- A6: KPI summary + operational controls + table
- A7: split review workspace
- A8: finalization table + fixed bottom action bar
- A9: package/submission block composition

## Stitch adaptation rule
Stitch HTML/CSS is a composition source, not the design-system truth.

When adapting Stitch:
1. preserve useful information architecture and grouping intent
2. remap visual surfaces to existing Figma grammar
3. choose the composition pattern based on target archetype
4. use existing asset-derived spacing/radius/type hierarchy
5. never copy Stitch spacing/type/grouping as the Harness default merely because Stitch produced it

## Harness implication
The harness should distinguish:
- global visual grammar
- archetype composition grammar
- state variations
- component/token evidence

This prevents overfitting to any one screen such as A-30.
