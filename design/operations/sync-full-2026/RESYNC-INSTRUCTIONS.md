# Figma 최신 상태 재동기화 (2026-09-26)

## 상황
Figma에서 v5 외에도 여러 프레임 이름·화면을 정리했음. repo의 스냅샷과 7종 PDF는
정리 이전 상태라 현재 Figma와 어긋남. 화면 생성/coverage 판단 전에 현재 Figma 전체를
다시 추출해 repo를 최신으로 맞춘다.

## 실행 순서

### 1) design 페이지 전체 추출
Figma Desktop Plugin에서 아래 spec을 실행:

- `design/operations/sync-full-2026/spec-extract-full.json`
  - `frameIds` 미지정 → design 페이지의 모든 최상위 프레임/섹션 추출
  - 결과가 크면 batch1~4로 나눠 실행 (같은 폴더에 있음)

### 2) 결과 저장
플러그인 결과 JSON을 아래로 저장:

- 한 번에 뽑은 경우: `design/operations/sync-full-2026/snapshot-full.json`
- 배치로 뽑은 경우: `snapshot-batch1.json` ~ `snapshot-batch4.json`
  (이 경우 하나로 합쳐 `snapshot-full.json`로 만들어야 함 → 저장 후 알려주면 Kiro가 합침)

### 3) 정식 스냅샷 경로로 저장
```
npm run save-snapshot -- --stage screens --from design/operations/sync-full-2026/snapshot-full.json
```

### 4) 판정
```
npm run check -- --phase screens
npm run audit
```

## 주의
- Design System 페이지(컴포넌트)는 이미 components-02에서 재추출 완료(Button disabled = dark-text-slate 확인됨).
  이번 재동기화는 `design` 페이지(실제 화면)가 대상.
- 이름 바꾼 프레임은 추출 결과의 name 필드에 그대로 반영됨.
  이후 screens.json / coverage 갱신 시 이 최신 name을 기준으로 함.


## Failure log — 2026-09-29

### TB-01 exact-name extract
- Spec: `spec-extract-tb01-by-name.json`
- Failure: `오류: 요청한 frameName 없음`
- Meaning: the canonical manifest name `TB-01_team-list__recruiting_H2` did not exactly match any visible top-level FRAME/COMPONENT/COMPONENT_SET/INSTANCE/SECTION on page `design`.
- Harness fix: plugin extract now includes TB/team top-level candidate names, node ids, and node types when exact frame-name lookup fails. This prevents repeating blind name guesses.
- Do not guess/rename the target until candidate evidence is returned by the plugin.


### TB-01 exact-name extract — second failure
- Failure: `TB/team top-level candidates=[]`.
- Interpretation: the canonical TB-01 name is not a visible top-level eligible node; likely nested under another frame/section, or the exact name differs deeper in the page tree.
- Harness fix: exact `frameNames` now search the whole `design` page descendant tree (FRAME/COMPONENT/COMPONENT_SET/INSTANCE/SECTION only), while duplicate names still fail closed.
- Failure hints now report TB/team candidates from the whole page with node id, type, and parent name.


### Representative batch extract — duplicate frame-name failure
- Failure: batch extract used `frameNames`, and `RV-01_first-review-finalize` existed at two distinct node IDs (`1:3126`, `1:3666`).
- User renamed a Figma frame to resolve the duplicate, which triggered many secondary errors because manifests/specs/other references still depended on existing names.
- Root cause: the harness treated a mutable display name as an execution identifier after node IDs were already known.
- Harness fix:
  - extract now supports descendant `frameIds` directly, not only top-level IDs.
  - reference extractor is kept in parity.
  - representative batch spec now uses exact node IDs.
- Permanent rule:
  1. frame/node names are discovery and human-readable evidence only.
  2. once a node ID is resolved, all subsequent extract/update/duplicate/mutation specs MUST prefer exact node ID.
  3. duplicate names MUST fail closed; do not ask the user to rename Figma nodes just to satisfy the harness.
  4. if two same-name candidates are both plausible, extract both by ID and apply a structure/archetype sanity gate before choosing one.
  5. renaming canonical Figma nodes is a product/design change and must never be used as a harness workaround.


### Text containment false-positive — HUG text
- Failure: create-time containment guard reported many false positives after A-40 v4.
- Examples included Breadcrumb microcopy, Honors labels, Highlight top labels/icons, and Reviewer header labels.
- Root cause:
  - guard treated all TEXT as if it must wrap inside parent content width.
  - intentional HUG / `WIDTH_AND_HEIGHT` text in horizontal auto-layout was incorrectly considered overflow.
  - some FILL child frames had not yet resolved to a meaningful width, producing temporary 1px/100px parent widths.
- Harness fix:
  1. containment guard now checks only bounded text (`HEIGHT/NONE/TRUNCATE` or horizontal FILL).
  2. HUG / `WIDTH_AND_HEIGHT` microcopy is excluded from wrap containment.
  3. unresolved tiny HUG/auto parents are not used as containment boundaries.
  4. important rails/grids/cards should still receive explicit width evidence when geometry matters.
- Permanent rule:
  - **Long copy wraps; microcopy may HUG.**
  - Do not solve text overflow by globally forcing every TEXT node to bounded wrap.
  - A rail/card that must be centered or split into columns should have explicit width/geometry evidence rather than relying on transient Figma auto-layout defaults.


### Create layout collapse — width-only and alignment ignored
- Failure: A-40 code-informed v4 rendered as a narrow vertical column despite a 1200px centered detail rail in the spec.
- Root causes in plugin create:
  1. generic node resize ran only when **both** width and height were provided. FRAME nodes with width-only evidence silently stayed at Figma's default ~100px width.
  2. `primaryAxisAlignItems` / `counterAxisAlignItems` / `layoutWrap` from the spec were parsed but not applied to created auto-layout nodes.
- Symptoms:
  - 1200px detail rail collapsed to ~100px
  - card grids became vertical/narrow
  - text wrapped one or two characters per line
  - root/content centering declared in JSON had no visual effect
- Harness fix:
  - width-only and height-only resizing now apply to FRAME/TEXT/other resizable nodes
  - auto-layout alignment properties and layoutWrap are applied during create
- Permanent rule:
  - generation contracts are not valid merely because JSON contains geometry/alignment fields; plugin create must have parity with the extract/layout schema.
  - when a generated layout collapses globally, inspect create-runtime property application before compensating by changing design rules or adding arbitrary widths.


### Peer-card height mismatch
- Observation: horizontally adjacent same-level cards can end up with different heights when every card is generated with vertical HUG.
- Permanent rule:
  - row/grid may HUG tallest content
  - same-row peer cards use vertical FILL/STRETCH so heights resolve equally
  - internal content can HUG; use SPACE_BETWEEN/flexible content layout when bottom metadata or tags should align
  - intentional masonry/asymmetry requires explicit composition evidence
