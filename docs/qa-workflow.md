# QA 워크플로우 — PRD 기반 QA 리스트 생성

이 문서는 **PRD/화면 근거에서 출발해 추적 가능한 QA 케이스를 생성하고,
자동화 후보를 분류하는** 절차를 정의한다.

실제 TC 생성의 패턴·화면 영역 체크리스트는 `docs/qa-list-workflow.md`에 있다.
이 문서는 그 위에 올라타는 **traceability 계층**과 **schema 계약**을 다룬다.

> 원칙:
> - source 없는 QA requirement를 만들지 않는다.
> - 한 화면의 규칙을 서비스 전체로 일반화하지 않는다.
> - 근거가 부족한 항목은 `INFERRED` 또는 `OPEN_QUESTION`으로 표시한다.
> - QA 리스트 생성과 QA 실행은 분리한다. 리스트를 만들었다고 자동 실행하지 않는다.

---

## 전체 흐름

```
PRD / Screen Source
        ↓
  Requirement Extraction        ← source 위치를 명시해 추출
        ↓
  Source Traceability           ← 모든 케이스에 source 필드 채움
        ↓
  QA Case Generation            ← schema(design/qa/qa-schema.md) 준수
        ↓
  State / Permission Coverage   ← 상태 머신·권한 matrix 별도 생성
        ↓
  Automation Classification     ← true / partial / false 판정
        ↓
  Human Review                  ← INFERRED·OPEN_QUESTION 확인
        ↓
  QA Execution                  ← 사람이 직접 실행·기록
        ↓
  Playwright Implementation     ← automationCandidate=true 중 실행 조건이 갖춰진 케이스
```

Playwright 구현 기준은 `docs/qa-playwright-workflow.md`를 따른다.
`automationCandidate=true`는 "자동화할 가치가 있음"을 뜻하며,
테스트 서버·로그인·fixture·stable selector가 준비되지 않았으면 즉시 구현 가능하다는 뜻은 아니다.

---

## Source of Truth 우선순위

QA 항목을 만들 때 근거 채택 순서:

| 우선순위 | 근거 | sourceType |
|---|---|---|
| 1 | 릴리즈별 PDF 안의 **원본 노란색 PRD 박스** | `PRD` |
| 2 | 실제 해당 Figma 화면 | `SCREEN` |
| 3 | 명시적으로 확정된 프로젝트 문서 (SITEMAP, workflow 등) | `CONFIRMED_PROJECT_RULE` |
| 4 | 역방향 복원 PRD 또는 위 source에서 논리적으로 유추한 항목 | `INFERRED` |

**5번(일반 UX/QA 관례)은 근거로 사용하지 않는다.**
관례상 필요해 보여도 source에 없는 product rule은 만들지 않는다.

---

## 절대 금지

- PRD에 없는 business rule 추가
- 화면 하나에서 본 패턴을 서비스 전체 규칙으로 일반화
- "보통 이런 서비스는…"을 근거로 expected result 생성
- 근거 없는 validation / 권한 / 상태 / 숫자 / 제한값 추가
- Card/Table/layout 같은 디자인 규칙을 QA requirement처럼 발명
- source가 불명확한 항목을 확정 QA로 작성

---

## 절차

### 1단계 — Source 읽기

대상 릴리즈의 PRD를 우선 읽는다.

```
design/operations/prd-pdf/img/            ← 원본 PDF 렌더. 노란 PRD 박스 우선 확인
design/operations/prd-pdf/v<n>.txt         ← 원본 텍스트 추출 보조자료
design/operations/prd-<release>/PRD.md     ← 역방향 복원본이면 보조자료(INFERRED)로 취급
design/02-structure/SITEMAP.md             ← 권한·상태·의존관계
```

원본 노란 PRD가 없는 경우에는 실제 Figma 화면을 sourceType=`SCREEN`으로 사용한다.
역방향 복원 PRD는 탐색·정리에는 사용할 수 있지만 원본 PRD와 같은 권위로 승격하지 않는다.
복원 과정에서 추가된 해석은 `INFERRED`로 남기고 자동화 대상에서 제외한다.

### 2단계 — Requirement Extraction

PRD의 각 블록에서 테스트 가능한 요구사항을 추출한다.

| PRD 블록 | 추출 대상 |
|---|---|
| 화면 개요 | 화면 진입 조건, 리다이렉트 규칙 |
| 진입 경로 + 조건 | phase/권한별 접근 허용·차단 |
| 로딩/예외 | 로딩, 에러, 빈상태 각 UI |
| 상태 머신 | 각 상태의 entry, visible UI, available/disabled actions, 전이 트리거 |
| 상태별 UI 매트릭스 | 배지 라벨·색, 문구, CTA 라벨/활성여부, 부가표시 조건 |
| 정렬·버튼 규칙 | 정렬 기준, 동점 처리, 버튼 상태 예외 |
| 표기 규칙 | 시간 형식, 자릿수, 말줄임 |
| 레이아웃·인터랙션 | 고정 높이/스크롤, 최대 노출 수, 카운트다운 동작 |

추출 시 반드시 **source 위치**를 기록한다.
예: `v3 PRD / A-01 / 2.2 지원서 상태`

### 3단계 — QA Case 생성

`design/qa/qa-schema.md`의 필드 정의에 맞춰 각 케이스를 작성한다.

ID 규칙: `QA-V{n}-{화면ID}-{순번 3자리}`
예: `QA-V3-A01-001`, `QA-V5-A32-007`

source에서 직접 확인되지 않는 expected result는 케이스에 추가하지 않는다.
근거가 부족하면:
- 논리적으로 유추 가능 → `sourceType: INFERRED`, `confidence: LOW`
- 사용자 확인이 필요 → `notes`에 `OPEN_QUESTION: <질문내용>` 명시

### 4단계 — State Coverage Matrix

상태 머신이 있는 화면은 별도 transition matrix를 생성한다.

```markdown
## State Coverage — {화면ID}

| From | Event | To | Source | QA IDs |
|------|-------|----|---------| -------|
```

각 상태마다 최소한 아래 coverage를 확인한다:
- entry (진입 조건)
- visible UI (보이는 요소)
- available actions (활성 버튼·링크)
- disabled actions (비활성 요소)
- transition (어떤 이벤트로 다음 상태로 이동)
- final state (되돌릴 수 없는 상태가 있으면 명시)

### 5단계 — Permission Coverage Matrix

권한이 있는 기능은 role/permission matrix를 생성한다.

이 프로젝트의 확정 권한 모델 (SITEMAP §1 기준):

| 기능 | 일반 계정 | 일반 계정 + 심사자 권한 | 관리자 계정 |
|---|---|---|---|
| 일반 지원 흐름 (A 시리즈) | ✓ | ✓ | — |
| 사람 1차/최종 심사 | ✗ | ✓ | — |
| AI 심사 J-01~J-04 | ✗ | ✗ | ✓ |
| 심사자 권한 부여/해제 | ✗ | ✗ | ✓ |

- 심사자 권한으로 AI 심사(J 시리즈) 접근 시 → 접근 차단 케이스를 반드시 포함한다.
- 비로그인 상태의 보호 기능이 PRD에 명시된 경우에만 PERMISSION 케이스를 추가한다.

### 6단계 — Automation Classification

각 케이스에 `automationCandidate` 값을 배정한다.

**`true`** — DOM/state로 명확히 검증 가능:
- 페이지 이동 / 리다이렉트
- 버튼 노출·비노출 / enabled·disabled
- modal open·close
- validation message
- status label / badge text
- table 정렬
- loading · error · empty state
- 권한별 route 접근 차단

**`partial`** — 자동 검증 + 사람 확인이 함께 필요:
- 긴 텍스트가 overflow 없이 표시되는지
- 특정 viewport에서 레이아웃이 깨지지 않는지

**`false`** — 사람의 시각/UX 판단이 필요:
- 정보 위계가 자연스러운지
- 디자인이 기존 화면과 일관된지
- 문구가 어색하지 않은지
- dense screen이 과도하게 단순화되지 않았는지
- 실제 데이터에서의 체감

애매하면 `false`로 둔다.
`sourceType: INFERRED`인 케이스는 자동화 대상으로 분류하지 않는다.

### 7단계 — 산출물 저장

```
design/qa/releases/v{n}/
  qa-cases.yaml          ← 케이스 목록
  state-matrix.md        ← 상태 coverage matrix (있는 화면만)
  permission-matrix.md   ← 권한 matrix (권한 기능 있는 화면만)
  open-questions.md      ← OPEN_QUESTION 모음 (사람 확인 필요 항목)
```

기존 `design/operations/qa/` 파일 형식(Pass/Fail/Skip 기록용)은
`docs/qa-list-workflow.md` 절차로 생성하며 이 파일들과 별개다.

---

## Human QA 역할

사람 QA를 없애려는 목적이 아니다.
아래 항목은 항상 Human QA 대상이며 자동화하지 않는다.

- visual fidelity (색·크기·여백이 디자인 의도와 일치하는지)
- information hierarchy (정보 위계가 자연스러운지)
- copy / context (문구가 문맥에 맞는지, 오탈자)
- interaction awkwardness (인터랙션이 어색하지 않은지)
- 기존 화면과의 미묘한 inconsistency
- 긴 콘텐츠·실제 데이터에서의 체감
- dense screen의 밀도가 의도한 수준인지

category=`VISUAL`인 케이스는 모두 `automationCandidate: false`다.

---

## Self-check (케이스 생성 완료 전 확인)

작성한 QA 케이스를 저장하기 전에 아래를 확인한다.

- [ ] source 없는 QA requirement를 만들지 않았는가
- [ ] 한 화면의 규칙을 전체 서비스로 일반화하지 않았는가
- [ ] 사람 심사와 AI 심사를 같은 권한/흐름으로 섞지 않았는가
- [ ] 기존 화면 modification rule과 충돌하지 않는가
- [ ] Visual QA를 무리하게 자동화 대상으로 분류하지 않았는가
- [ ] 모든 확정 QA에 source trace가 있는가
- [ ] INFERRED 항목은 automationCandidate: false인가

---

## 관련 문서

- `docs/qa-list-workflow.md` — TC 생성 패턴·화면 영역 체크리스트 (Pass/Fail/Skip 기록 형식)
- `docs/qa-playwright-workflow.md` — automationCandidate를 Playwright 실행으로 연결하는 기준
- `design/qa/qa-schema.md` — QA case 필드 정의
- `design/qa/README.md` — QA 산출물 폴더 구조
- `design/02-structure/SITEMAP.md` — 권한·상태·의존관계
- `docs/prd-authoring-workflow.md` — PRD가 없을 때 역방향 복원 절차
