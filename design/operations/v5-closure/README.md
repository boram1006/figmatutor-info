# V5 Closure Work Package

V5 결과물을 아래 4개 묶음으로 정리한다.

## 1. PRD — 추가 확인 + 보완

- 정본: `../prd-v5/PRD.md`
- audit: `../prd-v5/PRD_AUDIT.md`
- 추가 확인: `prd-confirmation-needed.md`

확정 반영:
- 7 inherited + 1 new content section
- initial completion 7/8
- inherited sections editable
- package = 별도 step 9
- submitted + changed = primary SUBMITTED + secondary action-needed
- [최종 보고서 확인] = SECTION 1~8 read-only viewer modal

## 2. Design — 추가 화면/상태 + Figma JSON

- gap audit: `design-gap-audit.md`
- READY:
  - `spec-duplicate-a30-submitted-changed.json`
  - `spec-duplicate-a32-post-submit.json`
- BLOCKED:
  - A-30 progress 1/8 → 7/8: progress child exact nodeId/nodeName 확인 전 JSON 생성 금지
  - `candidate-report-viewer-modal.json`: Q1 mapping/content ordering 확인 후 NEW_CONSTRUCTION

원칙:
`INSTANCE_REUSE → CLONE_COMPOSE → NEW_CONSTRUCTION`

JSON에는 snapshot에서 확인된 실제 `nodeId/nodeName`만 사용한다. 추측 selector는 만들지 않는다.

## 3. QA — PRD 보완 후 V5 리스트

- 정본: `../../qa/releases/v5/qa-cases.yaml`
- 실행표: `../../qa/releases/v5/qa-list-after-prd.md`
- 상태 전이: `../../qa/releases/v5/state-matrix.md`
- open question: `../../qa/releases/v5/open-questions.md`
- 수동 실행표: `../../qa/releases/v5/manual-checklist.md`

## 4. Playwright — 자동화 범위 + 실행 방법

- backlog: `../../qa/releases/v5/automation-backlog.md`
- 실행 정의: `../../qa/releases/v5/playwright-execution.md`

현재 이 repo에는 webapp source/route/auth/fixture/data-testid contract가 없으므로 실제 spec 파일은 임의 생성하지 않는다.
webapp contract가 확보되면 Tier 0부터 `tests/e2e/v5/*.spec.ts`로 구현한다.

## Figma 실행 순서

1. 최신 Design Flow Harness plugin 사용
2. `spec-duplicate-a30-submitted-changed.json` 실행
3. `spec-duplicate-a32-post-submit.json` 실행
4. result JSON 저장
5. 새 frame IDs로 screenshot
6. v5 section extract
7. coverage audit 재실행
8. A-30 progress child exact node 확인 후 patch JSON 추가

주의:
- duplicate patch는 `sourceNodeId` exact selector를 사용
- 동일 이름 node가 많은 A-32는 nodeName-only patch 금지
- plugin commit: `f7d23f2a701be6fcfcc8ef1629082489dc02c223`
