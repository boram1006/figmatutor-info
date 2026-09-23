# Kiro Figma 플러그인 방식 (대안 1: Plugin API로 그리기)

이 워크스페이스는 Figma 무료 계정을 대상으로 한다. Dev Mode MCP를 쓰지 않는다.
대신 **AI가 Figma 플러그인에서 실행할 JS 스펙/스크립트를 생성**하고, 사용자가 Figma
데스크탑 플러그인에서 실행하는 방식으로 캔버스를 만들고 스냅샷을 추출한다.

이 문서는 steering(`design-flow-harness`)이 지정한 플러그인 방식의 원본 계약이다.
`docs/figma-contract.md`(산출물 계약)와 `docs/contracts.md`(JSON 게이트 계약)는 그대로
유효하며, 이 문서는 "그 계약을 어떻게 플러그인으로 충족하는가"만 정의한다.

## 핵심 원칙

- 게이트 판정의 원본은 여전히 로컬 JSON 계약이다. 플러그인은 캔버스를 만들고 스냅샷을
  추출하는 실행 주체일 뿐, 완료를 판정하지 않는다. 완료는 `npm run check` / `npm run audit`.
- 클립보드가 파일 I/O를 대체한다. 무료 계정 플러그인은 로컬 저장소를 직접 읽고 쓸 수 없으므로,
  스펙 JSON은 사용자가 플러그인 UI에 붙여넣고, 결과 JSON은 사용자가 저장 경로에 붙여넣는다.
- 로컬 브릿지(localhost 자동 왕복)는 이후 확장이다. 현재는 클립보드 왕복만 사용한다.
- 이미지 생성 단계를 쓰지 않는다. `design/characters`의 보유 원본만 FIT로 배치하고,
  남는 영역은 `color-character-bg`(#E3F2FD)로 채운다. 헤더 로고는 `Logo.svg` 원본을 쓴다.
  (플러그인은 free 계정에서 이미지 바이트를 직접 업로드해 imageHash를 만들 수 있다. 아래 참고.)

## 1회 설치 (Figma 데스크탑)

1. 이 저장소의 `scripts/figma-plugin/manifest.json`을 사용한다.
2. Figma 데스크탑 → Plugins → Development → **Import plugin from manifest…** → 위 manifest 선택.
3. 이후 매 단계마다 재설치할 필요 없다. Plugins → Development → **Design Flow Harness**로 실행한다.
4. 플러그인은 재사용형이다. 실행할 때마다 붙여넣는 스펙 JSON의 `op` 필드로 동작이 결정된다.

## 왕복 흐름 (모든 Figma 단계 공통)

```
Kiro가 스펙 JSON 작성
  → design/operations/<task-id>/request.json 에 저장
사용자가 request.json 내용을 복사
  → Figma 플러그인 UI 텍스트영역에 붙여넣기 → Run
플러그인이 op에 따라 캔버스 생성 또는 스냅샷 추출
  → 결과 JSON을 플러그인 UI 출력 영역에 표시
사용자가 결과 JSON을 복사
  → create 결과: design/operations/<task-id>/result.json 에 저장
  → extract 결과: 아래 "스냅샷 저장 경로"에 저장 (npm run save-snapshot 권장)
Kiro가 result/snapshot 을 읽고 로컬 게이트로 검증
```

운영 폴더(`design/operations/<task-id>/`)는 왕복 원문 보관용이다. 승인 지문의 디자인
입력이 아니며 단계 완료 증거를 대신하지 않는다.

## 스펙(op) 종류

플러그인이 받는 스펙 JSON은 `op` 필드로 동작을 고른다.

### `op: "create"` — 캔버스 생성

토큰/시안/컴포넌트/화면을 그린다. 스펙에는 대상 페이지, 만들 변수·텍스트 스타일,
프레임·노드 트리, 각 노드의 `designHarness` 메타데이터를 담는다. 플러그인은 생성한 실제
노드 ID를 result.json에 돌려준다. Kiro는 그 ID를 `catalog.json`·`screens.json` 등에 기록한다.

- primitives 변수 → semantic alias → text style 순서로 만든다.
- 색·padding·spacing·radius는 semantic 변수에 바인딩한다. 타이포는 `Text/*` 스타일을 쓴다.
- 가변 콘텐츠 컨테이너는 HUG. 고정 높이는 catalog의 토큰 값과 일치시킨다.
- 노드 의미는 `node.setSharedPluginData('designHarness','metadata', JSON.stringify(meta))`로 기록한다.
  (`docs/figma-contract.md`의 메타데이터 계약과 동일.)
- 이미지 슬롯: 플러그인이 붙여넣은 base64/바이트로 `figma.createImage()` → 실제 imageHash를
  반환한다. 슬롯 paint는 FIT, 슬롯 바탕은 `color-character-bg`.

### `op: "extract"` — 스냅샷 추출

`scripts/figma/extract-snapshot.js`와 **동일한 추출 로직**을 플러그인 안에서 실행한다.
결과 스냅샷 JSON은 `scripts/lib/snapshot.mjs` 게이트가 그대로 검증할 수 있는 스키마다.

- 스펙에 `pageName`, `stage`(`components`|`screens`), `inputDigest`, 선택적 `frameIds`를 담는다.
- `inputDigest`는 `npm run fingerprint -- --scope <components|screens>` 출력값을 그대로 쓴다.
- 응답이 크면 `frameIds`로 나눠 여러 번 추출하고 `scripts/merge-snapshots.mjs`로 병합한다.
- 이 단계에서는 캔버스를 수정하지 않는다.

### `op: "screenshot"` — 캡처 저장 (검증 단계)

시각 검토·contentTests용 캡처는 플러그인의 `exportAsync`(PNG) 결과를 사용자가 파일로 저장한다.
저장 경로·해시는 `docs/figma-contract.md`와 `docs/contracts.md`의 검증 계약을 따른다.

## 스냅샷 저장 경로

| stage | 저장 경로 |
| --- | --- |
| components | `design/03-design-rules/components/snapshot.json` |
| screens | `design/04-screens/snapshot.json` |

붙여넣기 실수를 줄이려면 다음 헬퍼를 쓴다(원문 검증 후 저장):

```sh
npm run save-snapshot -- --stage components --from design/operations/<task-id>/snapshot.json
```

`--from`에 플러그인 결과를 저장한 파일 경로를 준다. 헬퍼는 JSON 파싱·`stage` 일치·`complete`
여부를 확인한 뒤 위 표의 정식 경로에 기록한다. 이후 `npm run check -- --phase <stage>`로 판정한다.

## 게이트와의 관계 (변하지 않는 것)

- 스냅샷 스키마·필드·검사 규칙은 그대로다. 플러그인은 같은 JSON을 만들어낼 뿐이다.
- `harness.config.json`의 `figma.fileKey`는 여전히 필요하다. 플러그인이 `figma.fileKey`를
  읽어 스냅샷에 기록하고, 게이트가 config와 대조한다. free 계정에서 fileKey를 얻는 방법은
  `docs/tool-adapters.md`의 Figma 섹션을 따른다.
- 폴더 존재·체크표시·이전 PASS로 완료를 판정하지 않는다. 규칙 위반은 스펙/캔버스를 고쳐
  해결하고, 스냅샷·검사 결과를 손으로 조작해 통과시키지 않는다.

## Codex 위임과의 차이

원본(Codex)은 Figma MCP 호출을 `figma-worker` 자식 에이전트에 위임했다. Kiro + 무료 계정에는
MCP도 `spawn_agent` 위임도 없다. 따라서:

- Figma "작업"은 플러그인 스펙 생성 + 클립보드 왕복으로 대체한다.
- 원문 응답·대용량 데이터(노드 트리·스냅샷·캡처)는 메인 대화에 붙이지 않고
  `design/operations/<task-id>/`에 파일로 보존한다.
- `figma-worker` 스킬과 `docs/figma-delegation.md`는 이 플러그인 왕복 규약으로 읽는다.
