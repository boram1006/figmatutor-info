# A1 Notice Evidence Mismatch

Date: 2026-09-29

## Intended representative
- Manifest key: `notice-list`
- Archetype: `A1`
- Manifest evidence: `sourceFrame: 1_Notice (Updated)@design`

## Extracted evidence
- Frame name: `1_Notice (Updated)`
- nodeId: `1:18039`
- Snapshot: `snapshot-a1-notice-list.json`

## Mismatch
The extracted frame is not a notice-list screen.

Observed content includes:
- application list / submission items
- review progress
- scores and review status
- AI summary
- application / AI service actions
- PDF/page review controls
- judging workspace content

This conflicts with the canonical A1 notice-list structure:
- page_title
- notice_list_or_table
- importance_badge
- pagination

## Harness implication
A manifest `sourceFrame` string must not be trusted only because the Figma node name matches.

Before a frame is accepted as a visual-rule representative, perform an evidence sanity gate:
1. exact node identity resolution
2. archetype/structure match against `screen-manifests.json`
3. only then extract visual composition rules

If structure conflicts, mark the sourceFrame as stale/misbound and do not learn visual rules from it.

## Status
- A1 notice-list visual analysis: NOT COMPLETED
- `1:18039`: excluded from A1 rule extraction
- Do not automatically rewrite manifest evidence until the true notice-list frame is identified.
