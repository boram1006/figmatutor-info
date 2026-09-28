# A-40 blind-v3 strict experiment

This variant tests Harness composition with a stricter contamination boundary than blind-v2.

Allowed evidence: V6 PRD, semantic screen manifest, reusable pattern guide, current DS catalog/snapshot/tokens, and original Figma evidence referenced by those sources.

Explicitly excluded: Stitch HTML, Stitch-derived notes, and existing A-40 v1/v2 specs/results/composition plans.

The PRD itself fixes the information order: result hero → total score card → AI/Human summary cards (2-column) → actions.

No new product sections are introduced. The test is whether Harness can turn that locked internal structure into a polished composition without external design inspiration.

Before plugin execution, run existing token validation and variant-scoped patch validation. After generation, freeze extract/screenshot of A-40_judging-result_blind-v3 before any Stitch comparison.