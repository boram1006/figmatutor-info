# v5 Playwright Automation Backlog

Source: `design/qa/releases/v5/qa-cases.yaml`

서비스 기능/데이터/상태/validation QA의 자동화 후보만 관리한다. 디자인 pixel/visual 검수는 대상이 아니다.

## Tier 0 — smoke / core state

- QA-V5-A30-001 — 최초 completion 7/8
- QA-V5-A30-002 — 작성중 → 이어 작성 workflow
- QA-V5-A32-001 — package 4종 표시
- QA-V5-A32-003 — 저장 ≠ 최종 제출
- QA-V5-A32-004 — 최종 제출 성공
- QA-V5-A32-005 — 제출 후 수정 → 재제출 필요
- QA-V5-A32-006 — 재제출 → 최신 제출본
- QA-V5-CROSS-002 — A-30/A-32 상태 sync

## Fixture 준비 후

- QA-V5-A31-001 — 7개 승계 + 수정 가능
- QA-V5-A31-002 — completion 7/8 → 8/8
- QA-V5-A31-004 — 서버 completion 상태 반영
- QA-V5-A32-002 — 미등록 item + 제출 불가
- QA-V5-A32-009 — PDF only 업로드
- QA-V5-A32-012 — submitted unchanged
- QA-V5-CROSS-001 — 전체 workflow continuity

## 환경/contract 준비 후

- QA-V5-A32-007 — 기존 report viewer modal open/close/read-only
- QA-V5-A32-008 — AI .pptx 생성 workflow (async contract 필요)
- QA-V5-A32-011 — 제출 마감 후 read-only (backend time control 필요)

## stable selector contract

```text
a30-report-card-{applicationId}
a30-report-progress
a30-report-primary-state
a30-report-action-needed
a30-report-resubmit

a31-content-progress
a31-step-{n}
a31-section-{n}
a31-next
a31-back

a32-package-grid
a32-artifact-report
a32-artifact-deck
a32-artifact-demo
a32-artifact-repository
a32-save
a32-submit
a32-resubmit
a32-submit-state
a32-action-needed
a32-report-viewer
a32-report-viewer-close
```

## 실제 Playwright spec 생성 전 필요한 webapp contract

1. baseURL / actual route
2. auth/storageState
3. fixture/seed 방식
4. stable `data-testid`
5. deadline E2E용 backend time control
6. 발표자료 생성 비동기 완료/실패 contract

제품 정책 또는 Figma 디자인 누락은 현재 blocker가 아니다.
