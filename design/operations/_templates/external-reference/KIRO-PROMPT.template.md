# Kiro Prompt — External Reference → Figma

Use latest `main` and continue this task with the Design Flow Harness.

## Mandatory constraints

- Do not use Figma MCP.
- Figma work must use the existing Design Flow Harness plugin JSON.
- Never guess nodeId/component/variant/token names.
- Once an exact nodeId is known, prefer nodeId over names.
- Read and follow:
  - `docs/kiro-external-reference-to-figma-workflow.md`
  - `docs/new-screen-workflow.md`
  - `design/03-design-rules/generation/product-visual-grammar.md`
  - `design/03-design-rules/generation/page-archetypes.md`
- Product truth comes from the locked PRD / approved product scope.
- Existing Figma/product grammar is visual truth.
- External captures and code are composition evidence, not visual truth.

## Inputs

Task folder:
`design/operations/<task-id>/`

Read:
- `external-source-map.md`
- files under `external/captures/`
- files under `external/code/`
- optional `external/figma-copy/`
- relevant PRD
- current Figma snapshots / pattern registry / DS tokens/components

## Required process

1. Inspect the region-level selections in `external-source-map.md`.
2. If HTML/CSS exists, analyze it before generating Figma.
3. Write/update `external-code-analysis.md`.
4. Resolve navigation depth before reusing any predecessor shell.
5. Separate:
   - composition to preserve from external code
   - product visual styling to translate
   - unsupported literal content to exclude/mock
6. Create/update schemaVersion 3 `composition-plan.json`.
7. Run:
   `npm run composition:validate -- --plan design/operations/<task-id>/composition-plan.json`
8. Do not proceed if validation fails.
9. Generate Figma spec using reuse priority:
   - INSTANCE_REUSE
   - CLONE_COMPOSE
   - NEW_CONSTRUCTION
10. Apply these invariants:
   - layout wrappers transparent
   - semantic cards use product surface/outline treatment
   - spacing/radius values use actual variable bindings
   - long copy wraps inside bounded content width
   - HUG microcopy may remain HUG
   - centered rails preserve actual centering
   - horizontal peer cards resolve to equal height
   - award/result heroes may use bounded semantic-token gradients
11. User executes the plugin spec.
12. After result is pushed:
   - resolve created node IDs
   - scoped extract
   - snapshot update
   - screenshot
   - visual comparison against source map + code analysis + product grammar
13. Plugin success alone is not completion.

## External-code appendix rule

Prefer HTML/CSS as external composition evidence.

Use Stitch→Figma copied code only as an appendix when HTML/CSS + captures are insufficient to reproduce geometry/auto-layout relationships. Never let Figma-copy styling override product Figma/DS rules.

## Output discipline

Keep work in small commits and report:
- files changed
- commit SHA
- what is ready for the user to run
- exact next plugin spec path

If a runtime/plugin limitation is discovered, fix the harness/runtime first. Do not compensate by inventing new design rules.
