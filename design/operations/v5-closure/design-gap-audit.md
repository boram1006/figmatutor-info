# V5 Current Design Gap Audit

Design source: `design/operations/coverage-v5/snapshot-coverage.json`
Captured: 2026-09-24T11:57:20.941Z
Type: PARTIAL_EXTRACT (v5 section 전체는 포함, design page 전체 기준 complete=false)

## 현재 존재하는 디자인

- A-30 `1:23009` — 내 지원 현황
  - Card-PENDING `1:23081`
  - Card-SUBMITTED-DONE `49:1278`
  - Card-RESUBMIT-NEEDED `49:1301`
  - Card-SUBMITTED / 본선 미진출 variant
- A-31 `1:23119` — 최종보고서 step form
  - 7개 완료 + 1개 미완료 형태가 시각적으로 존재
- A-32 ready `1:23529`
- A-32 incomplete `17:996`

## 기존 디자인 수정 필요

### D1. A-30 작성중 progress
현재: `1 / 8` + 약 25% progress fill
확정 baseline: 본선 진입 초기 **7/8**

판정: **MISMATCH**
새 화면 추가가 아니라 기존 A-30 수정 대상.

실행 JSON 상태: **BLOCKED_EXACT_NODE**
- frame/card source는 A-30 `1:23009` / Card-PENDING `1:23081`로 확인됨.
- 그러나 progress label text와 fill layer의 exact `nodeId/nodeName`은 현재 저장된 partial snapshot에서 확정할 수 없음.
- plugin `duplicate`/patch가 nodeName/selector strict이므로 추측 ID로 JSON을 만들지 않는다.
- 다음 full extract에서 exact child node를 확인한 뒤 기존 frame patch spec을 추가한다.

### D2. A-30 재제출 카드
현재: primary badge 자체가 Red `재제출 필요`
확정 baseline: primary는 Green `제출완료` 유지 + secondary action-needed 표시

판정: **MISMATCH**
현재 Card-RESUBMIT-NEEDED를 그대로 current source로 쓰지 않는다.
`Card-SUBMITTED-DONE` 기반 dual-state variant가 필요.

실행 JSON: `spec-duplicate-a30-submitted-changed.json`

## 실제 추가 디자인 필요

### G1. A-32 — SUBMITTED / 변경 없음
현재 ready/incomplete만 있고 **최종 제출 후 변경 없음** 전체 화면 variant가 없음.

필요 표현:
- primary state = SUBMITTED
- 제출완료 상태 표시
- 재제출 action 없음
- Save와 Final submit의 상태 구분

판정: **MISSING_STATE**
실행 JSON: `spec-duplicate-a32-post-submit.json` 첫 번째 item

### G2. A-32 — SUBMITTED + CHANGED_AFTER_SUBMIT
현재 제출 전 ready/incomplete만 있음.

필요 표현:
- primary state = SUBMITTED
- secondary = 수정사항 미반영 / 재제출 필요
- CTA = 변경사항 다시 제출하기

판정: **MISSING_STATE**
실행 JSON: `spec-duplicate-a32-post-submit.json` 두 번째 item

### G3. 최종 보고서 확인 read-only viewer modal
A-32의 `최종 보고서 확인` 액션은 확정됐지만 현재 v5 snapshot에 대응 modal/overlay frame이 없음.

필요:
- A-32 위에 여는 read-only modal
- 8 content section의 통합 확인
- edit UI 없음
- close action 후 A-32 context 유지

판정: **MISSING_DESIGN**

현재 repository에 그대로 재사용하기 적합한 "8-section read-only report modal" source는 확인되지 않았다.
기존 팀빌딩 modal을 의미만 바꿔 clone하는 것은 부적절하므로 NEW_CONSTRUCTION 후보로 둔다.

generation placeholder: `candidate-report-viewer-modal.json`
status: **BLOCKED_NEW_CONSTRUCTION**
- Q1 section/field mapping과 read-only content ordering/copy가 확정되기 전 임의 구조를 만들지 않는다.

## 기획 확정 전 생성하지 않는 디자인

### C1. deadline locked
마감 이후 state 자체는 필요 가능성이 높지만,
현재는 exact cutoff 및 edit/save/submit 잠금 범위가 미확정.

판정: **CANDIDATE_GAP / BLOCKED_BY_Q6**

### C2. AI deck generation progress/success/failure
버튼 존재는 SCREEN evidence지만 async state 정책이 없음.

판정: **CANDIDATE_GAP / BLOCKED_BY_Q3**

## Generation readiness

| 대상 | 전략 | 상태 | 근거/파일 |
|---|---|---|---|
| A-30 submitted+changed card | INSTANCE_REUSE → CLONE_COMPOSE | READY | `spec-duplicate-a30-submitted-changed.json` |
| A-32 submitted unchanged | INSTANCE_REUSE → CLONE_COMPOSE | READY | `spec-duplicate-a32-post-submit.json` |
| A-32 submitted+changed | INSTANCE_REUSE → CLONE_COMPOSE | READY | `spec-duplicate-a32-post-submit.json` |
| A-30 progress 7/8 | existing frame patch | BLOCKED_EXACT_NODE | progress child exact nodeId/nodeName 필요 |
| final report viewer modal | NEW_CONSTRUCTION | BLOCKED_Q1 | `candidate-report-viewer-modal.json` |
| deadline locked | TBD after policy | BLOCKED_Q6 | canonical deadline 필요 |
| AI deck async states | TBD after policy | BLOCKED_Q3 | async/file policy 필요 |

## 생성 순서

1. D2 dual-state card 생성
2. G1/G2 A-32 post-submit variants 생성
3. 새 frame IDs/result JSON 저장 + screenshot/extract
4. A-30 progress child exact node 확인 후 7/8 patch spec 생성
5. G3 report viewer modal은 Q1 확정 후 NEW_CONSTRUCTION
6. deadline/AI-generation state는 Q3/Q6 확정 뒤 추가
