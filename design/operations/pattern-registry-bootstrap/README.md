# Pattern Registry Bootstrap — v1~v4

목적: 현재 repo에 저장된 v5 partial extract만으로는 clone source를 확인할 수 없는
v1~v4 화면을 Figma Plugin으로 추출해 Pattern Registry를 확장한다.

## 1. Figma Plugin에서 3개 request 실행

아래 파일을 순서대로 실행한다.

- `spec-extract-batch-1.json`
- `spec-extract-batch-2.json`
- `spec-extract-batch-3.json`

각 결과 JSON을 같은 폴더에 다음 이름으로 저장한다.

- `snapshot-batch-1.json`
- `snapshot-batch-2.json`
- `snapshot-batch-3.json`

이 단계는 캔버스를 수정하지 않는다.

## 2. 병합

```sh
node scripts/merge-snapshots.mjs \
  design/operations/pattern-registry-bootstrap/snapshot-batch-1.json \
  design/operations/pattern-registry-bootstrap/snapshot-batch-2.json \
  design/operations/pattern-registry-bootstrap/snapshot-batch-3.json \
  --output design/operations/pattern-registry-bootstrap/snapshot-v1-v4.json
```

병합기는 세 배치의 schemaVersion/fileKey/stage/inputDigest/pageId/expectedFrameIds/variables/textStyles가
동일한지 확인하고, frame 중복/누락이 있으면 실패한다.

## 3. Pattern Registry 갱신

```sh
npm run patterns:refresh -- \
  --snapshot design/operations/pattern-registry-bootstrap/snapshot-v1-v4.json
```

이 명령은:
- discovery 후보를 `design/03-design-rules/patterns/discovery-candidates.json`에 기록
- registry selector를 최신 snapshot에 resolve해 `design/03-design-rules/patterns/resolved-registry.json`에 기록

한다.

## 4. 자동 승격 금지

Discovery 결과는 `candidate-only`다.
상위 후보라고 해서 sourceSelector로 자동 등록하지 않는다.

각 패턴마다 실제 task/화면 의미와 clone 단위를 검토한 뒤:
1. 정확한 재사용 단위인지 확인
2. selector가 1개 source만 resolve하는지 확인
3. 상태 variant가 같은 이름이면 descendant text 조건으로 구분
4. registry.json에 수동 승인
5. 다시 `patterns:refresh`

순서로 확정한다.
