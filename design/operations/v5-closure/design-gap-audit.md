# V5 Current Design Gap Audit

기준:
- `design/operations/v5-latest-snapshot/snapshot-v5-latest.json`
- capturedAt: `2026-09-26T11:11:36.951Z`
- V5 section: `1:23008`

## 완료 확인

- A-30 `7 / 8` text 반영
- A-30 submitted / resubmit-needed 상태 존재
- A-31 9-step 구조 확인
- 1차 지원서 기존 7개 승계 + 5번 `신규 메뉴` 추가 정책 확인
- A-32 complete: `1:23529`
- A-32 incomplete: `17:996`
- A-32 SUBMITTED: `76:1890`
- A-32 SUBMITTED_CHANGED: `76:2155`
- `제출 완료됨 ✓`
- `변경사항 다시 제출하기 →`
- AI 발표자료 초안 `.pptx` 생성 CTA

## Remaining gaps

### G0 — A-30 progress visual mismatch

- text `1:23100` = `7 / 8`
- track `1:23101` width = 120px
- fill `1:23102` width = 30px

7/8과 시각 상태가 불일치한다. 120px 기준 7/8 fill은 105px이어야 한다.

**Result: DESIGN_MISMATCH**

### G1 — A-32 DEADLINE_PASSED missing

확정 정책:
- edit/save/submit/re-submit 모두 disabled
- 전체 read-only
- primary action `제출 마감됨`
- 마지막 제출본이 최종본

최신 snapshot에는 `A-32_submission-package_DEADLINE_PASSED` frame과 실제 `제출 마감됨` CTA가 없다.

**Result: MISSING_DESIGN**

### G2 — Final report viewer modal missing

확정 정책:
- A-32 위 SECTION 1~8 통합 read-only modal
- edit control 없음
- close 후 A-32 context 유지

최신 snapshot에는 대응 viewer/modal frame이 없다.

**Result: MISSING_DESIGN**

### G3 — PDF final upload mismatch

확정 정책:
- AI 생성물 = editable PPTX
- 최종 등록 = PDF only
- max 50MB

최신 화면에는 `발표 자료(PDF)`와 `발표 자료 초안 생성 (.pptx)`가 존재하지만,
등록 완료 예시 파일명이 `최종_아뜰리에_발표자료_v1.2.pptx`로 남아 있다.
또 실제 화면에서 `최대 50MB · PDF 파일만 업로드 가능` 안내를 확인할 수 없다.

**Result: DESIGN_MISMATCH / MISSING_GUIDANCE**

### G4 — repository provider-neutral mismatch

확정 정책:
- generic repository link
- GitHub/GitLab provider 제한 없음

최신 화면에는 generic `소스코드 저장소` label도 있지만 보조 label이 `사내 GitLab`로 고정되어 있다.

**Result: DESIGN_MISMATCH**

## 결론

| Item | Result |
|---|---|
| A-30 7/8 text | COMPLETE |
| A-30 progress visual | MISMATCH |
| A-30 submitted/resubmit | COMPLETE |
| A-31 9-step/new menu | COMPLETE |
| A-32 complete/incomplete | COMPLETE |
| A-32 SUBMITTED | COMPLETE |
| A-32 SUBMITTED_CHANGED | COMPLETE |
| A-32 DEADLINE_PASSED | MISSING |
| Report viewer modal | MISSING |
| PDF-only/max 50MB | MISMATCH |
| Provider-neutral repository UI | MISMATCH |

**V5 디자인은 아직 QA baseline으로 확정하지 않는다.**

위 gap을 수정한 뒤 V5 전용 snapshot을 다시 extract한다. 그 결과가 모두 해소되면 `design/qa/releases/v5/` QA 파일을 최신 PRD + 최신 화면 기준으로 정리한다.
