# v5 — 현재 디자인에서 빠진 화면/상태 + 생성 계획 (사용자 결정 반영)

기준: 현재 Figma 실제 상태(`design/04-screens/coverage/design-coverage.md`, 2026-09-24 LIVE_EXTRACT)와
v5 PRD를 대조해 도출한 누락 항목. 생성은 하네스 규칙(INSTANCE_REUSE → CLONE_COMPOSE → NEW_CONSTRUCTION)을 따른다.

> **2026-09-25 결정 반영 (`1-prd-decisions.md`)**:
> - Q1: 재제출 관련 배지/강조는 **Warning** 계열(필수 확인 액션). Red/accent 아님.
> - Q7: **제출일시 등 timestamp를 UI에 새로 표현하지 않는다.** GAP-1/3의 timestamp 안내 패치 제거.
> - Q8: rename을 `A-32_final-report-package__*` 네이밍으로 통일.
> - Q4: 발표자료 등록 PDF only는 기존 드롭존 문구로 이미 충족 → 추가 패치 없음.

현재 상태 요약:
- **COVERED 10 / MISSING_STATE 4 / MISMATCH 1 / UNVERIFIED 2**
- A-30 카드 4상태는 모두 존재(작성중/미진출/제출완료/재제출). A-31 SECTION 1 존재. A-32 최초제출 전 2상태(완료/미충족) 존재.

---

## 빠진 항목

### GAP-1 · A-32 제출 완료 후 잠금 (SUBMITTED_LOCKED)  — P1

- **왜 필요**: PRD A-32 §6 제출 버튼 상태값에 정의된 primary 완결 상태. 사용자가 최종 제출을 마친 뒤 보는 화면이 없으면, "제출됨"을 시각적으로 확인할 방법이 없다.
- **PRD 근거**: A-32 §6 — 버튼 "제출 완료됨 ✓"(비활성), "N에 제출됨" 표기, 4종 카드 입력 잠금.
- **생성 방식**: `CLONE_COMPOSE` — A-32 완료 프레임(1:23529, PRE_SUBMIT_COMPLETE) 복제 후 하단 버튼/잠금만 패치.

### GAP-2 · A-32 변경사항 다시 제출 (CHANGED_AFTER_SUBMIT) — P1

- **왜 필요**: 제출 후 수정 → 재제출 유도. PRD의 명시적 재제출 모델의 핵심 상태. 이게 없으면 "수정사항 미반영" 사용자가 다음 액션을 못 찾는다.
- **PRD 근거**: A-32 §6 — 버튼 "변경사항 다시 제출하기 →"(재활성), 미반영 수정분 안내.
- **색 결정 (Q1)**: 재제출은 **사용자가 반드시 확인·재제출해야 하는 액션**이므로 안내/강조는 **Warning** 계열. 단 제출 버튼 자체는 A-32 primary 제출 버튼이므로 기존 Red primary(text-accent)를 유지하고, "수정사항 미반영"을 알리는 **배너/라벨을 Warning**으로 둔다.
- **생성 방식**: `CLONE_COMPOSE` — 1:23529 복제 후 버튼 라벨/활성 + 상단 "수정사항 미반영" Warning 안내 패치.

### GAP-3 · A-32 마감 이후 비활성 (DEADLINE_PASSED) — P2

- **왜 필요**: 마감(10/16 24:00) 후 전체 잠금. 마감 후에도 제출 버튼이 활성으로 보이면 오조작·혼란.
- **PRD 근거**: A-32 §6 — 버튼 "제출 마감됨"(잠금 아이콘, 비활성), 전체 잠금.
- **잠금 범위 (Q10 확정)**: 마감 후 edit·save·submit **3종 전부 잠금 + 비활성 (전체 read-only)**. 제출 버튼 "제출 마감됨", [임시 저장] 비활성, 4종 카드·입력·업로드·링크 편집 컨트롤 모두 비활성.
- **생성 방식**: `CLONE_COMPOSE` — 1:23529 복제 후 제출 버튼 "제출 마감됨" + [임시 저장] 비활성 + 4종 카드 read-only 패치.

### GAP-4 · A-30 빈 상태 (EMPTY) — P3 (확인 후 결정)

- **왜 필요**: 본선 진출 지원서가 없을 때 리스트가 비면 안내가 필요. 단 PRD에서 `[기본값]`(공통 빈 상태 패턴)이라, 전용 프레임이 필요한지 공통 컴포넌트로 처리되는지 미확정.
- **PRD 근거**: A-30 §3 [기본값] — 빈 상태 문구 + CTA.
- **생성 방식**: 보류. 공통 empty-state 패턴 재사용 여부 확인 후 결정. 무리하게 신규 생성하지 않음.

### 비-생성 항목 (참고)

- **A-31 SECTION 2~8** (coverage #9 MISSING_STATE): PRD §8 스코프 노트 + Q3(완료 판정 서버 처리)로 **개별 섹션 프레임을 생성하지 않는다.** 누락이 아니라 의도적 범위 제외. 스텝 네비의 완료/미완료는 서버 값 반영이므로 UI 판정식 없음.
- **A-31 SECTION_1 폼 콘텐츠 / A-32 버튼 비활성 색** (UNVERIFIED): 생성이 아니라 screenshot으로 확인할 항목.
- **A-30 재제출 카드 색 재검토** (`Card-RESUBMIT-NEEDED` 49:1301, 이미 존재): 현재 coverage에 "Red 배지"로 기록돼 있으나, Q1 결정에 따라 **Warning 계열로 바꿔야 한다.** 이 카드는 이미 존재(COVERED)하므로 신규 생성이 아니라 **기존 카드 배지 색 패치(op:duplicate 아님, 기존 노드 색 수정)** 대상이다. 아래 GAP-5로 별도 관리.

### GAP-5 · A-30 재제출 카드 배지 색 정정 (기존 노드 수정) — P1

- **왜 필요**: Q1에서 재제출=Warning으로 확정. 기존 `Card-RESUBMIT-NEEDED`(49:1301)의 배지가 Red/accent면 Warning으로 정정해야 정책과 일치.
- **생성이 아님**: 신규 프레임 생성 대상 아님. 기존 노드의 배지 fillBinding을 warning 토큰으로 바꾸는 **패치**다.
- **선행**: 49:1301 재추출로 배지 노드명·현재 색 확인 후 patch. 실제 색이 이미 warning이면 조치 불필요.

---

## 생성 우선순위 요약

| GAP | 화면 | 상태 | 우선순위 | 방식 | 생성/패치 JSON |
|---|---|---|---|---|---|
| GAP-1 | A-32 | SUBMITTED_LOCKED | P1 | CLONE_COMPOSE (1:23529) | `spec-duplicate-a32-submitted-locked.json` |
| GAP-2 | A-32 | CHANGED_AFTER_SUBMIT | P1 | CLONE_COMPOSE (1:23529) | `spec-duplicate-a32-resubmit.json` |
| GAP-3 | A-32 | DEADLINE_PASSED | P2 | CLONE_COMPOSE (1:23529) | `spec-duplicate-a32-deadline.json` |
| GAP-4 | A-30 | EMPTY | P3 | 보류 (필요 판단 시, Q9) | — |
| GAP-5 | A-30 | 재제출 배지 색 정정 | P1 | 기존 노드 패치 (49:1301) | (재추출 후 결정) |

> 생성 프레임 rename은 Q8 네이밍에 맞춰 `A-32_final-report-package__{state}`로 통일한다.

## 생성 방식 근거 (하네스 규칙)

- A-32 세 상태는 기존 완료 프레임(1:23529)과 레이아웃이 동일하고 **하단 제출 버튼 + 일부 라벨/잠금만 다르다.** 따라서 재생성(NEW_CONSTRUCTION)이 아니라 **Exact Clone → Minimal Patch**(`op:duplicate`)가 맞다.
- nodeId를 추측하지 않는다. patch 대상 nodeName은 실제 프레임 추출로 확인 후 확정해야 하며, 아래 JSON의 patch nodeName은 **확인 필요 표시**를 달았다.
- clone source 1:23529는 coverage에서 COVERED로 확인된 실재 프레임이다.
- **Q7 반영**: 제출일시 등 timestamp를 UI에 새로 추가하지 않는다. GAP-1/3에서 timestamp 안내 패치를 제거했다.
