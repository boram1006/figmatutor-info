---
inclusion: always
---

# Design Flow Harness — Kiro 진입점

이 워크스페이스는 Figma 모바일 UI를 일관되게 생성하는 디자인 하네스다.
원본은 Codex용으로 만들어졌으며(`AGENTS.md`), Kiro에서는 이 steering이 진입점 역할을 한다.
`AGENTS.md`, `.agents/skills/**/SKILL.md`, `docs/**`, `design/**/*.json` 계약을 활성 지침으로 사용한다.

## 세션 시작 시

1. `harness.config.json`을 읽는다.
2. `node scripts/harness.mjs status`(= `npm run status`)를 실행해 다음 미완료 단계를 파악한다.
3. 가장 앞선 미완료 단계에 해당하는 스킬 파일만 읽고 진행한다.

## 파이프라인 (5단계 게이트, extract-extend)

요구사항 → 기존 시스템 추출·정형화 → 컴포넌트(재사용+신규) → 전체 화면·상태 확장(기존+신규) → 구조·시각 검증.

컨셉 탐색·방향 선택 단계는 없다. 기존 피그마 시스템을 추출해 정형화한 뒤 재사용해 확장한다.

스킬 순서와 게이트 매핑:

| 게이트(phase) | 스킬 파일 |
| --- | --- |
| inputs | `.agents/skills/build-structure/SKILL.md` (+ 선택: `collect-references`, `analyze-references`) |
| extract-system | `.agents/skills/extract-system/SKILL.md` |
| components / screens | `.agents/skills/create-figma/SKILL.md` |
| verification | `.agents/skills/audit-design/SKILL.md` |

전체 흐름 오케스트레이션은 `.agents/skills/ui-flow/SKILL.md`를 따른다.

## Kiro 라우팅 (슬래시 명령 대체)

원본은 `$ui-flow` 같은 슬래시 명령으로 진입한다. Kiro에서는 자연어 요청을 아래로 매핑한다:

| 사용자가 말하면 | 실행 |
| --- | --- |
| "디자인 시작", "이어서 진행", "UI 만들어줘" | `ui-flow` 스킬 절차 시작 (status 확인 후 다음 단계) |
| "기존 시스템 추출/정형화", "토큰·컴포넌트 뽑아줘" | `extract-system` |
| "기존 화면 근거 수집/분석" (선택) | `collect-references` → `analyze-references` |
| "화면 구조 잡아줘" | `build-structure` |
| "컴포넌트/화면 만들어줘/추가해줘" | `create-figma` |
| "새 PRD로 화면 만들어줘", "이 PRD대로 그려줘" | `docs/new-screen-workflow.md` 절차 (PRD→requirements→그리기→screens/verification) |
| "이런 기능 필요해", "PRD 뽑아줘", "기획 정리해줘" | `docs/prd-authoring-workflow.md` 절차 (요청→8블록 PRD 초안→부족분 질문→확정) |
| "검증해줘", "결함 찾아줘" | `audit-design` |

해석한 명령을 한 줄로 밝힌 뒤 실행한다.

## PRD 생성 (기능 요청 기반)

기능만 대략 요청받으면 **`docs/prd-authoring-workflow.md`** 를 따라 PRD를 생성한다.
8블록(화면개요·진입조건·로딩/예외·상태머신·상태별 UI 매트릭스·정렬/버튼·표기·레이아웃)을
기존 릴리즈 관례를 기본값으로 채운 초안을 만들고, 정말 판단이 필요한 것만 질문해 보완한다.
확정한 PRD는 그대로 new-screen-workflow의 입력이 된다.

## 새 화면 생성 (PRD 기반)

새 PRD를 받아 화면을 만들 때는 **`docs/new-screen-workflow.md`** 를 따른다.
품질 기준선은 v1·v3 PRD 수준(화면 ID·진입조건·상태 머신·상태별 UI 매트릭스·정렬/버튼 규칙·표기·레이아웃)이며,
그 수준의 PRD가 들어오면 토큰·컴포넌트에 바인딩된 화면으로 구현·검증할 수 있어야 한다.
기존 양산 화면(현 design 페이지)은 이 규칙에 맞추지 않는다(`design/03-design-rules/system/STATUS.md`).

## 릴리즈 PRD 게시 규칙 (필수)

버전이 업데이트(새 릴리즈)될 때마다, 해당 릴리즈 Figma 프레임의 **맨 앞에 노란색 배경 박스**를 두고
그 릴리즈의 PRD(위 8블록)를 작성한다. 기존 v1~v5가 전부 이 방식이었고, 덕분에 캔버스만으로
각 화면의 의도·상태·예외를 복원할 수 있었다. 화면과 근거를 같은 캔버스에 붙여 둔다.
상세: `docs/prd-authoring-workflow.md`.

## 게이트 원칙 (반드시 준수)

- JSON 계약이 기계 판정의 원본이다. 필드는 `docs/contracts.md`, 게이트는 `scripts/lib/gates.mjs`.
- 폴더 존재·체크표시·이전 PASS만으로 완료를 판정하지 않는다. `npm run check`, `npm run audit`로 판정한다.
- extract-system은 값을 발명하지 않는다. 기존 시스템을 추출해 tokens.json/catalog.json으로 옮기고 실제 캔버스와 일치하는지 검증한다.
- 새 토큰은 `token-extensions.json`에 추가만 한다. 추출한 시스템 토큰을 덮어쓰려면 피그마 원본을 고쳐 재추출한다.
- 새 화면 레이아웃 초안이 필요하면 `op:create`로 그려줄 수 있으나 게이트 통과 조건이 아니다(컨셉 방향 선택 아님).
- 일률적 승인 대기를 넣지 않는다. 정보 누락이 실제로 작업을 막을 때만 질문한다.
- 규칙 위반은 캔버스/원본 JSON을 고쳐 해결한다. snapshot·검사 결과를 조작해 통과시키지 않는다.
- 이미지 생성 단계를 쓰지 않는다. `design/characters`의 보유 원본만 FIT 배치, 남는 영역은 `color-character-bg`.

## 검증 명령 (Node 18+, 외부 의존성 없음)

- `npm run status` — 읽기 전용 현재 상태
- `npm run check -- --phase <name>` — 해당·선행 단계 검증 (단계: inputs, extract-system, components, screens, verification)
- `npm run check` — 5단계 전체 재검증
- `npm run audit` — 구조·시각·콘텐츠 종합 판정
- `npm run save-snapshot -- --stage <extract-system|components|screens> --from <경로>` — 플러그인 extract 결과를 정식 스냅샷 경로에 저장
- `npm test` — 하네스 자체 회귀 테스트
- `npm run doctor` — 로컬 전제 조건 확인

## 이 워크스페이스의 커스터마이징 (원본과 다른 점)

- **Figma 무료 계정 (대안 1: Plugin API로 그리기, 확정)**: Figma Dev Mode MCP를 쓰지 않는다. Kiro가
  플러그인 스펙 JSON(`op`: create/extract/screenshot)을 만들고, 사용자가 재사용 플러그인
  `scripts/figma-plugin/`(Figma 데스크탑에 1회 설치)에 붙여넣어 실행한다. 클립보드가 파일 I/O를
  대체한다(로컬 브릿지는 이후 확장). 상세는 `docs/kiro-figma-plugin.md`.
- **figma-worker 위임**: Kiro는 Codex의 `collaboration.spawn_agent` 위임이 없다. Figma 작업은 위
  플러그인 왕복으로 대체하고(실행 계약 `docs/figma-delegation.md`), 원본 응답·대용량 데이터(노드
  트리·스냅샷·캡처)는 대화에 붙이지 않고 `design/operations/<task-id>/`에 파일로 저장한다. extract
  결과는 `npm run save-snapshot`으로 정식 스냅샷 경로에 저장한 뒤 `npm run check`로 판정한다.
- **소스 = 기존 피그마 시스템 (extract-extend, 확정)**: UXVoll/uibowl 같은 외부 레퍼런스가 아니라
  사용자의 실제 양산 화면 + 디자인시스템이 소스다. 컨셉 탐색·방향 선택을 하지 않고, `extract-system`으로
  기존 변수·컴포넌트·화면을 추출·정형화한 뒤 그 위에 새 화면을 추가한다. `harness.config.json`의
  `figma.fileKey`(기존 파일)와 `extractPages`(추출할 페이지 이름 배열)가 필수다.
