# Figma Design Sync + Design Coverage Audit

이 워크플로우는 **Figma의 최신 실제 화면 상태를 repository에 동기화하고,
PRD/requirements에 정의된 화면·상태가 실제 디자인으로 존재하는지 비교**하기 위한 절차다.

목적:
- Kiro가 과거 PDF만 보고 판단하지 않도록 최신 Figma 상태를 지속적으로 갱신한다.
- PRD에는 정의되어 있지만 실제 디자인이 없는 화면/상태를 자동으로 식별한다.
- 화면이 존재해도 PRD와 구조/상태가 어긋나는 경우를 별도로 표시한다.

상세 판정 기준, source basis 컬럼, Confidence 체계는 **`docs/coverage-audit-rules.md`** 를 참조한다.

---

## 1. 언제 실행하는가

### op:extract — 아래 경우에 실행
- 새 화면 생성 완료 후 (verification 전)
- 기존 화면 수정 완료 후
- Figma에서 사람이 직접 수정한 뒤
- 릴리즈 단위 디자인 작업이 끝난 뒤
- "Figma 최신 상태 동기화해줘"
- Design Coverage Audit을 위해 현재 구조를 확인할 때

### op:screenshot — 아래 경우에만 실행
- **새로 생성하거나 수정한 화면의 시각 결과를 확인**할 때
- verification 단계에서 visual-review.json 작성을 위해 실제 PNG가 필요할 때
- "스크린샷 찍어줘", "시각 확인해줘" 요청이 명시적으로 있을 때

**screenshot을 찍지 않아도 되는 경우 (명시적 금지):**
- Coverage Audit만 하는 경우 — 구조 분석(extract)으로 충분하다
- 기존 화면이 이미 PDF/이미지로 확인 가능한 경우
- 새 디자인 생성 없이 기존 화면을 분석·비교만 하는 경우
- "빠진 화면 찾아줘" 류의 분석 요청 — 누락 목록 작성에 PNG가 필요하지 않다

---

## 2. PRD Source Discovery (Coverage Audit 전 필수)

Design Coverage Audit을 시작하기 **전에 반드시** requirement source가 무엇인지 확인한다.
repo에 역방향 복원 PRD 파일(`prd-v*/PRD.md`)이 있다고 해서 그것을 공식 requirement source로 자동 선택하지 않는다.

### PRD source 우선순위

| 순위 | 타입 | 설명 |
|---|---|---|
| 1 | `ORIGINAL_PRD` | Figma 캔버스 안의 실제 노란 박스 PRD 레이어 (내용 있는 것) |
| 2 | `RELEASE_FINAL_PDF_PRD` | 해당 릴리즈의 확정된 PDF 안에 포함된 PRD |
| 3 | `RECONSTRUCTED_PRD` | repo 내 역방향 복원 PRD 파일 |
| 4 | `INFERRED` | 일반 규칙/SITEMAP/기존 패턴에서 추론한 요구사항 |

### PRD 레이어 탐색 방법

Figma 섹션 안에 `PRD`로 시작하는 레이어가 여러 개 있을 수 있다.

탐색 시 확인할 것:
- PRD 레이어가 몇 개인지 확인 (`op:extract`의 name 필드 탐색)
- 각 레이어가 비어 있는지(텍스트 노드 없음) vs 내용이 있는지
- 내용이 있는 레이어가 원본인지, 나중에 생성된 역복원본인지 (레이어 생성 시점, 위치, 구조로 판단)

**빈 PRD 레이어 하나만 보고 "원본 PRD 없음"으로 결론 내리지 않는다.**

원본 PRD가 실제로 Figma에 존재하면:
- 그것을 requirement source로 사용한다
- repo의 역복원 PRD(`RECONSTRUCTED_PRD`)는 비교/보조용으로만 사용한다
- `RECONSTRUCTED_PRD`를 근거로 `MISSING_STATE` / `MISSING_DESIGN`을 확정하지 않는다

### `RECONSTRUCTED_PRD` / `INFERRED` 사용 규칙

- 이 source에서 도출한 requirement는 `ORIGINAL_PRD` requirement와 동일한 확정도로 취급하지 않는다.
- 판정 결과의 Confidence를 `LOW` 또는 `MEDIUM`으로 표시한다.
- 원본 PRD 존재 여부를 먼저 확인하라는 메시지를 출력한 뒤 분석을 진행한다.

---

## 3. Coverage Audit 모드 선택

Coverage Audit 요청이 들어오면 먼저 **모드**를 결정한다.

### Mode A — Release Design Coverage Audit

질문 예:
- "v5 최종 디자인에서 빠진 화면이 뭐야?"
- "v5 릴리즈 결과물 기준으로 PRD 대비 누락된 상태가 있어?"
- "그 당시 디자인 기준으로 검토해줘"

이 모드에서:
- **Requirement source** = 해당 릴리즈 원본 PRD (ORIGINAL_PRD 또는 RELEASE_FINAL_PDF_PRD 우선)
- **Design source** = 해당 릴리즈 **최종 디자인 PDF** 또는 릴리즈 확정 Figma snapshot
- 최신 Live Figma sync는 필수 아님 — 릴리즈 당시 최종 산출물 기준으로 판정
- 릴리즈 최종 PDF는 "과거 historical reference"가 아니라 **릴리즈 공식 최종 산출물**로 취급

목적: **그 릴리즈 당시 최종 산출물에 빠진 디자인 확인**

### Mode B — Live Figma Coverage Audit

질문 예:
- "지금 Figma에 빠진 화면 있어?"
- "현재 최신 화면 기준으로 누락 state 찾아줘"
- "현재 Figma와 PRD 비교해줘"

이 모드에서:
- **Requirement source** = 원본 PRD
- **Design source** = 최신 `op:extract` + `op:screenshot`
- 최신 sync가 없으면 먼저 sync를 수행하거나, sync 없이 진행할 경우 `UNVERIFIED` / `CANDIDATE_GAP`으로 처리

목적: **현재 Figma 캔버스 기준 누락 확인**

### 모드 판단이 어려울 때

"~에서 빠진 게 뭐야" 류 요청에서 "~에"가 릴리즈 명칭이면 Mode A,
"지금/현재/최신"이면 Mode B,
명시 없으면 사용자에게 한 줄 확인 후 진행한다.

---

## 4. Coverage Audit Pre-check (필수 출력)

Coverage Audit 판정을 시작하기 전에 아래를 반드시 출력한다.
이 pre-check가 끝난 뒤에 비로소 개별 항목 판정을 시작한다.

```
## Coverage Audit Pre-check

- Audit Mode          : RELEASE | LIVE
- Requirement Source  : (파일명 또는 레이어명)
- Req Source Type     : ORIGINAL_PRD | RELEASE_FINAL_PDF_PRD | RECONSTRUCTED_PRD | INFERRED
- Design Source       : (파일명 / snapshot 경로 / "최신 Live Figma")
- Design Source Type  : RELEASE_FINAL_PDF | LIVE_EXTRACT | LIVE_SCREENSHOT | PARTIAL_EXTRACT
- 원본 PRD 확인 여부  : 확인됨 / 미확인 / 없음 (이유)
- 최신 Figma Sync 필요: 예 (sync 후 진행 권장) | 아니오 | Mode A라 불필요
```

`Req Source Type`이 `RECONSTRUCTED_PRD` 또는 `INFERRED`이면 아래를 추가 출력한다:

```
⚠️  Requirement source가 역복원본 또는 추론입니다.
    이 source로 도출한 누락 항목은 CANDIDATE_GAP 또는 LOW Confidence로 처리합니다.
    원본 PRD(Figma 노란 박스 또는 릴리즈 PDF) 존재 여부를 먼저 확인하세요.
```

---

## 5. Source of Truth

비교 시 우선순위:

1. 현재 릴리즈의 **원본 노란색 PRD 박스** (Figma 레이어, 내용 있는 것)
2. 해당 릴리즈 확정 PDF 안의 PRD
3. 현재 Figma 실제 화면
4. 명시적으로 확정된 SITEMAP / project rule
5. 역방향 복원 PRD 및 추론은 보조자료

중요:
- PDF/과거 screenshot은 기본적으로 historical reference지만, **release-final artifact인 경우** Release Coverage Audit에서 공식 design source로 사용한다.
- "현재 실제 디자인이 존재하는가"의 기준(Live Coverage)은 최신 Figma extract + screenshot이다.
- 과거 screenshot이 있다고 현재 Figma에도 존재한다고 간주하지 않는다.

---

## 6. Sync 산출물

최신 Figma 상태를 다음 두 가지 형태로 보존한다.

### A. Structural Snapshot — `op:extract`

이미지가 아니라 Figma 구조 JSON이다.

포함 대상:
- frame/node 구조
- screenId / state / viewportId metadata
- component instance/reference
- token binding
- text style
- parent relation
- geometry
- visibility
- 주요 interaction metadata

정식 저장:
`design/04-screens/snapshot.json`

### B. Visual Screenshot — `op:screenshot`

실제 Figma frame을 PNG로 캡처한 이미지다.

용도:
- visual hierarchy
- density
- spacing
- alignment
- actual appearance
- PRD 상태가 시각적으로 제대로 표현됐는지 확인

저장:
`design/04-screens/verification/`

`screens.json`에는 각 screen/state와 실제 screenshot 경로를 연결한다.

---

## 7. Sync 절차

### Step 1 — 최신 대상 범위 확정

PRD / SITEMAP / 현재 작업 범위를 기준으로 동기화할 screen/state 목록을 만든다.

기존 `requirements.json`이 있으면 우선 사용하되,
PRD source와 불일치하면 requirements를 먼저 수정한다.

### Step 2 — Figma extract

Kiro가 `op:extract` request를 생성한다.

- stage: `screens`
- 대상 pageName
- 필요 시 frameIds 분할
- 최신 `fingerprint --scope screens` 값 사용

사용자가 Figma plugin에서 실행한 결과를 저장한 뒤:

```sh
npm run save-snapshot -- --stage screens --from <extract-result>
```

으로 정식 snapshot을 갱신한다.

### Step 3 — Figma screenshot

각 **실제로 존재하는 screen/state frame**을 `op:screenshot`으로 PNG 캡처한다.

- 동일 state의 과거 screenshot을 새 디자인의 증거로 재사용하지 않는다.
- 캡처는 현재 Figma frame에서 다시 생성한다.
- screenshot 파일과 frameId/screenId/state를 `screens.json`에 연결한다.

### Step 4 — Sync completeness 확인

다음을 확인한다.

- extract에 대상 frame이 실제 포함됐는가
- screenshot이 실제 현재 frame에서 생성됐는가
- screenId/state metadata가 존재하는가
- screenshot path와 frameId가 대응하는가
- stale snapshot/screenshot을 현재 상태로 오인하지 않는가

---

## 8. Design Coverage Audit

Pre-check(Section 4)를 출력한 뒤 PRD/requirements와 실제 Figma를 비교한다.

비교 단위는 최소:
- screen
- state
- required visual variant
- 주요 modal/overlay/empty/error/finalization state

### 판정

#### COVERED
PRD에 요구된 화면/상태가 실제 Figma(또는 릴리즈 PDF)에 존재하고,
적합한 design source 근거가 있다.

#### MISSING_DESIGN
PRD에 화면/기능 단위가 정의되어 있으나 실제 대응 frame이 없다.

#### MISSING_STATE
화면 frame은 있으나 PRD의 특정 state/variant 디자인이 없다.

예:
- 작성중 디자인 있음
- 제출완료 디자인 없음
- 제출완료 후 수정사항 미반영 디자인 없음

#### MISMATCH
대응 frame은 있으나 PRD와 상태/CTA/정보구조가 명백히 다르다.

#### UNVERIFIED
frame은 있다고 추정되지만 최신 extract 또는 screenshot이 없어 현재 상태를 검증할 수 없다.

#### CANDIDATE_GAP
Requirement source가 `RECONSTRUCTED_PRD` 또는 `INFERRED`이고,
원본 PRD에서 해당 요구사항이 확인되지 않아 누락 여부가 불확실한 상태.
원본 PRD 확인 후 `MISSING_STATE` / `COVERED`로 재판정한다.

---

## 9. 결과 형식

`design/04-screens/coverage/design-coverage.md`

컬럼:

| Requirement | Screen | State | Req Source | Req Source Type | Design Source | Design Source Type | Figma Frame | Result | Confidence | Note |
|---|---|---|---|---|---|---|---|---|---|---|
| 최종보고서 작성중 | A-30 | IN_PROGRESS | v5 노란박스 PRD | ORIGINAL_PRD | Live extract | LIVE_EXTRACT | 1:23081 | COVERED | HIGH | |
| 제출완료 | A-30 | SUBMITTED | v5 노란박스 PRD | ORIGINAL_PRD | Live extract | LIVE_EXTRACT | — | MISSING_STATE | HIGH | PRD에는 정의됨 |
| 빈 상태 | A-30 | EMPTY | prd-v5/PRD.md | RECONSTRUCTED_PRD | Live extract | PARTIAL_EXTRACT | — | CANDIDATE_GAP | LOW | 원본 PRD 재확인 필요 |

### Summary

- COVERED: N
- MISSING_DESIGN: N
- MISSING_STATE: N
- MISMATCH: N
- UNVERIFIED: N
- CANDIDATE_GAP: N

그리고 **실제 추가 디자인이 필요한 항목만 별도 목록**으로 정리한다.
`CANDIDATE_GAP` 항목은 별도 "원본 PRD 확인 필요" 목록으로 분리한다.

---

## 10. 중요한 금지사항

- PRD에 상태가 있다고 해서 디자인이 존재한다고 가정하지 않는다.
- screenshot만 있고 extract metadata가 없으면 COVERED로 확정하지 않는다.
- extract만 있고 최신 screenshot이 없으면 visual coverage를 확정하지 않는다.
- 과거 PDF screenshot을 현재 Figma 상태로 간주하지 않는다 (단, Release Mode에서 릴리즈 최종 PDF는 design source로 사용 가능).
- 없는 state를 "기존 화면에서 유추 가능"하다는 이유로 COVERED 처리하지 않는다.
- Design Coverage Audit은 디자인을 자동 생성하지 않는다. 누락을 식별한 뒤 사용자가 생성 범위를 결정한다.
- **빈 PRD 레이어 하나만 보고 "원본 PRD 없음"으로 결론 내리지 않는다.**
- `RECONSTRUCTED_PRD` 또는 `INFERRED` source의 requirement만으로 `MISSING_STATE` / `MISSING_DESIGN`을 HIGH Confidence로 확정하지 않는다.
- repo에 역복원 PRD 파일이 있다는 이유만으로 그것을 공식 requirement source로 자동 선택하지 않는다.

---

## 11. 새 화면/수정 workflow와의 연결

새 화면 생성 또는 기존 화면 수정 완료 후:

```text
Figma create/modify
      ↓
Design Sync
  ├─ op:extract
  └─ op:screenshot
      ↓
snapshot/screens manifest update
      ↓
Design Coverage Audit
  ├─ Pre-check 출력 (모드 / source 유형 명시)
  └─ 판정
      ↓
screens/verification
```

즉 **Figma에 그렸다는 사실만으로 작업 완료가 아니다.**
최신 실제 화면이 repo의 구조 데이터와 시각 근거로 다시 동기화되어야
다음 기획/QA/누락 분석에서 신뢰할 수 있는 source가 된다.
