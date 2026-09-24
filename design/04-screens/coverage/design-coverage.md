# Design Coverage Audit — v5 최종보고서 제출

- **Audit Mode**: LIVE (현재 Figma 캔버스 기준)
- **Requirement Source**: `design/operations/prd-v5/PRD.md`
- **Req Source Type**: `RECONSTRUCTED_PRD` (역방향 복원본 — 원본 노란 박스 PRD 미확인)
- **Design Source**: `design/operations/rebind-v5/snapshot-v5.json` (capturedAt: 2026-09-23) + 2026-09-24 카드 추가분
- **Design Source Type**: `PARTIAL_EXTRACT` (stage=screens 공식 extract·screenshot 미완)
- **Figma 파일**: `t00UvcVe1M6llSJFyXcDkG` / 페이지 `design` / 섹션 `1:23008`
- **분석 일자**: 2026-09-24 (카드 2종 추가 반영)

> 판정 기준·source basis·Confidence 체계: `docs/coverage-audit-rules.md`
>
> 중요 전제: requirement source가 `RECONSTRUCTED_PRD`이고, 공식 stage=screens extract와 screenshot이 아직 없다.
> 따라서 이 감사의 신뢰도는 최대 MEDIUM이며, `MISSING_STATE` 확정 항목은 원본 PRD 확인 + 최신 sync 후 재판정이 필요하다.
> Coverage를 최신화하려면 `design/operations/coverage-v5/spec-extract-after-cards.json`을 Figma Plugin에서 실행해 stage=screens snapshot을 갱신한다.

---

## Summary

| 판정 | 건수 |
|---|---|
| COVERED (구조 확인) | 9 |
| MISSING_STATE | 5 |
| MISSING_DESIGN | 0 |
| MISMATCH | 2 |
| UNVERIFIED | 3 |

**2026-09-24 갱신**: A-30 SUBMITTED / CHANGED_AFTER_SUBMIT 2종을 `op:duplicate`(Card-PENDING 복제 + 최소 패치)로 생성 → MISSING_STATE 7 → 5로 감소.

**실제 추가 디자인이 필요한 항목: MISSING_STATE 5건** (A-30 빈 상태는 UNVERIFIED, A-32 3종 + A-31 섹션 전환 관련)

---

## A-30 · 내 지원 현황 (최종보고서 진입점)

PRD source: `v5 PRD / A-30 / 4. 상태 머신` + `5. 상태별 UI 매트릭스` (Req Source Type: RECONSTRUCTED_PRD)

| # | PRD 요구 | 화면 State | Figma Frame | 판정 | 비고 |
|---|---|---|---|---|---|
| 1 | 본선 진행중·작성중 | IN_PROGRESS | 1:23081 `Card-PENDING` | **COVERED** | 배지 "본선 진행중", 진행률 "1/8", CTA "이어 작성하기 →" 확인 |
| 2 | 본선 미진출 | NOT_SELECTED | 1:23104 `Card-SUBMITTED` | **COVERED** | 배지 "본선 미진출", 제출일시, CTA "제출 지원서 보기 →" 확인. 단 노드명이 `Card-SUBMITTED`로 혼동 유발 (MISMATCH 참조) |
| 3 | 제출완료 | SUBMITTED | `Card-SUBMITTED-DONE` (2026-09-24 신규, op:duplicate) | **COVERED** | Card-PENDING 복제 + 패치: Green "제출완료" 배지(status-success-s), "제출일시 26.10.14 11:23", CTA "제출 내용 보기 →", 진행률 바 숨김. stage=screens extract로 frameId 확정 필요 |
| 4 | 재제출 필요 (수정 후 미반영) | CHANGED_AFTER_SUBMIT | `Card-RESUBMIT-NEEDED` (2026-09-24 신규, op:duplicate) | **COVERED** | Card-PENDING 복제 + 패치: Red "재제출 필요" 배지(text-accent), "최종 제출 26.10.14 11:23 · 수정 후 미반영", CTA "수정사항 제출하기 →"(텍스트 링크), 진행률 바 숨김. stage=screens extract로 frameId 확정 필요 |
| 5 | 상단 마감 안내 배너 | — | 1:23077 `Deadline Banner` | **COVERED** | 구조 확인. 시각 확인은 screenshot 필요 |
| 6 | 빈 상태 (지원서 없음) | EMPTY | — | **UNVERIFIED** | PRD §3 [기본값]: 빈 상태 + CTA. 대응 frame 식별 불가. screenshot 없음 |

### A-30 2026-09-24 추가 작업 메모

- SUBMITTED / CHANGED_AFTER_SUBMIT 카드는 `op:duplicate`로 `Card-PENDING`(1:23081)을 복제해 만들었다. Exact Clone → Minimal Patch 원칙 적용.
- PRD §6에 따라 A-30 진입 CTA는 텍스트 링크형(→)이며, 원본 CTA 색(`text-tertiary`, 회색)을 유지했다. 재제출 CTA도 빨간 버튼이 아니라 회색 텍스트 링크가 맞다.
- 진행률 바(작성중 전용, `Left Status`)는 두 카드에서 `visible:false`로 제거했다.
- **확정 전 조건**: 아직 stage=screens 공식 extract가 없어 frameId가 미기록. `spec-extract-after-cards.json` 실행 후 frameId·screenshot을 채워 COVERED를 확정한다.

### A-30 MISMATCH 메모

- `Card-SUBMITTED` 노드명이 PRD의 `SUBMITTED(제출완료)` 상태를 연상시키나, 실제 내용은 "본선 미진출" 배지다. 노드 이름과 PRD 상태명이 불일치한다. 기능 동작에는 영향 없으나 향후 혼동 유발 가능. → **MISMATCH (노드명 vs 상태 의미)**

---

## A-31 · 최종보고서 스텝 폼

PRD source: `v5 PRD / A-31 / 4~5. 상태 머신 + 스텝 네비`

| # | PRD 요구 | 화면/State | Figma Frame | 판정 | 비고 |
|---|---|---|---|---|---|
| 7 | SECTION 1/8 기본정보 화면 | SECTION_1 | 1:23119, 1:23324 | **COVERED** | 스텝 네비 9개, 1~4·6~8 완료(✓), 5 미완료 번호, "다음 →" 버튼 확인 |
| 8 | SECTION 1/8 기본정보 — 폼 콘텐츠 (팀명 + 팀원 테이블) | SECTION_1_CONTENT | 1:23119 내부 | **UNVERIFIED** | 구조상 Input·Container 존재하나 screenshot 없어 시각 확인 불가 |
| 9 | SECTION 2~8 각 섹션 폼 화면 | SECTION_2~8 | — | **MISSING_STATE** | PRD §8 스코프 노트: 내부 필드 구성은 디자인 범위 외라고 명시. 그러나 섹션별 frame 자체(우측 폼 영역 스텝 전환)가 없음. 스코프에 따라 판정 재검토 필요 |
| 10 | A-31 frame1과 frame2가 동일 텍스트 — 구별 가능한 variant 의도 불명확 | DUPLICATE | 1:23119 ≈ 1:23324 | **MISMATCH** | 두 프레임의 전체 텍스트가 완전히 동일. 다른 상태를 표현하려 했다면 의도 불명확. 같은 화면의 중복이라면 정리 필요 |

---

## A-32 · 최종 심사 제출 패키지 (SECTION 9/9)

PRD source: `v5 PRD / A-32 / 4. 상태 머신` + `6. 정렬·버튼 규칙 / 하단 제출 버튼 상태값`

| # | PRD 요구 | 화면 State | Figma Frame | 판정 | 비고 |
|---|---|---|---|---|---|
| 11 | 4종 완료, 최초 제출 전 (활성) | PRE_SUBMIT_COMPLETE | 1:23529 | **COVERED** | 4종 모두 "완료", 제출버튼 Red primary `#FD312E` 확인 |
| 12 | 4종 미충족, 최초 제출 전 (비활성) | PRE_SUBMIT_INCOMPLETE | 1:23799 | **COVERED** | Item2(발표자료) "미등록", 나머지 완료. 제출버튼 fill 동일(Red) — 단 **비활성 시 버튼이 disabled 색이어야 하는데 Red 그대로** → 시각 확인 필요 (UNVERIFIED 참조) |
| 13 | 제출 완료 후 잠금 | SUBMITTED_LOCKED | — | **MISSING_STATE** | PRD §6: 버튼 라벨 "제출 완료됨 ✓", 점수 입력 비활성, 저장 버튼 비노출. 대응 frame 없음 |
| 14 | 제출 후 항목 수정 → 재제출 필요 | CHANGED_AFTER_SUBMIT | — | **MISSING_STATE** | PRD §6: 버튼 라벨 "변경사항 다시 제출하기 →", Red primary 재활성. 대응 frame 없음 |
| 15 | 마감 이후 비활성 | DEADLINE_PASSED | — | **MISSING_STATE** | PRD §6: 버튼 라벨 "제출 마감됨", 잠금 아이콘, 비활성. 대응 frame 없음 |
| 16 | 마감 경고 배너 | — | 1:23758, 1:24016 | **COVERED** | "심사 제출 패키지 유의사항", "D-Day 마감 임박" 텍스트 확인 |
| 17 | Package Item 2 업로드 드롭존 | ITEM2_MISSING | 1:23799 내부 1:23933 | **COVERED** | "미등록", "최대 50MB · PDF 파일만 업로드 가능" 텍스트 확인 |

### A-32 UNVERIFIED 메모

- frame2(`1:23799`, PRE_SUBMIT_INCOMPLETE): Item2 미등록 상태에서 제출 버튼 fill이 `#FD312E(Red primary)`로 표시됨. PRD는 "4종 미충족 시 비활성"을 요구한다. screenshot + 실제 활성화 여부 확인 필요. → **UNVERIFIED (버튼 비활성 여부)**

---

## 실제 추가 디자인이 필요한 항목

아래 항목은 PRD에 명시된 상태이나 대응 Figma frame이 없다. 생성 범위는 별도 확인 후 결정한다.

| 우선순위 | ID | 화면 | 누락 State | PRD 근거 | 비고 |
|---|---|---|---|---|---|
| P1 | MISS-01 | A-30 | **제출완료** (SUBMITTED) | v5 PRD / A-30 / §5 상태별 UI 매트릭스 | Green "제출완료" 배지, 제출일시, "제출 내용 보기 →" CTA |
| P1 | MISS-02 | A-30 | **재제출 필요** (CHANGED_AFTER_SUBMIT) | v5 PRD / A-30 / §4 전이 트리거 + §5 | "재제출 필요" Red 배지, "수정사항 제출하기 →" CTA |
| P1 | MISS-03 | A-32 | **제출 완료 후 잠금** (SUBMITTED_LOCKED) | v5 PRD / A-32 / §6 하단 제출 버튼 상태값 | "제출 완료됨 ✓", 입력 비활성, 저장 버튼 비노출 |
| P1 | MISS-04 | A-32 | **변경사항 다시 제출하기** (CHANGED_AFTER_SUBMIT) | v5 PRD / A-32 / §6 하단 제출 버튼 상태값 | "변경사항 다시 제출하기 →", Red primary 재활성 |
| P2 | MISS-05 | A-32 | **마감 이후 비활성** (DEADLINE_PASSED) | v5 PRD / A-32 / §6 하단 제출 버튼 상태값 | "제출 마감됨", 잠금 아이콘, 전체 잠금 |
| P2 | MISS-06 | A-31 | **SECTION 2~8 폼 화면** (스텝 전환) | v5 PRD / A-31 / §8 스코프 노트 참조 | PRD에서 내부 필드는 스코프 밖으로 명시. 섹션별 frame 필요 여부 재확인 필요 |
| P3 | MISS-07 | A-30 | **빈 상태** (지원서 없음) | v5 PRD / A-30 / §3 [기본값] | 공통 빈 상태 패턴. 기본값 처리 가능 여부 확인 필요 |

---

## 확인이 필요한 항목 (UNVERIFIED / MISMATCH)

| ID | 화면 | 항목 | 확인 방법 |
|---|---|---|---|
| CHECK-01 | A-32 frame2 (1:23799) | Item2 미등록 상태에서 제출 버튼이 실제로 비활성(disabled)인지, Red primary 그대로인지 | Figma에서 직접 확인 또는 screenshot |
| CHECK-02 | A-30 Card-SUBMITTED (1:23104) | 노드명 `Card-SUBMITTED`이 실제 "본선 미진출" 상태를 나타냄 — 노드명 정정 또는 의도 확인 필요 | Figma 직접 확인 |
| CHECK-03 | A-31 frame1 ≈ frame2 | 두 프레임이 동일 내용 — 다른 상태 표현 의도인지, 단순 중복인지 확인 필요 | Figma 직접 확인 |

---

## Figma Sync 다음 단계

현재 공식 extract(stage=screens)와 screenshot이 없어 판정이 부분적이다.
아래 순서로 sync를 완료하면 UNVERIFIED 항목을 확정할 수 있다.

```
1. Figma Plugin에서 아래 request 실행:
   design/operations/coverage-v5/spec-extract-v5-coverage.json   ← op:extract
   design/operations/coverage-v5/spec-screenshot-v5.json         ← op:screenshot

2. extract 결과 저장:
   npm run save-snapshot -- --stage screens --from <extract결과경로>

3. screenshot 결과를 design/04-screens/verification/v5/ 에 저장

4. screens.json에 5개 프레임 등록:
   screenId / state / frameId / screenshot 경로 연결

5. 이 파일(design-coverage.md) UNVERIFIED 항목 재판정
```

---

## 판정 근거 메모

- **COVERED 판정**: `snapshot-v5.json` 노드 구조 + 텍스트에서 직접 확인한 경우. screenshot 없어 시각 확인 미완료.
- **MISSING_STATE 판정**: PRD에 해당 상태가 명시되어 있고, 섹션(1:23008) 내 모든 frame을 탐색했으나 대응 frame/노드를 발견하지 못한 경우.
- **MISMATCH 판정**: frame은 존재하나 PRD의 상태명·내용과 노드 이름 또는 구조가 다른 경우.
- **UNVERIFIED 판정**: frame은 존재하나 최신 screenshot 또는 공식 extract 없어 시각/동작 확인 불가.
- **역방향 복원 PRD 주의**: 이 감사의 PRD source(`prd-v5/PRD.md`)는 원본 노란 박스 PRD가 아닌 역방향 복원본이다. MISSING_STATE 항목 중 일부(특히 MISS-06, MISS-07)는 원본 PRD 재확인 후 재판정이 필요하다.
