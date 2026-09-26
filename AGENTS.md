# Design Flow Harness — Codex

이 저장소는 Codex에서 사용하는 Figma UI 생성 하네스다. 시작할 때 `npm run status`와
`harness.config.json`을 읽는다. 이 저장소의 AGENTS.md, 프로젝트 스킬, JSON 계약만
활성 지침·명령·완료 판정으로 사용한다. 규칙 간 정본 우선순위는 `docs/source-of-truth.md`를 따른다. 원본 프로젝트 경로에 쓰지 않는다.

## 흐름

요구사항 → 기존 시스템 추출·정형화 → 컴포넌트(기존 재사용 + 신규) → 전체 화면·상태 확장(기존 + 신규) → 구조·시각 검증.

구조/시각 5단계 게이트: inputs → extract-system → components → screens → verification. 릴리즈별 PRD↔디자인 의미 정합성은 별도 semantic coverage gate(`npm run check:coverage`)로 검사하며, `npm run audit`은 구조/시각 게이트 뒤 이 coverage gate까지 통과해야 성공한다.
컨셉 탐색·방향 선택 단계는 없다. 이 하네스는 기존 피그마 시스템을 추출해 정형화한 뒤 재사용해 확장한다.

- JSON 계약은 기계 판정의 원본이다. 필드는 `docs/contracts.md`, 게이트는 `scripts/lib/gates.mjs` 참조.
- `npm run status`는 다음 미완료 단계를 보여 준다. `npm run check -- --phase NAME`은 선행 단계도 검사한다.
- extract-system은 값을 발명하지 않는다. 기존 변수·텍스트 스타일·컴포넌트를 추출해 tokens.json/catalog.json으로 옮기고, 옮긴 게 실제 캔버스 스냅샷과 일치하는지 검증한다.
- 새 화면에 필요한 새 토큰은 `token-extensions.json`에 추가만 한다. 추출한 시스템 토큰을 덮어쓰려면 피그마 원본을 고쳐 재추출한다.
- Figma 토큰/컴포넌트 라이브러리 문서는 `docs/token-library-guide.md`, `docs/component-library-guide.md`의 절차를 따른다.
- 새 화면 레이아웃 초안이 필요하면 플러그인 `op:create`로 그려줄 수 있으나, 이는 게이트 통과 조건이 아니다(컨셉 방향 선택이 아님).
- 단계별로 일률적 승인 대기를 추가하지 않는다. 누락 정보가 실제로 작업을 막는 경우만 질문한다. 외부 변경·비용은 세션의 승인 범위를 따른다.
- 입력이 달라지면 해시로 stale 판정한다. 영향 설명 후 재검증한다. 해시만 수동 교체해 우회하지 않는다.
- 이미지 생성 단계를 사용하지 않는다. 캐릭터 이미지에는 `design/characters`의 보유 원본만 FIT로 배치하고 남는 영역은 `color-character-bg` 파스텔 하늘색으로 채운다.
- 브랜드 로고가 표시되는 헤더에는 `design/characters/Logo.svg` 원본을 사용한다. 텍스트나 다른 글꼴로 재현하지 않고 원본 비율·색상을 유지한다. 일반 화면 제목·뒤로가기 헤더에 로고를 일률적으로 추가하지 않는다. SVG 로고에는 캐릭터용 하늘색 배경을 강제하지 않는다. 파일이 없으면 임의 대체하지 않고 누락을 알린다. 제작·검증은 `docs/figma-contract.md`의 헤더 로고 절차를 따른다.
- 규칙 위반은 캔버스/원본 JSON을 수정해서 해결한다. snapshot, 검사 결과, 시각 관찰을 만들어서 통과시키지 않는다.
- 임의의 폴더 존재, 체크 표시, 이전 PASS만으로 완료 판단하지 않는다.
- Figma mutation(create/update/duplicate/rebind) 작업은 **spec 생성 또는 plugin 실행 성공만으로 완료 처리하지 않는다.** 반드시 대상 범위를 다시 `op:extract`한 최신 snapshot으로 검증한다.
- 릴리즈별 semantic coverage assertion이 있으면 mutation 후 `npm run check:coverage`를 실행하고 PASS해야 완료다. `MISSING_DESIGN`, `MISSING_STATE`, `MISMATCH`에 해당하는 assertion 실패가 남아 있으면 QA baseline 확정 및 다음 단계 진행을 금지한다.
- 부분 extract는 전체 snapshot으로 위장하지 않는다. `npm run save-snapshot -- --stage screens --from <file> --scope <name> --root <frameId>`로 scoped snapshot을 저장할 수 있다.
- duplicate로 릴리즈 section 내부에 state/frame을 추가할 때는 spec item에 `parentId`를 명시한다. plugin 결과의 실제 `parentId`가 기대값과 다르면 실패로 본다.
- Figma mutation(create/update/duplicate/rebind)은 플러그인 성공 응답만으로 완료 처리하지 않는다. 반드시 대상 범위를 다시 `op:extract`하고 최신 scoped snapshot을 저장한 뒤 `npm run check:coverage`를 통과해야 완료다.
- 부분 extract는 `npm run save-snapshot -- --stage screens --from <file> --scope <name> --root <frameId>`로 canonical scoped snapshot으로 저장할 수 있다. 전체 canonical snapshot에는 계속 `complete:true`가 필요하다.
- `op:duplicate`로 특정 SECTION/FRAME 내부에 상태 화면을 만들 때는 `parentId`를 반드시 명시한다. plugin 결과의 `parentId`가 요청값과 다르면 실패다.
- Figma 작업은 플러그인 왕복으로 한다. Kiro가 `op` 스펙을 만들어 `design/operations/<task-id>/`에 저장하고, 사용자가 데스크탑 플러그인에서 실행한다. 원본 응답·이미지·스냅샷은 대화에 붙이지 않고 파일로 보존한다.
- Kiro는 요구사항·승인·작업 범위·로컬 게이트를 관리한다. extract 결과는 `npm run save-snapshot`으로 저장한 뒤 `npm run check`로 판정한다. 같은 파일의 Figma 작업은 순차로 진행한다. 상세 절차는 `docs/figma-delegation.md`.

## 프로젝트 스킬

| 요청 | 진입점 |
| --- | --- |
| 디자인 시작/이어서 진행 | `$ui-flow` |
| 기존 시스템 추출·정형화 | `$extract-system` |
| 기존 화면 근거 수집 (선택) | `$collect-references` |
| 기존 화면 분석 (선택) | `$analyze-references` |
| 화면·상태·흐름 정리 | `$build-structure` |
| 컴포넌트·전체 화면 확장 | `$create-figma` |
| 기존 화면 토큰 바인딩(색·폰트 rebind) | `docs/rebind-existing-screen-workflow.md` |
| 검증/결함 수정 | `$audit-design` |
| Figma 플러그인 실행 | `$figma-worker` (스펙 생성 + 사용자 실행) |

역할명은 기존 프로젝트의 단계 명칭과 맞춘다. Codex 런타임 규약 때문에 위치는
`.agents/skills/<name>/SKILL.md`를 유지한다. 자동 발견이 아직 안 되면
해당 파일을 직접 읽거나 이 프로젝트를 새 Codex 세션으로 연다.

## Figma·이미지 도구

Figma 캔버스 생성·추출·캡처는 [플러그인 방식](docs/kiro-figma-plugin.md)으로 한다. Kiro가 스펙
JSON(`op`: create/extract/screenshot/rebind/duplicate)을 만들고 사용자가 데스크탑 플러그인(`scripts/figma-plugin/`)에서
실행한다. Dev Mode MCP를 쓰지 않는다. 도구 절차는 `docs/tool-adapters.md`, 메타데이터·스냅샷 계약은
`docs/figma-contract.md`.

## 구현 변경 검증

Node.js 18+ / 외부 npm 의존성 없음. 코드 변경 후 `npm test`, `npm run doctor`, `npm run status` 실행.
새 복제본은 빈 초안으로 시작하므로 `npm run check`가 실패하는 것이 정상이다.
완료하지 않은 디자인 단계를 테스트 통과를 위해 PASS로 만들지 않는다.
