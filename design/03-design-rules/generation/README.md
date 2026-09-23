# Generation Design Rules

이 폴더는 기존 Design System의 token/component 정의를 반복 설명하지 않는다.

목적은 **새 화면을 생성할 때 AI가 내려야 하는 디자인 의사결정**을 규칙으로 제공하는 것이다.

## 역할 구분

- PRD: 무엇을 만들어야 하는가
- tokens/components: 무엇으로 만들 수 있는가
- existing screens: 지금까지 어떻게 만들어왔는가
- generation rules: **어떤 조건에서 어떤 구성 방식을 선택해야 하는가**

## 사용 순서

새 화면을 생성하기 전에 다음 순서로 판단한다.

1. `page-archetypes.md`에서 화면 목적에 가장 가까운 archetype을 선택한다.
2. `density-rules.md`에서 필요한 정보 밀도를 결정한다.
3. `layout-rules.md`에서 페이지 구조와 주요 영역 배치를 선택한다.
4. `component-usage.md`에서 Card / Table / List / Banner / Modal 등의 표현 방식을 결정한다.
5. `patterns.md`에서 기존 복합 패턴을 우선 재사용한다.
6. `visual-hierarchy.md`의 강조·상태·시각 언어를 적용한다.
7. `exceptions.md`의 예외 조건을 확인한다.
8. 판단 근거가 부족하면 `unresolved.md`를 확인하고 임의의 서비스 규칙을 발명하지 않는다.

## Confidence

- **HIGH**: 서로 다른 화면/버전에서 반복적으로 확인된 규칙
- **MEDIUM**: 복수 사례 또는 강한 구조적 근거가 있으나 적용 범위가 완전히 확정되지 않은 규칙
- **HYPOTHESIS**: 단일 사례 또는 해석이 필요한 가설. 자동 생성의 강제 규칙으로 사용하지 않는다.

## 핵심 원칙

이 서비스의 화면은 모든 페이지를 같은 밀도와 같은 구성으로 만들지 않는다.

**화면의 목적이 읽기/탐색인지, 상태 확인인지, 반복 작업인지, 비교·심사인지에 따라
정보 밀도와 레이아웃을 바꾼다.**

일반적인 "깔끔한 SaaS UI" 관습을 적용해 기존 화면의 정보량을 임의로 줄이거나,
모든 정보를 Card로 쪼개거나, 작업 컨텍스트를 여러 페이지로 분리하지 않는다.

## 기존 화면 수정

기존 화면에 기능을 추가하거나 일부를 수정하는 작업은 `existing-screen-modification.md`를 먼저 따른다. 기존 화면을 baseline으로 보존하고 PRD delta만 최소 변경한다.
