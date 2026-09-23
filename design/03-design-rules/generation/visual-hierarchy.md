# Visual Hierarchy Rules

## V1. 기능 화면의 기본 tone
**Confidence: HIGH**

- light/white base
- black/dark gray primary text
- muted gray secondary text
- thin border / subtle neutral surface
- restrained radius
- limited use of shadow
- Red accent for primary action/attention

정확한 color/radius/shadow 값은 extracted design token을 따른다.

---

## V2. hierarchy 우선순위
**Confidence: HIGH**

기능 화면에서 위계는 대체로 다음 순서로 만든다.

1. Position / layout
2. Spacing / grouping
3. Typography size/weight
4. Border / subtle surface
5. Semantic color
6. Decorative effects

장식 효과를 1~4의 대체재로 사용하지 않는다.

---

## V3. Page title은 명확하지만 과장하지 않는다
**Confidence: HIGH**

기능 화면의 page title은 주변 정보보다 분명히 크고 강하지만,
landing/campaign hero 수준으로 확장하지 않는다.

Title 아래에는 필요한 경우 1~2줄의 context description을 둔다.

---

## V4. Secondary metadata는 compact하고 muted하게
**Confidence: HIGH**

timestamp, team/organization, count, supporting state 등은
title/action보다 낮은 contrast와 작은 typography를 사용한다.

단, 운영 판단에 직접 필요한 상태/점수는 muted 처리하지 않는다.

---

## V5. Red emphasis
**Confidence: HIGH**

Red는 다음 목적에 우선한다.

- primary actionable button
- active navigation/step
- attention-needed
- error/warning 계열 일부
- selected local state

Red를 단순 decoration으로 반복 사용하지 않는다.

---

## V6. State colors carry semantics
**Confidence: HIGH**

기존 화면에서 상태가 색으로 구분된다.

- completed/submitted: Green
- reviewing: Purple
- inactive/closed/neutral: Gray
- action-needed/current: Red
- supporting informational/editing state: Blue가 일부 사용됨

색상만으로 의미를 전달하지 말고 label/text를 함께 둔다.

---

## V7. Border와 surface는 grouping 용도
**Confidence: HIGH**

Card/panel의 경계는 "더 예쁘게 보이기 위해"가 아니라
entity 또는 functional group을 구분하기 위해 사용한다.

같은 section 안의 모든 작은 요소를 각각 boxed card로 만들지 않는다.

---

## V8. Shadow는 overlay/depth가 필요한 곳에 더 적합하다
**Confidence: MEDIUM**

일반 page card는 flat 또는 매우 약한 depth가 많고,
modal/floating panel처럼 실제 layer depth가 있는 경우 shadow가 더 분명해진다.

새로운 기능 Card에 강한 drop shadow를 기본 적용하지 않는다.

---

## V9. Campaign visual mode
**Confidence: HIGH**

Celebration/result page에서만:
- dark dominant background
- gold/yellow event accent
- large emotional headline
- decorative image/effects
- centered dramatic composition

를 허용한다.

같은 서비스의 기능 UI는 다시 light functional mode로 돌아온다.

---

## V10. Landing visual mode
**Confidence: MEDIUM**

홈/landing은 일반 functional UI보다 더 많은 illustration/gradient/hero treatment를 허용한다.
다만 하단의 일정/혜택/팀빌딩 같은 정보 section은 다시 구조적이고 절제된 표현을 사용한다.

---

## V11. Dense 화면은 color보다 alignment를 강화한다
**Confidence: HIGH**

Table, evaluation pane, final matrix처럼 밀도가 높을수록
새 색상 추가보다 다음을 사용한다.

- aligned columns
- repeated row rhythm
- selected row
- thin separators
- compact badge
- consistent numeric alignment

---

## V12. Footer visual contrast
**Confidence: MEDIUM**

public-facing page에서 dark footer가 반복적으로 사용된다.
Footer를 본문 visual mode와 혼동하지 않는다.