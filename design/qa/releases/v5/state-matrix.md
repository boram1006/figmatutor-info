# v5 State Coverage Matrix

정본 QA: `design/qa/releases/v5/qa-cases.yaml`

이 문서는 서비스의 기능/데이터/상태 전이만 정리한다. 디자인 생성 규칙과 pixel/visual 검수는 QA 범위에서 제외한다.

## A-30 내 지원 현황

| From | Event | To | QA IDs |
|---|---|---|---|
| 본선 진출 직후 | v5 workflow 진입 | 작성중 + content 7/8 | QA-V5-A30-001 |
| 작성중 | 이어 작성 | A-31 workflow | QA-V5-A30-002 |
| SUBMITTED | 제출 후 항목 수정 | SUBMITTED + CHANGED_AFTER_SUBMIT | QA-V5-A30-003 |
| SUBMITTED + CHANGED_AFTER_SUBMIT | 재제출 성공 | SUBMITTED | QA-V5-A30-003, QA-V5-CROSS-002 |

## A-31 최종보고서 스텝 폼

| From | Event | To | QA IDs |
|---|---|---|---|
| 1차 지원서 완료 | 최초 A-31 진입 | 기존 7 section prefilled + 신규 1 section incomplete | QA-V5-A31-001, QA-V5-A31-002 |
| content 7/8 | 신규 section 완료 | content 8/8 | QA-V5-A31-002, QA-V5-A31-004 |
| content 8/8 | package step 진입 | UI workflow step 9 | QA-V5-A31-003 |

Section completion 판정은 서버 책임이며 UI는 서버 상태를 반영한다.

## A-32 최종 심사 제출 패키지

| From | Event | To | QA IDs |
|---|---|---|---|
| package incomplete | artifact 등록 | readiness 갱신 | QA-V5-A32-002 |
| package ready | 저장 | package ready 유지, submitted 아님 | QA-V5-A32-003 |
| package ready | 최종 제출 성공 | SUBMITTED | QA-V5-A32-004 |
| SUBMITTED | 마감 전 항목 수정 | SUBMITTED + CHANGED_AFTER_SUBMIT | QA-V5-A32-005 |
| SUBMITTED + CHANGED_AFTER_SUBMIT | 재제출 성공 | SUBMITTED | QA-V5-A32-006 |
| any pre-deadline state | 제출 마감 | DEADLINE_PASSED / read-only | QA-V5-A32-011 |

마감 후에는 이전의 submitted/not-submitted 여부로 별도 UI 상태를 나누지 않는다. 현재 최종 제출 내용을 read-only로 보여주며 저장/제출/재제출 액션은 제공하지 않고 `제출이 마감되었습니다.`를 표시한다.

최종 보고서 확인은 신규 viewer frame을 요구하지 않고 기존 viewer modal을 재사용한다. 동작 검증은 QA-V5-A32-007에서 수행한다.

## Cross-screen

- A-30 → A-31 → A-32에서 7개 승계 데이터 + 신규 1개 section + 9번째 package finalization 흐름을 유지한다. (`QA-V5-CROSS-001`)
- 제출 후 수정/재제출 상태는 A-30과 A-32에서 모순 없이 동기화한다. (`QA-V5-CROSS-002`)

## Coverage status

최신 V5 scoped snapshot 기준 design coverage는 PASS 상태다. 과거 `DESIGN_MISSING`, progress geometry, 신규 viewer modal 요구는 현재 QA gap으로 취급하지 않는다.
