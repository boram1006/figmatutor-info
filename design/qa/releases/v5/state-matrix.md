# v5 State Coverage Matrix

Source:
- `design/02-structure/SERVICE_EVOLUTION.md §4`
- `design/03-design-rules/generation/state-and-interaction.md`
- Figma v5 A-30 / A-31 / A-32 screen evidence

## A-30 내 지원 현황

| From | Event | To | Source | QA IDs |
|---|---|---|---|---|
| 본선 진출 직후 | v5 workflow 진입 | 작성중 + content 7/8 | SERVICE_EVOLUTION §4 | QA-V5-A30-001, QA-V5-A31-003 |
| 작성중 | 신규 content section 완료 | 작성중 + content 8/8 | SERVICE_EVOLUTION §4 | QA-V5-A31-004 |
| 작성중 | A-32 최종 제출 성공 | SUBMITTED | State rules S4 | QA-V5-A32-004, QA-V5-A32-015 |
| SUBMITTED | 제출 후 항목 수정 | SUBMITTED + CHANGED_AFTER_SUBMIT | State rules S1,S5 | QA-V5-A30-004, QA-V5-A32-006 |
| SUBMITTED + CHANGED_AFTER_SUBMIT | 재제출 성공 | SUBMITTED | State rules S5 | QA-V5-A30-005, QA-V5-A32-007 |
| SUBMITTED + CHANGED_AFTER_SUBMIT | A-30/A-32 재조회 | 동일 상태가 화면 간 일치 | State rules S1,S5 | QA-V5-A32-016, QA-V5-CROSS-002 |

## A-31 최종보고서 스텝 폼

| From | Event | To | Source | QA IDs |
|---|---|---|---|---|
| 1차 지원서 완료 | 본선 진출 후 최초 A-31 진입 | 기존 7 section prefilled + 신규 1 section incomplete | SERVICE_EVOLUTION §4 | QA-V5-A31-001, QA-V5-A31-003 |
| inherited section | 기존 값 수정 | inherited section edited | SERVICE_EVOLUTION §4 | QA-V5-A31-002 |
| content 7/8 | 신규 section 완료 | content 8/8 | SERVICE_EVOLUTION §4 | QA-V5-A31-004 |
| content 8/8 | package step 진입 | UI workflow step 9 | SERVICE_EVOLUTION §4 + screen | QA-V5-A31-006, QA-V5-A31-007 |

> Section completion 판정식은 아직 확정하지 않는다. 필수/선택 field rule이 없으므로 transition의 trigger 구현은 OPEN_QUESTION이다.

## A-32 최종 심사 제출 패키지

| From | Event | To | Source | QA IDs |
|---|---|---|---|---|
| package incomplete | artifact 등록 | package readiness 갱신 | Figma v5 | QA-V5-A32-002, QA-V5-A32-012 |
| package ready | Save | package ready 유지, submitted 아님 | State rules S4 | QA-V5-A32-004, QA-V5-A32-005 |
| package ready | Final Submit 성공 | SUBMITTED | State rules S4 | QA-V5-A32-015 |
| SUBMITTED | artifact/section 수정 | SUBMITTED + CHANGED_AFTER_SUBMIT | State rules S5 | QA-V5-A32-006 |
| SUBMITTED + CHANGED_AFTER_SUBMIT | Re-submit 성공 | SUBMITTED | State rules S5 | QA-V5-A32-007 |
| any pre-deadline state | deadline 도달 | 미확정 | PRD_AUDIT §8 | QA-V5-A32-014 |

## Coverage gaps

아래 transition은 source가 부족해 아직 확정하지 않는다.

- section별 완료 판정 조건
- deadline 도달 시 정확한 edit/save/submit 잠금 범위
- AI PPTX 생성 완료 후 발표자료 package item으로 들어가는 transition
- repository URL validation 성공/실패 transition
- resume 시 "마지막 작성 section" 자동 진입 여부
