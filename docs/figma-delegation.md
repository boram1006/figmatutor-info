# Figma 플러그인 실행 계약 (Kiro)

이 워크스페이스는 Figma 무료 계정 + 데스크탑 플러그인을 쓴다. Dev Mode MCP도, 자식 에이전트
위임(`spawn_agent`)도 없다. 원본(Codex)의 `figma-worker` 위임은 **플러그인 스펙 생성 +
클립보드 왕복**으로 대체한다. 전체 방식은 [플러그인 방식 문서](kiro-figma-plugin.md)가 원본이다.

## 역할과 경계

- Kiro(메인)는 요구사항, 사용자와의 대화, 실제 승인 기록, 로컬 JSON과 게이트를 담당한다.
- Figma 캔버스 생성·스냅샷 추출·캡처는 **플러그인**이 수행한다. Kiro는 플러그인이 실행할
  스펙 JSON을 만들고, 사용자는 그 스펙을 플러그인에 붙여넣어 실행한다.
- 이는 지침 기반 분리이며 기술적 권한 차단이 아니다. 플러그인 스킬 파일이 도구 권한을
  차단한다고 주장하지 않는다.
- 완료 판정의 원본은 여전히 로컬 게이트다. 플러그인 실행 성공은 해당 작업의 완료일 뿐
  전체 디자인 완료가 아니다. 전체 완료는 `npm run audit`, `npm run check`로 판정한다.

## 작업 전달 (스펙)

Kiro는 `design/operations/<task-id>/request.json`에 플러그인 스펙을 작성하고 경로를 사용자에게
알린다. 이 운영 기록은 왕복 원문 보관용이며 승인 지문의 디자인 입력이 아니고 단계 완료 증거를
대신하지 않는다. 스펙의 `op`는 create/extract/screenshot 중 하나다(필드는 플러그인 문서 참고).

```json
{
  "schemaVersion": 1,
  "taskId": "extract-components",
  "op": "extract",
  "fileKey": "실제 파일 키",
  "pageName": "02 Components",
  "stage": "components",
  "inputDigest": "npm run fingerprint -- --scope components 출력",
  "frameIds": [],
  "objective": "컴포넌트 페이지 스냅샷 추출",
  "authorization": "사용자가 허용한 변경 범위 또는 읽기 전용"
}
```

큰 화면 작업은 페이지/컴포넌트/상태 단위로 나눈다. extract가 크면 `frameIds`로 나눠 여러 번
받아 `scripts/merge-snapshots.mjs`로 병합한다. 중간 수정 중 스냅샷 배치를 섞지 않는다.

## 결과 반환

사용자는 플러그인 결과 JSON을 저장한다. 원문·캡처·스냅샷·노드 트리는 메인 대화에 붙이지 않고
`design/operations/<task-id>/`(또는 정식 스냅샷 경로)에 파일로 보존한다.

- create 결과: `design/operations/<task-id>/result.json`. Kiro는 반환된 실제 노드 ID를
  `catalog.json`·`screens.json` 등에 기록한다.
- extract 결과: `npm run save-snapshot -- --stage <components|screens> --from <경로>`로 정식
  스냅샷 경로에 저장한다. 저장은 검증이 아니며, 이어서 `npm run check -- --phase <stage>`로 판정한다.
- screenshot 결과: base64 PNG를 사용자가 파일로 저장한다. 저장 경로·해시는 검증 계약을 따른다.

시각 검토는 실제 캡처 이미지를 열어 수행한다. 검토하지 않은 이미지를 봤다고 쓰지 않는다.
대표 이미지 하나 정도는 메인이 직접 검토할 수 있으나 전체 이미지를 대화에 반복 로드하지 않는다.

## 금지

- 스냅샷·검사 결과·시각 관찰을 손으로 만들어 게이트를 통과시키지 않는다. 규칙 위반은
  스펙/캔버스를 고쳐 해결한다.
- 폴더 존재·체크표시·이전 PASS만으로 완료를 판정하지 않는다.
- 사용자 승인을 임의로 만들거나 기존 승인 범위를 확장하지 않는다.
