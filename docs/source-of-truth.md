# Source of Truth Map

이 저장소는 코드, 계약, 디자인 규칙, workflow 문서, Kiro steering이 함께 동작한다.
같은 내용을 여러 파일에 중복 정의하지 않고 아래 우선순위를 따른다.

## 1. 실행 동작

실제 실행 동작의 정본은 코드다.

- Figma Plugin op 구현: `scripts/figma-plugin/code.js`
- 하네스 CLI: `scripts/harness.mjs`
- 단계 판정: `scripts/lib/gates.mjs`
- snapshot 검증: `scripts/lib/snapshot.mjs`
- 공통 파일/해시/토큰 로직: `scripts/lib/core.mjs`

문서가 코드와 충돌하면 코드를 우선 확인하고 문서를 수정한다.
단, 코드를 계약에 맞추지 않고 문서만 바꿔 기존 보장을 약화시키지 않는다.

## 2. JSON / Gate 계약

기계 판정 계약의 설명 정본:

- `docs/contracts.md`
- `docs/figma-contract.md`

실제 판정 구현의 정본:

- `scripts/lib/gates.mjs`
- `scripts/lib/snapshot.mjs`

계약 필드를 변경할 때는 문서와 validator/test를 함께 수정한다.

## 3. Figma 실행 계약

Figma 무료 계정 + Desktop Plugin 왕복 방식의 정본:

- `docs/kiro-figma-plugin.md`
- 실행 구현: `scripts/figma-plugin/code.js`

현재 지원 op:

- `extract`
- `create`
- `screenshot`
- `rebind`
- `duplicate`

기존 화면 수정은 가능한 경우 `duplicate`의 Exact Clone → Minimal Patch를 우선한다.

## 4. 디자인 판단 규칙

새 화면/기존 화면 수정 시 디자인 판단의 정본:

- `design/03-design-rules/generation/README.md`
- 같은 폴더의 archetype / layout / density / component / pattern / state / hierarchy 규칙
- Pattern Registry semantic/source selector 정본: `design/03-design-rules/patterns/registry.json`
- 최신 snapshot에서 resolve한 clone source는 `resolved-registry.json` 파생 결과이며, 원본 registry를 대체하지 않는다.
- v1~v4 legacy pattern source scan의 운영 정본은 `design/operations/pattern-source-scan/` + `scripts/refresh-pattern-sources.mjs`다. 별도 bootstrap 경로를 병행 운영하지 않는다.
- 단일 최신 snapshot의 discovery + resolve 갱신은 `npm run patterns:refresh-snapshot -- --snapshot <path>`을 사용한다.
- Visual DNA 계약의 정본은 `design/03-design-rules/visual-dna.md`; `visual-dna*.json`은 snapshot + resolved source에서 생성한 파생 evidence이며 generation rule 자체가 아니다.

Steering이나 workflow 문서에 디자인 규칙을 다시 상세 복제하지 않고,
필요한 진입점과 적용 순서만 적는다.

## 5. PRD / 서비스 구조

- 전체 서비스 구조·권한·의존관계: `design/02-structure/SITEMAP.md`
- 버전별 정책 변화 + 앞으로의 current baseline 설명 정본: `design/02-structure/SERVICE_EVOLUTION.md`
- current baseline의 machine-readable companion: `design/02-structure/service-baselines.json`
- PRD 작성 절차: `docs/prd-authoring-workflow.md`
- Coverage용 PRD source 우선순위: `docs/coverage-audit-rules.md` 및 `docs/figma-design-sync-workflow.md`

새 기획에서는 단순히 과거 PRD/화면이 더 상세하다는 이유로 과거 정책을 복원하지 않는다.
정책이 변경된 기능은 `SERVICE_EVOLUTION.md`의 current baseline을 먼저 확인한다.
역복원 PRD는 원본 PRD보다 우선하지 않는다.

## 6. Figma Sync / Coverage

- 최신 Figma 동기화: `docs/figma-design-sync-workflow.md`
- Coverage 판정 정의: `docs/coverage-audit-rules.md`
- frame naming / rename 재동기화: `docs/frame-naming-and-resync-workflow.md`

과거 PDF/snapshot보다 LIVE extract + screenshot을 current source로 우선한다.

## 7. QA

- QA 생성/분류: `docs/qa-workflow.md`
- QA 결과 기록: `docs/qa-list-workflow.md`

QA 요구사항 근거는 PRD source provenance를 유지한다.

## 8. Orchestration

Kiro 진입점:

- `.kiro/steering/design-flow-harness.md`

Codex/공통 agent 진입점:

- `AGENTS.md`

세부 작업 절차:

- `.agents/skills/**/SKILL.md`

Steering/AGENTS/skills는 위 정본 문서와 코드를 라우팅·호출하는 역할이다.
실행 계약이나 디자인 규칙을 별도 버전으로 재정의하지 않는다.

## 변경 원칙

하나의 변경이 여러 계층에 영향을 주면 다음을 함께 갱신한다.

1. 실행 코드
2. 회귀 테스트
3. 계약 문서
4. 사용자 workflow 문서
5. 필요한 경우 steering/skill routing

예:
- Plugin op 동작 변경 → `code.js` + `tests` + `docs/kiro-figma-plugin.md`
- snapshot field 변경 → extractor 2종 + validator/test + 관련 계약 문서
- 디자인 생성 판단 변경 → `design/03-design-rules/generation/` 정본 수정 후 workflow는 링크/요약만 수정

## 중복 규칙 발견 시

같은 규칙이 여러 파일에서 서로 다르게 쓰여 있으면:

1. 이 문서의 정본 위치를 확인한다.
2. 정본을 기준으로 판정한다.
3. 다른 문서는 정본을 링크하거나 짧은 요약만 남긴다.
4. 과거 문구를 별도 활성 규칙으로 유지하지 않는다.
