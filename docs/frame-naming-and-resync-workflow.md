# Frame Naming + Manual Rename → Resync Workflow

이 워크플로우는 두 가지를 규정한다.

1. **프레임 명명 규칙** — 모든 화면/상태 프레임의 이름을 일관된 체계로 짓는다.
2. **수작업 rename 후 재동기화 절차** — Figma에서 사람이 프레임 이름을 정리한 뒤,
   그 결과를 repo의 snapshot / screens.json / coverage에 다시 반영하는 공식 절차.

배경: 초기에는 프레임 이름을 즉흥적으로 지어 중복·불일치가 많았다.
이름을 명명 규칙에 맞춰 정리하면 Coverage Audit의 screenId/state 매핑, PRD source discovery,
op:duplicate의 nodeName 매칭이 모두 안정된다.

관련 문서:
- 재추출/스냅샷/coverage 판정 절차 상세: `docs/figma-design-sync-workflow.md`
- coverage 판정 기준: `docs/coverage-audit-rules.md`
- 전체 화면 트리·권한·상태: `design/02-structure/SITEMAP.md`

---

## 1. 프레임 명명 규칙

### 형식

```
{시리즈}-{번호}_{english-slug}            ← 상태가 하나뿐인 화면
{시리즈}-{번호}_{english-slug}__{state}   ← 상태/variant가 여러 개인 화면·카드
```

- `시리즈` = 대문자 영역 코드 (아래 표)
- `번호` = 2자리, 영역 내 순서 (`01`, `02`, `30` …)
- `english-slug` = 소문자-하이픈, 화면 의미
- `state` = snapshot의 state 키와 **동일한 문자열** (`in-progress`, `submitted`, `resubmit-needed`, `not-selected`, `recruiting`, `closed` …)
- 상태 카드는 `{ID}_card__{state}` 형태를 쓴다 (화면 안의 상태 카드 컴포넌트).

### 시리즈 체계

| 시리즈 | 영역 | 접근 권한 | 출처 |
|---|---|---|---|
| `H` | 홈 / 발표 / 수상 (Campaign) | 일반 | v1/v4 + 수상작 |
| `N` | 공지사항 | 일반 | v1 |
| `F` | FAQ | 일반 | v1 |
| `TB` | 팀빌딩 | 일반 | v1/v4 |
| `A` | 지원하기(A-0x) + 최종보고서(A-3x) | 일반 | v3/v5 |
| `MY` | 마이페이지 | 일반 | v1 |
| `RV` | 사람 심사 (Review) | 심사자 권한 | v1 |
| `J` | AI 심사 | 관리자 | v2 |

> A 시리즈는 기존 체계를 유지한다. 지원 흐름은 `A-0x`, 최종보고서는 `A-3x`로 번호대를 나눈다.

### PRD 노란 박스 명명

각 릴리즈의 PRD 노란 박스 레이어는 `PRD-{version}`으로 통일한다 (예: `PRD-v5`).
Coverage Audit의 PRD source discovery가 이 이름으로 원본 PRD를 찾는다.

---

## 2. 전체 화면 명명표

### H — 홈 / 발표 / 수상
| ID | 프레임 이름 | 비고 |
|---|---|---|
| H-01 | `H-01_landing` | 홈(랜딩) v1/v4 |
| H-02 | `H-02_first-round-result` | 1차 합격 발표 v4 |
| H-03 | `H-03_final-winners` | 최종 합격팀 v1 |
| H-04 | `H-04_awards-landing` | 수상작 발표 랜딩 |
| H-05 | `H-05_award-detail` | 수상작 카드 상세 |

### N — 공지사항
| ID | 프레임 이름 |
|---|---|
| N-01 | `N-01_notice-list` |
| N-02 | `N-02_notice-detail` |

### F — FAQ
| ID | 프레임 이름 |
|---|---|
| F-01 | `F-01_faq` |

### TB — 팀빌딩
| ID | 프레임 이름 | state |
|---|---|---|
| TB-01 | `TB-01_team-list__recruiting` | 모집중 |
| TB-01 | `TB-01_team-list__upcoming` | 모집예정 |
| TB-01 | `TB-01_team-list__closed` | 모집마감 |
| TB-02 | `TB-02_team-apply-modal` | 지원 모달 |
| TB-03 | `TB-03_teambuild-setting-modal` | 설정 모달 |

### A — 지원하기
| ID | 프레임 이름 | 비고 |
|---|---|---|
| A-01 | `A-01_application-list` | 내 지원서 리스트(허브) |
| A-02 | `A-02_application-form` | 입력 폼 (8섹션 stepper) |

### A-3x — 최종보고서 (v5)
| ID | 프레임 이름 | state |
|---|---|---|
| A-30 | `A-30_my-report-status` | 진입점(내 지원 현황) |
| A-30 card | `A-30_card__in-progress` | 작성중 (현 `Card-PENDING`) |
| A-30 card | `A-30_card__not-selected` | 본선 미진출 (현 `Card-SUBMITTED` — 이름/내용 불일치, rename 필요) |
| A-30 card | `A-30_card__submitted` | 제출완료 (현 `Card-SUBMITTED-DONE`) |
| A-30 card | `A-30_card__resubmit-needed` | 재제출 필요 (현 `Card-RESUBMIT-NEEDED`) |
| A-31 | `A-31_report-step-form` | 스텝 폼 |
| A-32 | `A-32_submission-package` | 최종 심사 제출 패키지 |

### MY — 마이페이지
| ID | 프레임 이름 | 비고 |
|---|---|---|
| MY-01 | `MY-01_profile` | 기본정보 탭 |
| MY-02 | `MY-02_application-status` | 지원 현황 탭 (기본 활성) |
| MY-03 | `MY-03_teambuild-manage` | 팀빌딩 관리 탭 |

### RV — 사람 심사 (심사자 권한)
| ID | 프레임 이름 | 비고 |
|---|---|---|
| RV-01 | `RV-01_first-review` | 1차 심사 |
| RV-02 | `RV-02_final-review` | 최종 심사 |
| RV-03 | `RV-03_review-finalize` | 최종 검토/제출 |

### J — AI 심사 (관리자)
| ID | 프레임 이름 | 비고 |
|---|---|---|
| J-01 | `J-01_ai-review-dashboard` | AI 심사 대시보드 |
| J-02 | `J-02_ai-review-result` | AI 심사 결과 목록/상세 |
| J-03 | `J-03_ai-review-template-list` | 템플릿 목록 |
| J-04 | `J-04_ai-review-template-edit` | 템플릿 편집 |

> 새 상태/화면이 생기면 이 표에 행을 추가한 뒤 rename·생성한다.
> ID·state 키는 여기서 확정한 값을 snapshot/screens.json/coverage 전부에서 동일하게 쓴다.

---

## 3. 수작업 rename → 재동기화 절차 (공식)

Figma에서 사람이 프레임 이름을 정리한 뒤, 아래 순서로 repo를 다시 맞춘다.
**"이름만 바꿨다"로 끝내지 않는다. 재추출로 실제 캔버스와 repo를 일치시켜야 완료다.**

```text
[1] 명명표 확정 (Section 2)
        ↓
[2] Figma에서 수작업 rename (사람)
        ↓
[3] op:extract 재추출 (플러그인 실행)
        ↓
[4] save-snapshot 으로 정식 snapshot 갱신
        ↓
[5] screens.json 의 screenId/state ↔ frameId 재매핑
        ↓
[6] coverage / SITEMAP 참조 프레임명 갱신
        ↓
[7] npm run check / audit 로 판정
        ↓
[8] commit + push
```

### Step 1 — 명명표 확정
Section 2 표에서 대상 화면의 ID·slug·state를 확정한다.
불일치·중복이 있으면 표를 먼저 고친 뒤 rename한다.

### Step 2 — Figma 수작업 rename
사람이 Figma에서 프레임 이름을 표에 맞춰 변경한다.
- 상태 카드는 `{ID}_card__{state}` 형태로.
- ⚠️ `Card-SUBMITTED`(1:23104)는 실제 내용이 "본선 미진출"이므로 `A-30_card__not-selected`로 바꾼다 (coverage MISMATCH 해소).
- PRD 노란 박스는 `PRD-{version}`으로.

> 플러그인으로 하고 싶으면 `op:duplicate`의 `rename` 패치 대신, 이름만 바꾸는 것은
> 수작업이 가장 빠르다. 대량이면 `op:extract`로 현재 이름 목록을 먼저 뽑아 매핑표를 만든다.

### Step 3 — op:extract 재추출
Kiro가 `op:extract` 스펙(stage `screens`, 대상 pageName/frameIds)을 만든다.
사용자가 데스크탑 플러그인에서 실행하고 결과 JSON을 `design/operations/<task-id>/`에 저장한다.

기존 스펙 `design/operations/coverage-v5/spec-extract-after-cards.json`이 이 목적에 재사용 가능하다
(frameIds `["1:23008"]` = v5 섹션 전체).

### Step 4 — 정식 snapshot 갱신
```sh
npm run save-snapshot -- --stage screens --from <extract-result 경로>
```
`design/04-screens/snapshot.json`(또는 stage 경로)이 최신 캔버스 구조로 갱신된다.

### Step 5 — screens.json 재매핑
새 프레임 이름/ID를 `design/04-screens/screens.json`의 screenId·state에 연결한다.
- rename으로 frameId 자체는 바뀌지 않으므로(같은 노드), 매핑 키는 유지되고 name만 갱신된다.
- 새로 만든 A-30 카드 2종(SUBMITTED / RESUBMIT-NEEDED)의 frameId를 여기서 확정한다.

### Step 6 — coverage / SITEMAP 참조 갱신
- `design/04-screens/coverage/design-coverage.md`의 Figma Frame·프레임명 컬럼을 새 이름/ID로 갱신.
- `A-30_card__not-selected` rename으로 기존 MISMATCH 항목을 해소하고 결과를 재판정.
- SITEMAP에 화면 ID를 인용한 곳이 있으면 명명표와 일치시킨다.

### Step 7 — 판정
```sh
npm run check -- --phase screens
npm run audit
```
- 폴더 존재·체크표시로 완료를 판정하지 않는다. 게이트 통과가 완료 기준이다.
- extract 결과가 실제 rename을 반영했는지(새 이름이 snapshot에 있는지) 확인한다.

### Step 8 — commit + push
```sh
git add design/04-screens/ design/operations/<task-id>/ docs/frame-naming-and-resync-workflow.md
git commit -m "chore: 프레임 명명 규칙 적용 + rename 재동기화"
git push boram1006 main
```

---

## 4. 금지사항

- 이름만 바꾸고 재추출을 건너뛰지 않는다. snapshot이 옛 이름이면 이후 매칭이 깨진다.
- snapshot·coverage를 손으로 고쳐 통과시키지 않는다. 재추출 결과가 원본이다.
- 명명표에 없는 임의 이름을 만들지 않는다. 새 화면이면 표에 행을 먼저 추가한다.
- rename으로 frameId가 바뀌었다고 가정하지 않는다(같은 노드는 ID 유지). 확실치 않으면 extract로 확인한다.
