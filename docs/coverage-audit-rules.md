# Coverage Audit Rules

Design Coverage Audit의 판정 기준, source basis 컬럼 정의, Confidence 체계를 정의한다.
이 문서는 `docs/figma-design-sync-workflow.md`의 상세 규칙 레퍼런스다.

---

## 1. PRD Source Type 정의

| Type | 설명 | 신뢰도 |
|---|---|---|
| `ORIGINAL_PRD` | Figma 캔버스 안 실제 노란 박스 PRD 레이어 (내용 있는 것) | 최고 |
| `RELEASE_FINAL_PDF_PRD` | 해당 릴리즈 확정 PDF 안에 포함된 PRD | 높음 |
| `RECONSTRUCTED_PRD` | repo 내 역방향 복원 PRD 파일 (`design/operations/prd-*/PRD.md` 등) | 중간 |
| `INFERRED` | SITEMAP·일반 규칙·기존 패턴에서 추론 | 낮음 |

---

## 2. Design Source Type 정의

| Type | 설명 |
|---|---|
| `LIVE_EXTRACT` | 최신 `op:extract` 결과 JSON (stage=screens) |
| `LIVE_SCREENSHOT` | 최신 `op:screenshot` PNG |
| `RELEASE_FINAL_PDF` | 릴리즈 확정 PDF (Release Mode의 공식 design source) |
| `PARTIAL_EXTRACT` | extract는 있으나 일부 frame만 포함됨 |
| `STALE_EXTRACT` | extract가 있으나 최신 Figma와 동기화 여부 불확실 |
| `NONE` | 해당 항목에 대한 design source 없음 |

---

## 3. Audit Mode 정의

### Mode A — Release Design Coverage Audit

- 목적: 특정 릴리즈 당시 최종 산출물 기준으로 빠진 디자인 확인
- Requirement Source: `ORIGINAL_PRD` 또는 `RELEASE_FINAL_PDF_PRD` 우선
- Design Source: 해당 릴리즈 **최종 디자인 PDF** 또는 릴리즈 확정 Figma snapshot
- 릴리즈 최종 PDF는 historical reference가 아니라 release-final artifact다
- 최신 Live Figma sync 불필요

### Mode B — Live Figma Coverage Audit

- 목적: 현재 Figma 캔버스 기준 누락 확인
- Requirement Source: `ORIGINAL_PRD` 우선
- Design Source: 최신 `op:extract` + `op:screenshot`
- 최신 sync가 없으면 `UNVERIFIED` / `CANDIDATE_GAP` 처리 후 sync 먼저 요청

---

## 4. Pre-check 출력 형식 (판정 시작 전 필수)

```
## Coverage Audit Pre-check

- Audit Mode          : RELEASE | LIVE
- Requirement Source  : (파일명 또는 레이어명)
- Req Source Type     : ORIGINAL_PRD | RELEASE_FINAL_PDF_PRD | RECONSTRUCTED_PRD | INFERRED
- Design Source       : (파일명 / snapshot 경로 / "최신 Live Figma")
- Design Source Type  : RELEASE_FINAL_PDF | LIVE_EXTRACT | LIVE_SCREENSHOT | PARTIAL_EXTRACT
- 원본 PRD 확인 여부  : 확인됨 / 미확인 / 없음 (이유)
- 최신 Figma Sync 필요: 예 | 아니오 | Mode A라 불필요
```

`Req Source Type`이 `RECONSTRUCTED_PRD` 또는 `INFERRED`이면 추가 출력:

```
⚠️  Requirement source가 역복원본 또는 추론입니다.
    이 source로 도출한 누락 항목은 CANDIDATE_GAP 또는 LOW Confidence로 처리합니다.
    원본 PRD(Figma 노란 박스 또는 릴리즈 PDF) 존재 여부를 먼저 확인하세요.
```

---

## 5. 판정 기준

### COVERED
- PRD에 요구된 화면/상태가 실제 design source에 존재한다
- 적합한 design source 근거(extract 또는 릴리즈 PDF)가 있다
- Confidence: Req Source Type + Design Source Type에 따라 결정

### MISSING_DESIGN
- PRD에 화면/기능 단위가 정의되어 있으나 대응 frame 자체가 없다
- Req Source Type이 `RECONSTRUCTED_PRD` / `INFERRED`이면 `CANDIDATE_GAP`으로 처리

### MISSING_STATE
- 화면 frame은 있으나 PRD의 특정 state/variant 디자인이 없다
- Req Source Type이 `RECONSTRUCTED_PRD` / `INFERRED`이면 `CANDIDATE_GAP`으로 처리

### MISMATCH
- 대응 frame은 있으나 PRD와 상태명·CTA·정보구조가 명백히 다르다
- 노드명과 PRD 상태명의 불일치도 MISMATCH로 기록 (예: `Card-SUBMITTED` 노드가 "본선 미진출" 상태)

### UNVERIFIED
- frame이 존재한다고 추정되지만 최신 extract 또는 screenshot이 없어 현재 상태 검증 불가
- Live Mode에서 최신 sync 없을 때 기본 판정

### CANDIDATE_GAP
- Requirement source가 `RECONSTRUCTED_PRD` 또는 `INFERRED`이고
  원본 PRD에서 해당 요구사항이 확인되지 않아 누락 여부가 불확실한 상태
- 원본 PRD 확인 후 `MISSING_STATE` / `COVERED`로 재판정
- 바로 작업 목록에 올리지 않는다

---

## 6. Confidence 기준

| Req Source Type | Design Source Type | Confidence |
|---|---|---|
| ORIGINAL_PRD | LIVE_EXTRACT | HIGH |
| ORIGINAL_PRD | RELEASE_FINAL_PDF | HIGH |
| ORIGINAL_PRD | PARTIAL_EXTRACT | MEDIUM |
| ORIGINAL_PRD | NONE | HIGH (MISSING 판정) |
| RELEASE_FINAL_PDF_PRD | RELEASE_FINAL_PDF | HIGH |
| RELEASE_FINAL_PDF_PRD | LIVE_EXTRACT | MEDIUM |
| RECONSTRUCTED_PRD | 어떤 source든 | LOW~MEDIUM |
| INFERRED | 어떤 source든 | LOW |

`MISSING_STATE` / `MISSING_DESIGN` 확정은 Confidence `HIGH`일 때만 한다.
`MEDIUM` 이하는 `CANDIDATE_GAP` 또는 `UNVERIFIED`로 두고 원본 PRD 확인을 먼저 요청한다.

---

## 7. Coverage Report 컬럼 정의

Coverage report(`design/04-screens/coverage/design-coverage.md`)에 포함할 컬럼:

| 컬럼 | 설명 |
|---|---|
| Requirement | PRD에 정의된 요구사항 (화면·상태) |
| Screen | 화면 ID (예: A-30) |
| State | 상태 키 (예: SUBMITTED) |
| Req Source | 사용한 requirement source 파일명/레이어명 |
| Req Source Type | ORIGINAL_PRD / RELEASE_FINAL_PDF_PRD / RECONSTRUCTED_PRD / INFERRED |
| Design Source | 사용한 design source 파일명/경로 |
| Design Source Type | LIVE_EXTRACT / RELEASE_FINAL_PDF / PARTIAL_EXTRACT / NONE 등 |
| Figma Frame | frame ID (있는 경우) |
| Result | COVERED / MISSING_DESIGN / MISSING_STATE / MISMATCH / UNVERIFIED / CANDIDATE_GAP |
| Confidence | HIGH / MEDIUM / LOW |
| Note | 비고 |

### 예시 행

| Requirement | Screen | State | Req Source | Req Source Type | Design Source | Design Source Type | Figma Frame | Result | Confidence | Note |
|---|---|---|---|---|---|---|---|---|---|---|
| 제출완료 카드 | A-30 | SUBMITTED | v5 노란박스 PRD | ORIGINAL_PRD | Live extract | LIVE_EXTRACT | — | MISSING_STATE | HIGH | PRD §5 상태별 UI 매트릭스에 명시 |
| 재제출 필요 카드 | A-30 | CHANGED_AFTER_SUBMIT | v5 노란박스 PRD | ORIGINAL_PRD | Live extract | LIVE_EXTRACT | — | MISSING_STATE | HIGH | PRD §4 전이 트리거에 명시 |
| 빈 상태 | A-30 | EMPTY | prd-v5/PRD.md | RECONSTRUCTED_PRD | Live extract | PARTIAL_EXTRACT | — | CANDIDATE_GAP | LOW | 원본 PRD 확인 필요 |
| 본선 진행중 카드 | A-30 | IN_PROGRESS | v5 노란박스 PRD | ORIGINAL_PRD | Live extract | LIVE_EXTRACT | 1:23081 | COVERED | HIGH | |

---

## 8. Summary 형식

```md
## Summary

| 판정 | 건수 |
|---|---|
| COVERED | N |
| MISSING_DESIGN | N |
| MISSING_STATE | N |
| MISMATCH | N |
| UNVERIFIED | N |
| CANDIDATE_GAP | N |

**실제 추가 디자인이 필요한 항목 (HIGH Confidence MISSING_*)**: N건
**원본 PRD 확인 후 재판정 필요 (CANDIDATE_GAP / LOW Confidence)**: N건
```

---

## 9. 금지사항 요약

- 빈 PRD 레이어 하나만 보고 "원본 PRD 없음"으로 결론 내리지 않는다
- repo에 역복원 PRD 파일이 있다는 이유만으로 공식 requirement source로 자동 선택하지 않는다
- `RECONSTRUCTED_PRD` / `INFERRED` source만으로 `MISSING_STATE` / `MISSING_DESIGN`을 HIGH Confidence로 확정하지 않는다
- 릴리즈 최종 PDF를 무조건 "historical reference"로 처리하지 않는다 — Release Mode에서는 공식 design source다
- Live Mode에서 최신 sync 없이 `MISSING_STATE`를 확정하지 않는다 — 먼저 `UNVERIFIED`로 두고 sync를 요청한다
- Coverage Audit은 디자인을 자동 생성하지 않는다 — 누락 목록을 출력하고 사용자가 범위를 결정한다

---

## 10. `design/operations/prd-v5/PRD.md` 취급

이 파일은 `RECONSTRUCTED` / `AUXILIARY` source다.

- v5 공식 requirement source로 자동 선택하지 않는다
- 삭제하지 않고 비교/보조용으로 유지한다
- 향후 원본 PRD 레이어가 확인되면 원본을 primary source로 두고 이 파일은 secondary로 유지한다
- 이 파일을 근거로 판정한 requirement는 항목에 `Req Source Type: RECONSTRUCTED_PRD` + `Confidence: LOW~MEDIUM`을 표시한다
