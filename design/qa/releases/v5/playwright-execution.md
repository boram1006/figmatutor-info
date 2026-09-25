# V5 Playwright QA — 실행 범위와 방법

## 1. Playwright가 우선 실행할 QA

### Smoke / Tier 0

1. `QA-V5-A30-001`
   - finalist fixture
   - A-30 progress text = 7/8
2. `QA-V5-A31-003`
   - A-31 initial content completion = 7/8
3. `QA-V5-A31-006`
   - content step 1~8 + package step 9 존재
4. `QA-V5-A32-001`
   - report/deck/demo/repository 4종 표시
5. `QA-V5-A32-004`
   - Save와 Final Submit이 별도 action
6. `QA-V5-A32-005`
   - Save만 실행해도 submitted state가 되지 않음
7. `QA-V5-A32-006`
   - submitted fixture에서 edit 발생 → primary SUBMITTED 유지 + changed warning/action
8. `QA-V5-A32-007`
   - re-submit 성공 → changed warning 제거
9. `QA-V5-CROSS-002`
   - 동일 entity를 A-30/A-32에서 조회했을 때 상태 동기화

### 디자인 반영 후 추가

- read-only report viewer modal: QA-V5-A32-008
  - modal open/close
  - SECTION 1~8 read-only content container 존재
  - edit control 없음
  - close 후 A-32 context 유지

### 제품 결정 후 추가

- section/field prefill: QA-V5-A31-001/002/009
- completion rule: QA-V5-A31-004/008
- deck file validation: QA-V5-A32-010
- repository provider: QA-V5-A32-011
- deadline: QA-V5-A32-014

## 2. 필요한 webapp contract

### stable selector

권장 `data-testid`:

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

텍스트/CSS class/DOM depth에 의존하는 selector는 회귀 테스트 정본으로 사용하지 않는다.

### fixture

최소 fixture 상태:
- finalist-initial: inherited 7 complete + new section incomplete
- package-incomplete
- package-ready
- submitted-unchanged
- submitted-changed
- resubmitted

fixture 구현 방식 우선순위:
1. test API / seed endpoint
2. seeded DB
3. storage/session fixture
4. UI로 긴 선행 flow를 매번 만드는 방식은 마지막 수단

## 3. 설치

webapp repo에서:

```sh
npm install -D @playwright/test
npx playwright install chromium
```

Design Harness repo에 실제 webapp source가 없다면 여기에서 Playwright를 실행하지 않는다.
테스트 spec은 **webapp repo**에 두고 QA ID/source trace만 이 repo와 연결한다.

## 4. 환경변수

예:

```sh
PLAYWRIGHT_BASE_URL=https://<test-server> \
PLAYWRIGHT_STORAGE_STATE=playwright/.auth/user.json \
npx playwright test tests/e2e/v5 --project=chromium
```

credential은 git에 저장하지 않는다.

## 5. playwright.config 예시

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

## 6. spec 구조

```
tests/e2e/
  fixtures/
    hackathon.ts
  v5/
    a30-status.spec.ts
    a31-report.spec.ts
    a32-package.spec.ts
    cross-screen.spec.ts
```

테스트 이름 앞에 QA ID를 넣는다.

예:

```ts
test('QA-V5-A32-006 submitted edit requires re-submit', async ({ page, hackathon }) => {
  await hackathon.seed('submitted-changed');
  await page.goto('/<A32-route>');

  await expect(page.getByTestId('a32-submit-state')).toContainText('제출완료');
  await expect(page.getByTestId('a32-action-needed')).toBeVisible();
  await expect(page.getByTestId('a32-resubmit')).toBeEnabled();
});
```

## 7. 실행 결과

실패 시 보존:
- trace
- screenshot
- video

CI:
```sh
npx playwright test tests/e2e/v5 --project=chromium
```

로컬 디버깅:
```sh
npx playwright test tests/e2e/v5/a32-package.spec.ts --headed
npx playwright test --ui
npx playwright show-report
```

## 8. 현재 즉시 실행할 수 없는 이유

이 Design Harness repo에는 현재:
- webapp source
- route contract
- auth 방식
- fixture API
- stable data-testid

가 없다.

따라서 지금 Playwright 코드를 임의의 URL/selector로 만들어 "자동 QA 가능"이라고 가장하지 않는다.
위 contract가 확인되면 Tier 0 9개부터 실제 spec으로 구현한다.
