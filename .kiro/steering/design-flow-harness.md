---
inclusion: always
---

# Design Flow Harness — Kiro 진입점

이 워크스페이스는 Figma 데스크톱 웹 UI를 일관되게 생성하는 디자인 하네스다.
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
| "기존 화면 토큰 바인딩해줘", "색·폰트가 안 붙었어", "raw 값 정리해줘" | `docs/rebind-existing-screen-workflow.md` 절차 (진단→색 rebind→타이포 size 배정→재추출 검증) |
| "이런 기능 필요해", "PRD 뽑아줘", "기획 정리해줘" | `docs/prd-authoring-workflow.md` 절차 (요청→8블록 PRD 초안→부족분 질문→확정) |
| "검증해줘", "결함 찾아줘" | `audit-design` |
| "프레임 이름 어떻게 달지", "화면 번호 매겨줘", "이름 규칙 알려줘" | `docs/frame-naming-and-resync-workflow.md`의 명명 규칙·전체 명명표(H/N/F/TB/A/MY/RV/J 시리즈) |
| "이름 바꿨어 반영해줘", "rename 재동기화", "프레임명 정리 후 업데이트" | `docs/frame-naming-and-resync-workflow.md` Section 3 절차 (수작업 rename→op:extract 재추출→snapshot/screens.json/coverage 갱신→check/audit) |
| "Figma 최신 상태 동기화해줘", "최신 화면 반영해줘" | `docs/figma-design-sync-workflow.md` 절차 (extract + screenshot + manifest/snapshot 갱신) |
| "PRD 대비 빠진 화면 찾아줘", "디자인 누락 확인해줘", "상태 디자인 빠진 거 찾아줘" | `docs/figma-design-sync-workflow.md`의 Design Coverage Audit 절차 — **반드시 PRD Source Discovery(Section 2) → 모드 선택(Section 3) → Pre-check 출력(Section 4) 순서로 시작** |
| "QA 리스트 만들어줘", "QA 케이스 생성해줘", "테스트 케이스 뽑아줘" | `docs/qa-workflow.md` 절차 (PRD source 읽기→requirement extraction→케이스 생성→state/permission matrix→automation 분류) |
| "QA 실행 결과 기록해줘", "Pass/Fail 정리해줘" | `docs/qa-list-workflow.md` 절차 (TC 패턴 생성→design/operations/qa/ 파일 저장) |

해석한 명령을 한 줄로 밝힌 뒤 실행한다.

## 전체 기획 이해 (사이트맵)

이 웹서비스의 전체 메뉴 트리·권한(일반/관리자)·상태 머신·릴리즈 이력·의존관계는
**`design/02-structure/SITEMAP.md`** 에 종합돼 있다(v1~v5 PRD 노란 박스 정독 기반).
새 기획 요청이 오면 먼저 SITEMAP의 "의존관계"로 영향 범위를 파악한 뒤 작업 범위를 잡는다.
화면 ID 체계: 일반 지원 흐름=A 시리즈, AI 심사 관리 기능=J 시리즈. 사람 심사 화면은 J 시리즈와 별개다.

## PRD 생성 (기능 요청 기반)

기능만 대략 요청받으면 **`docs/prd-authoring-workflow.md`** 를 따라 PRD를 생성한다.
8블록(화면개요·진입조건·로딩/예외·상태머신·상태별 UI 매트릭스·정렬/버튼·표기·레이아웃)을
기존 릴리즈 관례를 기본값으로 채운 초안을 만들고, 정말 판단이 필요한 것만 질문해 보완한다.
확정한 PRD는 그대로 new-screen-workflow의 입력이 된다.

## 디자인 생성 규칙 (필수)

화면을 새로 생성하거나 기존 화면을 수정할 때는 `design/03-design-rules/generation/README.md`를 진입점으로 사용한다.
화면 목적에 맞는 archetype·density·layout·component usage·pattern·visual hierarchy·state 규칙을 선택해서 적용한다.
일반적인 SaaS 관습보다 실제 기존 화면과 PRD 근거를 우선한다.

- **신규 화면 생성**: 먼저 사용자/task/outcome을 분석한다. 기존 유형이면 archetype/pattern을 재사용하고, 기존 유형으로 설명되지 않는 신규 기획이면 `design/03-design-rules/generation/novel-screen-reasoning.md`를 따라 pattern 조합 → Candidate Pattern 순으로 판단한다. Product Decision은 근거 없이 발명하지 않는다.
- **기존 화면 수정/기능 추가**: 반드시 `design/03-design-rules/generation/existing-screen-modification.md`를 먼저 읽고, 기존 화면을 baseline으로 유지한 채 ADD/MODIFY/REMOVE delta만 적용한다. PRD에 언급되지 않은 영역은 변경하지 않는다.
- 기존 component instance/JSON 구조가 있으면 새로 비슷하게 만들지 말고 동일 component reference/instance structure를 재사용한다.
- 근거 없는 Card/Table 변환, 고정 pane 비율, 속성 개수 기반 threshold, 임의의 spacing/width 재설계를 하지 않는다.

## PRD Source 우선순위 (Coverage Audit·PRD 기반 작업 전 필수)

Design Coverage Audit 또는 PRD 기반 작업을 시작하기 전에 requirement source를 확정한다.
repo에 역방향 복원 PRD 파일이 있다는 이유만으로 그것을 공식 source로 자동 선택하지 않는다.

우선순위:

1. **ORIGINAL_PRD** — Figma 캔버스 안 실제 노란 박스 PRD 레이어 (내용 있는 것)
2. **RELEASE_FINAL_PDF_PRD** — 해당 릴리즈 확정 PDF 안에 포함된 PRD
3. **RECONSTRUCTED_PRD** — repo 내 역방향 복원 PRD (`design/operations/prd-*/PRD.md` 등)
4. **INFERRED** — SITEMAP/일반 규칙/기존 패턴에서 추론

탐색 규칙:
- Figma에 `PRD` 이름의 레이어가 여러 개 있을 수 있다. 내용 있는 레이어와 빈 레이어를 구분한다.
- 빈 PRD 레이어 하나만 보고 "원본 PRD 없음"으로 결론 내리지 않는다.
- `RECONSTRUCTED_PRD` / `INFERRED`를 근거로 `MISSING_STATE` / `MISSING_DESIGN`을 HIGH Confidence로 확정하지 않는다.
- 원본 PRD가 확인되면 역복원 PRD는 비교/보조용으로만 사용한다.

`design/operations/prd-v5/PRD.md`는 `RECONSTRUCTED` / `AUXILIARY` source다. v5 공식 requirement source로 자동 선택하지 않는다.

상세 절차: `docs/figma-design-sync-workflow.md` Section 2 (PRD Source Discovery).

## Figma 최신 디자인 동기화 (필수)

새 화면 생성/기존 화면 수정 후에는 `docs/figma-design-sync-workflow.md`를 따라
현재 Figma의 실제 화면을 repository에 다시 동기화한다.

- `op:extract` = Figma 구조 JSON
- `op:screenshot` = 실제 frame PNG
- 둘을 모두 최신화해야 이후 기획/QA/coverage 판단의 current source로 사용한다.
- PRD에 정의된 화면/state와 실제 Figma를 비교해 `COVERED / MISSING_DESIGN / MISSING_STATE / MISMATCH / UNVERIFIED`로 판정한다.
- 과거 PDF나 이전 screenshot만으로 현재 디자인이 존재한다고 판단하지 않는다.

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
