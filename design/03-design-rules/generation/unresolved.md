# Unresolved / Do Not Invent

아래 항목은 제공된 화면만으로 서비스 전체 규칙이라고 확정하기 어렵다.
새 화면 생성 시 임의의 값/규칙을 만들지 말고 기존 token/component/nearest screen을 참조한다.

## U1. Exact spacing scale
PDF에서 시각적 리듬은 확인되지만 exact px spacing system은 이 문서에서 확정하지 않는다.
`tokens.json` 또는 추출된 geometry를 사용한다.

## U2. Exact max-width / grid width
읽기 화면과 workspace의 폭 전략 차이는 명확하지만,
정확한 px max-width를 새로 정의하지 않는다.

## U3. Responsive / mobile behavior
제공 화면은 desktop 중심이다.
mobile breakpoint, stacking order, mobile navigation을 이 규칙에서 발명하지 않는다.

## U4. Sticky behavior
step navigation이나 evaluation panel이 시각적으로 persistent한 것은 확인되지만,
스크롤 시 `position: sticky`인지까지 모든 화면에서 확정하지 않는다.

## U5. Hover / keyboard / focus
일부 hover/scrollbar 요구가 문서에 있으나
서비스 전체 accessibility interaction rule은 충분히 확인되지 않았다.

## U6. Exact radius / shadow
flat/restrained 성향은 확인되지만 exact 값은 design token을 사용한다.

## U7. Typography scale
title/body/metadata hierarchy는 확인되지만 exact font-size/line-height는 token 또는 existing style을 사용한다.

## U8. Icon system
상태 아이콘과 일부 utility icon은 보이지만,
아이콘 스타일 전체 규칙은 component catalog를 우선한다.

## U9. Dark theme
dark celebration page는 별도 campaign mode다.
일반 서비스의 dark theme가 존재한다고 해석하지 않는다.

## U10. Blue state semantics
일부 보조/editing 상태에서 Blue가 보이지만,
서비스 전역 semantic state로 확정하지 않는다.

## U11. Maximum card columns
팀빌딩에서 desktop 3-column grid가 관찰되지만,
모든 entity card page의 고정 규칙으로 일반화하지 않는다.

## U12. Whether every public page must have footer
public pages에서 반복되지만,
dense internal workspace까지 강제해야 한다는 근거는 부족하다.

---

# Fallback Rule

판단이 불가능할 때:

1. 동일 archetype의 기존 화면을 찾는다.
2. 해당 화면의 structure를 우선 복제한다.
3. existing component와 token만 사용한다.
4. 새 design convention을 만들지 않는다.
5. 필요하면 `HYPOTHESIS`로 명시하고 사용자 확인을 요청한다.

---

## 추가 금지 항목

근거가 없으면 다음을 generation rule로 만들지 않는다.

- 속성 개수 기반 Card/Table threshold
- 화면별 최대 action 개수
- 고정 pane 비율
- 공통 mobile breakpoint
- 모든 내부 화면의 footer 강제
- celebration dark 화면을 근거로 한 전역 dark theme

# Conflict Resolution Order

충돌 시 다음 순서를 따른다.

1. 현재 PRD의 명시적 기능/상태 요구
2. 현재 Design System token/component 제약
3. 여러 실제 화면에서 반복된 pattern
4. 동일 사용자 task를 가진 closest existing screen
5. 이 generation rule
6. 일반적인 UI 관습

일반 UI 상식은 마지막 fallback이며 서비스 규칙의 근거가 아니다.