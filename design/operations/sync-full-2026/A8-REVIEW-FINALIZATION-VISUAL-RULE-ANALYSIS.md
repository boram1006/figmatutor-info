# A8 Review Finalization Visual Rule Analysis

Source: `snapshot-representative-archetypes-batch.json`
Canonical representative: `RV-01_first-review-finalize` nodeId `1:3666`
State variation evidence: same-name nodeId `1:3126`
Archetype: A8 / review finalization

## Representative selection
- `1:3666` is the completed/final-review state:
  - title: "1차 심사 최종 검토"
  - 40/40 ready
  - no missing-score warning
- `1:3126` is the same finalization composition with an incomplete/error state:
  - missing review items warning
  - 37/40 ready

Therefore:
- `1:3666` = canonical composition source
- `1:3126` = state-variation evidence

## Composition
- 1440 desktop
- header uses 120px side padding
- main workspace width ~1280, inset 80px from viewport
- inner content uses 24px padding and 32px major vertical spacing
- large review table is the dominant primary surface
- table container is white + border; outer rounding is larger (~24px)
- table header cells commonly use 16/24 padding
- data rows use compact 16/8 or 20/24 padding depending on column
- fixed bottom action bar spans full viewport width
- bottom actions use pill buttons, 12/20 padding

## State handling
The error/incomplete state is added as a secondary warning surface above the table, without changing the primary composition.

## A8-specific
- finalization = summary + editable/review table + persistent submit action
- fixed bottom action bar is archetype-specific
- error states should be layered into the same composition, not create a separate visual pattern
