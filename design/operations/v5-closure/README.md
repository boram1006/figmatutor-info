# V5 Closure Work Package

이 폴더는 V5를 PRD → Design Gap → QA → Playwright까지 닫기 위한 작업 묶음이다.

## 1. PRD

- 정본 보완: `../prd-v5/PRD.md`
- 추가 확인: `prd-confirmation-needed.md`
- 상세 audit: `../prd-v5/PRD_AUDIT.md`

확정 반영:
- 7 inherited + 1 new content section
- initial completion 7/8
- inherited sections editable
- package = 별도 step 9
- submitted + changed는 primary/secondary dual state

## 2. Design

- gap audit: `design-gap-audit.md`
- 실행 가능:
  - `spec-duplicate-a30-submitted-changed.json`
  - `spec-duplicate-a32-post-submit.json`
- blocked:
  - `candidate-report-viewer-modal.json`

현재 핵심 gap:
- A-30 1/8 progress → 7/8 수정
- A-30 dual-state card 수정
- A-32 submitted unchanged variant 추가
- A-32 submitted+changed variant 추가
- read-only final report viewer modal 추가

## 3. QA

- 정본: `../../qa/releases/v5/qa-cases.yaml`
- reconciled 실행표: `../../qa/releases/v5/qa-list-after-prd.md`
- state matrix / open questions / manual checklist는 동일 폴더

## 4. Playwright

- 실행 정의: `../../qa/releases/v5/playwright-execution.md`
- backlog: `../../qa/releases/v5/automation-backlog.md`

실제 webapp 자동화 코드는 test server/auth/fixture/data-testid contract 확인 뒤 webapp repo에서 생성한다.

## Figma 실행 순서

1. 최신 Design Flow Harness plugin 사용
2. `spec-duplicate-a30-submitted-changed.json` 실행
3. `spec-duplicate-a32-post-submit.json` 실행
4. result JSON 저장
5. 새 frame IDs로 screenshot
6. v5 section extract
7. coverage audit 재실행

주의:
- 두 spec은 plugin의 `sourceNodeId` exact patch selector가 필요함
- plugin commit: `f7d23f2a701be6fcfcc8ef1629082489dc02c223`
