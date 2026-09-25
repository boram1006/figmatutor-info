# Visual DNA — Evidence-Only Design Evidence

Visual DNA는 새 화면을 만들 때 기존 화면의 시각적 성질을 근거로 참고하기 위한 **파생 evidence**다.
새 전역 디자인 규칙이나 평균값을 자동 생성하는 기능이 아니다.

## 입력

- 실제 Figma extract snapshot
- 같은 snapshot에 대해 exact resolve된 Pattern Registry 결과

명령:

```sh
npm run visual-dna:derive -- \
  --snapshot <snapshot.json> \
  --resolved <resolved-registry.json> \
  --output <visual-dna.json>
```

## 무엇을 기록하나

각 resolved pattern source에 대해:

- root width / height
- layout mode / sizing / alignment / wrap
- padding / itemSpacing / corner radius
- fill / stroke token binding
- clip / opacity / blend / effect count
- subtree text style 사용
- subtree component reference 사용
- source frame / node ID

를 보존한다.

## Invariant vs Observation

여러 source에서 같은 값이 반복되면 `invariants`에 기록한다.

예:

- source 3개 모두 padding 24 → invariant
- source 3개 모두 radius 16 → invariant

값이 다르면 평균내지 않고 `observations`에 그대로 보존한다.

예:

- height = 163 / 156 / 156 → values + min/max
- padding이 16 / 24 → 두 값 모두 유지

즉 `평균 20` 같은 새 규칙을 만들지 않는다.

## Confidence

- `REPEATED_OBSERVATION`: exact-resolved source가 2개 이상
- `OBSERVED_SINGLE`: source가 1개뿐

`OBSERVED_SINGLE`은 전역 규칙으로 자동 승격하지 않는다.

## 적용 순서

신규 화면 생성 시:

1. PRD / task 분석
2. archetype / pattern 판단
3. Pattern Registry retrieval
4. actual source resolve
5. **Visual DNA evidence 확인**
6. INSTANCE_REUSE / CLONE_COMPOSE 우선
7. NEW_CONSTRUCTION이 필요한 부분만 Visual DNA evidence를 참고
8. 생성 후 screenshot / extract 재검증

CLONE source 자체의 geometry/style은 Visual DNA를 보고 다시 설정하지 않는다.
CLONE은 native clone 보존이 우선이고, Visual DNA는 **새로 구성해야 하는 주변 shell/새 구조**의 근거로만 사용한다.

## 승격 금지

Visual DNA output은 파생 파일이다.

- registry selector를 대체하지 않는다.
- generation rule을 자동 변경하지 않는다.
- 서로 다른 archetype/task의 화면을 한데 평균내지 않는다.
- partial snapshot을 서비스 전체 visual rule로 가장하지 않는다.

전역 generation rule로 승격하려면 반복 evidence + 적용 범위 + 예외를 별도로 검토해
`design/03-design-rules/generation/` 정본에 반영한다.
