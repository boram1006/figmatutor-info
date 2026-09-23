# 구조화 계약

모든 활성 JSON은 schemaVersion: 1이다. 아래는 핵심 필드 설명이며 실행 검증의 원본은
scripts/lib/gates.mjs 및 snapshot.mjs다. 주석·본문의 단어 횟수는 검사에 사용하지 않는다.

파이프라인은 5단계다: inputs → extract-system → components → screens → verification.
컨셉 탐색·방향 선택 단계는 없다. 기존 피그마 시스템을 추출·정형화한 뒤 재사용해 확장한다.

## 1. 입력

`design/02-structure/requirements.json`: status(draft/ready), prd(상대경로), audience,
screens, flows, openQuestions. ready는 에이전트의 검토 완료 표시이며 사용자 디자인 승인이 아니다.

각 screen:
- id, name, purpose, primaryAction:{id,label,kind}
- origin: `existing`(기존 피그마 화면) 또는 `new`(새 화면).
  - existing이면 sourceFrame(원본 프레임 식별자, 예: 프레임명@페이지명) 필수.
  - new이면 rationale(추가 근거: PRD 어느 요구·왜 필요) 필수.
- referenceIds: 선택. 지정하면 index.json의 실제 ID여야 한다. (외부 레퍼런스 강제 없음)
- states:[{id,primaryRequired:boolean}]. default 필수. 로딩은 주 액션이 없어도 된다.
- componentIds: 필요한 컴포넌트 ID. 기존 catalog 컴포넌트 재사용이 기본.
- viewportIds: harness.config.json의 viewport ID.
- contentCases: 실제 검사할 긴 문구·항목 수·오류 등의 사례 문자열 목록.
- imageSlots:[{id,assetId,states?:[상태 ID]}]. 이미지가 없으면 빈 배열.

flow는 id, goal, screenIds. 범위 밖 화면을 만든 것으로 표시하지 않는다.
references/index.json은 references:[{id,file,sourceApp,sourceUrl?,notes?}]. 파일은 실제 PNG/JPEG/WebP.
레퍼런스는 선택이며, 등록한 항목만 실제 이미지·출처를 검증한다.

harness.config.json에는 figma.fileKey(기존 파일)와 extractPages(추출할 페이지 이름 배열)가 필수다.

## 2. 토큰 (추출·정형화)

`design/03-design-rules/tokens/tokens.json`:
```json
{"schemaVersion":1,"primitives":{"blue":{"type":"COLOR","value":"#2563EB"},"gap-16":{"type":"FLOAT","value":16}},"semantic":{"color-primary":{"ref":"blue"},"space-content":{"ref":"gap-16"}},"textStyles":{"Text/body":{"fontFamily":"Pretendard","fontStyle":"Regular","fontSize":15,"lineHeight":24}}}
```

이 파일은 기존 피그마 변수·텍스트 스타일을 **추출해 옮긴** 결과다. 값을 발명하지 않는다.
COLOR는 #RRGGBB 또는 #RRGGBBAA. 숫자는 FLOAT. semantic은 primitive ref만 허용.
Figma의 실제 fontFamily/fontStyle을 그대로 옮긴다. 단일 테마이며 여러 모드를 쓰면 모든 모드가
토큰과 일치해야 한다.

## 3. extract-system (정형화 검증)

`design/03-design-rules/system/snapshot.json`: 플러그인 `op:extract`(stage:"extract-system")로 얻은
스냅샷. inputDigest는 `npm run fingerprint -- --scope system` 출력. 이 게이트는 tokens.json이
스냅샷의 실제 변수·텍스트 스타일과 일치하는지 검증한다. 불일치는 tokens.json을 고치거나
피그마 원본을 수정 후 재추출해서 해결한다. 스냅샷을 손으로 조작하지 않는다.

## 4. 컴포넌트

catalog.json의 components:
```json
{"id":"Button","nodeId":"실제 Figma ID","states":["default","disabled"],"height":{"token":"size-tap-min"},"semanticTokens":["color-primary","radius-button","size-tap-min"]}
```
extract-system에서 추출한 기존 컴포넌트를 옮기고, 새 화면에 필요한 새 컴포넌트만 추가한다.
가변 콘텐츠 컴포넌트의 height는 "hug". 고정은 FLOAT semantic 토큰으로 명시한다.
새 상태/컴포넌트에 필요한 추가 토큰은 token-extensions.json의 primitives/semantic/textStyles에
**추가만** 한다. 추출한 시스템 토큰과 이름이 겹치면 실패한다(원본을 고쳐 재추출해야 함). 추가만
하는 경우 컴포넌트·화면 스냅샷만 새 지문으로 재생성한다.
기존 토큰/시안 자체를 바꾸는 경우만 방향 변경 절차로 돌아간다.

## 5. 전체 화면

screens.json의 screens:[{screenId,state,viewportId,frameId,screenshot}].
요구사항의 화면 × 상태 × viewport 조합을 정확히 채운다. 하나의 Figma 프레임으로 여러 상태를
완료 처리하지 않는다. 스크롤 내용은 고정 viewport 내부의 스크롤 컨테이너로 만든다.

assets.json의 assets:[{id,file,sha256,source,figmaImageHash}]. 같은 이미지는 같은 assetId 재사용.
파일 hash는 `shasum -a 256 경로`, Figma imageHash는 원본 업로드의 실제 결과를 쓴다.
source는 local-character이며 file은 imagePolicy.directory 안의 원본이어야 한다.
컴포넌트와 화면의 IMAGE paint는 등록된 assetId/hash 및 scaleMode FIT가 필요하다.
같은 노드 또는 직계 부모에 imagePolicy.backgroundColor 배경이 있어야 한다.
캐릭터 원본 변경은 시스템 지문을, assets.json 변경은 컴포넌트 지문을 무효화한다.

## 6. 검증

visual-review.json:
```json
{"schemaVersion":1,"inputDigest":"npm run fingerprint -- --scope review 출력","reviewedAt":"ISO timestamp","reviewer":"codex","screens":[{"frameId":"실제 ID","screenshotSha256":"실제 파일 hash","checks":{"hierarchy":"pass","readability":"pass","alignment":"pass","brandFit":"pass","interactionClarity":"pass"},"observations":"직접 관찰한 결과","issues":[]}],"contentTests":[{"screenId":"home","case":"요구사항의 contentCases와 동일 문자열","status":"pass","observations":"실제 긴 제목 검토 결과","evidence":"design/04-screens/verification/evidence/home-long-title.png","evidenceSha256":"실제 파일 hash"}]}
```

시각 검토는 모든 화면·상태·viewport를 직접 확인한다. contentTests는 별도 테스트 프레임/렌더에서
각 contentCase를 재현하고 캡처한 증거를 기록한다. 결함은 issues에 {description,status}로 기록하며
해결되지 않은 항목은 게이트 실패. 수치 색상 대비/키보드/스크린리더 전체 검증을 했다고 주장하지 않는다.

`npm run audit`는 이 결과와 구조 검사를 함께 재실행한다. 과거 audit.json의 PASS는 믿지 않는다.
파일 해시는 변경 추적 장치다. 이미지 검토가 실제 수행됐는지는 에이전트가 대화와 도구 실행으로
증명해야 하며 JSON 파일만으로 인증할 수 없다.
