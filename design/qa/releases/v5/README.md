# v5 QA Package

대상 릴리즈: 최종보고서 제출 (A-30 / A-31 / A-32)

## Source policy

v5의 `design/operations/prd-v5/PRD.md`는 화면에서 역복원한 문서다.
따라서 QA expected result는 다음 우선순위를 사용한다.

1. current product baseline / confirmed project rule
2. actual Figma screen evidence
3. reverse-engineered PRD = INFERRED unless independently confirmed

과거 QA ver.1~3은 TC 분해 수준과 regression-risk 참고용이지 v5 requirement source가 아니다.

## Files

- `qa-cases.yaml` — source-traceable cases
- `state-matrix.md` — state transition coverage
- `open-questions.md` — product decisions needed before definitive QA/automation
- `manual-checklist.md` — execution sheet for human QA
- `automation-backlog.md` — Playwright candidates

## Current high-risk areas

1. application 7 sections → final report 8 sections mapping
2. initial completion 7/8
3. SUBMITTED + CHANGED_AFTER_SUBMIT dual state
4. re-submit and cross-screen synchronization
5. package readiness / Save vs Final Submit
6. file type/provider/deadline rules that are still open

## Playwright readiness

Tier 0 smoke candidates are listed in `automation-backlog.md`.
Actual specs should not be generated until test server, auth, fixture strategy, and stable selectors are known.
