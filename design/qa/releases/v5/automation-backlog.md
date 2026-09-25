# v5 Playwright Automation Backlog

Source: `design/qa/releases/v5/qa-cases.yaml`

과거 QA ver.1~3에서 실제로 실패했던 **boundary state / cross-screen synchronization**을 우선 회귀 영역으로 본다.
단, 과거 QA는 요구사항 source가 아니라 regression-risk evidence다.

## Tier 0 — 먼저 자동화할 smoke

| QA ID | 시나리오 | 필요한 fixture | 권장 selector |
|---|---|---|---|
| QA-V5-A30-001 | 본선 진입 카드 progress 7/8 | finalist + inherited 7 complete + new section incomplete | `a30-report-progress` |
| QA-V5-A31-003 | A-31 최초 content progress 7/8 | same | `a31-content-progress` |
| QA-V5-A31-006 | 8 content section + package step 9 | finalist | `a31-step-nav`, `a31-package-step` |
| QA-V5-A32-001 | package 4종 표시 | report workflow available | `a32-package-grid` + item ids |
| QA-V5-A32-004 | Save와 Final Submit 분리 | ready-to-submit package | `a32-save`, `a32-submit` |
| QA-V5-A32-006 | 제출 후 수정 → submitted+changed | submitted package + post-submit edit | `a32-submit-state`, `a32-resubmit` |
| QA-V5-A32-007 | 재제출 성공 | submitted+changed | `a32-resubmit` |
| QA-V5-CROSS-002 | A-30/A-32 상태 동기화 | submitted+changed | status testids on both screens |

## Tier 1 — fixture 준비 후

| QA ID | 시나리오 | blocker |
|---|---|---|
| QA-V5-A31-001 | 7개 section prefill | section/field mapping 필요 |
| QA-V5-A31-002 | inherited data 수정/저장 | mapping + save API fixture |
| QA-V5-A31-004 | 7/8→8/8 | completion rule 필요 |
| QA-V5-A32-002 | incomplete/complete readiness | artifact fixture 필요 |
| QA-V5-A32-005 | save/navigation ≠ submit | workflow fixture |
| QA-V5-A32-008 | report 확인 UI | exact web presentation 확인 |
| QA-V5-A32-009 | AI deck generation 시작 | async API contract 필요 |
| QA-V5-A32-012 | item readiness | artifact fixtures |
| QA-V5-A32-015 | submitted unchanged | submitted fixture |
| QA-V5-A32-016 | re-submit 후 상태 동기화 | cross-screen fixture |

## Blocked by product decision

자동화 코드를 만들지 않는다.

- QA-V5-A31-008 — required/optional rule
- QA-V5-A31-009 — application→final report mapping
- QA-V5-A32-010 — PPTX/PDF policy
- QA-V5-A32-011 — GitLab/GitHub provider policy
- QA-V5-A32-014 — canonical deadline
- QA-V5-A30-007 — 상대시간 원본 요구사항 provenance

## Selector contract 제안

제품 웹 코드에 아래처럼 안정적인 `data-testid`를 두는 것을 권장한다.

```
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
```

## Playwright execution contract가 아직 필요한 것

실제 spec 생성 전 확인:
1. test server baseURL
2. login/auth 방식과 storageState 가능 여부
3. test fixture를 만드는 API/DB/seed 방식
4. `data-testid` 적용 가능 여부
5. backend deadline/time을 test에서 제어할 수 있는지

이 다섯 가지가 준비되면 Tier 0부터 실제 `tests/e2e/v5/*.spec.ts`로 전환한다.
