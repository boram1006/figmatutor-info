# V5 Playwright QA — 실행 범위와 방법

## 우선 자동화
1. QA-V5-A30-001 — 7/8
2. QA-V5-A31-003 — 7/8
3. QA-V5-A31-006 — 8 content + step 9
4. QA-V5-A32-001 — 4종 package
5. QA-V5-A32-004/005 — Save와 Submit 분리
6. QA-V5-A32-006/007 — submitted changed / re-submit
7. QA-V5-CROSS-002 — A-30/A-32 상태 sync

디자인 반영 후:
- QA-V5-A32-008 — read-only report viewer modal
- QA-V5-A32-015 — submitted unchanged
- QA-V5-A32-014 — deadline-passed 전체 read-only

fixture 준비 후:
- 7개 승계 + 5번 신규 메뉴
- PDF only 업로드
- server completion state
- deadline state

## webapp contract

```
a30-report-card-{applicationId}
a30-report-progress
a30-report-primary-state
a30-report-action-needed
a30-report-resubmit

a31-content-progress
a31-step-1 ... a31-step-9
a31-next
a31-back

a32-package-grid
a32-artifact-report
a32-artifact-deck
a32-artifact-demo
a32-artifact-repository
a32-save
a32-submit
a32-resubmit
a32-submit-state
a32-action-needed
a32-report-viewer
a32-report-viewer-close
```

최소 fixture:
- finalist-initial
- package-incomplete
- package-ready
- submitted-unchanged
- submitted-changed
- resubmitted
- deadline-passed

## 설치 / 실행

webapp repo에서:
```sh
npm install -D @playwright/test
npx playwright install chromium
npx playwright test tests/e2e/v5 --project=chromium
```

환경:
```sh
PLAYWRIGHT_BASE_URL=https://<test-server> \
PLAYWRIGHT_STORAGE_STATE=playwright/.auth/user.json \
npx playwright test tests/e2e/v5 --project=chromium
```

실패 시 trace/screenshot/video를 보존한다.

현재 Design Harness repo에는 webapp source/route/auth/fixture/stable testid contract가 없으므로 실제 `*.spec.ts`는 임의 생성하지 않는다.
