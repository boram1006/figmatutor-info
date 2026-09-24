# State & Interaction Rules

## S1. 상태는 CTA와 편집 가능 여부를 결정한다
**Confidence: HIGH**

각 workflow entity는 state label뿐 아니라 다음을 함께 정의한다.

- supporting metadata
- editable / read-only mode
- progress or result
- primary next action
- warning/follow-up action if needed

CTA를 상태와 분리해서 설계하지 않는다.

### Primary state와 action-needed state는 분리될 수 있다

하나의 entity가 동시에 두 의미를 가질 수 있다.

- **Primary workflow state**: 현재 업무 상태 자체
  - 예: 제출완료, 심사중, 심사완료
- **Secondary action-needed state**: 현재 상태는 유지되지만 추가 행동이 필요한 상태
  - 예: 제출완료 + 수정사항 미반영 → 재제출 필요

이 경우 primary state를 다른 상태로 덮어쓰지 않는다.
예: `SUBMITTED + CHANGED_AFTER_SUBMIT`은 단순히 `ERROR`나 `DRAFT`로 바꾸지 않는다.

UI는 다음을 함께 보여줄 수 있어야 한다.

- 현재 확정 상태
- 이후 발생한 변경/경고
- 필요한 후속 action
- 후속 action이 완료되면 돌아갈 상태

---

## S2. Draft / Submitted / Reviewing / Reviewed는 서로 다른 UI다
**Confidence: HIGH**

- Draft: 진행률 + 최종 수정 시각 + 이어 작성/편집
- Submitted: 제출일시 + 제출본 보기
- Reviewing: 심사 상태 + 필요한 경우 읽기 전용
- Reviewed: 결과 + 조회 action
- Submitted + changed: 제출 상태 + 수정사항 미반영 warning + 재제출 action

---

## S3. Progress 표현은 업무별로 달라진다
**Confidence: HIGH**

- 작성: current section / total
- 심사 queue: completed / total + remaining
- AI batch: completed / total + status breakdown
- final review: incomplete/missing count
- package: artifact readiness

하나의 generic progress pattern을 모든 화면에 강제하지 않는다.

---

## S4. Save와 Submit은 구분한다
**Confidence: HIGH**

Save는 작업을 보존한다.
Submit/Confirm은 workflow state를 전환한다.

명시적 final action이 존재하면 save/navigation의 side effect로 final submit을 발생시키지 않는다.

---

## S5. 제출 후 수정 가능 ≠ 자동 반영
**Confidence: HIGH**

수정 후 재제출이 필요한 workflow에서는 다음을 함께 이해할 수 있게 한다.

- 제출본 존재
- 이후 변경 존재
- 재제출 필요

---

## S6. 반복 심사에서는 다음 대상 이동 비용을 줄인다
**Confidence: HIGH**

- 현재 entity 선택 상태
- 전체 진행률
- 저장 후 다음 대상 이동
- 상태 변화의 즉시 이해 가능성

을 유지한다.

반복 심사의 핵심은 특정 pane 구성이 아니라 아래 work loop의 연속성이다.

**대상 선택 → 근거/산출물 확인 → 평가 입력 → 저장 → 다음 대상**

레이아웃을 변경하더라도 이 흐름에서 불필요한 페이지 이동이나 context reset을 만들지 않는다.

---

## S7. Finalization
**Confidence: HIGH**

Final submit/confirm 전에 다음을 확인 가능하게 한다.

- 누락 여부
- readiness
- 저장되지 않은 변경 여부
- submit consequence

제출 후 read-only가 요구되면 edit/save/submit UI를 제거 또는 비활성화하고 조회 상태를 유지한다.

Final action은 반드시 화면 하단의 고정 bar일 필요는 없다.
중요한 것은 여러 준비 상태를 종합한 뒤 state transition을 실행하는 **Final Action Region**이 명확히 구분되는 것이다.

---

## S8. Loading / Empty / Error는 범위를 구분한다
**Confidence: HIGH**

### Loading
- 전체 화면 데이터를 기다리는 경우: page-level skeleton 또는 기존 layout을 유지한 loading state
- 특정 pane/card/document만 기다리는 경우: 해당 local 영역에서 loading 처리
- loading 때문에 이미 확보된 주변 context를 불필요하게 제거하지 않는다.

### Empty
- 현재 상태 설명
- 가능한 next action
- 생성/지원/작성처럼 실행 가능한 행동이 없으면 억지 CTA를 만들지 않는다.

### Page-level failure
- 화면의 핵심 데이터 전체를 사용할 수 없는 경우
- 오류 설명
- retry action
- 필요 시 안전한 상위 경로/home 이동

### Local failure
- document viewer, score panel, list 등 특정 영역만 실패한 경우
- 전체 workspace를 error page로 바꾸지 않는다.
- 실패한 영역 안에서 오류 설명 + retry를 제공하고 가능한 주변 context는 유지한다.

### Action failure
저장/제출처럼 사용자의 action이 실패한 경우:
- 기존 입력/작업 context를 유지한다.
- toast 또는 local feedback으로 실패를 알린다.
- 재시도 방법을 제공한다.
- 성공하지 않은 action을 성공 상태로 표시하지 않는다.

### Incomplete finalization
- 무엇이 누락됐는지
- 왜 submit할 수 없는지
- 어디에서 수정할 수 있는지

를 보여준다.

---

## S9. 색상만으로 상태를 전달하지 않는다
**Confidence: HIGH**

status color는 label/text/behavior와 함께 사용한다.
