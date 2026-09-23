# Figma Design Sync + Design Coverage Audit

이 워크플로우는 **Figma의 최신 실제 화면 상태를 repository에 동기화하고,
PRD/requirements에 정의된 화면·상태가 실제 디자인으로 존재하는지 비교**하기 위한 절차다.

목적:
- Kiro가 과거 PDF만 보고 판단하지 않도록 최신 Figma 상태를 지속적으로 갱신한다.
- PRD에는 정의되어 있지만 실제 디자인이 없는 화면/상태를 자동으로 식별한다.
- 화면이 존재해도 PRD와 구조/상태가 어긋나는 경우를 별도로 표시한다.

---

## 1. 언제 실행하는가

다음 중 하나에 해당하면 이 workflow를 실행한다.

- 새 화면 생성 완료 후
- 기존 화면 수정 완료 후
- Figma에서 사람이 직접 수정한 뒤
- 릴리즈 단위 디자인 작업이 끝난 뒤
- "Figma 최신 상태 동기화해줘"
- "PRD 대비 빠진 화면/상태 찾아줘"
- "디자인 누락 확인해줘"

새 화면/기존 화면 작업이 완료되면 별도 요청이 없어도
**verification 전에 최신 Figma 상태를 동기화하는 것을 기본 절차**로 본다.

---

## 2. Source of Truth

비교 시 우선순위:

1. 현재 릴리즈의 **원본 노란색 PRD 박스**
2. 현재 Figma 실제 화면
3. 명시적으로 확정된 SITEMAP / project rule
4. 역방향 복원 PRD 및 추론은 보조자료

중요:
- PDF/과거 screenshot은 historical reference다.
- "현재 실제 디자인이 존재하는가"의 기준은 최신 Figma extract + screenshot이다.
- 과거 screenshot이 있다고 현재 Figma에도 존재한다고 간주하지 않는다.

---

## 3. Sync 산출물

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

## 4. Sync 절차

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

## 5. Design Coverage Audit

최신 sync가 끝난 뒤 PRD/requirements와 실제 Figma를 비교한다.

비교 단위는 최소:
- screen
- state
- required visual variant
- 주요 modal/overlay/empty/error/finalization state

### 판정

#### COVERED
PRD에 요구된 화면/상태가 실제 Figma에 존재하고,
extract + screenshot 근거가 모두 있다.

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

---

## 6. 결과 형식

`design/04-screens/coverage/design-coverage.md`

예:

| Requirement | Screen | State | Figma Frame | Screenshot | Result | Note |
|---|---|---|---|---|---|---|
| 최종보고서 작성중 | A-30 | IN_PROGRESS | 123:45 | a30-in-progress.png | COVERED | |
| 제출완료 | A-30 | SUBMITTED | — | — | MISSING_STATE | PRD에는 정의됨 |
| 제출 후 수정사항 미반영 | A-30 | CHANGED_AFTER_SUBMIT | — | — | MISSING_STATE | 재제출 CTA 필요 |
| 본선 미진출 | A-30 | NOT_SELECTED | 123:67 | a30-not-selected.png | COVERED | |

### Summary

- COVERED: N
- MISSING_DESIGN: N
- MISSING_STATE: N
- MISMATCH: N
- UNVERIFIED: N

그리고 **실제 추가 디자인이 필요한 항목만 별도 목록**으로 정리한다.

---

## 7. 중요한 금지사항

- PRD에 상태가 있다고 해서 디자인이 존재한다고 가정하지 않는다.
- screenshot만 있고 extract metadata가 없으면 COVERED로 확정하지 않는다.
- extract만 있고 최신 screenshot이 없으면 visual coverage를 확정하지 않는다.
- 과거 PDF screenshot을 현재 Figma 상태로 간주하지 않는다.
- 없는 state를 "기존 화면에서 유추 가능"하다는 이유로 COVERED 처리하지 않는다.
- Design Coverage Audit은 디자인을 자동 생성하지 않는다. 누락을 식별한 뒤 사용자가 생성 범위를 결정한다.

---

## 8. 새 화면/수정 workflow와의 연결

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
      ↓
screens/verification
```

즉 **Figma에 그렸다는 사실만으로 작업 완료가 아니다.**
최신 실제 화면이 repo의 구조 데이터와 시각 근거로 다시 동기화되어야
다음 기획/QA/누락 분석에서 신뢰할 수 있는 source가 된다.
