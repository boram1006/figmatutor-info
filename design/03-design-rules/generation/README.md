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

1. 사용자 / task / desired outcome을 먼저 정의한다.
2. 기존 화면과 동일 유형이 없는 신규 기획이면 `novel-screen-reasoning.md`를 먼저 읽는다.
3. `page-archetypes.md`에서 화면 목적을 설명할 수 있는 primary archetype이 있는지 확인한다.
4. 하나의 archetype으로 충분하지 않으면 검증된 pattern을 조합한다. 억지로 하나에 끼워 맞추지 않는다.
5. `density-rules.md`에서 필요한 정보 밀도를 결정한다.
6. `layout-rules.md`에서 페이지 구조와 주요 영역 배치를 선택한다.
7. `component-usage.md`에서 Card / Table / List / Banner / Modal 등의 표현 방식을 결정한다.
8. `patterns.md`에서 기존 복합 패턴을 우선 재사용한다.
9. 실제 Figma 자산 후보는 **Pattern Registry retrieval**로 먼저 찾는다. `design/03-design-rules/patterns/registry.json`의 semantic/evidence 정보와 최신 extract로 resolve된 source만 사용한다. 0건/다수 매칭 node ID를 추측하지 않는다.
10. resolved source가 있으면 `design/03-design-rules/visual-dna.md`에 따라 **Visual DNA evidence**를 확인한다. 반복 source의 동일 값만 invariant로 보고, 차이는 observation으로 유지하며 평균값을 새 규칙으로 만들지 않는다. single source는 전역 규칙으로 승격하지 않는다.
11. 실제 Figma 자산 재사용 우선순위를 적용한다.
   - **INSTANCE_REUSE**: Design System component가 있으면 catalog/snapshot의 실제 nodeId로 INSTANCE를 사용한다.
   - **CLONE_COMPOSE**: 카드/섹션/업무 블록처럼 실제 양산 화면의 복합 패턴이 있으면 source node를 CLONE해 새 화면에 조합하고 최소 patch만 적용한다.
   - **NEW_CONSTRUCTION**: 앞 두 방식으로 표현되지 않는 구조만 primitive로 새로 만든다.
   앞 단계로 충분하면 뒤 단계로 내려가지 않는다.
12. `visual-hierarchy.md`의 강조·상태·시각 언어를 적용한다.
13. `exceptions.md`의 예외 조건을 확인한다.
14. 판단 근거가 부족하면 `unresolved.md`를 확인하고 임의의 서비스 규칙을 발명하지 않는다.

신규 구조가 필요하면 바로 전역 규칙으로 만들지 않고 `CANDIDATE/HYPOTHESIS`로 기록한다.

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

## 신규 기획과 기존 화면 수정

- **완전히 새로운 기획**: `novel-screen-reasoning.md`를 따라 Product Decision과 Design Decision을 분리하고, 기존 archetype 재사용 → pattern 조합 → Candidate Pattern 순으로 판단한다.
- **기존 화면 수정**: `existing-screen-modification.md`를 먼저 따른다. 기존 화면을 baseline으로 보존하고 PRD delta만 최소 변경한다.
