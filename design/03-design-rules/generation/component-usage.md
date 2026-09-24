# Component Usage Rules

## C1. Card vs Table
**Confidence: HIGH**

### Use Card when
- 항목이 독립적인 entity/task다.
- 항목별 상태와 action이 다르다.
- 정보 종류가 heterogeneous하다.
- 하나씩 탐색/선택하는 행동이 중심이다.
- KPI처럼 하나의 summary 의미 단위다.

Examples:
팀빌딩 팀 카드, 현재 진행 중인 지원 현황 카드, dashboard KPI, 제출 package artifact.

### Use Table when
- 동일 schema의 행이 많다.
- 여러 행의 값을 비교해야 한다.
- 정렬/필터가 중요하다.
- 운영자가 많은 항목을 빠르게 scan한다.
- inline edit/review가 중요하다.
- 동일 사용자의 여러 회차/과거 기록처럼 history를 비교·조회하는 목적이 중심이다.

Examples:
AI 심사 지원서 목록, 마이페이지 통합 지원 현황, 심사 최종 검토.

### Same user/domain에서도 목적에 따라 달라진다

개인 데이터라는 이유만으로 항상 Card를 쓰지 않는다.

- **현재 active workflow + next action 중심** → Card / status list
- **여러 회차·과거 이력 + 동일 schema 비교 중심** → Table
- **한 건의 산출물을 보며 평가** → Evaluation Workspace

### Anti-rule
"정보가 많다" 또는 "개인 화면이다"라는 이유만으로 Card로 분리하지 않는다.

---

## C2. Status Badge / Tag
**Confidence: HIGH**

Badge는 상태나 category처럼 짧고 반복되는 값을 compact하게 표현한다.

상태 변화는 badge만 바꾸지 않고 관련 CTA/metadata도 함께 바꾼다.

Observed semantic roles:
- Red: active / action needed / primary emphasis
- Green: completed / submitted
- Purple: reviewing / in progress review
- Gray: neutral / inactive / closed
- Blue: secondary informational/editing cue in 일부 상태

정확한 color token은 기존 system token을 사용한다.

완료 상태와 후속 행동 필요 상태가 동시에 존재할 수 있다.
예: Green `제출완료` + Red `재제출 필요`.
이 경우 하나의 badge 색으로 전체 상태를 단순화하지 않는다.

---

## C3. Primary Button
**Confidence: HIGH**

Filled Red는 해당 local task scope에서 가장 중요한 즉시 실행 action에 사용한다.

Examples:
- 지원하기
- 다음
- 저장/제출 계열의 주요 action
- final submit

### Rule
IF 하나의 card/section에 여러 action이 있다  
THEN 가장 중요한 action만 strongest treatment를 사용하고 나머지는 outline/text/link hierarchy로 낮춘다.

### Caution
페이지 전체에 primary-looking Red button을 무차별 반복하지 않는다.
단, card grid에서 각 card가 독립 task scope인 경우 card별 primary action은 가능하다.

---

## C4. Text/Link Navigation Action
**Confidence: HIGH**

"보기 →", "상세 →", breadcrumb 성격의 이동은
filled primary button보다 낮은 강조의 link/action을 우선한다.

읽기/상세 이동과 상태 변경 action의 시각적 강도를 동일하게 만들지 않는다.

---

## C5. Banner / Notice
**Confidence: HIGH**

화면 전체 또는 phase 전체에 영향을 주는 정보에 사용한다.

Examples:
- 제출 마감
- 수정/재제출 정책
- 누락 경고
- AI 요약 참고용 안내

### Do
- content 영역 상단 또는 관련 workflow 단계 바로 위
- warning severity에 따라 semantic color

### Do not
단일 field 설명을 page-wide banner로 승격하지 않는다.

---

## C6. Progress Indicator
**Confidence: HIGH**

진행률이 실제 사용자의 다음 행동에 영향을 줄 때 사용한다.

Examples:
- N/8 작성 진행률
- N/12 심사 진행률
- AI 심사 완료 N/전체
- percentage/progress bar

### Rule
가능하면 numeric value와 visual progress를 함께 제공한다.
단순 장식용 progress bar는 사용하지 않는다.

---

## C7. Sidebar / Queue List
**Confidence: HIGH**

Evaluation workspace에서 현재 대상 전환과 상태 scan을 위한 compact navigation으로 사용한다.

Sidebar row에는 전체 상세 정보를 넣지 않는다.
선택에 필요한 식별자, 상태, 핵심 점수/메타만 유지한다.

---

## C8. Modal
**Confidence: MEDIUM**

Modal은 main flow를 떠날 필요가 없는 bounded secondary task에 사용한다.

Observed examples:
- 지원서/아이디어 보기
- 팀빌딩 설정
- 사용자 추가/설정성 작업
- 확인/경고

### Use when
- task가 짧다.
- 완료 후 원래 context로 즉시 돌아와야 한다.
- 별도 URL/page가 필요하지 않다.

### Avoid when
- 긴 form
- 다단계 workflow
- 많은 비교/탐색이 필요한 업무

---

## C9. Tabs
**Confidence: MEDIUM**

같은 entity/context 안에서 peer-level mode를 전환할 때 사용한다.

Examples:
- 마이페이지의 여러 관리 영역
- 심사 상세의 지원서 심사 / 산출물 심사

Tabs를 순차 step navigation의 대체로 사용하지 않는다.

---

## C10. Empty State
**Confidence: HIGH**

Empty state는 현재 상태를 설명하고,
사용자가 실행 가능한 다음 행동이 있을 때 CTA를 함께 제공한다.

Examples:
- 지원서 없음 → 지원서 작성
- 모집 중 팀 없음 → 상태 안내

빈 화면만 보여주지 않는다.
실행 가능한 다음 행동이 없는 경우에는 상태 설명만 명확히 제공하고 억지 CTA를 만들지 않는다.

---

## C11. Internal Scroll Area
**Confidence: MEDIUM**

Card 내부 variable list의 최대 높이를 안정화하거나
workspace에서 pane별 context를 유지하기 위해 제한적으로 사용한다.

스크롤바 visibility 등 인터랙션 상세는 기존 component behavior를 우선한다.

---

## C12. Footer
**Confidence: MEDIUM**

일반 public/service page에서는 dark footer가 반복된다.
고밀도 workspace에서는 footer보다 작업 공간이 우선될 수 있으므로
모든 내부 업무 화면에서 강제하지 않는다.

---

## C13. Loading / Error Feedback
**Confidence: HIGH**

Loading/Error UI는 실패 범위와 같은 scope에 둔다.

- page 전체 load 실패 → page-level error
- document/pane/card만 실패 → 해당 local 영역 error
- save/submit 실패 → 입력 context를 유지한 toast 또는 local feedback
- retry가 가능한 경우 retry action 제공

Local failure 하나 때문에 정상적으로 사용할 수 있는 queue/navigation/주변 정보를 모두 error state로 치환하지 않는다.
