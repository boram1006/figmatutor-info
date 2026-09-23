# Layout Rules

## L1. 먼저 page mode를 선택한 뒤 layout을 정한다
**Confidence: HIGH**

### Read/Browse mode
- 중앙 정렬
- 제한된 main content width
- 넓은 외부 여백

### Work/Operate mode
- viewport width 적극 사용
- task pane/list/table에 공간 배분
- page-level 장식 최소화

---

## L2. Global navigation은 기능 화면의 안정된 상단 기준선이다
**Confidence: HIGH**

대부분의 서비스 화면은 동일한 얇은 top navigation shell을 유지한다.
새 기능 화면도 특별한 이유가 없으면 이 shell을 유지한다.

Campaign/celebration 화면도 navigation은 서비스 shell과 연결된다.

---

## L3. 일반 정보 페이지는 title → description → content 순서를 따른다
**Confidence: HIGH**

공지/FAQ/팀빌딩 등은 페이지 상단에서:
1. title
2. 짧은 context/description
3. 필요 시 중요 안내
4. main content

순으로 진입한다.

큰 dashboard control을 title보다 먼저 두지 않는다.

---

## L4. Dashboard는 summary → detail 순서다
**Confidence: HIGH**

IF 전체 현황과 개별 데이터가 모두 필요하다  
THEN 상단 summary KPI → 하단 detailed table 순서를 사용한다.

Summary는 전체 흐름을 빠르게 파악할 정도로 제한하고,
실제 운영 데이터는 table에 남긴다.

Evidence: AI 심사 대시보드.

---

## L5. 긴 form은 persistent left navigation + right workspace
**Confidence: HIGH**

IF form이 여러 section으로 구성되고 사용자가 현재 위치를 잃을 수 있다  
THEN 2-column shell을 우선한다.

Left:
- step list
- completed/current/incomplete state
- 전체 흐름

Right:
- current section title
- current form/content
- local next/back action

Navigation과 본문을 별도 페이지로 분리하지 않는다.

Evidence: 지원하기, 최종보고서.

---

## L6. Evaluation workspace는 list → content → evaluation 순으로 공간을 배분한다
**Confidence: HIGH**

### Preferred spatial hierarchy
- Left: entity queue / navigation
- Center: artifact/document/main content
- Right: score/summary/action

Center가 가장 넓다.

IF right evaluation pane이 접힐 수 있어도,
현재 대상/진행률/주요 action 접근성은 유지한다.

Evidence: 심사 페이지, 최종 심사.

---

## L7. 독립 entity browse는 grid, 상태 작업 목록은 vertical list/card를 우선한다
**Confidence: HIGH**

### Grid
서로 독립된 여러 entity를 탐색하고 선택하는 경우.
예: 팀빌딩 모집 팀.

### Vertical list/card
같은 사용자의 진행 중 업무를 상태 순서로 확인하는 경우.
예: 내 지원 현황.

Grid를 모든 카드형 데이터의 기본값으로 사용하지 않는다.

---

## L8. Table control은 table에 붙인다
**Confidence: HIGH**

Sort/filter/export/pagination은 page header가 아니라
해당 table의 header/toolbar 주변에 둔다.

사용자가 "이 control이 어떤 데이터에 적용되는지" 즉시 이해할 수 있어야 한다.

---

## L9. Phase/deadline 안내는 main entity list보다 위에 둔다
**Confidence: HIGH**

IF 화면 전체의 행동 가능 여부에 영향을 주는 기간/마감/phase 정보가 있다  
THEN list/card보다 먼저 banner 또는 notice로 보여준다.

Evidence: 지원하기, 최종보고서, 팀빌딩.

---

## L10. Bottom action bar는 finalization에 사용한다
**Confidence: MEDIUM**

여러 준비 항목을 검토한 뒤 전체를 제출/재제출하는 화면에서는
하단에 전체 package/action scope의 버튼을 둔다.

개별 카드 action과 final package action을 같은 위치/강도로 섞지 않는다.

Evidence: 최종 패키지 제출.

---

## L11. Content width는 기존 token/system 값을 사용한다
**Confidence: HIGH**

이 문서에서 새로운 px width를 발명하지 않는다.

- exact max-width
- sidebar width
- panel width
- grid gap

은 기존 token, extracted screen geometry, component constraints를 우선한다.

이 규칙 문서는 **폭의 목적과 관계**만 정의한다.

---

## L12. Component 선택은 속성 개수가 아니라 작업 방식으로 결정한다
**Confidence: HIGH**

같은 domain entity도 사용 목적에 따라 표현이 달라진다.

- 개인 지원서 상태 확인 → status card/list
- 관리자 다수 지원서 비교 → table
- 심사위원 한 지원서 평가 → evaluation workspace

entity type 또는 attribute count만으로 component를 고르지 않는다.

---

## L13. Evaluation workspace에 고정 pane 비율을 강제하지 않는다
**Confidence: HIGH**

queue / artifact / evaluation의 역할은 유지하되 exact width와 비율은 closest existing screen의 geometry와 primary task 중요도를 따른다.