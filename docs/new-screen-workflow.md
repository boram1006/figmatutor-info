# 새 화면 생성 워크플로우

이 문서는 **PRD가 들어왔을 때, 이 하네스로 디자인시스템을 준수하는 새 화면을 만들어 게이트를 통과시키는** 실전 절차다.

품질 기준선은 **v3 「지원하기」 PRD 수준의 화면을 만들어낼 수 있어야 한다**로 삼는다.
즉 화면 ID·상태 머신·상태별 UI 규칙·시간/빈상태/엣지케이스까지 정의된 PRD를 받아,
그대로 토큰·컴포넌트에 바인딩된 화면으로 구현·검증할 수 있어야 한다.

기존 양산 화면(현재 design 페이지)은 이 규칙에 맞추지 않는다(STATUS.md 참조).
**이 워크플로우는 "지금부터 새로 만드는 화면"에만 적용한다.**

> PRD가 아직 없고 기능 요청만 있으면, 먼저 **`docs/prd-authoring-workflow.md`** 로 PRD를 생성한 뒤 이 문서로 온다.
> 기존 화면 유형으로 설명되지 않는 완전히 새로운 기획이면 화면을 그리기 전에 **`design/03-design-rules/generation/novel-screen-reasoning.md`** 를 적용한다.
> 이때 Product Decision은 임의로 만들지 않고, Design Decision만 기존 archetype/pattern 근거를 조합해 판단한다.
> 새 릴리즈면 그 PRD를 Figma 프레임 맨 앞 **노란색 박스**에도 싣는다(릴리즈 PRD 게시 규칙).

---

## 0. 전제 (이미 갖춰진 것)

- `primitives`(55) / `semantic`(57) 변수 컬렉션, `Text/*`(20) 텍스트 스타일 — extract-system PASS 상태
- 재사용 컴포넌트: `Button`(1:637), `Tag`(1:877) 등 — components catalog 등록됨
- 새 화면은 이 토큰·컴포넌트 위에서만 그린다. **새 색/치수/스타일을 임의로 만들지 않는다.**
  정말 없는 값이 필요하면 `token-extensions.json`에 추가만 하고 근거를 남긴다.

---

## 1. PRD 기준선 — v1~v3·v5 실제 PRD에서 도출

기존 릴리즈 PRD(v1 공통/팀빌딩, v2 AI 심사, v3 지원하기, v5 최종보고서)를 분석하면,
잘 쓰인 화면 PRD는 아래 **8개 블록**을 담는다. 이 순서가 곧 화면을 확정적으로 그릴 수 있는 정보의 최소 집합이다.
새 PRD를 받으면 이 블록이 있는지 확인하고, 빠지면 만들기 전에 사용자와 채운다(추측으로 그리지 않는다).

1. **화면 개요** — 화면 ID·이름, 한 줄 역할.
   - 예(v3): `A-01 내 지원서 리스트` — "로그인 사용자가 회차별 지원서 현황을 확인하고 현재 단계에 맞는 액션으로 진입하는 허브 화면"
2. **진입 경로 + 조건** — 어디서 어떤 조건으로 들어오는가, 조건 미충족 시 리다이렉트.
   - 예(v3): GNB "지원하기" 클릭, `phase=OPEN`이고 지원서 1건 이상이면 리스트(0건이면 폼으로 즉시 이동). `phase≠OPEN`이면 화면이 닫히고 마이페이지가 유일 진입점.
3. **데이터 로딩 정책 + 예외 처리** — 로딩 방식과 세 가지 예외:
   - 로딩 중: 스켈레톤 UI
   - 에러(API 실패): "데이터를 불러오는 데 실패했습니다" + [다시 시도]
   - 빈 상태(Empty): 조건별 문구 + CTA (예: "현재 모집 중인 팀이 없습니다", "아직 작성한 지원서가 없습니다")
4. **상태 머신** — 데이터/화면 상태와 전이, 각 전이의 트리거.
   - 예(v3): `DRAFT → SUBMITTED → REVIEWING → REVIEWED (+result: PASS/FAIL)`
   - 전이 트리거 명시(제출 클릭, phase 전환, 관리자 결과 발표 등)
5. **상태별 UI 매트릭스** — PRD의 심장. 각 상태마다 표로:
   - 배지 라벨 + 색 (semantic 토큰으로: 작성중=Gray, 제출완료=Green, 심사중=Purple 등)
   - 본문/보조 문구
   - CTA 라벨과 활성 여부 (이것이 화면의 primaryAction 후보)
   - 부가 표시(result, 진행바)·부가 메뉴(⋯ 삭제)의 노출 조건
6. **정렬·버튼 규칙** — 목록 정렬 우선순위, 버튼 상태와 예외.
   - 예(v1 팀빌딩): 정렬 1순위 내가 지원한 팀 / 2순위 모집중(사용자별 고정 랜덤) / 3순위 완료.
   - 버튼 3상태: [지원하기]/[지원취소하기]/[모집완료]. 예외: 다른 팀 지원 중 클릭 시 "이미 다른 팀에 지원 중입니다…" 알림 팝업.
7. **표기 규칙** — 상대 시간, 자릿수, 말줄임 등.
   - 예(v3 상대시간): 방금 전 / N분 전 / N시간 전 / N일 전 / 7일 이상은 `YYYY.MM.DD`.
8. **레이아웃·인터랙션 세부** — 고정 높이/스크롤, 최대 노출 개수 등.
   - 예(v1): 목록 최대 3.5개가 보이는 고정 높이, 초과 시 내부 스크롤. 스크롤바는 평소 숨김, hover/스크롤 시 노출.

> v1·v3 PRD가 이 8블록을 표로 촘촘히 담고 있었고, v2(AI 심사)는 채점 규칙(지원서 6항목×10점=60 + 산출물 40 = 100점, 5회 반복 평균, "AI 심사 진행중" 로딩, 지원서 N/128 페이지네이션)을 더한다.
> 이 밀도의 PRD가 들어오면 화면을 확정적으로 그릴 수 있어야 한다 — 이것이 품질 기준선이다.

### 릴리즈별 화면 유형 (실제 자산 관찰)

- **공통(v1)**: 랜딩(히어로+카운트다운), 공지사항, FAQ, 팀빌딩(모집/상세/지원 모달/마감/예정), 마이페이지(팀 카드·지원 현황 카드)
- **AI 심사(v2)**: 심사 대시보드(지표 카드+결과 테이블), 심사 결과 상세(원형 점수 게이지+항목별 채점), 회의록 요약기(로딩→결과), 프롬프트 관리(토글 리스트+편집 모달)
- **지원하기(v3)**: 지원서 리스트(상태별 카드), 지원 폼(A-02), 마이페이지 내 지원현황(빈/있음)
- **하반기(v4, PRD 텍스트 없음·디자인만)**: 합격 발표(다크+골드), 팀빌딩(예정/모집중, 포지션 지원), 팀빌딩 설정 모달. 제약: 기존 팀원 5명이면 팀빌딩 불가, 모집 포지션 수는 기존 팀원 합쳐 5 초과 불가.
- **최종보고서(v5)**: 내 지원현황, 단계별 제출 폼(좌측 스텝 네비), 최종 심사 제출 패키지(보고서/발표자료/데모 URL/소스코드 4구성 + 마감 경고)

### 반복 UI 패턴 (새 화면도 이 패턴을 따른다)

- 상단 고정 네비(홈/공지사항/팀빌딩/FAQ/로그인) + 우측 붉은 CTA
- 상태 뱃지: Gray(작성중/미제출) · Green(제출완료) · Purple(심사중) · Red 계열 강조
- 카드 리스트(정렬 우선순위 규칙) / 좌측 스텝 네비가 있는 단계별 폼
- 다크+골드 발표 화면(합격 축하) + 카운트다운 타이머
- 빈 상태 + CTA는 화면마다 필수 정의

---

## 1.5. 신규 UX 구조 판단

PRD의 사용자 목표와 task를 기존 archetype 하나가 충분히 설명하는지 먼저 확인한다.

- 충분함 → 해당 archetype + 기존 pattern을 사용한다.
- 일부만 맞음 → primary archetype을 정하고 필요한 supporting pattern을 조합한다.
- 맞는 유형이 없음 → `novel-screen-reasoning.md`에 따라 Candidate Pattern을 정의한다.

Candidate Pattern은 현재 화면을 만들기 위한 설계 가설이며 전역 generation rule이 아니다.
새 정보 공개 범위·권한·상태·점수 정책처럼 제품 정책에 해당하는 빈칸은 사용자 확인 없이 채우지 않는다.

---

## 2. requirements.json 작성 (inputs 게이트)

PRD의 각 화면을 `design/02-structure/requirements.json`의 `screens[]`로 옮긴다.
새 화면은 `origin: "new"`로 둔다(기존 추출 화면은 `existing`).

화면 하나당 채우는 필드 (게이트가 요구하는 것):

- `id`, `name`, `purpose`
- `primaryAction`: `{ id, label, kind }` — PRD의 대표 CTA. **상태별로 정확히 1개**가 원칙.
- `states[]`: `{ id, primaryRequired }` — PRD 상태 머신을 그대로. 각 상태에서 주 액션이 필수인지 표시.
  - 예: DRAFT(primaryRequired:true, CTA "작성하기"), REVIEWED(primaryRequired:false)
- `viewportIds`: 데스크탑 기준 `["desktop"]`
- `componentIds`: 이 화면이 쓰는 재사용 컴포넌트 (catalog에 있어야 함) — 예: `["Button","Tag"]`
- `imageSlots[]`: 캐릭터/이미지가 들어가면 정의(없으면 `[]`)
- `contentCases[]`: PRD의 엣지 케이스(긴 텍스트, 다수 항목, 빈 상태 등)

작성 후:
```
node scripts/harness.mjs check --phase inputs
```
PASS 확인. `status: "ready"` 유지.

---

## 3. 화면 그리기 (Figma 플러그인)

Figma는 무료 계정 + 플러그인 왕복으로 다룬다(MCP 없음). 상세: `docs/kiro-figma-plugin.md`, `docs/figma-delegation.md`.

새 화면을 그릴 때 지킬 것 (screens 게이트를 처음부터 통과시키기 위해):

- **색/치수/텍스트는 반드시 토큰에서.** raw hex·임의 padding 금지. 색은 semantic 변수, 여백은 space 토큰(4px 그리드), radius는 radius 토큰, 텍스트는 `Text/*` 스타일.
- **재사용 컴포넌트는 인스턴스로.** 버튼·태그는 마스터(Button/Tag)의 인스턴스를 배치한다. 도형으로 새로 그리지 않는다. (마스터로 관리하는 의미가 여기서 나온다.)
- **뷰포트 폭**: 데스크탑 1920 또는 1440. 세로는 콘텐츠 길이에 따라 자유(웹 랜딩). 카드 등 뷰포트가 아닌 부분 추출물은 별도 취급.
- **프레임 메타데이터(pluginData `designHarness`)** 를 심는다 — screens 게이트가 읽는다:
  - 화면 프레임: `screenId`, `state`, `viewportId`
  - 주 액션 버튼: `primaryActionId` (requirements의 primaryAction.id와 일치, 상태당 1개)
  - 탭 대상: `tapTarget`, 이미지 슬롯: `slotId`/`assetId`, 반복 UI: `reusable`
- **레이아웃**: 고정 높이 대신 HUG(자동)를 기본으로. 자식이 부모를 넘지 않게.

레이아웃 초안이 필요하면 플러그인 `op:create`로 그려줄 수 있으나, 이는 게이트 통과 조건이 아니라 초안이다.

---

## 4. 스크린샷 + 매니페스트 (screens 게이트)

각 화면×상태×viewport마다:

1. **스크린샷 캡처** — 플러그인 `op:screenshot`으로 PNG 추출 → `design/04-screens/verification/` 등에 저장.
2. **screens.json 매니페스트** 작성 — 엔트리마다:
   `{ screenId, state, viewportId, frameId, screenshot(이미지 경로) }`
   - 화면×상태×viewport 조합 수가 requirements와 정확히 일치해야 한다.
   - 하나의 프레임을 여러 상태로 재사용 불가(상태마다 별도 프레임).
3. **이미지 에셋** — 캐릭터를 쓰면 `assets.json`에 등록(원본 파일 + sha256 + figmaImageHash). 생성 이미지 금지, 보유 원본만 FIT 배치.

---

## 5. 추출 + 판정 (screens → verification)

1. 화면 페이지를 `op:extract`로 추출 (stage=screens, inputDigest는 `fingerprint --scope screens` 값).
2. 결과를 `design/04-screens/snapshot.json`에 저장:
   ```
   node scripts/harness.mjs save-snapshot --stage screens --from <경로>
   node scripts/harness.mjs check --phase screens
   ```
3. screens PASS 후 verification(시각 검토): `design/04-screens/verification/visual-review.json` 작성.
   위계·가독성·정렬·브랜드 적합성 검토. `docs/audit` 흐름 참조.
   ```
   node scripts/harness.mjs audit
   ```

---

## 6. screens 게이트가 실제로 검사하는 것 (요약)

새 화면은 처음부터 이걸 만족하도록 그린다:

- 화면×상태×viewport 조합이 requirements와 일치, 각각 스크린샷 파일 존재
- 프레임 폭이 허용 폭(데스크탑 1920/1440), 세로는 자유(재개 시 config `allowedWidths`/`heightMode:content` 적용)
- 주 액션 노드가 상태 규칙대로 정확히 1개
- 탭 타겟이 safe area 안, 최소 탭 크기 이상
- **모든 색이 semantic 바인딩, 모든 여백/반경이 토큰+4px 그리드, 모든 텍스트가 `Text/*` 스타일**
- 자식이 부모 경계를 넘지 않음, 고정 높이 대신 HUG/높이 토큰
- 반복 UI에 `reusable` 표식(재사용률 기준 충족)
- 이미지 슬롯이 등록 에셋으로 채워짐

> 기존 양산 화면이 screens에서 대량 실패한 이유가 바로 이 목록이다.
> 새 화면은 3단계에서 이를 지키며 그리면 애초에 걸리지 않는다. "그린 뒤 고치기"보다 "규칙대로 그리기"가 훨씬 싸다.

---

## 7. 원칙 (하네스 계약과 일관)

- JSON 계약이 기계 판정의 원본이다. 필드는 `docs/contracts.md`, 게이트는 `scripts/lib/gates.mjs`·`snapshot.mjs`.
- 폴더 존재·체크표시·이전 PASS로 완료를 판정하지 않는다. `npm run check`/`npm run audit`로 판정한다.
- 규칙 위반은 캔버스/원본 JSON을 고쳐 해결한다. 스냅샷·검사 결과를 조작하지 않는다.
- 새 토큰이 꼭 필요하면 `token-extensions.json`에 추가만 한다. 추출한 시스템 토큰은 덮어쓰지 않는다.
- 이미지 생성 단계를 쓰지 않는다. `design/characters` 보유 원본만 FIT 배치, 남는 영역은 `color-character-bg`.
- 게이트 전제가 실제 디자인 성격과 다르면(예: 웹 세로 가변), 캔버스가 아니라 **게이트 계약을 조정**하고 근거를 코드 주석·문서에 남긴다.
