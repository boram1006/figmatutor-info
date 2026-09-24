# Design Coverage Audit — v5 최종보고서 제출

- **Audit Mode**: LIVE (현재 Figma 캔버스 기준)
- **Requirement Source**: `v5 PRD (노란 박스)` Figma 레이어 (id `20:823`, 섹션 `1:23008` 내) — 보조: `design/operations/prd-v5/PRD.md`
- **Req Source Type**: `ORIGINAL_PRD` (Figma 캔버스 원본 노란 박스 확인됨) / `prd-v5/PRD.md`는 `RECONSTRUCTED_PRD` 보조자료
- **Design Source**: `design/operations/coverage-v5/snapshot-coverage.json` (op:extract, capturedAt: 2026-09-24T11:57)
- **Design Source Type**: `LIVE_EXTRACT` (v5 섹션 stage=screens 최신 추출) — screenshot 미완(시각 확인 대상만 UNVERIFIED)
- **Figma 파일**: `t00UvcVe1M6llSJFyXcDkG` / 페이지 `design` / 섹션 `1:23008`
- **분석 일자**: 2026-09-24 (카드 2종 실재 확인 + A-31 중복 삭제 반영)

> 판정 기준·source basis·Confidence 체계: `docs/coverage-audit-rules.md`
>
> 전제: 원본 PRD 노란 박스(`20:823`)가 Figma에 실재함을 최신 extract로 확인했다. 따라서 requirement source는 `ORIGINAL_PRD`이며, 구조 판정은 최신 LIVE_EXTRACT 기준으로 HIGH Confidence다.
> 시각(색/정렬/실제 활성화 여부) 확정이 필요한 항목만 screenshot 미완으로 UNVERIFIED로 남긴다.

---

## Summary

판정행(#1~#17) 기준 집계다. 상세표가 정본이며, 아래 건수·gap 목록은 상세표와 1:1로 일치한다.

| 판정 | 건수 | 해당 항목 |
|---|---|---|
| COVERED | 10 | #1, #2, #3, #4, #5, #7, #11, #12, #16, #17 |
| MISSING_STATE | 4 | #9, #13, #14, #15 |
| MISSING_DESIGN | 0 | — |
| MISMATCH | 1 | A-30 `Card-SUBMITTED`(1:23104) 노드명 vs 상태 의미 |
| RESOLVED | 1 | #10 (A-31 중복 프레임 1:23324 삭제됨) |
| UNVERIFIED | 2 | #6 (A-30 빈 상태), #8 (A-31 폼 콘텐츠) |

**2026-09-24 갱신 (최신 extract 반영)**:
- A-30 SUBMITTED(`49:1278`) / CHANGED_AFTER_SUBMIT(`49:1301`) 2종 실재 확인 → **COVERED** 확정. 이전 gap의 MISS-01(A-30 제출완료), MISS-02(A-30 재제출 필요) 제거.
- A-31 중복 프레임(1:23324) 삭제 확인 → 이전 MISMATCH #10 **해소**. MISMATCH 2 → 1.
- 원본 PRD 노란 박스(`20:823`) 실재 확인 → requirement source를 `ORIGINAL_PRD`로 격상.

**실제 추가 디자인이 필요한 항목(MISSING_STATE): 4건** — A-32 3종(SUBMITTED_LOCKED / CHANGED_AFTER_SUBMIT / DEADLINE_PASSED) + A-31 SECTION 2~8.

---

## A-30 · 내 지원 현황 (최종보고서 진입점)

PRD source: `v5 PRD / A-30 / 4. 상태 머신` + `5. 상태별 UI 매트릭스` (Req Source Type: RECONSTRUCTED_PRD)

| # | PRD 요구 | 화면 State | Figma Frame | 판정 | 비고 |
|---|---|---|---|---|---|
| 1 | 본선 진행중·작성중 | IN_PROGRESS | 1:23081 `Card-PENDING` | **COVERED** | 배지 "본선 진행중", 진행률 "1/8", CTA "이어 작성하기 →" 확인 |
| 2 | 본선 미진출 | NOT_SELECTED | 1:23104 `Card-SUBMITTED` | **COVERED** | 배지 "본선 미진출", 제출일시, CTA "제출 지원서 보기 →" 확인. 단 노드명이 `Card-SUBMITTED`로 혼동 유발 (MISMATCH 참조) |
| 3 | 제출완료 | SUBMITTED | **49:1278** `Card-SUBMITTED-DONE` | **COVERED** | 최신 extract로 실재 확인. Card-PENDING 복제 + 패치: Green "제출완료" 배지, "제출일시 26.10.14 11:23", CTA "제출 내용 보기 →", 진행률 바 숨김 |
| 4 | 재제출 필요 (수정 후 미반영) | CHANGED_AFTER_SUBMIT | **49:1301** `Card-RESUBMIT-NEEDED` | **COVERED** | 최신 extract로 실재 확인. Card-PENDING 복제 + 패치: Red "재제출 필요" 배지, "최종 제출 26.10.14 11:23 · 수정 후 미반영", CTA "수정사항 제출하기 →"(텍스트 링크), 진행률 바 숨김 |
| 5 | 상단 마감 안내 배너 | — | 1:23077 `Deadline Banner` | **COVERED** | 구조 확인. 시각 확인은 screenshot 필요 |
| 6 | 빈 상태 (지원서 없음) | EMPTY | — | **UNVERIFIED** | PRD §3 [기본값]: 빈 상태 + CTA. 대응 frame 식별 불가. screenshot 없음 |

### A-30 2026-09-24 추가 작업 메모

- SUBMITTED / CHANGED_AFTER_SUBMIT 카드는 `op:duplicate`로 `Card-PENDING`(1:23081)을 복제해 만들었다. Exact Clone → Minimal Patch 원칙 적용.
- PRD §6에 따라 A-30 진입 CTA는 텍스트 링크형(→)이며, 원본 CTA 색(`text-tertiary`, 회색)을 유지했다. 재제출 CTA도 빨간 버튼이 아니라 회색 텍스트 링크가 맞다.
- 진행률 바(작성중 전용, `Left Status`)는 두 카드에서 `visible:false`로 제거했다.
- **frameId 확정(2026-09-24 재추출)**: `Card-SUBMITTED-DONE`=49:1278, `Card-RESUBMIT-NEEDED`=49:1301. 두 카드 모두 `1:23076` 아래에 실재. 구조 COVERED 확정. 시각(색/배지) 최종 확인만 screenshot로 남음.

### A-30 MISMATCH 메모

- `Card-SUBMITTED` 노드명이 PRD의 `SUBMITTED(제출완료)` 상태를 연상시키나, 실제 내용은 "본선 미진출" 배지다. 노드 이름과 PRD 상태명이 불일치한다. 기능 동작에는 영향 없으나 향후 혼동 유발 가능. → **MISMATCH (노드명 vs 상태 의미)**

---

## A-31 · 최종보고서 스텝 폼

PRD source: `v5 PRD / A-31 / 4~5. 상태 머신 + 스텝 네비`

| # | PRD 요구 | 화면/State | Figma Frame | 판정 | 비고 |
|---|---|---|---|---|---|
| 7 | SECTION 1/8 기본정보 화면 | SECTION_1 | 1:23119 `A-31_report-step-form` | **COVERED** | 스텝 네비 9개, 1~4·6~8 완료(✓), 5 미완료 번호, "다음 →" 버튼 확인 |
| 8 | SECTION 1/8 기본정보 — 폼 콘텐츠 (팀명 + 팀원 테이블) | SECTION_1_CONTENT | 1:23119 내부 | **UNVERIFIED** | 구조상 Input·Container 존재하나 screenshot 없어 시각 확인 불가 |
| 9 | SECTION 2~8 각 섹션 폼 화면 | SECTION_2~8 | — | **MISSING_STATE** | PRD §8 스코프 노트: 내부 필드 구성은 디자인 범위 외라고 명시. 그러나 섹션별 frame 자체(우측 폼 영역 스텝 전환)가 없음. 스코프에 따라 판정 재검토 필요 |
| 10 | (해소됨) A-31 중복 프레임 정리 | — | ~~1:23324~~ 삭제됨 | **RESOLVED** | 이전 중복 프레임 `A-31_step-form-section1-v2`(1:23324)를 2026-09-24 Figma에서 삭제. A-31은 이제 1:23119 단일 프레임. 최신 extract로 확인. |

---

## A-32 · 최종 심사 제출 패키지 (SECTION 9/9)

PRD source: `v5 PRD / A-32 / 4. 상태 머신` + `6. 정렬·버튼 규칙 / 하단 제출 버튼 상태값`

| # | PRD 요구 | 화면 State | Figma Frame | 판정 | 비고 |
|---|---|---|---|---|---|
| 11 | 4종 완료, 최초 제출 전 (활성) | PRE_SUBMIT_COMPLETE | 1:23529 | **COVERED** | 4종 모두 "완료", 제출버튼 Red primary `#FD312E` 확인 |
| 12 | 4종 미충족, 최초 제출 전 (비활성) | PRE_SUBMIT_INCOMPLETE | 17:996 `A-32_submission-package` | **COVERED** | (최신 extract로 frameId 17:996 확정, 이전 1:23799) Item2(발표자료) "미등록", 나머지 완료. 제출버튼 fill 동일(Red) — 단 **비활성 시 disabled 색이어야 하는데 Red 그대로** → 시각 확인 필요 (UNVERIFIED 참조) |
| 13 | 제출 완료 후 잠금 | SUBMITTED_LOCKED | — | **MISSING_STATE** | PRD §6: 버튼 라벨 "제출 완료됨 ✓", 점수 입력 비활성, 저장 버튼 비노출. 대응 frame 없음 |
| 14 | 제출 후 항목 수정 → 재제출 필요 | CHANGED_AFTER_SUBMIT | — | **MISSING_STATE** | PRD §6: 버튼 라벨 "변경사항 다시 제출하기 →", Red primary 재활성. 대응 frame 없음 |
| 15 | 마감 이후 비활성 | DEADLINE_PASSED | — | **MISSING_STATE** | PRD §6: 버튼 라벨 "제출 마감됨", 잠금 아이콘, 비활성. 대응 frame 없음 |
| 16 | 마감 경고 배너 | — | 1:23758, 1:24016 | **COVERED** | "심사 제출 패키지 유의사항", "D-Day 마감 임박" 텍스트 확인 |
| 17 | Package Item 2 업로드 드롭존 | ITEM2_MISSING | 17:996 내부 (item2-missing 프레임) | **COVERED** | "미등록", "최대 50MB · PDF 파일만 업로드 가능" 텍스트 확인 |

### A-32 UNVERIFIED 메모

- item2-missing 프레임(`17:996`, PRE_SUBMIT_INCOMPLETE): Item2 미등록 상태에서 제출 버튼 fill이 `#FD312E(Red primary)`로 표시됨. PRD는 "4종 미충족 시 비활성"을 요구한다. screenshot + 실제 활성화 여부 확인 필요. → **UNVERIFIED (버튼 비활성 여부)**

---

## 실제 추가 디자인이 필요한 항목

아래 항목은 PRD에 명시된 상태이나 대응 Figma frame이 없다(상세표 판정 = MISSING_STATE). 생성 범위는 별도 확인 후 결정한다.
UNVERIFIED(#6 A-30 빈 상태, #8 A-31 폼 콘텐츠)는 "존재하나 미검증"이므로 이 목록에 넣지 않고 아래 UNVERIFIED / MISMATCH 표에서 관리한다.

| 우선순위 | ID | 상세표 # | 화면 | 누락 State | PRD 근거 | 비고 |
|---|---|---|---|---|---|---|
| P1 | MISS-01 | #13 | A-32 | **제출 완료 후 잠금** (SUBMITTED_LOCKED) | v5 PRD / A-32 / §6 하단 제출 버튼 상태값 | "제출 완료됨 ✓", 입력 비활성, 저장 버튼 비노출 |
| P1 | MISS-02 | #14 | A-32 | **변경사항 다시 제출하기** (CHANGED_AFTER_SUBMIT) | v5 PRD / A-32 / §6 하단 제출 버튼 상태값 | "변경사항 다시 제출하기 →", Red primary 재활성 |
| P2 | MISS-03 | #15 | A-32 | **마감 이후 비활성** (DEADLINE_PASSED) | v5 PRD / A-32 / §6 하단 제출 버튼 상태값 | "제출 마감됨", 잠금 아이콘, 전체 잠금 |
| P2 | MISS-04 | #9 | A-31 | **SECTION 2~8 폼 화면** (스텝 전환) | v5 PRD / A-31 / §8 스코프 노트 참조 | PRD에서 내부 필드는 스코프 밖으로 명시. 섹션별 frame 필요 여부 재확인 필요 |

---

## 확인이 필요한 항목 (UNVERIFIED / MISMATCH)

| ID | 상세표 # | 화면 | 항목 | 판정 | 확인 방법 |
|---|---|---|---|---|---|
| CHECK-01 | #12 | A-32 item2-missing (17:996) | Item2 미등록 상태에서 제출 버튼이 실제로 비활성(disabled)인지, Red primary 그대로인지 | UNVERIFIED(버튼 비활성 여부) | Figma에서 직접 확인 또는 screenshot |
| CHECK-02 | #2 | A-30 Card-SUBMITTED (1:23104) | 노드명 `Card-SUBMITTED`이 실제 "본선 미진출" 상태를 나타냄 — 노드명 정정 또는 의도 확인 필요 | MISMATCH(노드명 vs 상태) | Figma 직접 확인 / rename `A-30_card__not-selected` |
| ~~CHECK-03~~ | #10 | A-31 중복 프레임 | (해소) 중복 프레임 1:23324 삭제 완료 — 2026-09-24 최신 extract로 확인 | RESOLVED | — |
| CHECK-04 | #6 | A-30 빈 상태 (frame 미식별) | 지원서 없음 상태의 대응 frame 존재 여부 — 공통 빈 상태 패턴/기본값 처리 가능한지 | UNVERIFIED(frame 미식별) | 최신 extract + screenshot |
| CHECK-05 | #8 | A-31 SECTION_1 폼 콘텐츠 (1:23119 내부) | 팀명 Input·팀원 테이블 등 폼 콘텐츠의 시각 표현 | UNVERIFIED(시각 미확인) | screenshot |

---

## Figma Sync 다음 단계

**구조 extract는 완료됨** (`snapshot-coverage.json`, 2026-09-24). 남은 것은 시각 확인용 screenshot뿐이다.
아래는 UNVERIFIED 4건(#6, #8, #12 버튼 활성 여부, #2 배지 색)을 확정하기 위한 screenshot 단계다.

```
1. Figma Plugin에서 op:screenshot 실행 (대상: A-30 카드 4종, A-31 SECTION_1, A-32 frame2)
2. 결과 PNG를 design/04-screens/verification/v5/ 에 저장
3. screens.json에 screenId / state / frameId / screenshot 경로 연결
4. 이 파일 UNVERIFIED 항목 재판정
```

> 참고: 구조 판정(COVERED/MISSING_STATE/RESOLVED)은 최신 LIVE_EXTRACT 기준으로 이미 확정이다.
> screenshot은 시각 속성(색/활성 여부) 확정에만 필요하며, 누락 디자인 판정에는 영향을 주지 않는다.

---

## 판정 근거 메모

- **COVERED 판정**: `snapshot-coverage.json`(2026-09-24 LIVE_EXTRACT) 노드 구조 + 텍스트에서 직접 확인. 시각 최종 확인만 screenshot 대상.
- **MISSING_STATE 판정**: PRD에 해당 상태가 명시되어 있고, 섹션(1:23008) 내 모든 frame을 탐색했으나 대응 frame/노드를 발견하지 못한 경우.
- **MISMATCH 판정**: frame은 존재하나 PRD의 상태명·내용과 노드 이름 또는 구조가 다른 경우.
- **RESOLVED 판정**: 이전 감사에서 지적된 MISMATCH/중복이 이후 Figma 수정으로 해소되고 최신 extract로 확인된 경우.
- **UNVERIFIED 판정**: frame은 존재하나 최신 screenshot이 없어 시각/동작(색·활성 여부)만 확인 불가.
- **원본 PRD 확인됨(2026-09-24)**: `v5 PRD (노란 박스)`(20:823)가 Figma에 실재. requirement source는 `ORIGINAL_PRD`이며, `prd-v5/PRD.md`는 보조(RECONSTRUCTED)로만 사용. 따라서 MISSING_STATE 항목은 원본 PRD 기준으로 HIGH Confidence다.
