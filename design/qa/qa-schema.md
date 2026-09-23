# QA Case Schema

`design/qa/releases/*/qa-cases.yaml`의 각 항목이 따르는 필드 계약이다.

---

## 필드 정의

```yaml
id: QA-V{n}-{화면ID}-{순번3자리}
# 안정적인 QA ID. 변경 불가. 예: QA-V3-A01-001, QA-V5-A32-007

release: v1 | v2 | v3 | v4 | v5 | ...
# 해당 릴리즈 버전

screen: "{화면ID} {화면명}"
# 예: "A-01 내 지원서 리스트", "J-01 AI 심사 대시보드"

category: FUNCTIONAL | STATE | VALIDATION | DATA | VISUAL | PERMISSION
# 아래 카테고리 정의 참조

source: "{PRD 위치 또는 문서 위치}"
# 반드시 명시. 예:
#   "v3 PRD / A-01 / 2.2 지원서 상태"
#   "v5 PRD / A-32 / 6. 정렬·버튼 규칙"
#   "SITEMAP §1 권한 관계"
#   "SITEMAP §5 공통 규칙"

sourceType: PRD | SCREEN | CONFIRMED_PROJECT_RULE | INFERRED
# PRD: 릴리즈 PRD (노란 박스 또는 역방향 복원)
# SCREEN: Figma 실제 화면에서 직접 확인
# CONFIRMED_PROJECT_RULE: SITEMAP/workflow 등 확정 문서
# INFERRED: 위 3종에서 논리적으로 유추. 자동화 금지.

precondition: |
  테스트 시작 전 시스템 상태를 서술한다.
  예: "로그인 상태. phase=OPEN. 지원서 1건 이상 존재."

action: |
  사용자가 실제 수행하는 행동을 서술한다.
  예: "GNB '지원하기' 클릭"

expected: |
  source에서 직접 도출되는 결과만 작성한다.
  source에 없는 결과를 추가하지 않는다.
  예: "A-01 내 지원서 리스트 화면으로 이동한다."

automationCandidate: true | false | partial
# 아래 판정 기준 참조

confidence: HIGH | MEDIUM | LOW
# HIGH: 서로 다른 화면/버전에서 반복 확인된 규칙
# MEDIUM: 복수 사례 또는 강한 구조적 근거
# LOW: 단일 사례 또는 해석이 필요한 유추

notes: |
  선택 필드. 아래 경우에 반드시 작성:
  - automationCandidate: false → 사람 확인 포인트 명시
  - automationCandidate: partial → 자동/수동 구분 명시
  - sourceType: INFERRED → 유추 근거 명시
  - 재현이 필요한 케이스 → "재현 필요: <조건>"
  - 사용자 확인이 필요한 항목 → "OPEN_QUESTION: <질문>"
```

---

## 카테고리 정의

### FUNCTIONAL
버튼, navigation, submit, save, modal, form behavior 등
예: 저장 버튼 클릭 시 API 호출, 모달 열기/닫기, 다음 지원서 이동

### STATE
상태별 UI와 전이
예: DRAFT→SUBMITTED 전이 트리거, 각 상태별 배지·CTA·부가표시

### VALIDATION
입력 제한, 빈 상태, 에러, loading, 마감, 권한 예외 등
예: 최솟값 미만 입력 차단, 빈 상태 메시지, 서버 오류 UI

### DATA
정렬, 날짜/시간, 점수, status label, count, 계산 정확성 등
예: 항목별 평균 계산, 상대시간 표기, 정렬 기준 일관성

### VISUAL
화면 깨짐, 정보 위계, 긴 텍스트, 밀도, 기존 화면과의 일관성 등
이 카테고리는 automationCandidate: false가 기본이다.
사람이 확인한다.

### PERMISSION
권한별 접근 허용·차단
이 프로젝트의 확정 모델에 근거가 있을 때만 추가한다.
예: 비로그인 접근 차단, 심사자 권한 없이 심사 기능 접근, 관리자 전용 J 시리즈 접근

---

## Automation Candidate 판정 기준

### `true` — DOM/state로 명확히 검증 가능
- 페이지 이동 / 리다이렉트
- 버튼 노출·비노출 / enabled·disabled
- modal open·close
- validation message 노출
- status badge text / label
- table 정렬 순서
- loading · error · empty state UI 노출
- 권한별 route 접근 허용·차단

### `partial` — 자동 검증 + 사람 확인이 함께 필요
- 긴 텍스트 overflow 없음 (존재 여부 = 자동, 시각 확인 = 사람)
- 특정 viewport에서 레이아웃 정상 (존재 여부 = 자동, 깨짐 여부 = 사람)

### `false` — 사람의 판단이 필요
- 정보 위계, 문구 어색함, 디자인 일관성
- dense screen의 밀도 적절성
- 실제 데이터에서의 체감
- `sourceType: INFERRED`인 모든 케이스
- VISUAL category 전체

---

## Confidence 기준

| 값 | 기준 |
|---|---|
| HIGH | 서로 다른 화면/버전에서 반복적으로 확인된 규칙. PRD에 명시적. |
| MEDIUM | 복수 사례 또는 강한 구조적 근거. PRD에서 유추 가능. |
| LOW | 단일 사례 또는 해석이 필요. INFERRED와 함께 사용. |

---

## 예시 케이스

```yaml
- id: QA-V3-A01-003
  release: v3
  screen: "A-01 내 지원서 리스트"
  category: FUNCTIONAL
  source: "v3 PRD / A-01 / 1.1 진입 조건"
  sourceType: PRD
  precondition: |
    로그인 상태.
    phase ≠ OPEN.
    /apply URL 직접 접근 시도.
  action: |
    브라우저 주소창에 /apply URL 직접 입력 후 엔터.
  expected: |
    마이페이지 > 내 지원 현황으로 리다이렉트된다.
  automationCandidate: true
  confidence: HIGH
  notes: ""

- id: QA-V5-A32-007
  release: v5
  screen: "A-32 최종 심사 제출 패키지"
  category: STATE
  source: "v5 PRD / A-32 / 6. 정렬·버튼 규칙 / 하단 제출 버튼 상태값"
  sourceType: PRD
  precondition: |
    로그인 상태.
    4종 구성요소 모두 완료.
    최초 제출 완료 후 임의 항목 수정함.
  action: |
    A-32 화면 진입.
  expected: |
    하단 액션바의 제출 버튼 라벨이 "변경사항 다시 제출하기 →"로 표시된다.
    버튼이 활성(Red primary) 상태이다.
  automationCandidate: true
  confidence: HIGH
  notes: ""

- id: QA-V5-A30-012
  release: v5
  screen: "A-30 내 지원 현황"
  category: VISUAL
  source: "v5 PRD / A-30 / 8. 레이아웃·인터랙션"
  sourceType: PRD
  precondition: |
    로그인 상태.
    본선 진행중 카드 1개 이상 존재.
  action: |
    A-30 화면 진입 후 상단 배너 확인.
  expected: |
    상단 안내 배너(연노랑, 시계 아이콘)가 표시된다.
    "10월 16일까지 제출을 완료해주세요." 문구가 포함된다.
  automationCandidate: partial
  confidence: HIGH
  notes: |
    배너 노출 여부 = 자동 검증 가능.
    배너 색상·아이콘 시각 확인 = 사람이 한다.
```

---

## State Coverage Matrix 형식

```markdown
## State Coverage — {화면ID} {화면명}

source: {PRD 위치}

| From | Event | To | Source | QA IDs |
|------|-------|----|--------|--------|
| (없음) | 1차 합격 발표 (관리자 액션) | 본선 진행중·작성중 | v5 PRD / A-30 / 4. 상태 머신 | QA-V5-A30-001 |
| 본선 진행중 | A-32에서 최초 제출 성공 | 제출완료 | v5 PRD / A-30 / 4. 상태 머신 | QA-V5-A30-002 |
```

---

## Permission Coverage Matrix 형식

```markdown
## Permission Coverage — {화면ID 또는 기능명}

source: SITEMAP §1 권한 관계

| 기능 | 일반 계정 | 일반 + 심사자 권한 | 관리자 계정 | QA IDs |
|------|----------|------------------|------------|--------|
| A-01 진입 | 허용 | 허용 | — | QA-V3-A01-001 |
| 사람 1차 심사 접근 | 차단 | 허용 | — | QA-V1-JUD-001 |
| J-01 AI 심사 접근 | 차단 | 차단 | 허용 | QA-V2-J01-001 |
```
