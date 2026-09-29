# A1 Notice List Visual Rule Analysis

Source: `snapshot-a1-notice-list-canonical.json`
Frame: `N-01_notice-list`
nodeId: `1:11206`
Archetype: A1 / 정보형

## 공통 rule
- page background: `background-subtle-2`
- header: white surface + border, 1440 width
- main content rail: 1200px / side margins 120px
- hero/title section: white surface separated from page body
- hierarchy: category pill -> large page title -> lead copy -> main content
- small pills use 8/12 or 4/8-ish spacing and full radius
- primary content is grouped by clear surface/border hierarchy rather than free-floating cards
- repeated use of 8/12/16/20/24/48 spacing scales

## A1-specific
- centered hero section with 80px top padding
- title: 54/60/600
- lead: 20/28/400
- notice list width: ~996px centered inside the 1200px rail
- table/list header uses compact 14/20 medium text
- rows are flat list rows rather than 16px-radius cards
- row columns: number / title / date
- row title: 18/28 medium
- date: 14/20 regular
- importance is expressed inline with a small status label rather than wrapping the whole row in a colored card
- pagination buttons: 32x32, radius 8

## Comparison
Common visual grammar with A3/A4/A5/A9:
- 1200px desktop rail
- white major surfaces on subtle page background
- nested hierarchy instead of arbitrary background color blocks
- compact status/tag treatment
- consistent semantic spacing scale

A1-specific composition:
- hero + centered flat list/table + pagination
- less card-heavy than A3/A4
- list rhythm and column alignment are more important than card grouping

## Harness implication
Do not generalize 'everything is a card'. The common rule is surface hierarchy, while A1 expresses the main content as a flat structured list within the common rail.
