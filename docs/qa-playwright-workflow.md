# Playwright QA Automation Strategy

이 문서는 source-traceable QA case 중 자동화 가능한 항목을 Playwright 테스트로 연결하는 기준이다.

## 목표

QA 리스트 전체를 브라우저 자동화로 대체하지 않는다.

```
PRD / SCREEN / CONFIRMED RULE
        ↓
source-traceable QA cases
        ↓
automationCandidate classification
        ↓
Playwright backlog
        ↓
stable selector / fixture / environment 확인
        ↓
Playwright spec
        ↓
run result + trace / screenshot / video
        ↓
human review for partial / visual cases
```

## 자동화 범위

### 적합
- route / redirect
- button visible / hidden / enabled / disabled
- modal open / close
- form validation message
- status / badge text
- loading / error / empty state
- table sort order
- permission-based access
- submit / re-submit state transition
- persisted value 확인
- deadline 전/후 UI (시간을 test fixture로 제어할 수 있을 때)

### partial
- responsive layout
- overflow
- screenshot comparison
- visual regression

DOM/state assertion은 자동화할 수 있지만 최종 visual 판단은 사람이 한다.

### 자동화하지 않음
- 정보 위계의 자연스러움
- campaign visual의 적절성
- copy tone
- dense screen의 체감
- sourceType=INFERRED
- OPEN_QUESTION

## QA case → Playwright 연결

QA case ID를 테스트 title/tag의 안정 키로 사용한다.

예:

```ts
test('QA-V5-A32-007 submitted+changed shows resubmit action', async ({ page }) => {
  // fixture: submitted package + changed_after_submit
  // action: open A-32
  // expected: primary SUBMITTED indication remains
  //           resubmit warning/action is visible and enabled
});
```

QA case가 바뀌면 같은 ID를 유지하고 요구사항이 실질적으로 바뀐 경우 source trace를 갱신한다.

## Selector 정책

자동화가 CSS class / 화면 문구 / DOM 깊이에 의존하지 않게 한다.

우선순위:
1. 제품 코드의 안정적인 `data-testid`
2. accessibility role + accessible name
3. stable form name / label
4. 기타 selector는 예외

Figma node ID나 디자인 harness pluginData를 웹 DOM selector로 직접 사용하지 않는다.

권장 convention:

```
data-testid="a32-package-submit"
data-testid="a32-package-resubmit"
data-testid="a30-report-status"
data-testid="a31-step-8"
```

## 테스트 데이터 / 상태 주입

상태 머신 테스트는 클릭을 수십 단계 반복해서 상태를 만들지 않는다.

가능하면:
- API fixture
- seeded DB
- test-only backend fixture endpoint
- storage/session fixture

등으로 precondition을 재현한다.

각 QA case는 최소한 아래가 재현 가능해야 자동화한다.
- account/role
- phase
- entity state
- required data
- deadline/time state

재현 방법이 없으면 automationCandidate가 true여도 implementation status는 `BLOCKED_FIXTURE`로 둔다.

## 로그인

로그인 절차가 안정화되면 Playwright `storageState`를 역할별로 분리한다.

예:
- normal user
- reviewer-enabled user
- admin

credential 자체는 repo에 저장하지 않는다.

## 시간 기반 기능

deadline/countdown 테스트는 실제 시계를 기다리지 않는다.

우선:
- backend fixture clock
- app의 injectable clock

차선:
- Playwright browser clock

서버 판정과 클라이언트 시각이 다르면 서버 기준을 source of truth로 테스트한다.

## 네트워크 실패

PRD/source에 정의된 경우에만 테스트한다.

Playwright route mocking 또는 test backend fixture로:
- 4xx/5xx
- timeout
- retry success

를 재현할 수 있다.

일반 QA 관례만으로 임의 error test를 만들지 않는다.

## Evidence

자동화 run에서 실패 시 가능하면:
- Playwright trace
- screenshot
- video
- console/network context

를 남긴다.

video는 디버깅 evidence이지 pass/fail 판정 그 자체가 아니다.

## 권장 repo 구조

Playwright 도입 시:

```
playwright.config.ts
tests/e2e/
  fixtures/
  helpers/
  v5/
    a30-status.spec.ts
    a31-report-form.spec.ts
    a32-package.spec.ts
artifacts/playwright/   # gitignore
```

source QA 파일:
```
design/qa/releases/v5/qa-cases.yaml
```

QA case가 요구사항의 traceability 원본이고, Playwright spec은 실행 구현이다.

## 도입 순서

1. v5 PRD audit 완료
2. v5 QA case 생성
3. automationCandidate=true만 추출
4. test server / login / fixture 가능 여부 확인
5. selector contract 정의
6. A-32처럼 상태 전이가 명확한 화면부터 3~5개 smoke case 자동화
7. trace/video 결과 검토
8. 안정되면 release regression으로 확대

처음부터 모든 QA를 자동화하지 않는다.
