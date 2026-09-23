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

## S2. Draft / Submitted / Reviewing / Reviewed는 서로 다른 UI다
**Confidence: HIGH**

- Draft: 진행률 + 최종 수정 시각 + 이어 작성/편집
- Submitted: 제출일시 + 제출본 보기
- Reviewing: 심사 상태 + 필요한 경우 읽기 전용
- Reviewed: 결과 + 조회 action
- Submitted + changed: 제출 상태 + 수정사항 미반영 warning + 재제출 action

## S3. Progress 표현은 업무별로 달라진다
**Confidence: HIGH**

- 작성: current section / total
- 심사 queue: completed / total + remaining
- AI batch: completed / total + status breakdown
- final review: incomplete/missing count
- package: artifact readiness

하나의 generic progress pattern을 모든 화면에 강제하지 않는다.

## S4. Save와 Submit은 구분한다
**Confidence: HIGH**

Save는 작업을 보존한다.
Submit/Confirm은 workflow state를 전환한다.

명시적 final action이 존재하면 save/navigation의 side effect로 final submit을 발생시키지 않는다.

## S5. 제출 후 수정 가능 ≠ 자동 반영
**Confidence: HIGH**

수정 후 재제출이 필요한 workflow에서는 다음을 함께 이해할 수 있게 한다.

- 제출본 존재
- 이후 변경 존재
- 재제출 필요

## S6. 반복 심사에서는 다음 대상 이동 비용을 줄인다
**Confidence: HIGH**

- 현재 entity 선택 상태
- 전체 진행률
- 저장 후 다음 대상 이동
- 상태 변화의 즉시 이해 가능성

을 유지한다.

## S7. Finalization
**Confidence: HIGH**

Final submit/confirm 전에 다음을 확인 가능하게 한다.

- 누락 여부
- readiness
- 저장되지 않은 변경 여부
- submit consequence

제출 후 read-only가 요구되면 edit/save/submit UI를 제거 또는 비활성화하고 조회 상태를 유지한다.

## S8. Empty / Error
**Confidence: HIGH**

Empty:
- 현재 상태 설명
- 가능한 next action

Load failure:
- 오류 설명
- retry action

Incomplete finalization:
- 무엇이 누락됐는지
- 왜 submit할 수 없는지
- 어디에서 수정할 수 있는지

를 보여준다.

## S9. 색상만으로 상태를 전달하지 않는다
**Confidence: HIGH**

status color는 label/text/behavior와 함께 사용한다.