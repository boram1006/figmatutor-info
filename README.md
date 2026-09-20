# Design Flow Harness — Codex

Codex에서 모바일 Figma UI를 만드는 프로젝트 전용 하네스입니다.
하네스 구조 관련된 내용은 이 영상을 참고해 보세요.
https://youtu.be/yQcR1Dz5UDA?si=rnqF6nlvn7TSfW2O

**요구사항·레퍼런스 → 최소 토큰 → 대표 화면 시안 2~3개 → 방향 선택 → 컴포넌트 정리 → 전체 화면·상태 확장 → 검증**

팀에서 복제해 사용하는 디자인 하네스 템플릿입니다. 지침·스킬·검증기와 빈 JSON 초안을 포함합니다.
기존 프로젝트의 PRD, 이미지, 승인 기록, Figma 연결 정보와 디자인 산출물은 포함하지 않습니다.

## 시작

1. 저장소를 복제하고 Codex에서 **해당 폴더를 프로젝트로 열기**.
2. `PRD.md`를 작성하고 `harness.config.json`의 `project`, `figma.fileKey`, `representativeScreenId`, viewport를 설정합니다. Figma 파일 키는 `/design/` 다음 경로입니다. `docs/token-library-guide.md`의 참고 파일을 작업 대상으로 사용하지 마세요.
3. 공유·사용 가능한 캐릭터 PNG/JPEG/WebP 원본을 `design/characters/`에 넣습니다. 기본 정책은 이미지 생성 없이 FIT 배치와 파스텔 하늘색 여백입니다.
4. Node.js 18 이상에서 로컬 상태 확인 (`npm install` 불필요):

```sh
npm test
npm run doctor
npm run status
```

5. Codex에 요청:

```text
$ui-flow
PRD.md를 검토하고 레퍼런스를 수집해서 새 프로젝트 UI를 시작해줘.
최소 토큰으로 홈 대표 시안 2~3개를 보여주고 내가 방향을 선택하면 확장해줘.
```

초기 `npm run status`는 `inputs`를 다음 단계로 표시하며, `npm run check`는 실패하는 것이 정상입니다.
`npm test`는 독립 테스트 데이터로 하네스 자체를 검사합니다. 실제 작업 전 Figma 파일 접근 권한과 도구 연결을 확인하세요.
방향 선택 기록·스냅샷·검증 결과는 작업을 진행하면서 생성되며 템플릿에는 없습니다.

자연어로 요청해도 `AGENTS.md`의 라우팅을 따른다. `agent.md`가 아닌 **AGENTS.md**가 공식 프로젝트 진입점이다.
Codex 스킬은 `.agents/skills`에서 발견된다. 기존 세션에서 새 스킬이 보이지 않으면 새 세션으로 열거나 SKILL.md를 직접 읽게 한다.

## 이미지 정책

이미지 생성 단계 없이 `design/characters`의 보유 원본만 재사용합니다.
`npm run assets:list`로 목록을 확인하고, Figma에는 FIT로 배치합니다.
남는 영역은 파스텔 하늘색 `#E3F2FD`로 채웁니다. 원본에 포함된 배경은 유지합니다.
생성 서비스 provider·예산·job 제출/대기 설정은 사용하지 않습니다.
현재 진행 상태는 `npm run status`가 판정하며 과거 문서의 PASS를 재사용하지 않습니다.

## 폴더

```text
AGENTS.md                       Codex의 프로젝트 지침
.agents/skills/                 기존 역할명과 맞춘 6개 단계 스킬 + ui-flow + figma-worker
harness.config.json             화면 크기·대표 화면·캐릭터 이미지 정책·Figma 대상
PRD.md                          요구사항 원문
design/01-references/           레퍼런스 원본·목록·분석
design/02-structure/            화면·상태·흐름 JSON과 설계 결정
design/03-design-rules/         토큰·대표 시안·방향 선택·컴포넌트
design/04-screens/              전체 화면·상태·이미지·스냅샷·최종 검증
design/characters/              새 프로젝트의 캐릭터 원본을 넣는 빈 폴더
scripts/                       게이트·해시·토큰 내보내기
scripts/figma/                 Figma 런타임용 고정 스냅샷 추출기
tests/                         게이트 오탐·미탐 회귀 테스트
docs/                          계약, Figma 절차, 도구 어댑터
```

상위 design 폴더명과 단계 역할명은 기존 프로젝트와 동일하다. 현재 하네스에서 추가된 시안 비교,
방향 선택, 스냅샷과 검증 자료는 해당 단계 아래의 하위 폴더에 보존한다.

## 명령

| 명령 | 용도 |
| --- | --- |
| `npm run status` | 읽기 전용 현재 상태; 미완료여도 exit 0 |
| `npm run check -- --phase inputs` | 해당 단계 및 선행 단계 검증; 실패 exit 1 |
| `npm run check` | 7단계 전체 재검증 |
| `npm run tokens:export` | JSON 원본에서 CSS/JSON 파생 산출물 생성 |
| `npm run select -- --concept a --user-message "A안으로 진행해줘"` | 실제 사용자 선택을 기록할 때만 실행 |
| `npm run fingerprint -- --scope components` | Figma 추출기 입력 지문 (`screens`, `review`도 지원) |
| `npm run audit` | 구조·시각·콘텐츠 검토를 종합해 audit.json 기록 |
| `npm run doctor` | 로컬 전제 조건 확인; MCP 인증 판정은 하지 않음 |
| `npm run assets:list` | 사용 가능한 보유 캐릭터 원본 목록 |
| `npm test` | 외부 서비스 호출 없는 회귀 테스트 |

`npm run check -- --json`으로 기계 판정 JSON을 받을 수 있습니다.
시안 선택 기록은 사용자의 실제 발언을 보관하는 장치이며 인증·전자서명 시스템이 아닙니다.

## 운영 범위

기본 대상은 Figma 모바일 화면입니다. viewport와 화면 수는 설정/요구사항에서 바꿀 수 있으나,
React 구현·실제 브라우저 상호작용·WCAG 전 항목 인증은 포함하지 않습니다.
구조 검사는 변수 실제 값, semantic alias, 수치 바인딩, 탭 영역, 넘침, 상태 누락을 검사합니다.
시각적 위계·가독성·브랜드 적합성은 실제 이미지 관찰을 별도 기록하고 자동 게이트와 합칩니다.
Figma/API 연결은 실제 디자인 작업 시 확인합니다. 로컬 테스트 통과가 외부 서비스 실행 성공을 의미하지 않습니다.

자세한 계약은 [docs/contracts.md](docs/contracts.md), 도구 절차는 [docs/tool-adapters.md](docs/tool-adapters.md).

## Figma 실행 분리

Figma MCP는 전담 자식 에이전트가 호출하고 원본·캡처·스냅샷은 로컬 파일에 저장합니다. 메인은 작업 계약과 짧은 결과만 받습니다. [위임 절차](docs/figma-delegation.md)를 참고하세요. 이는 에이전트 지침에 의한 분리이며 MCP 권한 차단 기능은 아닙니다.

토큰 라이브러리는 사용자 지정 Figma 문서의 계열별 섹션과 견본·이름·값 카드 구성을 따릅니다. [제작 가이드](docs/token-library-guide.md)에 실제 조사 근거와 적용·검증 절차를 정리했습니다.

컴포넌트 라이브러리는 사용자 지정 Figma 레퍼런스를 참고해 카테고리별로 정리합니다. 방향 선택 이후 실제 마스터·상태·사용 예시를 구성하고 [컴포넌트 제작 가이드](docs/component-library-guide.md)에 따라 검증합니다.
