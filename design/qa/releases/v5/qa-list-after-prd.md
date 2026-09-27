# V5 QA List — Final

상세 QA 정본은 `qa-cases.yaml`이다. 서비스 기능/데이터/상태/validation QA만 포함하며 디자인 pixel/visual 검수는 제외한다.

## A-30

| ID | QA | P | 자동화 |
|---|---|---:|---|
| QA-V5-A30-001 | 최초 completion 7/8 | P1 | Yes |
| QA-V5-A30-002 | 작성중 카드 + 이어 작성 → workflow 진입 | P1 | Yes |
| QA-V5-A30-003 | 제출 후 수정 → 재제출 필요 상태/액션 | P1 | Yes |

## A-31

| ID | QA | P | 자동화 |
|---|---|---:|---|
| QA-V5-A31-001 | 기존 7개 section prefill + 수정 가능 | P1 | Yes |
| QA-V5-A31-002 | 7/8 → 신규 section 완료 후 8/8 | P1 | Partial |
| QA-V5-A31-003 | 8 content section → 9번째 package 단계 이동 | P1 | Yes |
| QA-V5-A31-004 | 서버 section completion 상태 반영 | P1 | Yes |

## A-32

| ID | QA | P | 자동화 |
|---|---|---:|---|
| QA-V5-A32-001 | package 4종 표시 | P1 | Yes |
| QA-V5-A32-002 | 미등록 항목 식별 + 제출 불가 | P1 | Yes |
| QA-V5-A32-003 | 저장 ≠ 최종 제출 | P1 | Yes |
| QA-V5-A32-004 | 최종 제출 성공 → 제출완료 | P1 | Yes |
| QA-V5-A32-005 | 제출 후 수정 → 변경사항 미반영/재제출 필요 | P1 | Yes |
| QA-V5-A32-006 | 재제출 → 최신 제출본 반영 | P1 | Yes |
| QA-V5-A32-007 | 기존 viewer modal로 최종 보고서 확인 | P1 | Yes |
| QA-V5-A32-008 | AI 발표자료 .pptx 생성 workflow | P2 | Partial |
| QA-V5-A32-009 | 발표자료 최종 등록 PDF only | P1 | Yes |
| QA-V5-A32-010 | repository link provider 제한 없음 | P2 | Yes |
| QA-V5-A32-011 | 제출 마감 후 단일 read-only 상태 | P1 | Partial |
| QA-V5-A32-012 | 제출완료·변경없음 상태 | P1 | Yes |

## Cross-screen

| ID | QA | P | 자동화 |
|---|---|---:|---|
| QA-V5-CROSS-001 | 7 inherited + 신규 section + package continuity | P1 | Partial |
| QA-V5-CROSS-002 | 제출 후 수정/재제출 A-30 ↔ A-32 sync | P1 | Yes |

## Current status

- 최신 V5 design coverage: PASS
- 신규 report viewer modal 생성 요구: 폐기, 기존 modal 재사용
- 마감 상태: submitted/not-submitted로 분리하지 않고 단일 read-only 상태
- 마감 후 저장/제출/재제출 액션 없음
- 마감 안내: `제출이 마감되었습니다.`
- 과거 DESIGN_MISSING/디자인 geometry 이슈는 본 QA 리스트에서 제거
