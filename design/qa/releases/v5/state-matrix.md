# v5 State Coverage Matrix

정본 QA: `qa-cases.yaml`  
Spec gaps: `qa-gap-audit.md`

## A-30

| From | Event | To / visible state | QA |
|---|---|---|---|
| 본선 진출 직후 | A-30 진입 | Red 본선 진행중 + 7/8 + 수정일시 표시 | A30-001, A30-009, A30-010 |
| 7/8 | 신규 section 완료 | 8/8 | A30-007, CROSS-002 |
| 작성중 | 이어 작성 | A-31 | A30-002 |
| SUBMITTED | A-30 진입 | Green 제출완료 + 수정일시 표시 | A30-003, A30-010 |
| SUBMITTED | 제출 후 수정 | Warning 재제출 필요, Green 제출완료 비노출, 수정일시 표시 | A30-004, A30-005, A30-010, CROSS-004 |
| 변경 미반영 | 재제출 성공 | Green 제출완료 | CROSS-005 |
| 본선 미진출 | A-30 진입 | Gray 본선 미진출 | A30-006 |

## A-31

| From | Event | To / visible state | QA |
|---|---|---|---|
| 1차 지원서 완료 | 최초 진입 | 7 inherited + 1 new / 7/8 | A31-001, A31-003 |
| 7/8 | 신규 section 완료 | 8/8 | A31-004 |
| content step | step 이동 | 1~8 section navigation | A31-005, A31-008 |
| content 8/8 | 9단계 진입 | A-32 package workflow | A31-008 |

## A-32

| From | Event | To | QA |
|---|---|---|---|
| 일부 미등록 | package 확인 | submit disabled | A32-011 |
| 4종 준비 | package 확인 | submit enabled | A32-012 |
| pre-submit | 저장 | data saved, not submitted | A32-013, A32-014 |
| ready | final submit | SUBMITTED | A32-015 |
| SUBMITTED | 재진입 | submitted/no changes | A32-016 |
| SUBMITTED | 마감 전 수정 | CHANGED_AFTER_SUBMIT | A32-018 |
| CHANGED_AFTER_SUBMIT | re-submit | SUBMITTED latest | A32-020 |
| any pre-deadline state | deadline | DEADLINE_PASSED/read-only | A32-021~024 |

## File validation

| Rule | QA |
|---|---|
| PDF only | A32-005, A32-006 |
| max 20MB | A32-007, A32-008 |

## Cross-screen

- A-30 → A-31 → A-32 continuity: CROSS-001
- A-31 8/8 → A-30 8/8: CROSS-002
- A-32 submit → A-30 submitted: CROSS-003
- A-32 changed → A-30 Warning only: CROSS-004
- A-32 re-submit → A-30/A-32 submitted latest: CROSS-005
