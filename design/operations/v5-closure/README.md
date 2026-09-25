# V5 Closure Work Package

비교 작업은 종료됐다. 이 폴더가 canonical closure package다.

## PRD
- 정본: `../prd-v5/PRD.md`
- audit: `../prd-v5/PRD_AUDIT.md`
- 제품 정책상 blocking open question 없음
- 남은 non-blocking: 화면 slug 최종 승인

## Design
- `design-gap-audit.md`
- `spec-duplicate-a30-submitted-changed.json`
- `spec-duplicate-a32-post-submit.json`
- `candidate-report-viewer-modal.json`

원칙: `INSTANCE_REUSE → CLONE_COMPOSE → NEW_CONSTRUCTION`
실제 snapshot에서 확인하지 않은 nodeId/nodeName은 추측하지 않는다.

## QA
- `../../qa/releases/v5/qa-cases.yaml`
- `../../qa/releases/v5/qa-list-after-prd.md`
- `../../qa/releases/v5/state-matrix.md`
- `../../qa/releases/v5/open-questions.md`
- `../../qa/releases/v5/manual-checklist.md`

## Playwright
- `../../qa/releases/v5/automation-backlog.md`
- `../../qa/releases/v5/playwright-execution.md`

실제 spec 생성에는 webapp의 route/auth/fixture/stable selector contract가 필요하다.

## 아직 Figma에 반영할 것
1. A-30 progress 1/8 → 7/8
2. A-30 submitted+changed Warning semantic
3. A-32 submitted unchanged
4. A-32 submitted+changed
5. A-32 deadline-passed 전체 read-only
6. final report read-only viewer modal
