# Variations & Exceptions

## E1. Celebration page는 functional visual rules의 예외
**Confidence: HIGH**

일반적으로 light functional UI를 쓰지만,
합격/결과 발표는 dark + gold/yellow + decorative image를 사용할 수 있다.

조건:
- 페이지의 핵심 목표가 작업 수행이 아니라 announcement/celebration일 것.

---

## E2. 같은 entity라도 interaction 목적에 따라 Card/Table이 바뀔 수 있다
**Confidence: HIGH**

지원서라는 동일한 domain entity도:
- 개인의 현재 상태와 next action 확인 → status card
- 관리자/심사자가 다수 지원서 비교 → table/list
- 한 건을 평가 → workspace

즉 domain object만 보고 component를 고르지 않는다.
**사용자의 작업 방식**을 먼저 본다.

---

## E3. 동일한 progress라도 표현 목적이 다르다
**Confidence: HIGH**

- 작성 progress: N/8 + progress bar
- 심사 queue progress: N/12 + remaining count
- system batch progress: 완료 N/전체 + 상태별 count
- final review: missing count / completion state

progress component를 단순 재사용하되,
표시해야 할 supporting information은 업무에 맞게 바꾼다.

---

## E4. Final step은 ordinary step과 다르다
**Confidence: HIGH**

multi-step workflow의 마지막 단계가 최종 제출인 경우,
이전 section과 동일한 form layout만 복사하지 않는다.

Final step은:
- 전체 readiness
- 누락/경고
- 제출 대상
- explicit final action

을 강조한다.

---

## E5. Submitted 후에도 수정 가능한 workflow
**Confidence: HIGH**

제출 이후 수정이 가능하더라도 자동 반영으로 간주하지 않는다.

UI는:
- 현재 제출본이 존재함
- 수정사항이 있음
- 재제출 필요

를 동시에 표현할 수 있어야 한다.

---

## E6. 내부 scroll은 bounded child list에 제한
**Confidence: MEDIUM**

팀빌딩 카드의 포지션 목록처럼
상위 구조의 높이를 안정화해야 할 때 내부 scroll이 허용된다.

읽기 콘텐츠 전체를 작은 내부 scroll container에 넣는 것은 근거가 없다.

---

## E7. Modal은 supporting task에만
**Confidence: MEDIUM**

아이디어 보기/설정/짧은 관리 작업은 modal이 가능하지만,
긴 작성/심사 workflow 전체를 modal로 만들지 않는다.

---

## E8. Error/empty는 각 화면의 기본 layout을 깨지 않는 범위에서 단순화
**Confidence: MEDIUM**

데이터 없음/로드 실패 시에는 main content 대신 중앙 또는 local empty/error state를 사용한다.
기존 navigation/context는 유지한다.

---

## E9. Workspaces may omit public-page rhythm
**Confidence: MEDIUM**

심사/관리 workspace는 일반 public page의 큰 header spacing, footer rhythm보다
업무 공간 확보를 우선할 수 있다.

따라서 public shell의 모든 vertical spacing을 workspace에 강제하지 않는다.