# Figma 최신 상태 재동기화 (2026-09-26)

## 상황
Figma에서 v5 외에도 여러 프레임 이름·화면을 정리했음. repo의 스냅샷과 7종 PDF는
정리 이전 상태라 현재 Figma와 어긋남. 화면 생성/coverage 판단 전에 현재 Figma 전체를
다시 추출해 repo를 최신으로 맞춘다.

## 실행 순서

### 1) design 페이지 전체 추출
Figma Desktop Plugin에서 아래 spec을 실행:

- `design/operations/sync-full-2026/spec-extract-full.json`
  - `frameIds` 미지정 → design 페이지의 모든 최상위 프레임/섹션 추출
  - 결과가 크면 batch1~4로 나눠 실행 (같은 폴더에 있음)

### 2) 결과 저장
플러그인 결과 JSON을 아래로 저장:

- 한 번에 뽑은 경우: `design/operations/sync-full-2026/snapshot-full.json`
- 배치로 뽑은 경우: `snapshot-batch1.json` ~ `snapshot-batch4.json`
  (이 경우 하나로 합쳐 `snapshot-full.json`로 만들어야 함 → 저장 후 알려주면 Kiro가 합침)

### 3) 정식 스냅샷 경로로 저장
```
npm run save-snapshot -- --stage screens --from design/operations/sync-full-2026/snapshot-full.json
```

### 4) 판정
```
npm run check -- --phase screens
npm run audit
```

## 주의
- Design System 페이지(컴포넌트)는 이미 components-02에서 재추출 완료(Button disabled = dark-text-slate 확인됨).
  이번 재동기화는 `design` 페이지(실제 화면)가 대상.
- 이름 바꾼 프레임은 추출 결과의 name 필드에 그대로 반영됨.
  이후 screens.json / coverage 갱신 시 이 최신 name을 기준으로 함.
