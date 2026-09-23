# Density Rules

## D0. 밀도는 미적 선호가 아니라 업무 특성으로 결정한다
**Confidence: HIGH**

다음 질문으로 density를 먼저 정한다.

1. 사용자가 동시에 몇 개의 정보를 비교해야 하는가?
2. 같은 작업을 여러 entity에 반복하는가?
3. 다른 자료를 계속 참조하면서 입력해야 하는가?
4. 한 viewport에서 상태 차이를 빠르게 찾아야 하는가?
5. 콘텐츠 자체를 읽는 것이 주목적인가?

---

## D1. Low Density — Read / Celebrate
**Confidence: HIGH**

### Trigger
- 메시지 전달, 공지 상세, celebration, campaign
- 한 번에 하나의 내용 흐름을 읽음

### Characteristics
- 넓은 vertical whitespace
- 큰 title/hero
- 제한된 content width
- 섹션 간 간격이 큼
- 장식 표현 허용

### Examples
공지 상세, 합격 발표.

---

## D2. Medium Density — Browse / Status
**Confidence: HIGH**

### Trigger
- 여러 entity를 탐색하지만 각 entity의 요약 정보와 action이 중요
- 현재 상태와 다음 행동 확인

### Characteristics
- card/list 단위 grouping
- 충분한 scanning gap
- 각 entity에 1차 정보 + 상태 + action 동시 노출
- section 간 여백은 유지하되 카드 내부는 기능적으로 압축

### Examples
팀빌딩, 내 지원 현황.

---

## D3. High Density — Operate / Compare
**Confidence: HIGH**

### Trigger
- 동일 schema의 많은 행 비교
- sorting/filtering
- 운영 현황 확인
- 누락/예외를 빠르게 찾아야 함

### Characteristics
- table 우선
- compact row/metadata
- 화면 폭 적극 사용
- controls를 데이터에 가깝게 배치
- 장식보다 상태 구분과 정렬을 우선

### Examples
AI 심사 대시보드, 최종 검토 table.

---

## D4. Very High Density — Continuous Evaluation Workspace
**Confidence: HIGH**

### Trigger
- entity queue + artifact + 평가 입력을 동시에 사용
- context switching 비용이 큼

### Characteristics
- multi-pane
- narrow supporting panes + wide primary pane
- persistent progress
- local scrolling 허용
- 대부분의 공간을 실제 업무 정보에 사용
- 불필요한 page-level hero/large whitespace 제거

### Examples
심사 페이지, 최종 심사.

---

## D5. 정보를 줄이지 말아야 하는 조건
**Confidence: HIGH**

다음 중 하나라도 해당하면 생성 모델이 임의로 정보를 숨기거나 단계화하지 않는다.

- 여러 항목을 옆/위아래로 비교해야 한다.
- 한 화면에서 누락 여부를 판단해야 한다.
- 같은 entity를 연속 처리해야 한다.
- 대상 자료와 입력 UI를 왕복해야 한다.
- 운영자가 전체 진행률과 예외 상태를 동시에 봐야 한다.

**Do not automatically**
- Card로 쪼개기
- "More" 뒤에 숨기기
- 별도 상세 페이지로 이동시키기
- Accordion으로 기본 collapse하기
- summary만 남기고 원데이터 제거하기

---

## D6. 내부 스크롤은 전체 구조를 안정화할 때만 사용한다
**Confidence: MEDIUM**

팀 카드처럼 variable-length sub-list 때문에 card 전체 높이가 크게 달라지는 경우,
bounded area + internal scroll을 사용할 수 있다.

원본 팀빌딩 정의에서는 포지션 목록이 최대 약 3.5개 보이는 고정 영역을 갖고
초과 시 내부 scroll을 사용한다.

**Rule**
IF 하위 반복 항목의 개수만 가변이고, 상위 카드들의 비교 가능성을 유지해야 한다  
THEN 하위 목록만 bounded scrolling을 고려한다.

전체 page를 작은 scroll box 여러 개로 분절하지 않는다.

---

## D7. 밀도 높은 화면에서도 hierarchy를 유지한다
**Confidence: HIGH**

High density ≠ 모든 간격을 최소화.

밀도가 높아질수록 다음을 더 명확히 유지한다.

- column alignment
- header/body distinction
- active row/selected entity
- status color
- local section title
- primary action
- separator/border

즉, whitespace의 양은 줄어도 구조적 구분은 약해지지 않는다.

---

## D8. 보편적인 숫자 임계값을 발명하지 않는다
**Confidence: HIGH**

PRD / Design System / 실제 geometry에 명시되어 있지 않다면 다음과 같은 규칙을 만들지 않는다.

- `속성 4개 이상 → Table`
- `속성 2~4개 → Card`
- `Card당 action 최대 N개`
- `좌/우 panel 35:65`
- archetype별 고정 row height

대신 행동 기준으로 판단한다.

- 동일 schema의 다수 항목 비교 → Table
- 독립적인 상태/action을 가진 entity → Card
- source를 보며 반복 평가 → Evaluation Workspace

정확한 수치는 기존 token/component/extracted geometry를 사용한다.