# v5 State Coverage Matrix

Source:
- `design/02-structure/SERVICE_EVOLUTION.md §4`
- `design/operations/prd-v5/PRD.md`
- `design/04-screens/snapshot.json` 최신 V5 screen evidence

## A-30 내 지원 현황

| From | Event | To | Source | QA IDs |
|---|---|---|---|---|
| 본선 진출 직후 | v5 workflow 진입 | 작성중 + content 7/8 | CONFIRMED_PROJECT_RULE + SCREEN | QA-V5-A30-001, QA-V5-A31-003 |
| 작성중 | 신규 content section 완료 | 작성중 + content 8/8 | CONFIRMED_PROJECT_RULE | QA-V5-A31-004 |
| 작성중 | A-32 최종 제출 성공 | SUBMITTED | CONFIRMED_PROJECT_RULE | QA-V5-A32-004, QA-V5-A32-015 |
| SUBMITTED | 제출 후 항목 수정 | SUBMITTED + CHANGED_AFTER_SUBMIT | CONFIRMED_PROJECT_RULE + SCREEN | QA-V5-A30-004, QA-V5-A32-006 |
| SUBMITTED + CHANGED_AFTER_SUBMIT | 재제출 성공 | SUBMITTED | CONFIRMED_PROJECT_RULE | QA-V5-A30-005, QA-V5-A32-007 |

최신 snapshot 확인:
- A-30 progress text `7 / 8` 반영됨.
- `재제출 필요`는 `status-warning` 바인딩으로 반영됨.
- 단, progress track 120px 대비 fill이 30px로 남아 있어 7/8과 시각적으로 불일치 → **DESIGN_MISMATCH**.

## A-31 최종보고서 스텝 폼

| From | Event | To | Source | QA IDs |
|---|---|---|---|---|
| 1차 지원서 완료 | 본선 진출 후 최초 A-31 진입 | 기존 7 section prefilled + 신규 1 section incomplete | CONFIRMED_PROJECT_RULE | QA-V5-A31-001, QA-V5-A31-003 |
| inherited section | 기존 값 수정 | inherited section edited | CONFIRMED_PROJECT_RULE | QA-V5-A31-002 |
| content 7/8 | 서버가 신규 section 완료 상태 반환 | content 8/8 | CONFIRMED_PROJECT_RULE | QA-V5-A31-004, QA-V5-A31-008 |
| content 8/8 | package step 진입 | UI workflow step 9 | CONFIRMED_PROJECT_RULE + SCREEN | QA-V5-A31-006, QA-V5-A31-007 |

Section completion 판정식은 UI 책임이 아니다. 서버가 완료/미완료를 판정해 내려주고 UI는 그 상태를 렌더링한다.

## A-32 최종 심사 제출 패키지

| From | Event | To | Source | QA IDs |
|---|---|---|---|---|
| package incomplete | artifact 등록 | package readiness 갱신 | SCREEN | QA-V5-A32-002, QA-V5-A32-012 |
| package ready | Save | package ready 유지, submitted 아님 | CONFIRMED_PROJECT_RULE | QA-V5-A32-004, QA-V5-A32-005 |
| package ready | Final Submit 성공 | SUBMITTED | CONFIRMED_PROJECT_RULE + SCREEN | QA-V5-A32-015 |
| SUBMITTED | artifact/section 수정 | SUBMITTED + CHANGED_AFTER_SUBMIT | CONFIRMED_PROJECT_RULE + SCREEN | QA-V5-A32-006 |
| SUBMITTED + CHANGED_AFTER_SUBMIT | Re-submit 성공 | SUBMITTED | CONFIRMED_PROJECT_RULE | QA-V5-A32-007 |
| any pre-deadline state | deadline 도달 | DEADLINE_PASSED / 전체 read-only | CONFIRMED_PROJECT_RULE | QA-V5-A32-014 |

최신 snapshot 확인:
- `A-32_submission-package_SUBMITTED` 존재.
- `A-32_submission-package_SUBMITTED_CHANGED` 존재.
- `제출 완료됨 ✓`, `변경사항 다시 제출하기 →` 실제 반영됨.
- `A-32_submission-package_DEADLINE_PASSED`는 최신 snapshot에 없음 → **DESIGN_MISSING**.

## Remaining design gaps

제품 정책 open question은 없다. 남은 디자인 이슈는 3건이다.

1. A-30 progress bar geometry
   - text = 7/8
   - track = 120px
   - fill = 30px → 105px로 수정 필요
2. A-32 `DEADLINE_PASSED`
   - edit/save/submit/re-submit 전체 잠금
   - 전체 read-only
   - `제출 마감됨`
3. 최종 보고서 viewer modal
   - SECTION 1~8 통합 read-only
   - edit control 없음
   - close 후 A-32 context 유지
