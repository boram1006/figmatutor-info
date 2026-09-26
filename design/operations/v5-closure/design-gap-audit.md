# V5 Current Design Gap Audit

기준: 최신 `design/04-screens/snapshot.json` 직접 확인.

## 확인 완료

### A-30 `1:23009`
- progress text: `7 / 8` 실제 반영
- progress track `1:23101` = 120px, fill `1:23102` = 30px로 남아 있음
- 7/8 시각 진행률이라면 fill은 105px(87.5%)가 되어야 하므로 text와 bar가 불일치
- submitted card 존재
- resubmit card 존재
- `재제출 필요` text가 `status-warning` (#F59E0B) semantic에 바인딩됨

**판정: MISMATCH — progress text는 수정됐지만 bar geometry가 1/4 상태로 남아 있음**

### A-31 `1:23119`
- 기존 최종보고서 step form 유지
- 7 inherited + 1 new 정책은 PRD/QA 정본에서 확정
- completion 판정은 server-side

**판정: COVERED (server-state rendering QA 필요)**

### A-32 complete/incomplete
- complete `1:23529`
- incomplete `17:996`

**판정: COVERED**

### A-32 SUBMITTED
- `A-32_submission-package_SUBMITTED` 실제 frame 존재
- `제출 완료됨 ✓` 실제 화면 text 확인

**판정: COVERED**

### A-32 SUBMITTED_CHANGED
- `A-32_submission-package_SUBMITTED_CHANGED` 실제 frame 존재
- `변경사항 다시 제출하기 →` 실제 화면 text 확인

**판정: COVERED**

## Remaining gaps

### G0 A-30 progress bar mismatch
확정 요구:
- content completion 7/8
- 숫자 표기와 progress bar 시각 상태가 동일한 completion을 표현

최신 snapshot:
- `1:23100` = `7 / 8`
- track `1:23101` = 120px
- fill `1:23102` = 30px

**판정: MISMATCH**

수정:
- `1:23102` width를 105px로 수정
- 기존 `spec-update-a30-final-report-status.json`의 width patch가 실제 캔버스에 반영됐는지 재실행/확인

### G1 A-32 DEADLINE_PASSED
확정 요구:
- edit/save/submit/re-submit 전체 잠금
- 전체 read-only
- `제출 마감됨`
- 마지막 제출본이 최종본

최신 snapshot에서:
- `A-32_submission-package_DEADLINE_PASSED` 없음
- 실제 화면 text `제출 마감됨` 없음
- 마감 안내 문구 없음

**판정: MISSING_DESIGN**

실행 spec:
- `design/operations/v5-closure/spec-duplicate-a32-deadline-passed.json`

### G2 Final report viewer modal
확정 요구:
- A-32 위 overlay/modal
- SECTION 1~8 통합 read-only
- edit control 없음
- close 후 A-32 context 유지

최신 snapshot에 대응 modal 없음.

**판정: MISSING_DESIGN**

방식:
- `NEW_CONSTRUCTION`
- Design System canonical refresh가 완료된 뒤 기존 component INSTANCE를 사용해 생성

## 현재 결론

V5 핵심 상태 화면은 대부분 반영 완료.
남은 디자인 이슈는 3건:
1. A-30 progress bar 7/8 geometry mismatch
2. A-32 DEADLINE_PASSED
3. Final report read-only viewer modal

이 2건 외의 제품 정책 blocking open question은 없다.
