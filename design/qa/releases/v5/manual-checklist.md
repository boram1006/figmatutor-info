# v5 Manual QA Checklist

이 파일은 사람이 실제 Pass / Fail / Skip을 기록하기 위한 체크리스트다.
정본 requirement는 `qa-cases.yaml`이며, 이 표는 실행 편의를 위한 view다.

## Result 기준

- **Pass**: expected와 일치
- **Fail**: expected와 불일치
- **Skip**: source-backed 케이스지만 실행 환경/fixture 때문에 재현 불가
- **Blocked**: OPEN_QUESTION 또는 fixture/환경 준비 전이라 실행 자체를 시작할 수 없음

## A-30 내 지원 현황

| QA ID | Summary | Priority | Result | 비고 |
|---|---|---:|---|---|
| QA-V5-A30-001 | 본선 진입 초기 content completion 7/8 | P1 |  |  |
| QA-V5-A30-002 | 작성중 카드 + 이어 작성 액션 노출 | P1 |  |  |
| QA-V5-A30-003 | 이어 작성으로 최종보고서 workflow 진입 | P1 |  |  |
| QA-V5-A30-004 | 제출완료 + 변경 미반영 dual-state 표현 | P1 |  |  |
| QA-V5-A30-005 | 변경분 존재 시 재제출 액션 | P1 |  |  |
| QA-V5-A30-006 | 상태/metadata/CTA 정보 위계 | P2 |  | Human visual |
| QA-V5-A30-007 | 상대시간 표기 | P3 | Blocked | source 확인 필요 |

## A-31 최종보고서

| QA ID | Summary | Priority | Result | 비고 |
|---|---|---:|---|---|
| QA-V5-A31-001 | 기존 7개 section prefill | P1 |  |  |
| QA-V5-A31-002 | inherited section 수정 가능 | P1 |  |  |
| QA-V5-A31-003 | 최초 progress 7/8 | P1 |  |  |
| QA-V5-A31-004 | 신규 section 완료 후 8/8 | P1 |  | completion rule 미확정 |
| QA-V5-A31-005 | persistent step nav + workspace | P2 |  | partial automation |
| QA-V5-A31-006 | 8 content + package step 9 구분 | P1 |  |  |
| QA-V5-A31-007 | 다음 단계 이동 | P2 |  |  |
| QA-V5-A31-008 | section 완료 판정 | P1 | Blocked | required field rule 필요 |
| QA-V5-A31-009 | section/field mapping | P1 | Blocked | mapping table 필요 |

## A-32 제출 패키지

| QA ID | Summary | Priority | Result | 비고 |
|---|---|---:|---|---|
| QA-V5-A32-001 | 4종 package item 표시 | P1 |  |  |
| QA-V5-A32-002 | 완료/미등록 상태 구분 | P1 |  |  |
| QA-V5-A32-003 | incomplete finalization 안내 | P1 |  |  |
| QA-V5-A32-004 | Save와 Final Submit 분리 | P1 |  |  |
| QA-V5-A32-005 | Save/navigation으로 submit 발생 금지 | P1 |  |  |
| QA-V5-A32-006 | 제출 후 수정 → submitted+changed | P1 |  |  |
| QA-V5-A32-007 | 재제출 성공 → changed 해소 | P1 |  |  |
| QA-V5-A32-008 | 최종 보고서 확인 UI | P2 |  | exact presentation 확인 |
| QA-V5-A32-009 | 발표자료 초안 생성 workflow 시작 | P2 |  | 비동기 후속 정책 확인 |
| QA-V5-A32-010 | 발표자료 허용 형식 | P1 | Blocked | file policy 필요 |
| QA-V5-A32-011 | 저장소 provider validation | P2 | Blocked | provider policy 필요 |
| QA-V5-A32-012 | artifact readiness 개별 표시 | P1 |  |  |
| QA-V5-A32-013 | artifact action vs final action 위계 | P2 |  | Human visual |
| QA-V5-A32-014 | deadline boundary | P1 | Blocked | canonical timestamp 필요 |
| QA-V5-A32-015 | 제출완료/변경없음 상태 | P1 |  |  |
| QA-V5-A32-016 | 재제출 후 A-30/A-32 상태 동기화 | P1 |  |  |

## Cross-screen

| QA ID | Summary | Priority | Result | 비고 |
|---|---|---:|---|---|
| QA-V5-CROSS-001 | 7 inherited + 1 new + package 연속 workflow | P1 |  |  |
| QA-V5-CROSS-002 | submitted+changed 상태 화면 간 동기화 | P1 |  | 과거 실제 Fail 패턴 반영 |
| QA-V5-CROSS-003 | 화면 간 상태/next action continuity | P2 |  | Human visual |
