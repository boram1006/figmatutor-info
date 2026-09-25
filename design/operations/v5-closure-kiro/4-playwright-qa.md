# v5 — Playwright 자동 QA 범위 + 실행 방법

목적: `3-qa-list-v5.md`의 QA 케이스 중 Playwright로 자동화할 수 있는 범위를 정하고, 실제 실행 절차를 제공한다.

대상 서버(QA 배포 리스트 기준): `https://axhack.lge.com:2026` (ver.2·3 QA에서 사용된 서버).
로그인·심사자/참가자 권한 계정이 필요하다 (아래 사전 조건).

---

## 1. 자동화 분류 기준

| 분류 | 조건 |
|---|---|
| AUTOMATE | expected가 결정론적이고 UI/DOM으로 검증 가능. PRD 확정 상태. |
| MANUAL | 시각 판정(색/정렬 느낌), 파일 업로드 실물, 외부 링크 실제 오픈, 서버 시간 의존 등 |
| BLOCKED | expected가 `1-prd-decisions.md`의 확인 필요(Q#)에 의존 → 결정 전 자동화 금지 |
| DESIGN_PENDING | 대상 상태 디자인이 아직 없음(`2-missing-designs.md` GAP) → 생성 후 자동화 |

---

## 2. 케이스별 분류

### A-30 (목록 1)

| QA# | 요약 | 분류 | 비고 |
|---|---|---|---|
| 1 | 카드 조회 | AUTOMATE | 카드 존재/개수 assert |
| 2 | 빈 상태 | BLOCKED | Q9 (공통 empty 처리 근거) |
| 3 | 마감 배너 | AUTOMATE | 배너 텍스트 assert |
| 4 | 작성중 배지/CTA | AUTOMATE | 배지 텍스트 + CTA 존재 |
| 5 | completion 7/8 시작 | AUTOMATE | seed 데이터 필요 |
| 6 | 제출완료 배지/CTA | AUTOMATE | seed 데이터 필요 |
| 7 | 재제출 배지/CTA | BLOCKED | Q1 (배지 문구/색 미확정) |
| 8 | 미진출 배지/CTA | AUTOMATE | seed 데이터 필요 |
| 9~11 | 상태 전이 | MANUAL | 제출/수정/재제출 실제 플로우 → E2E seed·격리 필요, 초기엔 수동 |
| 12 | 마감 잠금 | BLOCKED | Q7 (마감 timestamp) + 서버 시간 조작 필요 |
| 13 | 상대시간 표기 | BLOCKED | Q9 |
| 14 | 제출일시 표기 | AUTOMATE | 정규식 assert |
| 15 | 정렬 | BLOCKED | Q9 |
| 16 | 스켈레톤 | MANUAL | 로딩 타이밍 의존 |
| 17 | 에러 재시도 | AUTOMATE | 네트워크 mock/차단으로 유발 |

### A-31 (목록 2)

| QA# | 요약 | 분류 | 비고 |
|---|---|---|---|
| 1 | 이어 작성 진입 위치 | AUTOMATE | URL/활성 섹션 assert |
| 2 | 스텝 9개 | AUTOMATE | 네비 항목 count |
| 3 | 완료 아이콘 | MANUAL | 아이콘 시각 판정 |
| 4 | 9번 패키지 배지 | AUTOMATE | 배지 텍스트 |
| 5 | 스텝 점프 | AUTOMATE | 클릭 후 섹션 전환 |
| 6 | SECTION 1 헤더 | AUTOMATE | 헤더 텍스트 |
| 7 | 팀 정보 테이블 | AUTOMATE | 컬럼 헤더 assert |
| 8 | prefill 승계 | BLOCKED | Q2 (mapping 미확정) |
| 9 | 완료 판정 | BLOCKED | Q3 (판정식 미확정) |
| 10 | 다음 이동 | AUTOMATE | 클릭 후 전환 |
| 11 | 뒤로 복귀 | BLOCKED | Q6 (navigation ownership) |
| 12 | completion 표기 구분 | AUTOMATE | 텍스트 assert |

### A-32 (목록 3)

| QA# | 요약 | 분류 | 비고 |
|---|---|---|---|
| 1 | 헤더 | AUTOMATE | 텍스트 |
| 2 | 2x2 레이아웃 | MANUAL | 배치 시각 판정 |
| 3 | 완료/미등록 배지 | AUTOMATE | 배지 텍스트 |
| 4 | 보고서 확인 모달 | AUTOMATE | 클릭 후 모달 open assert |
| 5 | 발표자료 AI 생성 | MANUAL | 생성 결과·시간 의존 |
| 6 | 업로드 드롭존 | BLOCKED | Q4 (파일 정책) + 실물 업로드=MANUAL |
| 7 | 데모 URL 테스트 | MANUAL | 외부 새 탭 오픈 |
| 8 | 소스코드 링크 | BLOCKED | Q5 (provider) |
| 9 | 4종 미충족 비활성 | AUTOMATE | 버튼 disabled assert |
| 10 | 4종 충족 활성 | AUTOMATE | seed 데이터 필요 |
| 11 | 제출 성공 잠금 | DESIGN_PENDING + Q1 | GAP-1 생성 후 |
| 12 | 재제출 활성 | DESIGN_PENDING | GAP-2 생성 후 |
| 13 | 재제출 상태 반영 | MANUAL | E2E 전이 |
| 14 | 임시 저장 | AUTOMATE | 상태 불변 assert |
| 15 | 마감 잠금 | DESIGN_PENDING + Q7 | GAP-3 생성 후 + 서버 시간 |
| 16 | 마감 배너 | AUTOMATE | 텍스트 |
| 17 | 이전 이동 | AUTOMATE | 클릭 후 전환 |

### 집계

- AUTOMATE: 약 20건 (초기 자동화 대상)
- MANUAL: 약 9건
- BLOCKED (Q# 의존): 약 10건
- DESIGN_PENDING: 3건 (A-32 세 상태 생성 후 해제)

---

## 3. 실행 방법

### 사전 조건

- Node 18+ (하네스와 동일)
- 접근 가능한 QA 서버 + 참가자/심사자 테스트 계정
- seed 데이터: 작성중/제출완료/재제출/미진출 각 상태의 지원서 (상태별 카드 QA에 필요)

### 설치 (프로젝트에 아직 Playwright 없음)

```sh
npm init -y            # 별도 QA 워크스페이스에서 (하네스 package.json 오염 방지 권장)
npm i -D @playwright/test
npx playwright install chromium
```

> 하네스 repo는 "외부 npm 의존성 없음"이 원칙이므로, Playwright는 이 repo의 dependency로 넣지 말고
> 별도 QA 폴더/워크스페이스에서 운용하는 것을 권장한다.

### 구조 (제안)

```
qa-e2e/
  playwright.config.ts     # baseURL, storageState(로그인), 리포터
  auth.setup.ts            # 로그인 후 storageState 저장
  a30.spec.ts              # A-30 AUTOMATE 케이스
  a31.spec.ts              # A-31 AUTOMATE 케이스
  a32.spec.ts              # A-32 AUTOMATE 케이스
  fixtures/seed.ts         # 상태별 지원서 seed 헬퍼
```

### config 핵심

```ts
export default defineConfig({
  use: { baseURL: 'https://axhack.lge.com:2026', storageState: 'auth.json', trace: 'on-first-retry' },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'chromium', dependencies: ['setup'], use: { ...devices['Desktop Chrome'] } },
  ],
});
```

### AUTOMATE 케이스 예시 (A-30 #4 작성중 배지/CTA)

```ts
test('A-30 작성중 카드: 배지 + CTA', async ({ page }) => {
  await page.goto('/mypage/applications');       // 실제 route 확인 필요(Q6)
  const card = page.getByTestId('report-card').filter({ hasText: '본선 진행중' }).first();
  await expect(card).toBeVisible();
  await expect(card.getByRole('link', { name: /이어 작성하기/ })).toBeVisible();
});
```

### 실행

```sh
npx playwright test                    # 전체
npx playwright test a30.spec.ts        # 파일 단위
npx playwright test --grep @automate   # 태그 단위 (AUTOMATE만)
npx playwright show-report             # 결과 리포트
```

---

## 4. 자동화 진입 조건 (게이트)

아래가 충족되기 전에는 AUTOMATE 케이스도 expected를 고정하지 않는다.

1. **selector 계약**: 실제 앱에 `data-testid` 또는 안정적 role/label이 있어야 함. 없으면 텍스트 기반 selector는 깨지기 쉬움.
2. **route 확정**: A-30/A-31 실제 URL (Q6 navigation ownership).
3. **seed/격리**: 상태별 지원서를 만들고 테스트 후 정리하는 방법. 공유 계정이면 병렬 실행 충돌 주의.
4. **BLOCKED 해제**: `1-prd-decisions.md`의 Q1·Q3·Q7 등 확정 후 해당 케이스 자동화.

## 5. 우선 착수 권장

1순위: A-32 #9(4종 미충족 비활성), #16(마감 배너), A-31 #2/#6/#7 — 상태 seed 없이도 검증 가능한 정적 UI.
2순위: A-30 상태별 배지(#4,#6,#8) — seed 데이터 준비 후.
3순위: 전이 시나리오(#9~11) 및 DESIGN_PENDING 케이스 — 디자인 생성 + E2E 환경 정비 후.
