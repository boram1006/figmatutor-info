# V5 QA List — PRD Reconciled

기준:
- `design/operations/prd-v5/PRD.md` (current baseline 반영 후)
- `design/operations/prd-v5/PRD_AUDIT.md`
- `design/operations/v5-closure/design-gap-audit.md`
- 실제 v5 Figma snapshot
- 과거 QA ver.1~3은 granularity/regression-risk 참고만 사용

상세 source trace는 `qa-cases.yaml`을 정본으로 사용한다.

## A-30 내 지원 현황

| ID | QA | P | 자동화 | 상태 |
|---|---|---:|---|---|
| QA-V5-A30-001 | 본선 최초 진입 시 content completion 7/8 | P1 | Yes | READY |
| QA-V5-A30-002 | 작성중 카드 + 이어 작성 CTA 노출 | P1 | Yes | READY |
| QA-V5-A30-003 | 이어 작성 → 최종보고서 workflow 진입 | P1 | Yes | READY |
| QA-V5-A30-004 | 제출 후 수정 시 primary 제출완료 유지 + secondary 재제출 필요 | P1 | Yes | READY |
| QA-V5-A30-005 | 변경분 존재 시 재제출 CTA 제공 | P1 | Yes | READY |
| QA-V5-A30-006 | 카드 상태/metadata/CTA 시각 위계 | P2 | No | HUMAN |
| QA-V5-A30-007 | 상대시간 규칙 | P3 | No | BLOCKED_SOURCE |

추가 회귀:
- progress label이 7/8인데 progress bar가 다른 비율을 표시하지 않는지 확인
- 제출완료+changed 상태가 별도 primary state로 바뀌지 않는지 확인

## A-31 최종보고서

| ID | QA | P | 자동화 | 상태 |
|---|---|---:|---|---|
| QA-V5-A31-001 | 1차 지원서 기존 7 section prefill | P1 | Yes | BLOCKED_MAPPING |
| QA-V5-A31-002 | inherited 7 section 수정 가능 | P1 | Yes | BLOCKED_MAPPING |
| QA-V5-A31-003 | 최초 content completion 7/8 | P1 | Yes | READY |
| QA-V5-A31-004 | 신규 section 완료 후 8/8 | P1 | Partial | BLOCKED_COMPLETION_RULE |
| QA-V5-A31-005 | persistent step nav + workspace 존재/위계 | P2 | Partial | READY |
| QA-V5-A31-006 | 8 content + 9번째 package finalization 구분 | P1 | Yes | READY |
| QA-V5-A31-007 | 다음 단계 이동 | P2 | Yes | READY_WITH_ROUTE |
| QA-V5-A31-008 | section 완료 체크 조건 | P1 | No | BLOCKED_COMPLETION_RULE |
| QA-V5-A31-009 | section/field mapping 정합성 | P1 | No | BLOCKED_MAPPING |

## A-32 최종 심사 제출 패키지

| ID | QA | P | 자동화 | 상태 |
|---|---|---:|---|---|
| QA-V5-A32-001 | package 4종 표시 | P1 | Yes | READY |
| QA-V5-A32-002 | artifact별 완료/미등록 상태 | P1 | Yes | READY |
| QA-V5-A32-003 | incomplete 시 누락/submit 불가 이해 가능 | P1 | Partial | READY |
| QA-V5-A32-004 | Save와 Final Submit 분리 | P1 | Yes | READY |
| QA-V5-A32-005 | Save/navigation이 final submit을 발생시키지 않음 | P1 | Yes | READY |
| QA-V5-A32-006 | 제출 후 수정 → SUBMITTED + CHANGED_AFTER_SUBMIT | P1 | Yes | READY |
| QA-V5-A32-007 | 재제출 성공 후 changed state 해소 | P1 | Yes | READY |
| QA-V5-A32-008 | 최종 보고서 확인 viewer open | P2 | Yes | DESIGN_MISSING |
| QA-V5-A32-009 | 발표자료 초안 생성 workflow 시작 | P2 | Partial | BLOCKED_ASYNC_POLICY |
| QA-V5-A32-010 | 발표자료 파일 형식 validation | P1 | No | BLOCKED_FILE_POLICY |
| QA-V5-A32-011 | source repository provider validation | P2 | No | BLOCKED_PROVIDER_POLICY |
| QA-V5-A32-012 | artifact readiness 개별 표시 | P1 | Yes | READY |
| QA-V5-A32-013 | artifact action vs final action 위계 | P2 | No | HUMAN |
| QA-V5-A32-014 | deadline boundary | P1 | No | BLOCKED_DEADLINE |
| QA-V5-A32-015 | 제출완료 + 변경없음 | P1 | Yes | DESIGN_MISSING |
| QA-V5-A32-016 | 재제출 후 A-30/A-32 상태 동기화 | P1 | Yes | DESIGN_MISSING |

## Cross-screen

| ID | QA | P | 자동화 | 상태 |
|---|---|---:|---|---|
| QA-V5-CROSS-001 | 7 inherited + 1 new + package workflow continuity | P1 | Partial | BLOCKED_MAPPING |
| QA-V5-CROSS-002 | A-30/A-32 submitted+changed 상태 동기화 | P1 | Yes | READY_AFTER_DESIGN |
| QA-V5-CROSS-003 | 화면 간 상태/next action continuity | P2 | No | HUMAN |

## 우선 실행 순서

1. **READY P1**
2. 새 디자인 생성 후 **DESIGN_MISSING / READY_AFTER_DESIGN**
3. Q1~Q7 확정 후 BLOCKED 케이스
4. HUMAN visual QA

## 과거 실제 Fail 기반 회귀 포인트

과거 QA의 requirement를 복사하지는 않지만 다음 결함 유형은 반드시 재확인한다.
- state boundary에서 버튼 활성화가 잘못 바뀌는 문제
- save와 submit state 혼동
- 한 화면의 수정 결과가 다른 화면에 반영되지 않는 cross-screen sync
- 불가능한 상태값이 저장되는 문제
