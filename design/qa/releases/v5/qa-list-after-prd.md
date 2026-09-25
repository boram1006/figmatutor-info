# V5 QA List — Final PRD Reconciled

상세 source trace의 정본은 `qa-cases.yaml`이다.

## A-30

| ID | QA | P | 자동화 | 상태 |
|---|---|---:|---|---|
| QA-V5-A30-001 | 최초 completion 7/8 | P1 | Yes | READY |
| QA-V5-A30-002 | 작성중 카드 + 이어 작성 | P1 | Yes | READY |
| QA-V5-A30-003 | 이어 작성 → workflow 진입 | P1 | Yes | READY |
| QA-V5-A30-004 | 제출완료 유지 + Warning 재제출 필요 | P1 | Yes | READY_AFTER_DESIGN |
| QA-V5-A30-005 | 수정사항 제출 CTA | P1 | Yes | READY_AFTER_DESIGN |
| QA-V5-A30-006 | 상태/metadata/CTA 위계 | P2 | No | HUMAN |
| QA-V5-A30-007 | 시간 표기 | P3 | No | COMMON_RULE |

## A-31

| ID | QA | P | 자동화 | 상태 |
|---|---|---:|---|---|
| QA-V5-A31-001 | 기존 7개 section prefill | P1 | Yes | READY_WITH_FIXTURE |
| QA-V5-A31-002 | inherited 7개 수정 가능 | P1 | Yes | READY_WITH_FIXTURE |
| QA-V5-A31-003 | 최초 completion 7/8 | P1 | Yes | READY |
| QA-V5-A31-004 | 신규 메뉴 완료 후 8/8 서버 상태 반영 | P1 | Yes | READY_WITH_FIXTURE |
| QA-V5-A31-005 | step nav + workspace | P2 | Partial | READY |
| QA-V5-A31-006 | 8 content + step 9 package | P1 | Yes | READY |
| QA-V5-A31-007 | 다음 단계 이동 | P2 | Yes | READY_WITH_ROUTE |
| QA-V5-A31-008 | section 완료 판정식 | - | No | OUT_OF_UI_SCOPE |
| QA-V5-A31-009 | 7개 승계 + 5번 신규 메뉴 정합성 | P1 | Yes | READY_WITH_FIXTURE |

## A-32

| ID | QA | P | 자동화 | 상태 |
|---|---|---:|---|---|
| QA-V5-A32-001 | package 4종 표시 | P1 | Yes | READY |
| QA-V5-A32-002 | 완료/미등록 상태 | P1 | Yes | READY |
| QA-V5-A32-003 | incomplete submit 불가 | P1 | Yes | READY |
| QA-V5-A32-004 | Save / Final Submit 분리 | P1 | Yes | READY |
| QA-V5-A32-005 | Save/navigation ≠ submit | P1 | Yes | READY |
| QA-V5-A32-006 | 제출 후 수정 → SUBMITTED+CHANGED | P1 | Yes | READY_AFTER_DESIGN |
| QA-V5-A32-007 | 재제출 성공 → changed 해소 | P1 | Yes | READY_AFTER_DESIGN |
| QA-V5-A32-008 | read-only report viewer modal | P1 | Yes | DESIGN_MISSING |
| QA-V5-A32-009 | AI PPTX 생성 workflow 시작 | P2 | Partial | READY_WITH_ASYNC_CONTRACT |
| QA-V5-A32-010 | PDF only 업로드 | P1 | Yes | READY_WITH_UPLOAD_FIXTURE |
| QA-V5-A32-011 | repository link provider 제한 없음 | P2 | Yes | READY |
| QA-V5-A32-012 | artifact readiness 개별 표시 | P1 | Yes | READY |
| QA-V5-A32-013 | artifact action vs final action 위계 | P2 | No | HUMAN |
| QA-V5-A32-014 | 마감 후 edit/save/submit 전부 잠금 | P1 | Partial | READY_WITH_TIME_CONTROL |
| QA-V5-A32-015 | 제출완료·변경없음 | P1 | Yes | DESIGN_MISSING |
| QA-V5-A32-016 | 재제출 후 A-30/A-32 sync | P1 | Yes | READY_AFTER_DESIGN |

## Cross-screen

| ID | QA | P | 자동화 | 상태 |
|---|---|---:|---|---|
| QA-V5-CROSS-001 | 7 inherited + 신규 메뉴 + package continuity | P1 | Partial | READY_WITH_FIXTURE |
| QA-V5-CROSS-002 | submitted+changed sync | P1 | Yes | READY_AFTER_DESIGN |
| QA-V5-CROSS-003 | 상태/next action continuity | P2 | No | HUMAN |
