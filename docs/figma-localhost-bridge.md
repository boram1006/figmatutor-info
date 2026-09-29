# Figma localhost bridge

Design Flow Harness의 localhost bridge는 **Figma MCP 대체물이 아니다**.
Figma 캔버스 실행 권한과 mutation/extract 로직은 계속 Figma Desktop 안의 기존 plugin이 담당한다.
bridge는 repo의 JSON 파일과 plugin UI 사이의 transport만 자동화한다.

## MVP scope

현재 지원:

1. repo의 `design/operations/**/*.json` spec 읽기
2. Figma plugin UI에서 localhost로 spec GET
3. 기존 plugin `Run` 실행
4. plugin 결과 JSON을 localhost로 POST
5. 지정한 `design/operations/**/*.json` 경로에 저장

현재 미지원:

- 최근 spec 자동 탐색/선택
- op별 result filename 자동 결정
- PNG/screenshot binary 저장
- Kiro workflow 자동 실행
- Figma 실행 자체 자동화

## Architecture

```
repo JSON
  ↓
scripts/figma-plugin/bridge-server.mjs
  GET /api/spec?path=...
  ↑                    ↓
Figma plugin UI      POST /api/result
  ↓
existing code.js Run
  ↓
Figma Desktop Plugin API
```

`code.js`의 create/extract/discover/screenshot/rebind/duplicate/update 실행 계약은 변경하지 않는다.
bridge 장애가 Figma 실행 장애로 전파되지 않도록 clipboard 방식은 항상 fallback으로 남긴다.

## Start

repo root에서:

```sh
npm run figma:bridge
```

기본값:

- URL: `http://localhost:3845`
- listen host: `127.0.0.1`
- repo root: 현재 저장소
- 허용 파일 root: `design/operations/`

환경변수:

- `FIGMA_BRIDGE_HOST`
- `FIGMA_BRIDGE_PORT`
- `FIGMA_BRIDGE_REPO_ROOT`

MVP plugin manifest는 개발용 `localhost:3845`만 허용하므로, 포트를 바꾸면 manifest의
`devAllowedDomains`도 명시적으로 함께 바꿔야 한다.

상태 확인:

```sh
curl http://localhost:3845/health
```

## Plugin usage

1. repo를 최신 `main`으로 pull한다.
2. 터미널에서 `npm run figma:bridge`를 실행한다.
3. Figma Desktop에서 Development → Design Flow Harness를 연다.
4. **Spec 경로**에 예:
   `design/operations/v6-judging-result/request.json`
5. **localhost에서 Spec 불러오기**를 누른다.
6. 필요하면 **결과 저장 경로**를 예:
   `design/operations/v6-judging-result/result.json`
7. **Run**을 누른다.
8. 자동 저장 체크가 켜져 있고 결과 경로가 있으면 Run 완료 후 바로 파일에 저장된다.
9. 저장 실패 시 결과 영역의 JSON은 유지되므로 기존 **결과 복사** 방식으로 복구한다.

## API

### GET /api/spec

```
GET /api/spec?path=design/operations/<task>/request.json
```

응답:

```json
{
  "ok": true,
  "path": "design/operations/<task>/request.json",
  "spec": {}
}
```

### POST /api/result

```json
{
  "path": "design/operations/<task>/result.json",
  "data": {}
}
```

server는 `data`를 pretty JSON + trailing newline으로 저장한다.

## Safety rules

- server는 기본적으로 `127.0.0.1`에만 bind한다.
- read/write 모두 repo 상대경로만 허용한다.
- 허용 root는 `design/operations/` 하나다.
- `.json` 파일만 허용한다.
- absolute path, `../` traversal, 허용 root 밖 경로는 거부한다.
- request body는 최대 64 MiB다. 큰 scoped snapshot도 JSON으로 전송할 수 있게 잡되 무제한 업로드는 막는다.
- bridge는 Figma nodeId/component/variant/token을 해석하거나 보정하지 않는다.
- plugin result를 수정하거나 gate PASS를 만들어내지 않는다.
- bridge 실패 시 기존 paste/run/copy workflow를 사용한다.

## Tests

경로 allowlist 테스트:

```sh
node --test tests/figma-plugin-bridge.test.mjs
```

전체 테스트:

```sh
npm test
```

수동 smoke test:

1. 허용 경로에 작은 JSON spec을 둔다.
2. `npm run figma:bridge`
3. plugin에서 spec load
4. Run
5. 결과 경로에 파일 생성 확인
6. server를 종료한 뒤 paste → Run → 결과 복사가 여전히 동작하는지 확인
7. `../package.json` 같은 경로가 GET/POST에서 거부되는지 확인

## Operational rule

AI/Kiro가 bridge용 spec을 만들 때도 기존 원칙은 같다.

- 먼저 최신 `main`
- spec은 `design/operations/<task>/` 아래 저장
- nodeId/component/variant/token 추측 금지
- plugin Run 성공만으로 완료 처리 금지
- mutation 후 scoped extract/snapshot/coverage 검증 유지
- bridge는 transport 최적화일 뿐 Harness 검증 단계를 생략하는 이유가 아니다
