# Reusable Composition Patterns

## Pattern 1. KPI Summary + Data Table
**Confidence: HIGH**

### Intent
전체 운영 상태를 빠르게 파악한 뒤 상세 데이터를 관리/검토.

### Trigger
- aggregate metric + many same-schema entities
- sorting/filtering/export 필요

### Structure
1. Title / context selector
2. 업무 판단에 필요한 제한된 summary metric
3. Table toolbar
4. Dense table
5. Pagination

### Required
- summary metric
- detailed table
- status visibility

### Optional
- global selector
- export
- progress bar

### Anti-pattern
상세 entity 전체를 카드 grid로 바꾸지 않는다.

Evidence: AI 심사 대시보드.

---

## Pattern 2. Status-driven Entity Card
**Confidence: HIGH**

### Intent
한 entity의 현재 상태와 다음 행동을 한눈에 보여준다.

### Trigger
- entity별 workflow state가 다름
- user-specific work item
- 다음 행동이 상태에 따라 달라짐

### Structure
Top/primary:
- entity title
- primary workflow status badge

Supporting:
- team/category or supporting metadata
- timestamp
- progress/result if relevant
- secondary action-needed state if relevant

Bottom:
- status-dependent information
- next action on the opposite edge or clear local action area

### Variants
- DRAFT: progress + last modified + continue
- SUBMITTED: submit time + view
- REVIEWING: review status + read-only
- REVIEWED: result + view
- SUBMITTED + CHANGED_AFTER_SUBMIT: submitted 상태는 유지 + secondary warning + re-submit action

### Dual-state rule
완료/제출 같은 primary state와 "재제출 필요" 같은 secondary action-needed state가 동시에 존재할 수 있다.
secondary warning을 보여주기 위해 primary state를 다른 상태로 덮어쓰지 않는다.

### Anti-pattern
- 모든 상태에서 동일 CTA 유지
- `제출완료 + 변경 발생`을 단일 Red 상태로 단순화
- badge만 바꾸고 metadata/CTA는 이전 상태 그대로 유지

Evidence: 지원하기 A-01, 최종보고서 진입점.

---

## Pattern 3. Recruitable Entity Card
**Confidence: HIGH**

### Intent
팀/아이디어를 탐색하면서 여러 모집 포지션 중 지원.

### Trigger
entity 내부에 variable-length child actions가 존재.

### Structure
1. User-related status / category
2. Entity title
3. supporting summary
4. recruitment/availability metadata
5. child position list
6. position-level action

### Behavior
- available position first
- completed position later
- if child list grows, bounded list + internal scroll
- user-applied entity can rank before others

### Anti-pattern
포지션을 별도 unrelated cards로 흩뜨리지 않는다.

Evidence: 팀빌딩.

---

## Pattern 4. Persistent Step Form
**Confidence: HIGH**

### Intent
긴 multi-section form을 진행하면서 전체 위치를 잃지 않게 함.

### Trigger
여러 sequential section으로 구성되어 사용자가 현재 위치를 잃기 쉽고, step 간 진행·저장·재진입 맥락을 유지해야 하는 workflow.

### Structure
Left:
- workflow title/instruction
- step list
- state marker

Right:
- SECTION n / total
- section title
- form/content
- next/back

Final:
- review / package / submit

### Behavior
- resume 시 마지막 작업 위치 진입 가능
- completed/current/incomplete 구분
- final step의 submit은 explicit completion event

### Anti-pattern
각 section을 전혀 연결되지 않은 standalone page처럼 생성.

Evidence: 지원하기 8-step, 최종보고서 9-step.

---

## Pattern 5. Evaluation Workspace
**Confidence: HIGH**

### Intent
대상을 선택하고, 산출물을 보며, 바로 평가한다.

### Trigger
- high-frequency review
- context switching cost가 큼
- 여러 대상 연속 처리

### Core structure
- compact entity queue / navigation
- large primary artifact / document / source content
- scoring / summary / action UI

이 세 영역의 기능적 관계가 핵심이다.
panel 위치와 비율은 실제 closest screen을 따른다.

### Work loop
화면 구성보다 아래 반복 흐름을 끊지 않는 것이 우선이다.

**대상 선택 → source 확인 → 평가 입력 → 저장 → 다음 대상**

- 현재 선택 대상은 항상 식별 가능해야 한다.
- 저장 이후 다음 대상으로 이동하기 쉬워야 한다.
- evaluation UI가 bottom sheet / right panel / floating panel로 바뀌어도 source와 queue context를 잃지 않는다.
- 특정 local 영역 오류가 전체 loop를 불필요하게 중단시키지 않도록 한다.

### Persistent information
- current entity
- review progress
- score/result state
- next action

### Optional
- collapsible evaluation panel
- AI summary/supporting panel
- viewer controls

### Anti-pattern
- artifact를 새 탭/새 페이지로 보내고 scoring form만 남긴다.
- 평가 입력마다 queue/source context를 초기화한다.
- 심사 화면을 design token/component 검수용 inspector로 재해석한다.
- 근거 없이 고정 pane 비율을 만든다.

Evidence: 심사 페이지, 최종 심사, AI 심사 결과 상세.

---

## Pattern 6. Final Review Matrix
**Confidence: HIGH**

### Intent
최종 제출 전에 누락과 전체 점수를 한눈에 검토.

### Trigger
여러 entity/criteria의 completion 여부를 최종 확인.

### Structure
1. instruction
2. incomplete warning when needed
3. dense matrix/table
4. inline editable values if allowed
5. save
6. explicit final confirm/submit

### Variants
- incomplete
- 100% complete but unsubmitted
- submitted/read-only

### Anti-pattern
누락을 개별 상세 화면에 숨긴다.

Evidence: 1차 심사 최종 검토.

---

## Pattern 7. Package Readiness Grid
**Confidence: HIGH**

### Intent
서로 다른 형식의 산출물이 모두 준비되었는지 확인 후 일괄 제출.

### Trigger
report + file + URL + repository처럼 heterogeneous artifacts가 함께 필요.

### Structure
1. stage title/description
2. package status summary
3. artifact card/grid
4. warning/deadline
5. Final Action Region

정확한 column 수나 action bar 위치는 고정 규칙으로 만들지 않고 closest existing screen의 geometry를 따른다.

### Card content
- artifact label
- readiness/status
- artifact-specific input or view action

### Final Action Region
여러 artifact의 readiness와 workflow state를 종합해 최종 state transition을 실행하는 영역이다.

가능한 state:
- incomplete → submit disabled
- ready → submit enabled
- submitted unchanged → submitted/read-only
- submitted + changed → re-submit action
- deadline passed → locked/disabled

Final Action Region은 반드시 fixed bottom bar일 필요는 없다.
다만 개별 artifact action과 전체 package submit/re-submit action은 시각적으로 구분한다.

### State
submitted → changed → re-submit required를 별도 표시.

Evidence: 최종보고서 SECTION 9.

---

## Pattern 8. Announcement Hero + Follow-up Action
**Confidence: HIGH**

### Intent
중요 결과/축하를 감정적으로 전달하고 다음 참여 행동으로 연결.

### Trigger
합격 발표, 결과 발표 등 campaign moment.

### Structure
1. dark/visual hero
2. result message
3. selected/highlight entity preview
4. next-event explanation
5. countdown
6. clear next CTA

### Anti-pattern
이벤트 styling을 일반 dashboard/form에 재사용.

Evidence: 하반기 해커톤 1차 심사 합격 발표.

---

## Pattern 9. Read-only Article Detail
**Confidence: MEDIUM**

### Intent
운영 공지/가이드를 읽는 데 집중.

### Structure
1. breadcrumb/context
2. category/date/view metadata
3. title
4. long-form body
5. footer/return navigation

### Rules
- body를 좁은 reading column으로 유지
- content 자체의 heading/list hierarchy를 살림
- 카드 중첩 최소화

Evidence: 공지 상세.
