# V5 Current Design Gap Audit

## 현재 확인된 frame
- A-30 `1:23009`
  - pending `1:23081`
  - submitted `49:1278`
  - resubmit `49:1301`
- A-31 `1:23119`
- A-32 complete `1:23529`
- A-32 incomplete `17:996`

## 수정/추가 필요

### D1 A-30 progress
현재 `1/8` → 확정 baseline `7/8`.

**기존 화면 수정**이다.
progress text/fill의 exact child nodeId/nodeName을 확인하기 전에는 patch JSON을 만들지 않는다.

### D2 A-30 submitted+changed
정책:
- primary = Green `제출완료`
- secondary = Warning `재제출 필요`
- CTA = `수정사항 제출하기 →`

기존 `Card-RESUBMIT-NEEDED`를 별도 primary state로 쓰지 않는다.
canonical generation spec: `spec-duplicate-a30-submitted-changed.json`.

### G1 A-32 submitted unchanged
필요:
- submitted 상태 표시
- `제출 완료됨 ✓` 비활성
- 재제출 CTA 없음

canonical generation spec: `spec-duplicate-a32-post-submit.json`.

### G2 A-32 submitted + changed-after-submit
필요:
- primary SUBMITTED 유지
- Warning `수정사항 미반영`
- `변경사항 다시 제출하기 →`

canonical generation spec: `spec-duplicate-a32-post-submit.json`.

### G3 A-32 deadline passed
확정:
- edit/save/submit 전부 잠금
- 전체 read-only
- 제출 버튼 `제출 마감됨`

추가 디자인 필요.
단 exact patch node 확인 전 추측 JSON을 만들지 않는다.

### G4 final report viewer modal
확정:
- A-32 위 overlay/modal
- SECTION 1~8 통합 read-only
- edit control 없음
- close 후 A-32 유지

재사용 가능한 동등 modal이 없으므로 **NEW_CONSTRUCTION** 대상.
기존 `candidate-report-viewer-modal.json`의 BLOCKED_Q1 조건은 해제됐다.

## Generation readiness

| 대상 | 방식 | 상태 |
|---|---|---|
| A-30 submitted+changed | CLONE_COMPOSE | READY |
| A-32 submitted unchanged | CLONE_COMPOSE | READY |
| A-32 submitted+changed | CLONE_COMPOSE | READY |
| A-30 progress 7/8 | existing frame patch | BLOCKED_EXACT_NODE |
| A-32 deadline passed | CLONE_COMPOSE | BLOCKED_EXACT_NODE |
| report viewer modal | NEW_CONSTRUCTION | READY_FOR_SPEC |

## 금지
- 동일 이름 node가 많은 A-32에서 nodeName-only patch
- snapshot에 없는 nodeId 추측
- 비교용 TODO JSON을 실행 가능 spec처럼 취급
