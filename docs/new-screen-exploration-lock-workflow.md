# 신규 화면 Exploration → Lock 워크플로우

신규 화면 기획에서는 초안 단계의 발산을 허용하되, **발산 결과가 정본 PRD와 생성 스펙으로 자동 승격되지 않도록** 단계와 상태를 분리한다.

핵심 원칙은 **발산은 텍스트/구조에서, Figma 생성은 Lock 이후 한 번**이다.
여러 개의 Figma 분기를 만드는 것이 목적이 아니다.

## 1. 세 단계

### A. EXPLORE — 발산
입력:
- 사용자 요청/초기 PRD
- 기존 screen manifest / pattern registry / 실제 Figma evidence
- 외부 생성 결과(Stitch 등)가 있으면 아이디어 source로 사용 가능

이 단계에서는 PRD에 없는 유용한 기능을 제안할 수 있다.
예: 결과 화면에서 시상식 일정, 결과 리포트 다운로드, 이의신청 안내.

단, 모든 제안은 아래 중 하나로 명시적으로 분류한다.

- `LOCKED_CORE`: 사용자가 이미 확정했거나 정본 PRD에 명시된 요구사항
- `CANDIDATE_PRODUCT`: 제품 기능/정보 공개/정책에 영향을 주는 신규 아이디어. 유용해 보여도 자동 채택 금지
- `DESIGN_IDEA`: 제품 정책을 바꾸지 않는 구성/위계/표현 아이디어. AI가 근거와 함께 판단 가능
- `CONFLICT`: 현재 PRD/확정 정책과 충돌
- `UNSUPPORTED_DETAIL`: 숫자, 일정, 상금, 인원, 가중치 등 source 없는 구체값

EXPLORE 결과는 정본 PRD, requirements, QA expected, Figma generation spec에 바로 넣지 않는다.

### B. LOCK — 수렴
`CANDIDATE_PRODUCT`는 다음 셋 중 하나로 닫는다.

- `APPROVED`: 사용자가 채택 → 정본 PRD에 현재 기준 문장으로 반영
- `DEFERRED`: 좋은 아이디어지만 이번 릴리즈에서는 보류
- `REJECTED`: 사용하지 않음

`CONFLICT`와 `UNSUPPORTED_DETAIL`은 사용자가 명시적으로 확정하지 않는 한 생성 대상에서 제외한다.

Lock 완료 조건:
- 화면에 들어갈 product information/action/state가 모두 `LOCKED_CORE` 또는 `APPROVED`
- 남은 미정은 화면 생성을 막는지 여부가 명확함
- 화면 구성에 필요한 Design Decision은 reference evidence를 근거로 composition plan에 기록됨

### C. COMPOSE/GENERATE — 고정 후 생성
Lock된 product scope만 사용해 composition plan을 만든 뒤 Figma spec을 생성한다.

이 단계에서는:
- 신규 product feature 발명 금지
- 숫자/일정/정책 발명 금지
- reference retrieval → actual Figma evidence 확인 → composition plan → INSTANCE_REUSE / CLONE_COMPOSE / NEW_CONSTRUCTION 순서 적용

## 2. 왜 한 번만 분기하는가

여러 concept A/B/C를 Figma로 모두 생성하지 않는다.

기본 흐름:
`1개의 아이디어 풀 → 1회의 Lock → 1개의 composition plan → 1개의 Figma 초안`

필요하면 EXPLORE에서 3~7개의 기능/구성 아이디어를 텍스트로 발산한다.
사용자는 product candidate만 빠르게 승인/보류/거절한다.
그 뒤 생성은 하나의 locked scope로 수렴한다.

즉 **발산 폭은 넓게, 캔버스 분기는 최소화**한다.

## 3. 외부 생성물(Stitch 등) 사용 규칙

외부 생성물은 두 층으로 분리해서 본다.

### 가져올 수 있는 것
- 정보 위계
- grouping
- section sequence
- density
- shell/context 유지 방식
- follow-up information 배치
- CTA hierarchy

→ `DESIGN_IDEA` 또는 composition evidence로 사용 가능.

단, external composition은 **visual truth가 아니다**.
- grouping/section sequence/relative emphasis/density intent는 보존 가능
- typography/spacing/radius/color/surface/shell/component styling은 existing Figma grammar로 번역
- target archetype을 먼저 선택한 뒤 그 archetype의 current evidence를 적용
- A-30처럼 한 화면의 shell을 전체 서비스 규칙으로 일반화하지 않음

### 자동으로 가져오면 안 되는 것
- 새 기능
- 새 정책
- 점수 공개/비공개 정책
- 가중치/산식
- 상금/채용 혜택
- 심사위원 수
- 이의신청 기간
- 시상식 날짜/장소

→ `CANDIDATE_PRODUCT` 또는 `UNSUPPORTED_DETAIL`로만 기록.

## 4. Composition Plan 최소 계약

Figma spec 전에 영역별로 아래를 기록한다.

| 필드 | 의미 |
|---|---|
| region | 화면 영역 |
| purpose | 이 영역이 해결하는 사용자 질문 |
| source | manifest/pattern/Figma reference |
| reuseMode | INSTANCE_REUSE / CLONE_COMPOSE / NEW_CONSTRUCTION |
| productScope | 어떤 LOCKED_CORE/APPROVED 요구를 구현하는지 |
| inspectBeforeBuild | 실제 Figma subtree 확인이 필요한지 |
| notes | 보존/변경할 구조 |

reference 후보가 없으면 `no_suitable_reference`를 명시한다.
후보가 있다는 이유만으로 clone을 허가하지 않는다.

## 5. Generation Gate

다음 중 하나면 Figma spec을 만들지 않는다.

- `CANDIDATE_PRODUCT`가 승인되지 않았는데 화면에 포함됨
- `CONFLICT` 또는 `UNSUPPORTED_DETAIL`이 확정값처럼 들어감
- reference 후보가 있는데 실제 Figma evidence를 확인하지 않음
- composition plan 없이 primitive FRAME/TEXT부터 작성함
- 재사용 가능한 component/pattern을 무시하고 NEW_CONSTRUCTION으로 대체함

## 6. 산출물 권장 위치

신규 릴리즈 작업 폴더:

```
design/operations/<task>/
  exploration-triage.md
  composition-plan.json
  spec-*.json
  result.json
```

`exploration-triage.md`는 발산/결정 기록이다.
정본 PRD에는 **APPROVED 후의 현재 기준만** 반영하고 변경 이력성 설명은 넣지 않는다.
