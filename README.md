# Design Flow Harness — Kiro

Kiro에서 데스크탑/모바일 Figma UI를 만드는 프로젝트 전용 하네스입니다.
하네스 구조 관련된 내용은 이 영상을 참고해 보세요.
https://youtu.be/yQcR1Dz5UDA?si=rnqF6nlvn7TSfW2O

**요구사항 → 기존 시스템 추출·정형화 → 컴포넌트(재사용+신규) → 전체 화면·상태 확장(기존+신규) → Figma 최신 상태 동기화 → 디자인 커버리지/구조·시각 검증**

기존 피그마 시스템(변수·컴포넌트·양산 화면)을 추출해 정형화한 뒤 그 위에 새 화면을 추가하는
하네스입니다(extract-extend). 컨셉 탐색·방향 선택 단계는 없습니다. 지침·스킬·검증기와 빈 JSON 초안을 포함합니다.

## 시작

1. 저장소를 복제하고 프로젝트 폴더로 엽니다.
2. `PRD.md`를 작성하고 `harness.config.json`의 `project`, `figma.fileKey`(기존 파일), `extractPages`(추출할 페이지 이름 배열), viewport를 설정합니다. Figma 파일 키는 파일 URL의 `/design/` 또는 `/file/` 다음 경로입니다.
3. 캐릭터 PNG/JPEG/WebP 원본을 `design/characters/`에 넣습니다. 기본 정책은 이미지 생성 없이 FIT 배치와 파스텔 하늘색 여백입니다.
4. Figma 데스크탑에 플러그인을 1회 설치합니다: Plugins → Development → Import plugin from manifest → `scripts/figma-plugin/manifest.json`.
5. Node.js 18 이상에서 로컬 상태 확인 (`npm install` 불필요):

```sh
npm test
npm run doctor
npm run status
```

6. 에이전트에 요청:

```text
$ui-flow
PRD.md를 검토하고 기존 피그마 시스템을 추출·정형화해줘.
그 위에 필요한 새 화면을 기존 컴포넌트로 확장해줘.
```

초기 `npm run status`는 `inputs`를 다음 단계로 표시하며, `npm run check`는 실패하는 것이 정상입니다.
`npm test`는 독립 테스트 데이터로 하네스 자체를 검사합니다. 실제 작업 전 Figma 파일 접근과 플러그인 설치를 확인하세요.
추출 스냅샷·정형화·검증 결과는 작업을 진행하면서 생성됩니다.

자연어로 요청해도 `AGENTS.md`의 라우팅을 따릅니다. Kiro에서는 `.kiro/steering/design-flow-harness.md`가 진입점입니다.
스킬은 `.agents/skills`에서 발견됩니다. Figma 캔버스 작업은 플러그인 왕복으로 합니다(자세한 내용은 `docs/kiro-figma-plugin.md`).

## 이미지 정책

이미지 생성 단계 없이 `design/characters`의 보유 원본만 재사용합니다.
`npm run assets:list`로 목록을 확인하고, Figma에는 FIT로 배치합니다.
남는 영역은 파스텔 하늘색 `#E3F2FD`로 채웁니다. 원본에 포함된 배경은 유지합니다.
생성 서비스 provider·예산·job 제출/대기 설정은 사용하지 않습니다.
현재 진행 상태는 `npm run status`가 판정하며 과거 문서의 PASS를 재사용하지 않습니다.

## 폴더

```text
AGENTS.md                       프로젝트 지침 (Kiro는 .kiro/steering가 진입점)
.agents/skills/                 단계 스킬 (ui-flow, extract-system, build-structure, create-figma, audit-design, collect/analyze-references, figma-worker)
scripts/figma-plugin/           Figma 데스크탑에 설치하는 재사용 플러그인 (op: create/extract/screenshot)
harness.config.json             화면 크기·extractPages·캐릭터 이미지 정책·Figma 대상
PRD.md                          요구사항 원문
design/01-references/           (선택) 기존 화면 근거 캡처·목록·분석
design/02-structure/            화면·상태·흐름 JSON과 설계 결정
design/03-design-rules/         추출한 토큰·시스템 스냅샷·컴포넌트 카탈로그
design/04-screens/              전체 화면·상태·이미지·스냅샷·최종 검증
design/characters/              새 프로젝트의 캐릭터 원본을 넣는 빈 폴더
scripts/                       게이트·해시·토큰 내보내기
scripts/figma/                 Figma 런타임용 고정 스냅샷 추출기
tests/                         게이트 오탐·미탐 회귀 테스트
docs/                          계약, Figma 절차, 도구 어댑터
```

추출한 시스템 스냅샷·정형화 결과와 검증 자료는 해당 단계 아래의 하위 폴더에 보존한다.

## 명령

| 명령 | 용도 |
| --- | --- |
| `npm run status` | 읽기 전용 현재 상태; 미완료여도 exit 0 |
| `npm run check -- --phase inputs` | 해당 단계 및 선행 단계 검증; 실패 exit 1 |
| `npm run check` | 5단계(inputs → extract-system → components → screens → verification) 전체 재검증 |
| `npm run tokens:export` | tokens.json(추출) + token-extensions.json을 병합해 CSS/JSON 파생 생성 |
| `npm run fingerprint -- --scope system` | 시스템 추출 입력 지문 (`components`, `screens`, `review`도 지원) |
| `npm run save-snapshot -- --stage <extract-system\|components\|screens> --from <경로>` | 플러그인 extract 결과를 정식 스냅샷 경로에 저장 |
| `npm run audit` | 구조·시각·콘텐츠 검토를 종합해 audit.json 기록 |
| `npm run doctor` | 로컬 전제 조건 확인; 플러그인 실행/연결 판정은 하지 않음 |
| `npm run assets:list` | 사용 가능한 보유 캐릭터 원본 목록 |
| `npm test` | 외부 서비스 호출 없는 회귀 테스트 |

`npm run check -- --json`으로 기계 판정 JSON을 받을 수 있습니다.

## 운영 범위

기본 대상은 Figma 모바일 화면입니다. viewport와 화면 수는 설정/요구사항에서 바꿀 수 있으나,
React 구현·실제 브라우저 상호작용·WCAG 전 항목 인증은 포함하지 않습니다.
구조 검사는 변수 실제 값, semantic alias, 수치 바인딩, 탭 영역, 넘침, 상태 누락을 검사합니다.
시각적 위계·가독성·브랜드 적합성은 실제 이미지 관찰을 별도 기록하고 자동 게이트와 합칩니다.
Figma/API 연결은 실제 디자인 작업 시 확인합니다. 로컬 테스트 통과가 외부 서비스 실행 성공을 의미하지 않습니다.

자세한 계약은 [docs/contracts.md](docs/contracts.md), 도구 절차는 [docs/tool-adapters.md](docs/tool-adapters.md).

## Figma 실행 (플러그인 왕복)

Figma 무료 계정 + 데스크탑 플러그인을 씁니다. Dev Mode MCP를 쓰지 않습니다. Kiro가 스펙 JSON
(`op`: create/extract/screenshot)을 만들고 사용자가 플러그인에서 실행합니다. 원본·캡처·스냅샷은
`design/operations/<task-id>/`에 파일로 보존하고, extract 결과는 `npm run save-snapshot`으로 저장합니다.
새 화면 생성/수정 후에는 `docs/figma-design-sync-workflow.md`를 따라 extract(JSON)와 screenshot(PNG)을 모두 최신화하고,
PRD 대비 실제 화면/state 누락을 Design Coverage Audit으로 확인합니다.
자세한 방식은 [플러그인 문서](docs/kiro-figma-plugin.md)와 [실행 계약](docs/figma-delegation.md)을 참고하세요.

토큰 라이브러리 문서는 [제작 가이드](docs/token-library-guide.md)를 따릅니다.
컴포넌트 라이브러리는 카테고리별로 정리하며, extract-system에서 추출한 마스터·상태를 [컴포넌트 제작 가이드](docs/component-library-guide.md)에 따라 검증합니다.
