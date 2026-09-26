# Design System 수동 Refresh Workflow

Figma 무료 계정에서 MCP 없이 Design System 변경을 repository 정본에 반영하는 절차다.

## 언제 실행하는가

다음 중 하나면 **새 화면 생성 전에** 실행한다.

- 사용자가 Figma Design System의 component/variant/token/text style을 수정했다고 알림
- `harness.config.json.figma.fileKey`와 `design/03-design-rules/components/snapshot.json.fileKey`가 다름
- catalog의 componentNodeId/state/property가 현재 Figma와 다를 가능성이 있음

요약 메모나 과거 screenshot만으로 최신이라고 판단하지 않는다.

## 1. Extract spec 생성

Plugin용 `op:extract`를 만든다.

```json
{
  "op": "extract",
  "fileKey": "<harness.config.json의 현재 fileKey>",
  "pageName": "Design System",
  "stage": "components",
  "inputDigest": "<npm run fingerprint -- --scope components 결과>",
  "frameIds": []
}
```

페이지가 너무 크면 실제 top-level component/frame ID로 나눠 추출하고 마지막에 merge한다.
nodeId, variant property, token 이름을 추측해서 spec에 넣지 않는다.

## 2. 사용자가 Figma Plugin에서 실행

1. Design Flow Harness plugin 실행
2. extract spec 붙여넣기
3. Run
4. **출력 JSON 원문 전체를 UTF-8로 저장**

운영 원문 예:
`design/operations/components-refresh-YYYYMMDD/snapshot-components.json`

**요약본만 저장하면 안 된다.** 요약은 메모일 뿐 canonical snapshot을 만들 수 없다.

## 3. 배치 merge + fingerprint 자동 주입

배치 extract 결과의 `inputDigest`는 신뢰하지 않는다. 사용자가 fingerprint를 직접 복붙하지 않아도 된다.

```sh
npm run merge:components-snapshot -- --dir design/operations/components-refresh-YYYYMMDD
```

이 명령은:
- batch 간 fileKey/pageId/expectedFrameIds 일치 확인
- 모든 expected frame이 정확히 한 번씩 포함됐는지 확인
- variables/textStyles가 batch 간 동일한지 확인
- 현재 repo의 components fingerprint를 직접 계산
- 계산된 값을 merged snapshot의 `inputDigest`에 자동 주입
- `complete:true`인 `snapshot-components-merged.json` 생성

원본 batch JSON의 placeholder `inputDigest`는 수정하지 않는다. raw evidence 그대로 보관한다.

## 4. Canonical snapshot 갱신

```sh
npm run save-snapshot -- --stage components --from design/operations/components-refresh-YYYYMMDD/snapshot-components-merged.json
```

저장 후 반드시 확인:
- canonical snapshot `fileKey` == `harness.config.json.figma.fileKey`
- `complete:true` 또는 의도한 분할 extract가 모두 merge됨
- Button/Tag 등 필요한 COMPONENT/COMPONENT_SET과 variant child가 포함됨

## 5. tokens/catalog 역동기화

추출 원문을 기준으로만 갱신한다.

- 변수/텍스트 스타일 변경 → `tokens.json`
- component nodeId/state/semantic token 사용 변경 → `catalog.json`
- 새 토큰이 정말 추가된 경우만 `token-extensions.json`

기존 토큰/컴포넌트 값을 기억이나 관례로 보정하지 않는다.

## 6. 검증

```sh
npm run check -- --phase components
npm run validate-tokens -- --all
```

둘 중 하나라도 실패하면 화면 생성으로 넘어가지 않는다.

## 7. 화면 생성 시 사용

신규 화면:
- 복합 기존 UI가 있으면 CLONE/INSTANCE_REUSE 우선
- 신규 조립은 `type:"INSTANCE"` + catalog의 실제 `componentNodeId`
- COMPONENT_SET은 실제 `variantProperties`로 variant 선택
- 상태색은 component state로 변경
- text property가 노출되지 않은 component만 strict INSTANCE text patch 허용

Design System 변경 후 생성되는 화면은 이 canonical snapshot/catalog를 source로 사용한다.
