# Existing Screen Modification Rules

## Core Principle

기존 화면이 존재하는 경우 해당 화면을 새로 디자인하지 않는다.

**기존 화면을 baseline으로 사용하고, 현재 PRD에서 요구한 변경점만 최소 범위로 수정한다.**

---

## 1. Preserve Existing Structure

명시적인 변경 요구가 없는 한 다음을 그대로 유지한다.

- page layout
- content width
- section order
- column structure
- card/list/table composition
- component type
- component placement
- spacing relationship
- alignment
- typography hierarchy
- button hierarchy
- navigation structure
- visual grouping
- information density

새 generation rule이 더 적합해 보인다는 이유로 기존 화면을 재설계하지 않는다.

---

## 2. Reuse Existing Elements

기존 화면에 이미 존재하는 UI 요소는 새로 생성하지 않고 기존 요소를 재사용한다.

- 기존 Button → 동일 component / variant 사용
- 기존 Card → 동일 card structure 사용
- 기존 Table → 동일 row / column pattern 유지
- 기존 Status Badge → 동일 component와 state 표현 사용
- 기존 Header / Navigation / Footer 유지
- 기존 section title pattern 유지

기존 요소와 유사한 새 component를 임의로 만들지 않는다.

---

## 3. Classify the PRD Delta First

화면을 수정하기 전에 PRD 변경사항을 먼저 분류한다.

### ADD
기존 화면에 없는 기능/정보 추가.

→ 기존 structure를 유지하면서 가장 가까운 existing pattern 안에 추가한다.

### MODIFY
기존 기능/정보 변경.

→ 해당 요소만 수정하고 주변 구조는 유지한다.

### REMOVE
기존 기능/정보 제거.

→ 해당 요소만 제거하고 남은 영역은 최소 범위로 reflow한다.

**PRD delta에 언급되지 않은 영역은 unchanged로 간주한다.**

---

## 4. Preserve Visual Identity

새 기능을 추가할 때도 현재 화면의 다음 특성을 유지한다.

- density
- whitespace rhythm
- section spacing
- card density
- table density
- border treatment
- background treatment
- visual emphasis
- page width
- local action hierarchy

새 요소가 원래부터 그 화면에 있었던 것처럼 보이게 한다.

---

## 5. Do Not Redesign for Improvement

개선 가능성이 보여도 요청되지 않은 redesign을 하지 않는다.

명시적 요구가 없으면 다음은 금지한다.

- Card → Table 변경
- Table → Card 변경
- section 순서 변경
- 새로운 grid composition으로 변경
- CTA 위치 변경
- information hierarchy 재구성
- 더 깔끔하게 보이게 하려고 기존 정보 숨김/축약
- 기존 pattern을 일반적인 SaaS style로 재해석
- 다른 화면이 더 최신이라는 이유로 spacing/padding/radius 변경

---

## 6. Existing Screen Is the Source of Truth

기존 화면 수정 작업의 우선순위는 다음과 같다.

1. 변경 대상 기존 화면
2. 해당 화면의 component instance / JSON structure
3. 현재 PRD delta
4. 현재 Design System token/component 제약
5. generation design rules
6. 일반적인 UI 관습

Generation rules는 기존 화면을 재설계하기 위한 것이 아니라,
**새로 추가되는 부분을 기존 화면에 일관되게 통합하는 용도**로만 사용한다.

---

## 7. Existing Component Instance First

기존 화면에 component instance 정보가 있으면:

- 동일 component reference를 유지한다.
- 동일 instance structure를 유지한다.
- 필요한 property / variant / content만 변경한다.
- primitive로 유사하게 재구현하지 않는다.

---

## 8. Delta-first Generation

화면을 그리기 전에 변경점을 먼저 정리한다.

예:

```text
Existing screen: A-01 내 지원 현황

Changes:
- ADD: "재제출 필요" secondary status
- MODIFY: 제출완료 CTA → "수정사항 제출하기"
- ADD: supporting warning text

Unchanged:
- page header
- deadline banner
- card layout
- card spacing
- title position
- metadata layout
- CTA position
```

이 delta를 확정한 뒤 변경점만 적용한다.

---

## 9. New Elements Copy the Nearest Existing Pattern

새로운 UI가 필요해도 유사한 기존 요소가 있으면 해당 요소를 복제해 확장한다.

- 새로운 status card → 기존 status card pattern 복제 후 state/content만 변경
- 새로운 KPI → 기존 KPI card pattern 복제
- 새로운 workflow step → 기존 step item 복제
- 새로운 table column → 기존 table typography/alignment/padding 유지
- 새로운 warning → 기존 warning/banner treatment 재사용

한 기능 추가 때문에 새로운 visual language를 만들지 않는다.

---

## 10. Structural Change Is the Last Resort

기존 structure로 PRD 요구를 충족할 수 없는 경우에만 구조 변경을 허용한다.

구조 변경 전에 다음을 명시한다.

- 기존 구조로 해결할 수 없는 이유
- 필요한 최소 구조 변경
- 영향을 받는 기존 영역
- unchanged로 유지되는 영역

기존 구조 안에서 해결 가능하면 재설계하지 않는다.

---

## 11. Modification Mode vs New-screen Mode

### Existing-screen modification
Priority:

**Existing Screen → PRD Delta → Existing Components → Generation Rules**

Goal:
기존 화면의 identity를 보존하고 delta만 반영한다.

### New-screen generation
Priority:

**PRD → Page Archetype/Pattern → Similar Existing Screens → Components/Tokens**

Goal:
기존 서비스와 일관된 새로운 화면을 생성한다.

**기존 화면 수정 요청에 new-screen generation 방식으로 전체 화면을 다시 생성하지 않는다.**