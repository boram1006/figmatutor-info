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
(`create` / `extract` / `screenshot` / `rebind` / `duplicate`)

### `op: "create"` — 캔버스 생성

토큰/시안/컴포넌트/화면을 그린다. 스펙에는 대상 페이지, 만들 변수·텍스트 스타일,
프레임·노드 트리, 각 노드의 `designHarness` 메타데이터를 담는다. 플러그인은 생성한 실제
노드 ID를 result.json에 돌려준다. Kiro는 그 ID를 `catalog.json`·`screens.json` 등에 기록한다.

- primitives 변수 → semantic alias → text style 순서로 처리한다.
- **동일 이름의 기존 variable/text style이 이미 있으면 새로 만들지 않는다.** 정의까지 동일하면 기존 자산을 재사용하고 결과의 `reused`에 ID를 기록한다.
- 동일 이름인데 type/value/alias/font/size/line-height 정의가 다르면 기존 Design System을 덮어쓰거나 중복 생성하지 않고 create를 실패시킨다.
- 색·padding·spacing·radius는 semantic 변수에 바인딩한다. 타이포는 `Text/*` 스타일을 쓴다.
- 기존 Figma component가 있으면 primitive로 유사하게 다시 만들지 않고 `type:"INSTANCE"` + `componentNodeId`로 실제 instance를 생성한다.
- `componentNodeId`가 COMPONENT_SET이면 `variantName` 또는 `variantProperties`로 정확히 하나의 variant를 선택한다. 여러 variant 중 임의 선택하지 않는다.
- instance의 label/variant/property 변경은 `componentProperties`를 사용한다.
- INSTANCE에 `children`, `fills`, `strokes`, `metrics`를 넣어 내부 visual을 재구성하는 것은 금지한다.
- component geometry는 기본 보존한다. width/height 직접 resize가 정말 필요할 때만 `allowResize:true`를 명시한다.
- 결과의 `created.instances`에 실제 생성 instance ID와 resolved component/variant ID를 기록한다.
- 가변 콘텐츠 컨테이너는 HUG. 고정 높이는 catalog의 토큰 값과 일치시킨다.
- 노드 의미는 `node.setSharedPluginData('designHarness','metadata', JSON.stringify(meta))`로 기록한다.
  (`docs/figma-contract.md`의 메타데이터 계약과 동일.)
- 이미지 슬롯: 플러그인이 붙여넣은 base64/바이트로 `figma.createImage()` → 실제 imageHash를
  반환한다. 슬롯 paint는 FIT, 슬롯 바탕은 `color-character-bg`.

#### 기존 복합 패턴 CLONE 재사용 예시

카드/섹션/복합 블록처럼 실제 양산 화면에 이미 존재하는 구조는 `op:create`의 `type:"CLONE"`으로 재사용한다.
`CLONE`은 새 화면의 FRAME 안에 기존 패턴을 그대로 복제하고, 명시한 최소 patch만 적용한다.

```json
{
  "op": "create",
  "fileKey": "...",
  "pageName": "design",
  "nodes": [
    {
      "type": "FRAME",
      "key": "newScreen",
      "name": "A-NEW 신규 화면",
      "children": [
        {
          "type": "CLONE",
          "key": "statusCard",
          "sourceNodeId": "1:23081",
          "name": "Status Card",
          "patches": [
            {
              "nodeName": "Card Title",
              "characters": "새 화면의 제목",
              "expectedMatches": 1
            }
          ]
        },
        {
          "type": "INSTANCE",
          "key": "primaryButton",
          "componentNodeId": "1:637",
          "componentProperties": {
            "Label": "계속하기"
          }
        }
      ]
    }
  ]
}
```

CLONE 규칙:
- `sourceNodeId`는 snapshot에서 확인한 실제 Figma node ID를 사용한다.
- clone 직후 Exact Clone 검증 → 최소 patch 검증 → 새 parent에 reparent한 뒤 composition 검증까지 수행한다.
- `children`, `fills`, `strokes`, `metrics`, `layout`, `width/height`, `clip/scroll`로 clone을 다시 설계하지 않는다.
- 필요한 변화는 `patches`의 `characters / fillBinding / fillColor / rename / visible`만 사용한다.
- 결과의 `created.clones`에 sourceNodeId, patch 매칭 결과, prePatch/postPatch/composition 검증이 기록된다.
- 새 parent의 Auto Layout 때문에 생기는 파생 width/height 변화는 `composition.geometryChanges`로 기록하고 구조/style 변화는 실패시킨다.

#### 기존 Component Instance 재사용 예시

```json
{
  "op": "create",
  "fileKey": "...",
  "pageName": "design",
  "nodes": [
    {
      "type": "INSTANCE",
      "key": "submitButton",
      "name": "최종 제출",
      "componentNodeId": "1:637",
      "variantProperties": {
        "Type": "Solid",
        "State": "Default"
      },
      "componentProperties": {
        "Label": "최종 제출하기"
      },
      "layoutSizingHorizontal": "HUG",
      "layoutSizingVertical": "HUG"
    }
  ]
}
```

`componentNodeId`는 임의 문자열이 아니라 catalog/snapshot에서 확인한 실제 Figma COMPONENT 또는 COMPONENT_SET node ID를 사용한다.

### `op: "extract"` — 스냅샷 추출

`scripts/figma/extract-snapshot.js`와 **동일한 추출 로직**을 플러그인 안에서 실행한다.
결과 스냅샷 JSON은 `scripts/lib/snapshot.mjs` 게이트가 그대로 검증할 수 있는 스키마다.

- 스펙에 `pageName`, `stage`(`components`|`screens`), `inputDigest`, 선택적 `frameIds`를 담는다.
- `inputDigest`는 `npm run fingerprint -- --scope <components|screens>` 출력값을 그대로 쓴다.
- 응답이 크면 `frameIds`로 나눠 여러 번 추출하고 `scripts/merge-snapshots.mjs`로 병합한다.
- snapshot node에는 기본 bounds/token binding 외에 신규 생성·복제 검증에 필요한 원본 정보도 보존한다: horizontal/vertical sizing, primary/counter axis sizing·alignment, wrap, constraints, opacity/blend, stroke, effects, text auto-resize/alignment/letter-spacing, instance main-component 및 component/variant properties.
- 이 정보는 **원본을 더 정확히 이해하기 위한 evidence**이며, 추출 값을 보고 기존 화면을 임의로 normalize하라는 의미가 아니다.
- 이 단계에서는 캔버스를 수정하지 않는다.

### `op: "duplicate"` — 기존 노드 복제 + 최소 패치 (Exact Clone → Minimal Patch)

**기존 화면/카드/컴포넌트의 변형(variant, 상태 카드)을 만들 때는 `op:create`로 재생성하지 않고 `op:duplicate`로 원본을 복제한다.**

원칙: **Exact Clone → Minimal Patch**
- Figma 네이티브 `node.clone()`으로 원본 트리 전체를 그대로 복제한다(레이아웃·인스턴스 reference·variant·overrides·effects·token binding 유지).
- 복제 직후에는 어떤 속성도 재설정하지 않는다. width/height 재지정, HUG/FILL 재설정, token 재바인딩, component 재생성 금지 — 복제 정확도를 깨뜨린다.
- 그 다음 **명시적으로 지정한 노드의 최소 속성만** 패치한다.

`op:create`로 유사 구조를 새로 그리면 레이아웃·auto-layout·sizing이 원본과 어긋나므로, 기존 요소가 있으면 반드시 `duplicate`를 쓴다.

스펙 형식:

```json
{
  "op": "duplicate",
  "fileKey": "...",
  "pageName": "design",
  "items": [
    {
      "sourceId": "1:23081",            // 복제 원본 노드 ID
      "name": "Card-SUBMITTED-DONE",    // 복제본 이름
      "x": 7600, "y": 392,              // 복제본 위치 (optional)
      "patches": [
        { "nodeName": "Status Pill", "fillBinding": "background-surface" },
        { "nodeName": "본선 진행중", "characters": "제출완료", "fillBinding": "status-success-s", "rename": "제출완료" },
        { "nodeName": "이어 작성하기 →", "characters": "제출 내용 보기 →", "rename": "제출 내용 보기 →" },
        { "nodeName": "Left Status", "visible": false }
      ]
    }
  ]
}
```

patch 필드:
- `nodeName` — 복제본 트리에서 이름으로 찾을 대상(DFS, 동명 다수 매칭). **원본의 실제 노드 이름을 snapshot에서 확인해 쓴다.** 기본 정책은 strict이며 0건 매칭이면 해당 duplicate item 전체가 실패하고 생성된 clone도 제거된다.
- `expectedMatches` — optional. 같은 이름의 노드가 여러 개 있을 때 정확히 몇 개가 매칭되어야 하는지 지정한다. 실제 매칭 수가 다르면 해당 item 전체를 실패시킨다.
- `characters` — TEXT 노드 문자열 교체(원본 폰트/스타일 유지, `figma.mixed` 폰트 안전 로드).
- `fillBinding` — fill을 **semantic 토큰에 바인딩**(권장, harness 색 규칙 준수).
- `fillColor` — raw hex fill(바인딩 제거, `fillBinding` 없을 때만).
- `rename` — 노드 이름 변경(패치 후 노드명 정리용).
- `visible` — 표시/숨김(PRD 상태에 없는 요소 제거용. 예: 제출완료 카드에서 작성중 전용 진행률 바 숨김).

검증:
- clone 직후, patch 전에 원본과 복제본의 트리/노드 타입/child 순서·수/layout/constraints/component-instance 연결/style/fill/stroke/effect/typography 등을 비교한다.
- 이 **prePatch 검증이 다르면 patch를 시작하지 않고 실패**하며 clone을 제거한다.
- patch 후에는 스펙이 명시적으로 허용한 `name / visible / characters / fills` 외의 구조적 속성이 바뀌지 않았는지 다시 비교한다.
- 텍스트 길이와 Auto Layout 때문에 자연스럽게 파생될 수 있는 `width / height` 변화는 실패시키지 않고 `geometryChanges`에 별도로 기록한다.
- 결과의 `items[].verification.prePatch`와 `items[].verification.postPatch`를 확인한다. `counts.verifiedItems`는 두 검증을 모두 통과한 item 수다.
- 검증 실패 시 부분 수정된 clone을 남기지 않는다.

주의:
- 결과 `created`에 복제본 노드 ID가 담긴다.
- `items[].patches[]`에는 각 patch의 `matchedCount`, `targetIds`, `applied`가 기록된다. `counts`에는 요청/적용 item·patch 수가 집계된다.
- 패치 대상이 0건이면 **silent skip하지 않고 실패**한다. 해당 item에서 이미 만든 clone도 제거해 부분 결과를 남기지 않는다.
- 동일 이름이 여러 곳에 존재할 수 있고 정확한 개수가 중요하면 `expectedMatches`를 반드시 지정한다.
- `characters`를 TEXT가 아닌 노드에 적용하거나 fill patch를 fills가 없는 노드에 적용하는 등 타입이 맞지 않는 patch도 실패한다.
- 상태 카드를 만들 땐 배지·CTA뿐 아니라 **PRD 상태별 UI 매트릭스의 모든 요소**(부가 표시·시간 표기·진행률 유무)를 patch 목록에 포함했는지 대조한다.

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
