# A-40 blind-v2 expected structure

Blind condition: Stitch is excluded from generation reasoning and must only be opened after plugin generation + extract/screenshot.

Expected visual hierarchy:

1. Participant context — My Page / 내 지원 현황 lineage is visible before the result itself.
2. Result hero — left: rank/result/team context, right: compact total-score panel.
3. Review evidence — AI and human review are equal-weight sibling cards, each showing source label, summary, and score.
4. Actions — final submission viewer is secondary; detailed judging result is primary.

What should look better than v1:
- A-40 reads as a participant workflow screen, not a generic campaign landing.
- Hero and score are composed as one result module rather than stacked independent blocks.
- Evaluation evidence has a heading and clearer two-source grouping.
- Bottom actions have deliberate primary/secondary hierarchy.
- No extra ceremony/schedule/judge-count/weighting facts are introduced.

Validation before plugin execution:
- keep v1 untouched;
- run token/spec validation;
- verify Button and Tag variants with variant-scoped patch validation;
- if any token or patch name fails, stop and fix before plugin execution.

After plugin execution:
- extract only blind-v2 frame;
- capture screenshot;
- inspect hierarchy, balance, truncation, and instance integrity;
- only then open Stitch artifacts for comparison.
