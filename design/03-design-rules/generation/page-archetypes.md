# Page Archetypes

아래 archetype은 **화면 목적을 분류하고 판단을 돕는 모델**이지 고정 템플릿이 아니다.

먼저 사용자 / task / desired outcome을 정의한다.
기존 archetype 하나가 충분히 설명하면 primary archetype으로 사용한다.
둘 이상의 성격이 필요하면 주요 사용자 목표를 primary로 두고 supporting pattern을 조합한다.
기존 archetype에 맞지 않는 새로운 task를 억지로 끼워 맞추지 않는다.
그 경우 `novel-screen-reasoning.md`에 따라 Candidate Pattern을 만든다.

## A1. Editorial / Information
**Confidence: HIGH**

### Use when
- 공지사항 목록/상세
- FAQ
- 정적인 안내/정책 설명

### Structure
1. Global navigation
2. Page title + short description
3. Main reading/list area
4. Optional pagination / supporting action
5. Footer

### Density
Low ~ Medium

### Rules
- 중앙 정렬 content column을 사용한다.
- 긴 문장은 충분한 line length와 여백을 확보한다.
- 장식 Card보다 typography와 divider로 구조를 표현한다.
- 목록은 동일 schema 비교가 필요하면 간결한 table/list를 사용한다.

### Avoid
- 대시보드형 KPI 카드 남발
- 넓은 workspace layout

Evidence: 공지사항, 공지 상세, FAQ.

---

## A2. Campaign / Celebration
**Confidence: HIGH**

### Use when
- 합격 발표
- 결과 발표
- 행사 milestone을 감정적으로 전달해야 하는 페이지

### Structure
1. Strong hero / announcement
2. 핵심 결과 또는 축하 메시지
3. 관련 entity preview 또는 다음 행동
4. 일정/카운트다운/후속 안내
5. Footer

### Density
Low ~ Medium

### Rules
- 일반 functional page보다 큰 typography와 강한 visual treatment 허용.
- dark/gold 계열 등 이벤트용 visual mode를 사용할 수 있다.
- 아래에 실제 서비스 행동으로 연결되는 CTA를 명확하게 둔다.
- 이벤트 표현은 페이지 전체 목적이 celebration일 때만 사용한다.

Evidence: 하반기 해커톤 1차 심사 합격 발표.

---

## A3. Entity Browse / Selection
**Confidence: HIGH**

### Use when
- 사용자가 여러 팀/아이디어/모집 항목 중 하나를 탐색하고 선택/지원하는 화면

### Structure
1. Page title + rule/period notice
2. Summary strip (count, deadline, countdown)
3. Entity card grid
4. Each card: identity → summary → status → available sub-items/actions

### Density
Medium

### Rules
- 독립적 action을 가진 entity는 Card 사용.
- 카드 높이가 가변 데이터 때문에 지나치게 흔들리지 않도록 bounded sub-list를 사용 가능.
- 사용자가 이미 참여한/지원한 entity를 정렬 우선순위로 올릴 수 있다.
- closed/completed entity는 action을 명확히 비활성화한다.

Evidence: 팀빌딩.

---

## A4. Personal Status / Work Hub
**Confidence: HIGH**

### Use when
- 내 지원 현황
- 여러 application/report의 상태와 다음 행동을 확인하는 화면

### Structure
1. Context title
2. Phase/deadline banner
3. Entity status list/cards
4. 각 entity의 상태, 시간, 진행률, next action
5. Create-new action when allowed

### Density
Medium

### Rules
- entity마다 현재 상태와 next action을 한 덩어리로 보여준다.
- 상태에 따라 CTA가 달라진다.
- 진행 중인 항목은 progress와 last modified를 함께 보여준다.
- 완료 항목은 submitted timestamp와 read-only/view action을 우선한다.

Evidence: 지원하기 A-01, 최종보고서 진입점.

---

## A5. Step Workflow / Form
**Confidence: HIGH**

### Use when
- 8개/9개 section처럼 긴 작성 업무
- 단계 간 진행 구조를 잃으면 안 되는 폼

### Structure
1. Global navigation
2. Persistent step navigation
3. Current section header
4. Form/content workspace
5. Local next/back action
6. Final step에서 review/submit

### Density
Medium

### Rules
- 왼쪽 step navigation과 오른쪽 current workspace를 유지한다.
- step 상태(완료/현재/미완료)를 계속 노출한다.
- "SECTION n / total" 등 현재 위치를 본문에서도 재확인시킨다.
- 마지막 단계는 일반 입력 step이 아니라 review/finalization 성격을 가진다.

Evidence: 지원하기, 최종보고서 제출.

---

## A6. Operational Dashboard
**Confidence: HIGH**

### Use when
- 전체 운영 현황과 다수 entity를 함께 관리/확인
- KPI와 상세 목록이 모두 필요

### Structure
1. Page title + global context selector
2. Summary KPI cards
3. Detailed data table
4. Filter/sort/export actions near the table

### Density
High

### Rules
- KPI는 상단에서 제한된 수의 summary card로 압축한다.
- 상세 entity는 table로 제공한다.
- table을 card grid로 치환하지 않는다.
- filter/sort/export는 데이터 영역과 시각적으로 붙여둔다.
- 페이지 너비를 적극 사용한다.

Evidence: AI 심사 대시보드.

---

## A7. Evaluation Workspace
**Confidence: HIGH**

### Use when
- 한 entity의 산출물을 보면서 동시에 평가/입력
- 여러 entity를 순차적으로 처리

### Structure
핵심은 다음 작업 맥락을 한 흐름 안에서 유지하는 것이다.

1. entity queue / navigation
2. primary artifact / source content
3. evaluation / summary / action
4. persistent progress and next-item action

실제 화면에 따라 evaluation UI는 right panel, floating control, bottom sheet 등으로 달라질 수 있다.
고정된 pane 개수나 비율을 규칙으로 만들지 않는다.

### Density
Very High

### Rules
- 평가 근거와 입력 UI를 불필요하게 다른 페이지로 분리하지 않는다.
- primary artifact/source가 중심이면 가장 큰 공간을 배정한다.
- queue/list는 현재 대상과 상태를 빠르게 scan할 정도로 compact하게 유지한다.
- evaluation/action UI는 작업 중 쉽게 접근 가능하게 한다.
- exact pane ratio는 closest existing screen의 geometry를 따른다.
- 해커톤 심사 화면을 token/component QA용 REVIEW-INSPECTOR로 재해석하지 않는다.

Evidence: 1차 심사, 최종 심사, AI 심사 결과 상세.

---

## A8. Final Review / Finalization
**Confidence: HIGH**

### Use when
- 여러 작업 결과를 마지막으로 검토하고 확정/제출
- 누락 여부를 한 번에 찾아야 함

### Structure
1. Final-review title/instruction
2. Warning or incomplete-state summary
3. Dense comparison/edit table or readiness summary
4. Save
5. Final confirm/submit action

### Density
High

### Rules
- 누락 항목을 감추지 않는다.
- final action 전에 전체 상태를 한 화면에서 검토 가능하게 한다.
- editable review라면 inline edit를 우선한다.
- final action은 draft save와 명확히 구분한다.

Evidence: 1차 심사 최종 검토, 최종 패키지 제출.

---

## A9. Submission Package / Readiness
**Confidence: MEDIUM**

### Use when
- 서로 다른 산출물 여러 개가 모두 준비되어야 최종 제출 가능

### Structure
1. Final stage header
2. Package readiness summary
3. Artifact cards/grid
4. Deadline/warning
5. Action bar with explicit submit/re-submit

### Density
Medium ~ High

### Rules
- 각 artifact의 준비 여부를 개별적으로 보여준다.
- missing/changed item은 전체 package 상태와 연결해 표시한다.
- final submit은 모든 artifact 상태 확인 이후의 별도 action으로 둔다.

Evidence: 최종보고서 SECTION 9/9.