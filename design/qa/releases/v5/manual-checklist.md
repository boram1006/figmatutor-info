# v5 Manual QA Checklist

실제 Pass / Fail / Skip을 기록하기 위한 실행용 체크리스트다.
정본은 `qa-cases.yaml`이며 디자인 pixel/visual 검수는 포함하지 않는다.

## Result 기준

- **Pass**: expected와 일치
- **Fail**: expected와 불일치
- **Skip**: fixture/환경 때문에 재현 불가
- **Blocked**: 실행에 필요한 시스템 contract 또는 환경이 준비되지 않음

## A-30 내 지원 현황

| QA ID | Summary | Priority | Result | 비고 |
|---|---|---:|---|---|
| QA-V5-A30-001 | 본선 진입 초기 completion 7/8 | P1 |  |  |
| QA-V5-A30-002 | 작성중 카드 + 이어 작성 → workflow 진입 | P1 |  |  |
| QA-V5-A30-003 | 제출 후 수정 → 재제출 필요 상태/액션 | P1 |  |  |

## A-31 최종보고서

| QA ID | Summary | Priority | Result | 비고 |
|---|---|---:|---|---|
| QA-V5-A31-001 | 기존 7개 section prefill + 수정 가능 | P1 |  | fixture 필요 |
| QA-V5-A31-002 | 7/8 → 신규 section 완료 후 8/8 | P1 |  | 서버 completion 상태 반영 |
| QA-V5-A31-003 | 8 content → 9번째 package 단계 이동 | P1 |  |  |
| QA-V5-A31-004 | 서버 section completion 상태 반영 | P1 |  | UI 자체 판정 없음 |

## A-32 제출 패키지

| QA ID | Summary | Priority | Result | 비고 |
|---|---|---:|---|---|
| QA-V5-A32-001 | package 4종 표시 | P1 |  |  |
| QA-V5-A32-002 | 미등록 항목 식별 + 제출 불가 | P1 |  | fixture 필요 |
| QA-V5-A32-003 | 저장으로 최종 제출 발생 금지 | P1 |  |  |
| QA-V5-A32-004 | 최종 제출 성공 → 제출완료 | P1 |  |  |
| QA-V5-A32-005 | 제출 후 수정 → 변경사항 미반영/재제출 필요 | P1 |  |  |
| QA-V5-A32-006 | 재제출 → 최신 제출본 반영 | P1 |  |  |
| QA-V5-A32-007 | 기존 viewer modal로 최종 보고서 read-only 확인 | P1 |  | 신규 modal 생성 요구 없음 |
| QA-V5-A32-008 | 발표자료 .pptx 생성 workflow | P2 |  | async contract 필요 |
| QA-V5-A32-009 | 발표자료 최종 등록 PDF only | P1 |  | upload fixture 필요 |
| QA-V5-A32-010 | 저장소 링크 provider 제한 없음 | P2 |  |  |
| QA-V5-A32-011 | 제출 마감 후 단일 read-only 상태 | P1 |  | E2E 자동화 시 time control 필요 |
| QA-V5-A32-012 | 제출완료·변경없음 상태 | P1 |  |  |

## Cross-screen

| QA ID | Summary | Priority | Result | 비고 |
|---|---|---:|---|---|
| QA-V5-CROSS-001 | 7 inherited + 1 new + package 연속 workflow | P1 |  | fixture 필요 |
| QA-V5-CROSS-002 | 제출 후 수정/재제출 A-30 ↔ A-32 동기화 | P1 |  | regression 핵심 |
